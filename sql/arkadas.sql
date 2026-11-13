-- ============================================================
-- Valdrenn: ARKADAŞ LİSTESİ, ÇEVRİMİÇİ DURUMU, ÖZEL MESAJ, ENGELLEME (sürüm 2.9.0)
-- Çalıştırma: SQL Editor'de yeni sekme, bu dosyanın hepsini yapıştır, Run. Tekrar çalıştırmak zararsızdır.
-- Önce topluluk.sql, liderlik.sql, filtre.sql çalıştırılmış olmalı.
--
-- Kurallar:
--  * Arkadaşlık iki taraflıdır: istek gönderilir, karşı taraf kabul edince arkadaş olunur (karşı taraf zaten sana istek yolladıysa direkt arkadaş olursunuz).
--  * En çok 50 arkadaş. Çevrimiçi durumunu yalnızca arkadaşların görür (son 3 dakikada oyundaysan çevrimiçi sayılırsın).
--  * Özel mesaj herkese gönderilebilir (200 karakter, küfür filtresi, 2 sn aralık). Engellediğin kişi sana yazamaz ve istek atamaz.
--  * Özel mesajlar 14 gün saklanır.
-- ============================================================
create table if not exists public.kz_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  seen timestamptz not null default now()
);
alter table public.kz_presence enable row level security;
revoke all on public.kz_presence from anon, authenticated;

create table if not exists public.kz_friend (
  from_uid uuid not null references auth.users(id) on delete cascade,
  to_uid uuid not null references auth.users(id) on delete cascade,
  status text not null default 'req' check (status in ('req','ok')),
  created timestamptz not null default now(),
  primary key (from_uid, to_uid),
  check (from_uid <> to_uid)
);
create index if not exists kz_friend_to_idx on public.kz_friend(to_uid);
alter table public.kz_friend enable row level security;
revoke all on public.kz_friend from anon, authenticated;

create table if not exists public.kz_block (
  user_id uuid not null references auth.users(id) on delete cascade,
  blocked uuid not null references auth.users(id) on delete cascade,
  primary key (user_id, blocked)
);
alter table public.kz_block enable row level security;
revoke all on public.kz_block from anon, authenticated;

create table if not exists public.kz_dm (
  id bigserial primary key,
  from_uid uuid not null references auth.users(id) on delete cascade,
  to_uid uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 200),
  created timestamptz not null default now(),
  is_read boolean not null default false
);
create index if not exists kz_dm_to_idx on public.kz_dm(to_uid, is_read);
create index if not exists kz_dm_pair_idx on public.kz_dm(from_uid, to_uid, id desc);
alter table public.kz_dm enable row level security;
revoke all on public.kz_dm from anon, authenticated;

-- Oyundayım (istemci dakikada bir çağırır) + okunmamış mesaj ve bekleyen istek sayısı
create or replace function public.kz_ping()
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); un int; rq int;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  insert into public.kz_presence(user_id, seen) values (uid, now())
    on conflict (user_id) do update set seen = now();
  select count(*) into un from public.kz_dm where to_uid = uid and not is_read;
  select count(*) into rq from public.kz_friend where to_uid = uid and status = 'req';
  if random() < 0.02 then delete from public.kz_dm where created < now() - interval '14 days'; end if;
  return jsonb_build_object('unread', un, 'reqs', rq);
end;
$$;
revoke all on function public.kz_ping() from public, anon;
grant execute on function public.kz_ping() to authenticated;

-- Bir oyuncuyla ilişkim: self | friend | sent | got | blocked | blockedby | none
create or replace function public.kz_f_rel(p_user uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); r text; f record; sn timestamptz;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  if p_user = uid then return jsonb_build_object('rel', 'self'); end if;
  if exists (select 1 from public.kz_block where user_id = uid and blocked = p_user) then r := 'blocked';
  elsif exists (select 1 from public.kz_block where user_id = p_user and blocked = uid) then r := 'blockedby';
  else
    select * into f from public.kz_friend where (from_uid = uid and to_uid = p_user) or (from_uid = p_user and to_uid = uid) limit 1;
    if not found then r := 'none';
    elsif f.status = 'ok' then r := 'friend';
    elsif f.from_uid = uid then r := 'sent';
    else r := 'got'; end if;
  end if;
  if r = 'friend' then select seen into sn from public.kz_presence where user_id = p_user; end if;
  return jsonb_build_object('rel', r, 'online', coalesce(r = 'friend' and sn > now() - interval '3 minutes', false));
end;
$$;
revoke all on function public.kz_f_rel(uuid) from public, anon;
grant execute on function public.kz_f_rel(uuid) to authenticated;

create or replace function public.kz_f_req(p_user uuid)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  if p_user = uid then raise exception 'arkadas: kendini ekleyemezsin'; end if;
  if not exists (select 1 from public.leaderboard where user_id = p_user) then raise exception 'arkadas: oyuncu bulunamadi'; end if;
  if exists (select 1 from public.kz_block where (user_id = p_user and blocked = uid) or (user_id = uid and blocked = p_user)) then raise exception 'arkadas: engelli'; end if;
  if exists (select 1 from public.kz_friend where status = 'ok' and ((from_uid = uid and to_uid = p_user) or (from_uid = p_user and to_uid = uid))) then raise exception 'arkadas: zaten arkadassiniz'; end if;
  select count(*) into n from public.kz_friend where status = 'ok' and (from_uid = uid or to_uid = uid);
  if n >= 50 then raise exception 'arkadas: arkadas listen dolu'; end if;
  select count(*) into n from public.kz_friend where from_uid = uid and status = 'req';
  if n >= 30 then raise exception 'arkadas: cok fazla bekleyen istegin var'; end if;
  if exists (select 1 from public.kz_friend where from_uid = p_user and to_uid = uid and status = 'req') then
    update public.kz_friend set status = 'ok' where from_uid = p_user and to_uid = uid;
    return 'friend';
  end if;
  insert into public.kz_friend(from_uid, to_uid) values (uid, p_user) on conflict do nothing;
  return 'sent';
end;
$$;
revoke all on function public.kz_f_req(uuid) from public, anon;
grant execute on function public.kz_f_req(uuid) to authenticated;

create or replace function public.kz_f_accept(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select count(*) into n from public.kz_friend where status = 'ok' and (from_uid = uid or to_uid = uid);
  if n >= 50 then raise exception 'arkadas: arkadas listen dolu'; end if;
  update public.kz_friend set status = 'ok' where from_uid = p_user and to_uid = uid and status = 'req';
  if not found then raise exception 'arkadas: istek bulunamadi'; end if;
end;
$$;
revoke all on function public.kz_f_accept(uuid) from public, anon;
grant execute on function public.kz_f_accept(uuid) to authenticated;

-- Arkadaşlıktan çıkar / isteği reddet / isteği geri çek
create or replace function public.kz_f_remove(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  delete from public.kz_friend where (from_uid = uid and to_uid = p_user) or (from_uid = p_user and to_uid = uid);
end;
$$;
revoke all on function public.kz_f_remove(uuid) from public, anon;
grant execute on function public.kz_f_remove(uuid) to authenticated;

-- Engelle / engeli kaldır (engelleyince arkadaşlık da biter)
create or replace function public.kz_f_block(p_user uuid, p_on boolean)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  if p_user = uid then raise exception 'arkadas: kendini engelleyemezsin'; end if;
  if p_on then
    insert into public.kz_block(user_id, blocked) values (uid, p_user) on conflict do nothing;
    delete from public.kz_friend where (from_uid = uid and to_uid = p_user) or (from_uid = p_user and to_uid = uid);
  else
    delete from public.kz_block where user_id = uid and blocked = p_user;
  end if;
end;
$$;
revoke all on function public.kz_f_block(uuid, boolean) from public, anon;
grant execute on function public.kz_f_block(uuid, boolean) to authenticated;

-- Arkadaş listesi + gelen/giden istekler
create or replace function public.kz_f_list()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); fr jsonb; inc jsonb; outg jsonb;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('user_id', x.pid, 'name', coalesce(l.char_name, '?'), 'cls', coalesce(l.cls, 'tank'),
      'level', coalesce(l.level, 1), 'online', coalesce(p.seen > now() - interval '3 minutes', false),
      'unread', (select count(*) from public.kz_dm d where d.from_uid = x.pid and d.to_uid = uid and not d.is_read))
      order by coalesce(p.seen > now() - interval '3 minutes', false) desc, coalesce(l.char_name, '')), '[]'::jsonb)
    into fr
    from (select case when from_uid = uid then to_uid else from_uid end as pid from public.kz_friend
           where status = 'ok' and (from_uid = uid or to_uid = uid)) x
    left join public.leaderboard l on l.user_id = x.pid
    left join public.kz_presence p on p.user_id = x.pid;
  select coalesce(jsonb_agg(jsonb_build_object('user_id', f.from_uid, 'name', coalesce(l.char_name, '?'), 'level', coalesce(l.level, 1)) order by f.created), '[]'::jsonb)
    into inc from public.kz_friend f left join public.leaderboard l on l.user_id = f.from_uid where f.to_uid = uid and f.status = 'req';
  select coalesce(jsonb_agg(jsonb_build_object('user_id', f.to_uid, 'name', coalesce(l.char_name, '?'), 'level', coalesce(l.level, 1)) order by f.created), '[]'::jsonb)
    into outg from public.kz_friend f left join public.leaderboard l on l.user_id = f.to_uid where f.from_uid = uid and f.status = 'req';
  return jsonb_build_object('friends', fr, 'incoming', inc, 'outgoing', outg);
end;
$$;
revoke all on function public.kz_f_list() from public, anon;
grant execute on function public.kz_f_list() to authenticated;

-- Özel mesaj gönder
create or replace function public.kz_dm_send(p_user uuid, p_body text)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); b text := btrim(coalesce(p_body, '')); lastt timestamptz;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  if p_user = uid then raise exception 'arkadas: kendine yazamazsin'; end if;
  if not exists (select 1 from public.leaderboard where user_id = p_user) then raise exception 'arkadas: oyuncu bulunamadi'; end if;
  if exists (select 1 from public.kz_block where user_id = p_user and blocked = uid) then raise exception 'arkadas: bu oyuncu sana mesaj kabul etmiyor'; end if;
  if exists (select 1 from public.kz_block where user_id = uid and blocked = p_user) then raise exception 'arkadas: bu oyuncuyu engelledin'; end if;
  if char_length(b) < 1 or char_length(b) > 200 then raise exception 'arkadas: mesaj 1-200 karakter olmali'; end if;
  if public.kz_is_bad(b) then raise exception 'kufur: mesaj'; end if;
  select max(created) into lastt from public.kz_dm where from_uid = uid;
  if lastt is not null and lastt > now() - interval '2 seconds' then raise exception 'cok hizli yaziyorsun'; end if;
  insert into public.kz_dm(from_uid, to_uid, body) values (uid, p_user, b);
end;
$$;
revoke all on function public.kz_dm_send(uuid, text) from public, anon;
grant execute on function public.kz_dm_send(uuid, text) to authenticated;

-- İki kişi arasındaki son 50 mesaj (gelenler okundu olur)
create or replace function public.kz_dm_thread(p_user uuid)
returns table(id bigint, mine boolean, body text, created timestamptz)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  update public.kz_dm set is_read = true where to_uid = uid and from_uid = p_user and not is_read;
  return query
    select x.did, x.dmine, x.dbody, x.dcreated from (
      select d.id as did, (d.from_uid = uid) as dmine, d.body as dbody, d.created as dcreated
        from public.kz_dm d
       where (d.from_uid = uid and d.to_uid = p_user) or (d.from_uid = p_user and d.to_uid = uid)
       order by d.id desc limit 50) x
    order by x.did;
end;
$$;
revoke all on function public.kz_dm_thread(uuid) from public, anon;
grant execute on function public.kz_dm_thread(uuid) to authenticated;

-- Gelen kutusu: konuşmalar (son mesaj + okunmamış sayısı)
create or replace function public.kz_dm_inbox()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); r jsonb;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('user_id', c.pid, 'name', coalesce(l.char_name, '?'), 'body', c.body, 'mine', c.mine,
      'unread', (select count(*) from public.kz_dm d where d.from_uid = c.pid and d.to_uid = uid and not d.is_read)) order by c.mid desc), '[]'::jsonb)
    into r
    from (select distinct on (pid) pid, mid, body, mine from (
            select case when from_uid = uid then to_uid else from_uid end as pid, id as mid, body, (from_uid = uid) as mine
              from public.kz_dm where from_uid = uid or to_uid = uid) q
           order by pid, mid desc) c
    left join public.leaderboard l on l.user_id = c.pid
    where not exists (select 1 from public.kz_block b where b.user_id = uid and b.blocked = c.pid);
  return r;
end;
$$;
revoke all on function public.kz_dm_inbox() from public, anon;
grant execute on function public.kz_dm_inbox() to authenticated;
