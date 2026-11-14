-- ============================================================
-- Valdrenn: DÜNYA BOSS'U (sürüm 2.13.0)
-- Herkesin ortak vurduğu boss. Hasarı sunucu (battle fonksiyonu) hesaplar ve buraya yazar; istemci doğrudan yazamaz.
-- Çalıştırma: SQL Editor'de yeni sekme, bu dosyanın hepsi, Run. karakter.sql'den SONRA çalıştırılmalı. Tekrar çalıştırmak zararsızdır.
-- Kurallar: karakter başına günde 3 hak, boss 3 gün yaşar, öldürülürse/kaçarsa 12 saat sonra sıradaki bölgenin bossu gelir.
-- Ayar (isteğe bağlı): kz_cfg tablosuna 'wb_avg' (boss canı için ortalama vuruş tahmini) yazılabilir.
-- ============================================================
create table if not exists public.kz_wb (
  id bigserial primary key,
  wi int not null,
  started timestamptz not null default now(),
  ends timestamptz not null,
  max_hp bigint not null,
  hp bigint not null,
  status text not null default 'live' check (status in ('live','dead','fled')),
  closed timestamptz
);
create table if not exists public.kz_wb_hit (
  wb_id bigint not null references public.kz_wb(id) on delete cascade,
  ck text not null,
  user_id uuid,
  dmg bigint not null default 0,
  hits int not null default 0,
  claimed int not null default 0,
  primary key (wb_id, ck)
);
create index if not exists kz_wb_hit_dmg_idx on public.kz_wb_hit (wb_id, dmg desc);
create table if not exists public.kz_wb_day (
  wb_id bigint not null references public.kz_wb(id) on delete cascade,
  ck text not null,
  day date not null,
  n int not null default 0,
  primary key (wb_id, ck, day)
);
alter table public.kz_wb enable row level security; revoke all on public.kz_wb from anon, authenticated;
alter table public.kz_wb_hit enable row level security; revoke all on public.kz_wb_hit from anon, authenticated;
alter table public.kz_wb_day enable row level security; revoke all on public.kz_wb_day from anon, authenticated;

-- Güncel boss: süresi dolanı kaçırır, gerekirse yenisini doğurur (iç kullanım)
create or replace function public.kz_wb_cur()
returns public.kz_wb language plpgsql security definer set search_path = public as $$
declare r public.kz_wb; wi int; avg numeric; part int; cnt int; sh numeric; sd numeric; mx bigint;
begin
  perform pg_advisory_xact_lock(7701);
  select * into r from public.kz_wb order by id desc limit 1;
  if found and r.status = 'live' and r.ends <= now() then
    update public.kz_wb set status = 'fled', closed = now() where id = r.id returning * into r;
  end if;
  if not found or (r.status <> 'live' and coalesce(r.closed, r.ends) + interval '12 hours' <= now()) then
    wi := case when r.id is null then 0 else (r.wi + 1) % 12 end;
    avg := null; part := 0;
    if r.id is not null then
      select coalesce(sum(hits), 0), coalesce(sum(dmg), 0), count(*) into sh, sd, cnt from public.kz_wb_hit where wb_id = r.id;
      if sh >= 10 then avg := sd / sh; part := ceil(cnt * 1.2); end if;
    end if;
    if avg is null then
      select coalesce(avg(2200.0 * l.level), 22000), greatest(5, count(*)) into avg, part
        from public.leaderboard l join public.kz_presence p on p.ck = l.ck
       where l.level >= 10 and p.seen > now() - interval '7 days';
      avg := coalesce(nullif(avg, 0), public.kz_cfg('wb_avg', 22000));
    end if;
    part := greatest(5, part);
    mx := greatest(100000, round(part * 3 * 3 * avg * 0.55));
    insert into public.kz_wb(wi, ends, max_hp, hp) values (wi, now() + interval '3 days', mx, mx) returning * into r;
  end if;
  return r;
end;
$$;
revoke all on function public.kz_wb_cur() from public, anon, authenticated;

-- Hangi karakter? (hesap sahipliği kontrolü)
create or replace function public.kz_wb_ck(p_uid uuid, p_name text)
returns text language plpgsql stable security definer set search_path = public as $$
declare k text := public.kz_name_key(p_name);
begin
  if not exists (select 1 from public.kz_names where key = k and user_id = p_uid) then raise exception 'boss: karakter bulunamadi'; end if;
  return k;
end;
$$;
revoke all on function public.kz_wb_ck(uuid, text) from public, anon, authenticated;

-- Saldırı öncesi kontrol (yalnızca battle fonksiyonu çağırır)
create or replace function public.kz_wb_pre(p_uid uuid, p_name text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare k text := public.kz_wb_ck(p_uid, p_name); r public.kz_wb; used int;
begin
  r := public.kz_wb_cur();
  if r.status <> 'live' then raise exception 'boss: su an canli boss yok'; end if;
  select d.n into used from public.kz_wb_day d where d.wb_id = r.id and d.ck = k and d.day = (now() at time zone 'utc')::date;
  used := coalesce(used, 0);
  if used >= 3 then raise exception 'boss: bugunluk hakkin bitti'; end if;
  return jsonb_build_object('id', r.id, 'wi', r.wi, 'left', 3 - used);
end;
$$;
revoke all on function public.kz_wb_pre(uuid, text) from public, anon, authenticated;
grant execute on function public.kz_wb_pre(uuid, text) to service_role;

-- Hasarı işle (yalnızca battle fonksiyonu çağırır)
create or replace function public.kz_wb_commit(p_uid uuid, p_name text, p_dmg bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare k text := public.kz_wb_ck(p_uid, p_name); r public.kz_wb; d bigint; used int; nh bigint;
begin
  r := public.kz_wb_cur();
  if r.status <> 'live' then raise exception 'boss: su an canli boss yok'; end if;
  insert into public.kz_wb_day(wb_id, ck, day, n) values (r.id, k, (now() at time zone 'utc')::date, 1)
    on conflict (wb_id, ck, day) do update set n = public.kz_wb_day.n + 1 where public.kz_wb_day.n < 3
    returning public.kz_wb_day.n into used;
  if used is null then raise exception 'boss: bugunluk hakkin bitti'; end if;
  d := greatest(0, least(coalesce(p_dmg, 0), r.max_hp));
  d := least(d, r.hp);
  update public.kz_wb set hp = hp - d where id = r.id returning hp into nh;
  if nh <= 0 then update public.kz_wb set status = 'dead', closed = now() where id = r.id; end if;
  insert into public.kz_wb_hit(wb_id, ck, user_id, dmg, hits) values (r.id, k, p_uid, d, 1)
    on conflict (wb_id, ck) do update set dmg = public.kz_wb_hit.dmg + d, hits = public.kz_wb_hit.hits + 1;
  return jsonb_build_object('hp', nh, 'dead', nh <= 0, 'dealt', d, 'left', 3 - used);
end;
$$;
revoke all on function public.kz_wb_commit(uuid, text, bigint) from public, anon, authenticated;
grant execute on function public.kz_wb_commit(uuid, text, bigint) to service_role;

-- Ortak ödül maskesi: 1 = %75'e indi, 2 = %50, 4 = %25, 8 = boss öldü (katılım)
create or replace function public.kz_wb_mask(w public.kz_wb)
returns int language sql immutable as $$
  select (case when w.hp <= w.max_hp * 0.75 then 1 else 0 end)
       | (case when w.hp <= w.max_hp * 0.5 then 2 else 0 end)
       | (case when w.hp <= w.max_hp * 0.25 then 4 else 0 end)
       | (case when w.status = 'dead' then 8 else 0 end);
$$;
revoke all on function public.kz_wb_mask(public.kz_wb) from public, anon, authenticated;

-- Ödülleri al (yalnızca battle fonksiyonu çağırır): son 3 bossun alınmamış ödülleri, tek seferlik
create or replace function public.kz_wb_claim(p_uid uuid, p_name text, p_lv int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare k text := public.kz_wb_ck(p_uid, p_name); r public.kz_wb; h record; w public.kz_wb;
  avail int; ch int := 0; gold bigint := 0; wbk int := 0; wbt int := 0; rk int; gr int; gid bigint; lv int := greatest(1, least(100, coalesce(p_lv, 1)));
begin
  r := public.kz_wb_cur();
  for h in select hh.* from public.kz_wb_hit hh where hh.ck = k and hh.wb_id >= r.id - 2 and hh.dmg > 0 order by hh.wb_id for update loop
    select * into w from public.kz_wb where id = h.wb_id;
    avail := public.kz_wb_mask(w) & ~h.claimed;
    if avail & 1 > 0 then ch := ch + 1; gold := gold + lv * 100; end if;
    if avail & 2 > 0 then ch := ch + 1; gold := gold + lv * 100; end if;
    if avail & 4 > 0 then ch := ch + 1; gold := gold + lv * 100; end if;
    if avail & 8 > 0 then
      if h.dmg >= w.max_hp * 0.003 then
        ch := ch + 3; gold := gold + lv * 400; wbk := wbk + 1;
        select count(*) + 1 into rk from public.kz_wb_hit x where x.wb_id = w.id and (x.dmg > h.dmg or (x.dmg = h.dmg and x.ck < k));
        if rk = 1 then ch := ch + 5; elsif rk = 2 then ch := ch + 3; elsif rk = 3 then ch := ch + 2; end if;
        if rk <= 3 then wbt := wbt + 1; end if;
        select m.guild_id into gid from public.kz_guild_member m where m.ck = k;
        if gid is not null then
          select pos into gr from (
            select m2.guild_id as gg, row_number() over (order by sum(x.dmg) desc, m2.guild_id) as pos
              from public.kz_wb_hit x join public.kz_guild_member m2 on m2.ck = x.ck where x.wb_id = w.id group by m2.guild_id) q where gg = gid;
          if gr is not null and gr <= 3 then ch := ch + 2; end if;
        end if;
      end if;
    end if;
    update public.kz_wb_hit set claimed = h.claimed | avail where wb_id = h.wb_id and ck = k;
  end loop;
  return jsonb_build_object('chests', ch, 'gold', gold, 'wbk', wbk, 'wbt', wbt);
end;
$$;
revoke all on function public.kz_wb_claim(uuid, text, int) from public, anon, authenticated;
grant execute on function public.kz_wb_claim(uuid, text, int) to service_role;

-- Ekranın durumu (oyuncu çağırır; salt okunur, boss yoksa doğurur)
create or replace function public.kz_wb_state(p_me text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); k text; r public.kz_wb; mine record; used int := 0; top jsonb; gl jsonb; pend int := 0; h record; w public.kz_wb; rk bigint;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  k := public.kz_wb_ck(uid, p_me);
  r := public.kz_wb_cur();
  select d.n into used from public.kz_wb_day d where d.wb_id = r.id and d.ck = k and d.day = (now() at time zone 'utc')::date;
  used := coalesce(used, 0);
  select * into mine from public.kz_wb_hit where wb_id = r.id and ck = k;
  select count(*) + 1 into rk from public.kz_wb_hit x where x.wb_id = r.id and mine.dmg is not null and (x.dmg > mine.dmg or (x.dmg = mine.dmg and x.ck < k));
  select coalesce(jsonb_agg(jsonb_build_object('ck', t.ck, 'name', coalesce(l.char_name, '?'), 'dmg', t.dmg) order by t.dmg desc, t.ck), '[]'::jsonb) into top
    from (select ck, dmg from public.kz_wb_hit where wb_id = r.id and dmg > 0 order by dmg desc, ck limit 10) t left join public.leaderboard l on l.ck = t.ck;
  select coalesce(jsonb_agg(jsonb_build_object('name', q.name, 'dmg', q.dmg, 'n', q.cnt) order by q.dmg desc), '[]'::jsonb) into gl
    from (select g.name, sum(x.dmg) as dmg, count(*) as cnt from public.kz_wb_hit x join public.kz_guild_member m on m.ck = x.ck
            join public.kz_guild g on g.id = m.guild_id where x.wb_id = r.id and x.dmg > 0 group by g.id, g.name order by sum(x.dmg) desc limit 5) q;
  for h in select hh.* from public.kz_wb_hit hh where hh.ck = k and hh.wb_id >= r.id - 2 and hh.dmg > 0 loop
    select * into w from public.kz_wb where id = h.wb_id;
    if (public.kz_wb_mask(w) & ~h.claimed) > 0 and ((public.kz_wb_mask(w) & ~h.claimed & 7) > 0 or h.dmg >= w.max_hp * 0.003) then pend := pend + 1; end if;
  end loop;
  return jsonb_build_object('id', r.id, 'wi', r.wi, 'status', r.status, 'max_hp', r.max_hp, 'hp', r.hp,
    'ends', extract(epoch from r.ends)::bigint, 'closed', extract(epoch from coalesce(r.closed, r.ends))::bigint,
    'next_in', case when r.status = 'live' then 0 else greatest(0, extract(epoch from (coalesce(r.closed, r.ends) + interval '12 hours' - now()))::bigint) end,
    'now', extract(epoch from now())::bigint,
    'left', 3 - used, 'my_dmg', coalesce(mine.dmg, 0), 'my_hits', coalesce(mine.hits, 0), 'my_rank', case when mine.dmg is null then null else rk end,
    'pending', pend, 'top', top, 'guilds', gl);
end;
$$;
revoke all on function public.kz_wb_state(text) from public, anon; grant execute on function public.kz_wb_state(text) to authenticated;

-- Karakter silinince ona ait boss kayıtları da temizlensin
create or replace function public.kz_char_released()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.kz_guild_member where ck = old.key;
  delete from public.kz_friend where from_ck = old.key or to_ck = old.key;
  delete from public.kz_block where ck = old.key or blocked = old.key;
  delete from public.kz_dm where from_ck = old.key or to_ck = old.key;
  delete from public.kz_presence where ck = old.key;
  delete from public.leaderboard where ck = old.key and user_id = old.user_id;
  delete from public.kz_wb_hit where ck = old.key;
  delete from public.kz_wb_day where ck = old.key;
  return null;
end;
$$;
