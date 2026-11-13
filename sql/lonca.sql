-- ============================================================
-- Valdrenn: LONCA SİSTEMİ (sürüm 2.8.0)
-- Çalıştırma: SQL Editor'de yeni sekme, bu dosyanın hepsini yapıştır, Run.
-- Sıra: diğer dosyalar çalıştırılmış olmalı (özellikle topluluk.sql, liderlik.sql, filtre.sql). Tekrar çalıştırmak zararsızdır.
--
-- Kurallar:
--  * Lonca kurmak için karakter seviyesi en az 10 olmalı. Bir oyuncu aynı anda tek loncada olabilir.
--  * En çok 30 üye. Roller: lider, subay, uye.
--  * Lider: herkesi atar, rütbe verir, liderliği devreder, loncayı dağıtır, ayarları değiştirir.
--  * Subay: yalnızca sıradan üyeleri atabilir.
--  * Lider loncadan ayrılırsa liderlik otomatik olarak en eski subaya (yoksa en eski üyeye) geçer; kimse kalmazsa lonca silinir.
--  * Lonca gücü = üyelerin (sıralamadaki) seviyeleri toplamı.
-- Tüm tablolara oyuncu doğrudan erişemez; her şey aşağıdaki fonksiyonlardan geçer.
-- ============================================================

create table if not exists public.kz_guild (
  id bigserial primary key,
  name text not null,
  name_key text not null unique,
  descr text not null default '',
  emblem int not null default 0 check (emblem between 0 and 11),
  min_lv int not null default 1 check (min_lv between 1 and 100),
  open boolean not null default true,
  created timestamptz not null default now(),
  constraint kz_guild_name_len check (char_length(name) between 3 and 16),
  constraint kz_guild_descr_len check (char_length(descr) <= 80)
);
alter table public.kz_guild enable row level security;
revoke all on public.kz_guild from anon, authenticated;

create table if not exists public.kz_guild_member (
  user_id uuid primary key references auth.users(id) on delete cascade,
  guild_id bigint not null references public.kz_guild(id) on delete cascade,
  role text not null default 'uye' check (role in ('lider','subay','uye')),
  joined timestamptz not null default now()
);
create index if not exists kz_gm_guild_idx on public.kz_guild_member(guild_id);
alter table public.kz_guild_member enable row level security;
revoke all on public.kz_guild_member from anon, authenticated;

create table if not exists public.kz_guild_chat (
  id bigserial primary key,
  guild_id bigint not null references public.kz_guild(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 200),
  created timestamptz not null default now()
);
create index if not exists kz_gc_idx on public.kz_guild_chat(guild_id, id desc);
alter table public.kz_guild_chat enable row level security;
revoke all on public.kz_guild_chat from anon, authenticated;

-- Lider ayrılınca/silinince liderlik devri
create or replace function public.kz_gm_after_delete()
returns trigger language plpgsql security definer set search_path = public as $$
declare nu uuid;
begin
  if old.role = 'lider' and exists (select 1 from public.kz_guild where id = old.guild_id) then
    select user_id into nu from public.kz_guild_member where guild_id = old.guild_id
      order by (role = 'subay') desc, joined limit 1;
    if nu is null then delete from public.kz_guild where id = old.guild_id;
    else update public.kz_guild_member set role = 'lider' where user_id = nu; end if;
  end if;
  return null;
end;
$$;
revoke all on function public.kz_gm_after_delete() from public, anon, authenticated;
drop trigger if exists kz_gm_after_delete on public.kz_guild_member;
create trigger kz_gm_after_delete after delete on public.kz_guild_member
  for each row execute function public.kz_gm_after_delete();

-- Kendi loncam (üyeler dahil). Loncası yoksa null.
create or replace function public.kz_g_me()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); m record; g record; mem jsonb; pw bigint;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select * into m from public.kz_guild_member where user_id = uid;
  if not found then return null; end if;
  select * into g from public.kz_guild where id = m.guild_id;
  select coalesce(jsonb_agg(jsonb_build_object('user_id', gm.user_id, 'name', coalesce(l.char_name, '?'),
           'cls', coalesce(l.cls, 'tank'), 'level', coalesce(l.level, 1), 'role', gm.role)
           order by case gm.role when 'lider' then 0 when 'subay' then 1 else 2 end, coalesce(l.level, 1) desc, gm.joined), '[]'::jsonb),
         coalesce(sum(coalesce(l.level, 0)), 0)
    into mem, pw
    from public.kz_guild_member gm left join public.leaderboard l on l.user_id = gm.user_id
   where gm.guild_id = g.id;
  return jsonb_build_object('id', g.id, 'name', g.name, 'descr', g.descr, 'emblem', g.emblem,
    'min_lv', g.min_lv, 'open', g.open, 'role', m.role, 'count', jsonb_array_length(mem),
    'power', pw, 'members', mem);
end;
$$;
revoke all on function public.kz_g_me() from public, anon;
grant execute on function public.kz_g_me() to authenticated;

-- Lonca listesi (güce göre ilk 30; ad araması isteğe bağlı)
create or replace function public.kz_g_list(p_q text default '')
returns table(id bigint, name text, descr text, emblem int, min_lv int, open boolean, cnt bigint, power bigint)
language plpgsql stable security definer set search_path = public as $$
declare q text := replace(replace(replace(trim(coalesce(p_q, '')), '\', '\\'), '%', '\%'), '_', '\_');
begin
  if auth.uid() is null then raise exception 'giris gerekli'; end if;
  return query
    select g.id, g.name, g.descr, g.emblem, g.min_lv, g.open,
           count(gm.user_id)::bigint, coalesce(sum(coalesce(l.level, 0)), 0)::bigint as pw
      from public.kz_guild g
      join public.kz_guild_member gm on gm.guild_id = g.id
      left join public.leaderboard l on l.user_id = gm.user_id
     where q = '' or g.name ilike '%' || q || '%'
     group by g.id
     order by pw desc, g.id
     limit 30;
end;
$$;
revoke all on function public.kz_g_list(text) from public, anon;
grant execute on function public.kz_g_list(text) to authenticated;

create or replace function public.kz_g_create(p_name text, p_descr text, p_emblem int)
returns bigint language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); lv int; nm text := btrim(coalesce(p_name, '')); ds text := left(btrim(coalesce(p_descr, '')), 80); gid bigint;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  if exists (select 1 from public.kz_guild_member where user_id = uid) then raise exception 'lonca: zaten loncan var'; end if;
  select level into lv from public.leaderboard where user_id = uid;
  if lv is null then raise exception 'lonca: once oyunda bir karakter olustur'; end if;
  if lv < 10 then raise exception 'lonca: lonca kurmak icin seviye 10 gerekir'; end if;
  if char_length(nm) < 3 or char_length(nm) > 16 then raise exception 'lonca: ad 3-16 karakter olmali'; end if;
  if public.kz_is_bad(nm) or public.kz_is_bad(ds) then raise exception 'kufur: lonca'; end if;
  begin
    insert into public.kz_guild(name, name_key, descr, emblem)
    values (nm, public.kz_name_key(nm), ds, greatest(0, least(11, coalesce(p_emblem, 0)))) returning id into gid;
  exception when unique_violation then raise exception 'lonca: bu lonca adi alinmis';
  end;
  insert into public.kz_guild_member(user_id, guild_id, role) values (uid, gid, 'lider');
  return gid;
end;
$$;
revoke all on function public.kz_g_create(text, text, int) from public, anon;
grant execute on function public.kz_g_create(text, text, int) to authenticated;

create or replace function public.kz_g_join(p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); lv int; g record; n int;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  if exists (select 1 from public.kz_guild_member where user_id = uid) then raise exception 'lonca: zaten loncan var'; end if;
  select * into g from public.kz_guild where id = p_id for update;
  if not found then raise exception 'lonca: lonca bulunamadi'; end if;
  if not g.open then raise exception 'lonca: lonca davetli, katilima kapali'; end if;
  select level into lv from public.leaderboard where user_id = uid;
  if lv is null then raise exception 'lonca: once oyunda bir karakter olustur'; end if;
  if lv < g.min_lv then raise exception 'lonca: en az seviye % gerekir', g.min_lv; end if;
  select count(*) into n from public.kz_guild_member where guild_id = g.id;
  if n >= 30 then raise exception 'lonca: lonca dolu'; end if;
  insert into public.kz_guild_member(user_id, guild_id, role) values (uid, g.id, 'uye');
end;
$$;
revoke all on function public.kz_g_join(bigint) from public, anon;
grant execute on function public.kz_g_join(bigint) to authenticated;

create or replace function public.kz_g_leave()
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  delete from public.kz_guild_member where user_id = uid;
end;
$$;
revoke all on function public.kz_g_leave() from public, anon;
grant execute on function public.kz_g_leave() to authenticated;

create or replace function public.kz_g_kick(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); me record; tg record;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select * into me from public.kz_guild_member where user_id = uid;
  select * into tg from public.kz_guild_member where user_id = p_user;
  if me is null or tg is null or me.guild_id <> tg.guild_id then raise exception 'lonca: oyuncu loncanda degil'; end if;
  if p_user = uid then raise exception 'lonca: kendini atamazsin'; end if;
  if me.role = 'lider' or (me.role = 'subay' and tg.role = 'uye') then
    delete from public.kz_guild_member where user_id = p_user;
  else raise exception 'lonca: yetkin yok'; end if;
end;
$$;
revoke all on function public.kz_g_kick(uuid) from public, anon;
grant execute on function public.kz_g_kick(uuid) to authenticated;

-- Rütbe: p_role 'subay' | 'uye' | 'lider' (lider = liderliği devret)
create or replace function public.kz_g_role(p_user uuid, p_role text)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); me record; tg record;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  if p_role not in ('subay', 'uye', 'lider') then raise exception 'lonca: gecersiz rutbe'; end if;
  select * into me from public.kz_guild_member where user_id = uid;
  select * into tg from public.kz_guild_member where user_id = p_user;
  if me is null or tg is null or me.guild_id <> tg.guild_id then raise exception 'lonca: oyuncu loncanda degil'; end if;
  if me.role <> 'lider' then raise exception 'lonca: yetkin yok'; end if;
  if p_user = uid then raise exception 'lonca: kendine islem yapamazsin'; end if;
  if p_role = 'lider' then
    update public.kz_guild_member set role = 'subay' where user_id = uid;
    update public.kz_guild_member set role = 'lider' where user_id = p_user;
  else
    update public.kz_guild_member set role = p_role where user_id = p_user;
  end if;
end;
$$;
revoke all on function public.kz_g_role(uuid, text) from public, anon;
grant execute on function public.kz_g_role(uuid, text) to authenticated;

create or replace function public.kz_g_set(p_descr text, p_emblem int, p_min_lv int, p_open boolean)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); me record; ds text := left(btrim(coalesce(p_descr, '')), 80);
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select * into me from public.kz_guild_member where user_id = uid;
  if me is null or me.role <> 'lider' then raise exception 'lonca: yetkin yok'; end if;
  if public.kz_is_bad(ds) then raise exception 'kufur: lonca'; end if;
  update public.kz_guild set descr = ds, emblem = greatest(0, least(11, coalesce(p_emblem, 0))),
         min_lv = greatest(1, least(100, coalesce(p_min_lv, 1))), open = coalesce(p_open, true)
   where id = me.guild_id;
end;
$$;
revoke all on function public.kz_g_set(text, int, int, boolean) from public, anon;
grant execute on function public.kz_g_set(text, int, int, boolean) to authenticated;

create or replace function public.kz_g_disband()
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); me record;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select * into me from public.kz_guild_member where user_id = uid;
  if me is null or me.role <> 'lider' then raise exception 'lonca: yetkin yok'; end if;
  delete from public.kz_guild where id = me.guild_id;
end;
$$;
revoke all on function public.kz_g_disband() from public, anon;
grant execute on function public.kz_g_disband() to authenticated;

-- Lonca sohbeti
create or replace function public.kz_g_say(p_body text)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); me record; b text := btrim(coalesce(p_body, '')); lastt timestamptz;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select * into me from public.kz_guild_member where user_id = uid;
  if me is null then raise exception 'lonca: loncan yok'; end if;
  if char_length(b) < 1 or char_length(b) > 200 then raise exception 'lonca: mesaj 1-200 karakter olmali'; end if;
  if public.kz_is_bad(b) then raise exception 'kufur: mesaj'; end if;
  select max(created) into lastt from public.kz_guild_chat where user_id = uid;
  if lastt is not null and lastt > now() - interval '2 seconds' then raise exception 'cok hizli yaziyorsun'; end if;
  insert into public.kz_guild_chat(guild_id, user_id, body) values (me.guild_id, uid, b);
  if random() < 0.05 then delete from public.kz_guild_chat where created < now() - interval '7 days'; end if;
end;
$$;
revoke all on function public.kz_g_say(text) from public, anon;
grant execute on function public.kz_g_say(text) to authenticated;

create or replace function public.kz_g_chat()
returns table(id bigint, user_id uuid, name text, body text, created timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); gid bigint;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select gm.guild_id into gid from public.kz_guild_member gm where gm.user_id = uid;
  if gid is null then return; end if;
  return query
    select x.cid, x.cuid, x.cname, x.cbody, x.ccreated from (
      select c.id as cid, c.user_id as cuid, coalesce(l.char_name, 'Oyuncu')::text as cname, c.body as cbody, c.created as ccreated
        from public.kz_guild_chat c left join public.leaderboard l on l.user_id = c.user_id
       where c.guild_id = gid order by c.id desc limit 50) x
    order by x.cid;
end;
$$;
revoke all on function public.kz_g_chat() from public, anon;
grant execute on function public.kz_g_chat() to authenticated;
