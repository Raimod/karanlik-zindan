-- ============================================================
-- Valdrenn: KARAKTER BAZLI KİMLİK (sürüm 2.11.0)
-- Sıralama, sohbet, arkadaşlık, özel mesaj, engel, çevrimiçi durumu ve lonca artık HESABA DEĞİL KARAKTERE bağlıdır.
-- Aynı hesabın karakterleri birbirinden bağımsız oyunculardır; ortak olan tek şey banka/pazar/takas deposudur.
-- Çalıştırma: SQL Editor'de yeni sekme, bu dosyanın hepsini yapıştır, Run. EN SON çalıştırılacak dosyadır. Tekrar çalıştırmak zararsızdır.
-- Gerekenler: topluluk, liderlik, filtre, dunya100, lonca ve arkadas dosyaları önceden çalıştırılmış olmalı.
-- NOT: Bu dosyadan sonra liderlik.sql / dunya100.sql / sunucu.sql dosyalarını TEKRAR çalıştırırsan bu dosyayı da yeniden çalıştır.
-- Eski arkadaşlık/mesaj/engel verileri sıfırlanır (yeni sistem karakter adına dayanır). Lonca üyelikleri en güçlü karaktere taşınır.
-- ============================================================

-- ---------- 1) SIRALAMA: karakter başına bir satır ----------
alter table public.leaderboard add column if not exists ck text;
-- geçiş sırasında eski satırlar kontrol edilmesin (yeni satırlar yine kontrol edilir)
alter table public.leaderboard disable trigger lb_before_write;
update public.leaderboard set ck = public.kz_name_key(char_name) where ck is null;
delete from public.leaderboard where ck is null;
alter table public.leaderboard enable trigger lb_before_write;
do $$ begin
  if exists (select 1 from pg_constraint where conrelid = 'public.leaderboard'::regclass and contype = 'p' and conname = 'leaderboard_pkey') then
    alter table public.leaderboard drop constraint leaderboard_pkey;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.leaderboard'::regclass and contype = 'p') then
    alter table public.leaderboard add primary key (ck);
  end if;
end $$;
create index if not exists lb_user_idx on public.leaderboard (user_id);

-- Karakter kimliği: ad anahtarı (kz_names) hesabınındır; değilse hata
create or replace function public.kz_me(p_me text)
returns text language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); k text;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  k := public.kz_name_key(p_me);
  if not exists (select 1 from public.kz_names where key = k and user_id = uid) then
    raise exception 'karakter: bu karakter hesabinda kayitli degil';
  end if;
  return k;
end;
$$;
revoke all on function public.kz_me(text) from public, anon, authenticated;

create or replace function public.kz_lb_refresh()
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); sd jsonb; s jsonb; keys text[] := '{}'; k text; cl text; nm text;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select data into sd from public.saves where user_id = uid;
  if sd is null or jsonb_typeof(sd->'slots') <> 'array' then delete from public.leaderboard where user_id = uid; return; end if;
  for s in select x from jsonb_array_elements(sd->'slots') x where jsonb_typeof(x) = 'object' loop
    nm := left(coalesce(s->>'name', ''), 14);
    if nm = '' then continue; end if;
    k := public.kz_name_key(nm);
    if not exists (select 1 from public.kz_names where key = k and user_id = uid) then continue; end if;
    keys := keys || k;
    cl := s->>'cls';
    if cl is null or cl not in ('tank','mage','archer','assassin','healer') then cl := 'tank'; end if;
    insert into public.leaderboard(ck, user_id, char_name, cls, level, tower, elites, kills, maxhit)
    values (k, uid, nm, cl,
            greatest(1, least(100, public.kz_n(s,'lv')::int)),
            greatest(0, least(500, public.kz_n(s,'tw')::int)),
            greatest(0, least(100000, public.kz_n(s->'st','e')::int)),
            greatest(0, least(10000000, public.kz_n(s->'st','k')::bigint)),
            greatest(0, least(2000000000, public.kz_n(s->'st','mh')::bigint)))
    on conflict (ck) do update
      set char_name = excluded.char_name, cls = excluded.cls, level = excluded.level, tower = excluded.tower,
          elites = excluded.elites, kills = excluded.kills, maxhit = excluded.maxhit
      where public.leaderboard.user_id = excluded.user_id;
  end loop;
  delete from public.leaderboard where user_id = uid and not (ck = any (keys));
end;
$$;
revoke all on function public.kz_lb_refresh() from public, anon;
grant execute on function public.kz_lb_refresh() to authenticated;

drop function if exists public.kz_rank_find(text, text);
create or replace function public.kz_rank_find(p_col text, p_q text)
returns table(rk bigint, ck text, char_name text, cls text, level int, tower int, elites int, kills int, maxhit bigint)
language plpgsql stable security definer set search_path = public as $$
declare q text := replace(replace(replace(trim(coalesce(p_q,'')), '\', '\\'), '%', '\%'), '_', '\_');
begin
  if auth.uid() is null then raise exception 'giris gerekli'; end if;
  if p_col not in ('level','tower','elites','maxhit') then p_col := 'level'; end if;
  if char_length(q) < 1 then return; end if;
  return query
    with r as (
      select l.*, row_number() over (
        order by case p_col when 'level' then l.level::bigint when 'tower' then l.tower::bigint
                            when 'elites' then l.elites::bigint else l.maxhit end desc,
                 l.kills desc, l.ck) as rnk
      from public.leaderboard l)
    select r.rnk, r.ck, r.char_name, r.cls, r.level, r.tower, r.elites, r.kills, r.maxhit
      from r where r.char_name ilike '%' || q || '%' order by r.rnk limit 10;
end;
$$;
revoke all on function public.kz_rank_find(text, text) from public, anon;
grant execute on function public.kz_rank_find(text, text) to authenticated;

drop function if exists public.kz_profile(uuid);
create or replace function public.kz_profile(p_ck text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare sd jsonb; best jsonb; lb record; eqj jsonb := '{}'::jsonb; k text; it jsonb;
begin
  if auth.uid() is null then raise exception 'giris gerekli'; end if;
  select * into lb from public.leaderboard where ck = p_ck;
  if not found then return null; end if;
  select data into sd from public.saves where user_id = lb.user_id;
  if sd is null or jsonb_typeof(sd->'slots') <> 'array' then return null; end if;
  select s into best from jsonb_array_elements(sd->'slots') s
   where jsonb_typeof(s) = 'object' and public.kz_name_key(s->>'name') = p_ck limit 1;
  if best is null then return null; end if;
  if jsonb_typeof(best->'eq') = 'object' then
    for k, it in select * from jsonb_each(best->'eq') loop
      if jsonb_typeof(it) = 'object' then
        eqj := eqj || jsonb_build_object(k, jsonb_build_object(
          'name', it->'name', 'g', it->'g', 'p', it->'p', 'rl', it->'rl', 'setOre', it->'setOre', 'rc', it->'rc',
          'af', case when jsonb_typeof(it->'af') = 'array' then it->'af' else '[]'::jsonb end));
      end if;
    end loop;
  end if;
  return jsonb_build_object('ck', p_ck, 'name', best->>'name', 'cls', best->>'cls', 'lv', public.kz_n(best,'lv'),
    'tw', public.kz_n(best,'tw'), 'title', best->>'title', 'race', best->>'race',
    'kills', lb.kills, 'elites', lb.elites, 'tower', lb.tower, 'maxhit', lb.maxhit, 'eq', eqj);
end;
$$;
revoke all on function public.kz_profile(text) from public, anon;
grant execute on function public.kz_profile(text) to authenticated;

-- ---------- 2) GENEL SOHBET: mesajı yazan KARAKTER ----------
alter table public.chat_messages add column if not exists char_name text not null default '';
alter table public.chat_messages add column if not exists char_key text not null default '';
create or replace function public.chat_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare lastt timestamptz; uname text;
begin
  select username into uname from public.profiles where id = new.user_id;
  if uname is null then raise exception 'profil bulunamadi'; end if;
  new.username := uname;
  new.body := btrim(new.body);
  new.char_name := left(btrim(coalesce(new.char_name, '')), 14);
  if new.char_name <> '' then
    new.char_key := public.kz_name_key(new.char_name);
    if not exists (select 1 from public.kz_names where key = new.char_key and user_id = new.user_id) then
      raise exception 'karakter: bu karakter hesabinda kayitli degil';
    end if;
  else new.char_key := ''; end if;
  select max(created_at) into lastt from public.chat_messages where user_id = new.user_id;
  if lastt is not null and lastt > now() - interval '2 seconds' then
    raise exception 'cok hizli yaziyorsun';
  end if;
  if random() < 0.05 then
    delete from public.chat_messages where created_at < now() - interval '7 days';
  end if;
  return new;
end;
$$;
revoke all on function public.chat_before_insert() from public, anon, authenticated;

-- ---------- 3) ARKADAŞLIK / MESAJ / ENGEL / ÇEVRİMİÇİ: karakter anahtarıyla (eski veriler sıfırlanır) ----------
drop function if exists public.kz_ping();
drop function if exists public.kz_f_rel(uuid);
drop function if exists public.kz_f_req(uuid);
drop function if exists public.kz_f_accept(uuid);
drop function if exists public.kz_f_remove(uuid);
drop function if exists public.kz_f_block(uuid, boolean);
drop function if exists public.kz_f_list();
drop function if exists public.kz_dm_send(uuid, text);
drop function if exists public.kz_dm_thread(uuid);
drop function if exists public.kz_dm_inbox();
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'kz_friend' and column_name = 'from_uid') then
    drop table public.kz_friend; drop table public.kz_block; drop table public.kz_dm; drop table public.kz_presence;
  end if;
end $$;

create table if not exists public.kz_presence (ck text primary key, seen timestamptz not null default now());
create table if not exists public.kz_friend (
  from_ck text not null, to_ck text not null,
  status text not null default 'req' check (status in ('req','ok')),
  created timestamptz not null default now(),
  primary key (from_ck, to_ck), check (from_ck <> to_ck));
create index if not exists kz_friend_to_idx on public.kz_friend(to_ck);
create table if not exists public.kz_block (ck text not null, blocked text not null, primary key (ck, blocked));
create table if not exists public.kz_dm (
  id bigserial primary key, from_ck text not null, to_ck text not null,
  body text not null check (char_length(body) between 1 and 200),
  created timestamptz not null default now(), is_read boolean not null default false);
create index if not exists kz_dm_to_idx on public.kz_dm(to_ck, is_read);
create index if not exists kz_dm_pair_idx on public.kz_dm(from_ck, to_ck, id desc);
alter table public.kz_presence enable row level security; revoke all on public.kz_presence from anon, authenticated;
alter table public.kz_friend enable row level security; revoke all on public.kz_friend from anon, authenticated;
alter table public.kz_block enable row level security; revoke all on public.kz_block from anon, authenticated;
alter table public.kz_dm enable row level security; revoke all on public.kz_dm from anon, authenticated;

create or replace function public.kz_ping(p_me text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me); un int; rq int;
begin
  insert into public.kz_presence(ck, seen) values (me, now()) on conflict (ck) do update set seen = now();
  select count(*) into un from public.kz_dm where to_ck = me and not is_read;
  select count(*) into rq from public.kz_friend where to_ck = me and status = 'req';
  if random() < 0.02 then delete from public.kz_dm where created < now() - interval '14 days'; end if;
  return jsonb_build_object('unread', un, 'reqs', rq);
end;
$$;
revoke all on function public.kz_ping(text) from public, anon; grant execute on function public.kz_ping(text) to authenticated;

create or replace function public.kz_f_rel(p_me text, p_user text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare me text := public.kz_me(p_me); r text; f record; sn timestamptz;
begin
  if p_user = me then return jsonb_build_object('rel', 'self'); end if;
  if exists (select 1 from public.kz_block where ck = me and blocked = p_user) then r := 'blocked';
  elsif exists (select 1 from public.kz_block where ck = p_user and blocked = me) then r := 'blockedby';
  else
    select * into f from public.kz_friend where (from_ck = me and to_ck = p_user) or (from_ck = p_user and to_ck = me) limit 1;
    if not found then r := 'none'; elsif f.status = 'ok' then r := 'friend'; elsif f.from_ck = me then r := 'sent'; else r := 'got'; end if;
  end if;
  if r = 'friend' then select seen into sn from public.kz_presence where ck = p_user; end if;
  return jsonb_build_object('rel', r, 'online', coalesce(r = 'friend' and sn > now() - interval '3 minutes', false));
end;
$$;
revoke all on function public.kz_f_rel(text, text) from public, anon; grant execute on function public.kz_f_rel(text, text) to authenticated;

create or replace function public.kz_f_req(p_me text, p_user text)
returns text language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me); n int;
begin
  if p_user = me then raise exception 'arkadas: kendini ekleyemezsin'; end if;
  if not exists (select 1 from public.leaderboard where ck = p_user) then raise exception 'arkadas: oyuncu bulunamadi'; end if;
  if exists (select 1 from public.kz_block where (ck = p_user and blocked = me) or (ck = me and blocked = p_user)) then raise exception 'arkadas: engelli'; end if;
  if exists (select 1 from public.kz_friend where status = 'ok' and ((from_ck = me and to_ck = p_user) or (from_ck = p_user and to_ck = me))) then raise exception 'arkadas: zaten arkadassiniz'; end if;
  select count(*) into n from public.kz_friend where status = 'ok' and (from_ck = me or to_ck = me);
  if n >= 50 then raise exception 'arkadas: arkadas listen dolu'; end if;
  select count(*) into n from public.kz_friend where from_ck = me and status = 'req';
  if n >= 30 then raise exception 'arkadas: cok fazla bekleyen istegin var'; end if;
  if exists (select 1 from public.kz_friend where from_ck = p_user and to_ck = me and status = 'req') then
    update public.kz_friend set status = 'ok' where from_ck = p_user and to_ck = me; return 'friend';
  end if;
  insert into public.kz_friend(from_ck, to_ck) values (me, p_user) on conflict do nothing;
  return 'sent';
end;
$$;
revoke all on function public.kz_f_req(text, text) from public, anon; grant execute on function public.kz_f_req(text, text) to authenticated;

create or replace function public.kz_f_accept(p_me text, p_user text)
returns void language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me); n int;
begin
  select count(*) into n from public.kz_friend where status = 'ok' and (from_ck = me or to_ck = me);
  if n >= 50 then raise exception 'arkadas: arkadas listen dolu'; end if;
  update public.kz_friend set status = 'ok' where from_ck = p_user and to_ck = me and status = 'req';
  if not found then raise exception 'arkadas: istek bulunamadi'; end if;
end;
$$;
revoke all on function public.kz_f_accept(text, text) from public, anon; grant execute on function public.kz_f_accept(text, text) to authenticated;

create or replace function public.kz_f_remove(p_me text, p_user text)
returns void language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me);
begin
  delete from public.kz_friend where (from_ck = me and to_ck = p_user) or (from_ck = p_user and to_ck = me);
end;
$$;
revoke all on function public.kz_f_remove(text, text) from public, anon; grant execute on function public.kz_f_remove(text, text) to authenticated;

create or replace function public.kz_f_block(p_me text, p_user text, p_on boolean)
returns void language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me);
begin
  if p_user = me then raise exception 'arkadas: kendini engelleyemezsin'; end if;
  if p_on then
    insert into public.kz_block(ck, blocked) values (me, p_user) on conflict do nothing;
    delete from public.kz_friend where (from_ck = me and to_ck = p_user) or (from_ck = p_user and to_ck = me);
  else delete from public.kz_block where ck = me and blocked = p_user; end if;
end;
$$;
revoke all on function public.kz_f_block(text, text, boolean) from public, anon; grant execute on function public.kz_f_block(text, text, boolean) to authenticated;

create or replace function public.kz_f_list(p_me text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare me text := public.kz_me(p_me); fr jsonb; inc jsonb; outg jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object('ck', x.pid, 'name', coalesce(l.char_name, '?'), 'cls', coalesce(l.cls, 'tank'),
      'level', coalesce(l.level, 1), 'online', coalesce(p.seen > now() - interval '3 minutes', false),
      'unread', (select count(*) from public.kz_dm d where d.from_ck = x.pid and d.to_ck = me and not d.is_read))
      order by coalesce(p.seen > now() - interval '3 minutes', false) desc, coalesce(l.char_name, '')), '[]'::jsonb)
    into fr
    from (select case when from_ck = me then to_ck else from_ck end as pid from public.kz_friend
           where status = 'ok' and (from_ck = me or to_ck = me)) x
    left join public.leaderboard l on l.ck = x.pid
    left join public.kz_presence p on p.ck = x.pid;
  select coalesce(jsonb_agg(jsonb_build_object('ck', f.from_ck, 'name', coalesce(l.char_name, '?'), 'level', coalesce(l.level, 1)) order by f.created), '[]'::jsonb)
    into inc from public.kz_friend f left join public.leaderboard l on l.ck = f.from_ck where f.to_ck = me and f.status = 'req';
  select coalesce(jsonb_agg(jsonb_build_object('ck', f.to_ck, 'name', coalesce(l.char_name, '?'), 'level', coalesce(l.level, 1)) order by f.created), '[]'::jsonb)
    into outg from public.kz_friend f left join public.leaderboard l on l.ck = f.to_ck where f.from_ck = me and f.status = 'req';
  return jsonb_build_object('friends', fr, 'incoming', inc, 'outgoing', outg);
end;
$$;
revoke all on function public.kz_f_list(text) from public, anon; grant execute on function public.kz_f_list(text) to authenticated;

create or replace function public.kz_dm_send(p_me text, p_user text, p_body text)
returns void language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me); b text := btrim(coalesce(p_body, '')); lastt timestamptz;
begin
  if p_user = me then raise exception 'arkadas: kendine yazamazsin'; end if;
  if not exists (select 1 from public.leaderboard where ck = p_user) then raise exception 'arkadas: oyuncu bulunamadi'; end if;
  if exists (select 1 from public.kz_block where ck = p_user and blocked = me) then raise exception 'arkadas: bu oyuncu sana mesaj kabul etmiyor'; end if;
  if exists (select 1 from public.kz_block where ck = me and blocked = p_user) then raise exception 'arkadas: bu oyuncuyu engelledin'; end if;
  if char_length(b) < 1 or char_length(b) > 200 then raise exception 'arkadas: mesaj 1-200 karakter olmali'; end if;
  if public.kz_is_bad(b) then raise exception 'kufur: mesaj'; end if;
  select max(created) into lastt from public.kz_dm where from_ck = me;
  if lastt is not null and lastt > now() - interval '2 seconds' then raise exception 'cok hizli yaziyorsun'; end if;
  insert into public.kz_dm(from_ck, to_ck, body) values (me, p_user, b);
end;
$$;
revoke all on function public.kz_dm_send(text, text, text) from public, anon; grant execute on function public.kz_dm_send(text, text, text) to authenticated;

create or replace function public.kz_dm_thread(p_me text, p_user text)
returns table(id bigint, mine boolean, body text, created timestamptz)
language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me);
begin
  update public.kz_dm set is_read = true where to_ck = me and from_ck = p_user and not is_read;
  return query
    select x.did, x.dmine, x.dbody, x.dcreated from (
      select d.id as did, (d.from_ck = me) as dmine, d.body as dbody, d.created as dcreated
        from public.kz_dm d where (d.from_ck = me and d.to_ck = p_user) or (d.from_ck = p_user and d.to_ck = me)
       order by d.id desc limit 50) x order by x.did;
end;
$$;
revoke all on function public.kz_dm_thread(text, text) from public, anon; grant execute on function public.kz_dm_thread(text, text) to authenticated;

create or replace function public.kz_dm_inbox(p_me text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare me text := public.kz_me(p_me); r jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object('ck', c.pid, 'name', coalesce(l.char_name, '?'), 'body', c.body, 'mine', c.mine,
      'unread', (select count(*) from public.kz_dm d where d.from_ck = c.pid and d.to_ck = me and not d.is_read)) order by c.mid desc), '[]'::jsonb)
    into r
    from (select distinct on (pid) pid, mid, body, mine from (
            select case when from_ck = me then to_ck else from_ck end as pid, id as mid, body, (from_ck = me) as mine
              from public.kz_dm where from_ck = me or to_ck = me) q order by pid, mid desc) c
    left join public.leaderboard l on l.ck = c.pid
    where not exists (select 1 from public.kz_block b where b.ck = me and b.blocked = c.pid);
  return r;
end;
$$;
revoke all on function public.kz_dm_inbox(text) from public, anon; grant execute on function public.kz_dm_inbox(text) to authenticated;

-- ---------- 4) LONCA: üyelik karaktere bağlı ----------
alter table public.kz_guild_member add column if not exists ck text;
update public.kz_guild_member m set ck = l.ck from (
  select distinct on (user_id) user_id, ck from public.leaderboard order by user_id, level desc, kills desc) l
 where m.user_id = l.user_id and m.ck is null;
delete from public.kz_guild_member where ck is null;
alter table public.kz_guild_chat add column if not exists ck text;
update public.kz_guild_chat c set ck = (select m.ck from public.kz_guild_member m where m.user_id = c.user_id limit 1) where ck is null;
do $$ begin
  if exists (select 1 from pg_constraint where conrelid = 'public.kz_guild_member'::regclass and contype = 'p' and conname = 'kz_guild_member_pkey') then
    alter table public.kz_guild_member drop constraint kz_guild_member_pkey;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.kz_guild_member'::regclass and contype = 'p') then
    alter table public.kz_guild_member add primary key (ck);
  end if;
end $$;
alter table public.kz_guild_member alter column user_id drop not null;
alter table public.kz_guild_chat alter column user_id drop not null;
alter table public.kz_guild_chat alter column ck set default '';
update public.kz_guild_chat set ck = '' where ck is null;
-- boş kalan lonca silinir, lidersiz kalan loncaya lider atanır
delete from public.kz_guild g where not exists (select 1 from public.kz_guild_member m where m.guild_id = g.id);

create or replace function public.kz_gm_after_delete()
returns trigger language plpgsql security definer set search_path = public as $$
declare nu text;
begin
  if old.role = 'lider' and exists (select 1 from public.kz_guild where id = old.guild_id) then
    select ck into nu from public.kz_guild_member where guild_id = old.guild_id order by (role = 'subay') desc, joined limit 1;
    if nu is null then delete from public.kz_guild where id = old.guild_id;
    else update public.kz_guild_member set role = 'lider' where ck = nu; end if;
  end if;
  return null;
end;
$$;
revoke all on function public.kz_gm_after_delete() from public, anon, authenticated;

drop function if exists public.kz_g_me();
drop function if exists public.kz_g_create(text, text, int);
drop function if exists public.kz_g_join(bigint);
drop function if exists public.kz_g_leave();
drop function if exists public.kz_g_kick(uuid);
drop function if exists public.kz_g_role(uuid, text);
drop function if exists public.kz_g_set(text, int, int, boolean);
drop function if exists public.kz_g_disband();
drop function if exists public.kz_g_say(text);
drop function if exists public.kz_g_chat();

create or replace function public.kz_g_me(p_me text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare me text := public.kz_me(p_me); m record; g record; mem jsonb; pw bigint;
begin
  select * into m from public.kz_guild_member where ck = me;
  if not found then return null; end if;
  select * into g from public.kz_guild where id = m.guild_id;
  select coalesce(jsonb_agg(jsonb_build_object('ck', gm.ck, 'name', coalesce(l.char_name, '?'),
           'cls', coalesce(l.cls, 'tank'), 'level', coalesce(l.level, 1), 'role', gm.role)
           order by case gm.role when 'lider' then 0 when 'subay' then 1 else 2 end, coalesce(l.level, 1) desc, gm.joined), '[]'::jsonb),
         coalesce(sum(coalesce(l.level, 0)), 0)
    into mem, pw from public.kz_guild_member gm left join public.leaderboard l on l.ck = gm.ck where gm.guild_id = g.id;
  return jsonb_build_object('id', g.id, 'name', g.name, 'descr', g.descr, 'emblem', g.emblem, 'min_lv', g.min_lv, 'open', g.open,
    'role', m.role, 'count', jsonb_array_length(mem), 'power', pw, 'members', mem);
end;
$$;
revoke all on function public.kz_g_me(text) from public, anon; grant execute on function public.kz_g_me(text) to authenticated;

create or replace function public.kz_g_list(p_q text default '')
returns table(id bigint, name text, descr text, emblem int, min_lv int, open boolean, cnt bigint, power bigint)
language plpgsql stable security definer set search_path = public as $$
declare q text := replace(replace(replace(trim(coalesce(p_q, '')), '\', '\\'), '%', '\%'), '_', '\_');
begin
  if auth.uid() is null then raise exception 'giris gerekli'; end if;
  return query
    select g.id, g.name, g.descr, g.emblem, g.min_lv, g.open, count(gm.ck)::bigint, coalesce(sum(coalesce(l.level, 0)), 0)::bigint as pw
      from public.kz_guild g join public.kz_guild_member gm on gm.guild_id = g.id left join public.leaderboard l on l.ck = gm.ck
     where q = '' or g.name ilike '%' || q || '%'
     group by g.id order by pw desc, g.id limit 30;
end;
$$;
revoke all on function public.kz_g_list(text) from public, anon; grant execute on function public.kz_g_list(text) to authenticated;

create or replace function public.kz_g_create(p_me text, p_name text, p_descr text, p_emblem int)
returns bigint language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me); uid uuid := auth.uid(); lv int; nm text := btrim(coalesce(p_name, '')); ds text := left(btrim(coalesce(p_descr, '')), 80); gid bigint;
begin
  if exists (select 1 from public.kz_guild_member where ck = me) then raise exception 'lonca: zaten loncan var'; end if;
  select level into lv from public.leaderboard where ck = me;
  if lv is null then raise exception 'lonca: once oyunda bir karakter olustur'; end if;
  if lv < 10 then raise exception 'lonca: lonca kurmak icin seviye 10 gerekir'; end if;
  if char_length(nm) < 3 or char_length(nm) > 16 then raise exception 'lonca: ad 3-16 karakter olmali'; end if;
  if public.kz_is_bad(nm) or public.kz_is_bad(ds) then raise exception 'kufur: lonca'; end if;
  begin
    insert into public.kz_guild(name, name_key, descr, emblem) values (nm, public.kz_name_key(nm), ds, greatest(0, least(11, coalesce(p_emblem, 0)))) returning id into gid;
  exception when unique_violation then raise exception 'lonca: bu lonca adi alinmis';
  end;
  insert into public.kz_guild_member(ck, user_id, guild_id, role) values (me, uid, gid, 'lider');
  return gid;
end;
$$;
revoke all on function public.kz_g_create(text, text, text, int) from public, anon; grant execute on function public.kz_g_create(text, text, text, int) to authenticated;

create or replace function public.kz_g_join(p_me text, p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me); uid uuid := auth.uid(); lv int; g record; n int;
begin
  if exists (select 1 from public.kz_guild_member where ck = me) then raise exception 'lonca: zaten loncan var'; end if;
  select * into g from public.kz_guild where id = p_id for update;
  if not found then raise exception 'lonca: lonca bulunamadi'; end if;
  if not g.open then raise exception 'lonca: lonca davetli, katilima kapali'; end if;
  select level into lv from public.leaderboard where ck = me;
  if lv is null then raise exception 'lonca: once oyunda bir karakter olustur'; end if;
  if lv < g.min_lv then raise exception 'lonca: en az seviye % gerekir', g.min_lv; end if;
  select count(*) into n from public.kz_guild_member where guild_id = g.id;
  if n >= 30 then raise exception 'lonca: lonca dolu'; end if;
  insert into public.kz_guild_member(ck, user_id, guild_id, role) values (me, uid, g.id, 'uye');
end;
$$;
revoke all on function public.kz_g_join(text, bigint) from public, anon; grant execute on function public.kz_g_join(text, bigint) to authenticated;

create or replace function public.kz_g_leave(p_me text)
returns void language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me);
begin delete from public.kz_guild_member where ck = me; end;
$$;
revoke all on function public.kz_g_leave(text) from public, anon; grant execute on function public.kz_g_leave(text) to authenticated;

create or replace function public.kz_g_kick(p_me text, p_user text)
returns void language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me); a record; tg record;
begin
  select * into a from public.kz_guild_member where ck = me;
  select * into tg from public.kz_guild_member where ck = p_user;
  if a is null or tg is null or a.guild_id <> tg.guild_id then raise exception 'lonca: oyuncu loncanda degil'; end if;
  if p_user = me then raise exception 'lonca: kendini atamazsin'; end if;
  if a.role = 'lider' or (a.role = 'subay' and tg.role = 'uye') then delete from public.kz_guild_member where ck = p_user;
  else raise exception 'lonca: yetkin yok'; end if;
end;
$$;
revoke all on function public.kz_g_kick(text, text) from public, anon; grant execute on function public.kz_g_kick(text, text) to authenticated;

create or replace function public.kz_g_role(p_me text, p_user text, p_role text)
returns void language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me); a record; tg record;
begin
  if p_role not in ('subay', 'uye', 'lider') then raise exception 'lonca: gecersiz rutbe'; end if;
  select * into a from public.kz_guild_member where ck = me;
  select * into tg from public.kz_guild_member where ck = p_user;
  if a is null or tg is null or a.guild_id <> tg.guild_id then raise exception 'lonca: oyuncu loncanda degil'; end if;
  if a.role <> 'lider' then raise exception 'lonca: yetkin yok'; end if;
  if p_user = me then raise exception 'lonca: kendine islem yapamazsin'; end if;
  if p_role = 'lider' then
    update public.kz_guild_member set role = 'subay' where ck = me;
    update public.kz_guild_member set role = 'lider' where ck = p_user;
  else update public.kz_guild_member set role = p_role where ck = p_user; end if;
end;
$$;
revoke all on function public.kz_g_role(text, text, text) from public, anon; grant execute on function public.kz_g_role(text, text, text) to authenticated;

create or replace function public.kz_g_set(p_me text, p_descr text, p_emblem int, p_min_lv int, p_open boolean)
returns void language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me); a record; ds text := left(btrim(coalesce(p_descr, '')), 80);
begin
  select * into a from public.kz_guild_member where ck = me;
  if a is null or a.role <> 'lider' then raise exception 'lonca: yetkin yok'; end if;
  if public.kz_is_bad(ds) then raise exception 'kufur: lonca'; end if;
  update public.kz_guild set descr = ds, emblem = greatest(0, least(11, coalesce(p_emblem, 0))),
         min_lv = greatest(1, least(100, coalesce(p_min_lv, 1))), open = coalesce(p_open, true) where id = a.guild_id;
end;
$$;
revoke all on function public.kz_g_set(text, text, int, int, boolean) from public, anon; grant execute on function public.kz_g_set(text, text, int, int, boolean) to authenticated;

create or replace function public.kz_g_disband(p_me text)
returns void language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me); a record;
begin
  select * into a from public.kz_guild_member where ck = me;
  if a is null or a.role <> 'lider' then raise exception 'lonca: yetkin yok'; end if;
  delete from public.kz_guild where id = a.guild_id;
end;
$$;
revoke all on function public.kz_g_disband(text) from public, anon; grant execute on function public.kz_g_disband(text) to authenticated;

create or replace function public.kz_g_say(p_me text, p_body text)
returns void language plpgsql security definer set search_path = public as $$
declare me text := public.kz_me(p_me); a record; b text := btrim(coalesce(p_body, '')); lastt timestamptz;
begin
  select * into a from public.kz_guild_member where ck = me;
  if a is null then raise exception 'lonca: loncan yok'; end if;
  if char_length(b) < 1 or char_length(b) > 200 then raise exception 'lonca: mesaj 1-200 karakter olmali'; end if;
  if public.kz_is_bad(b) then raise exception 'kufur: mesaj'; end if;
  select max(created) into lastt from public.kz_guild_chat where ck = me;
  if lastt is not null and lastt > now() - interval '2 seconds' then raise exception 'cok hizli yaziyorsun'; end if;
  insert into public.kz_guild_chat(guild_id, user_id, ck, body) values (a.guild_id, auth.uid(), me, b);
  if random() < 0.05 then delete from public.kz_guild_chat where created < now() - interval '7 days'; end if;
end;
$$;
revoke all on function public.kz_g_say(text, text) from public, anon; grant execute on function public.kz_g_say(text, text) to authenticated;

create or replace function public.kz_g_chat(p_me text)
returns table(id bigint, ck text, name text, body text, created timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare me text := public.kz_me(p_me); gid bigint;
begin
  select gm.guild_id into gid from public.kz_guild_member gm where gm.ck = me;
  if gid is null then return; end if;
  return query
    select x.cid, x.cck, x.cname, x.cbody, x.ccreated from (
      select c.id as cid, c.ck as cck, coalesce(l.char_name, 'Oyuncu')::text as cname, c.body as cbody, c.created as ccreated
        from public.kz_guild_chat c left join public.leaderboard l on l.ck = c.ck
       where c.guild_id = gid order by c.id desc limit 50) x order by x.cid;
end;
$$;
revoke all on function public.kz_g_chat(text) from public, anon; grant execute on function public.kz_g_chat(text) to authenticated;

-- ---------- 5) Karakter silinip adı serbest kalınca ona bağlı her şey temizlenir ----------
create or replace function public.kz_char_released()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.kz_guild_member where ck = old.key;
  delete from public.kz_friend where from_ck = old.key or to_ck = old.key;
  delete from public.kz_block where ck = old.key or blocked = old.key;
  delete from public.kz_dm where from_ck = old.key or to_ck = old.key;
  delete from public.kz_presence where ck = old.key;
  delete from public.leaderboard where ck = old.key and user_id = old.user_id;
  return null;
end;
$$;
revoke all on function public.kz_char_released() from public, anon, authenticated;
drop trigger if exists kz_char_released on public.kz_names;
create trigger kz_char_released after delete on public.kz_names for each row execute function public.kz_char_released();

-- Hesap tamamen silinirse (auth.users) üyelik/sohbet satırları zaten user_id üzerinden temizlenemez: kz_names silinince yukarıdaki tetikleyici çalışır.
