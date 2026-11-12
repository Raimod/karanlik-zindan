-- ============================================================
-- Karanlık Zindan RPG: Supabase kurulum kodu (5. aşama)
-- SAVAŞ SUNUCUDA OYNANIR (aşama 3)
-- Sıra: kurulum.sql, topluluk.sql, koruma.sql, sunucu.sql, EN SON bu dosya.
-- (koruma.sql bu sürümde güncellendi: önce onu, sonra sunucu.sql'i, sonra bunu çalıştır.)
-- İstediğin kadar tekrar çalıştırabilirsin.
--
-- Bu dosya:
--   * kz_battle: sürmekte olan savaşların durumunu tutar (kimse doğrudan okuyup yazamaz)
--   * kz_b_get / kz_b_put: yalnızca "battle" Edge Function'ının (service_role) kullanabildiği fonksiyonlar
--   * kz_lock_err: ilerleme alanlarını (seviye, tecrübe, öldürme, boss...) istemcinin değiştirmesini yasaklayan kontrol
--     (varsayılan KAPALI. Oyun dosyaları yüklenip fonksiyon çalışınca savas_siki.sql ile açılır)
-- ============================================================

insert into public.kz_config(key,val) values ('srv_lock',0)
on conflict (key) do nothing;

create table if not exists public.kz_battle (
  user_id uuid primary key references auth.users(id) on delete cascade,
  slot int not null,
  b jsonb not null,
  lock_until timestamptz not null default now(),
  started_at timestamptz not null default now()
);
alter table public.kz_battle enable row level security;   -- politika yok = kimse erişemez
revoke all on public.kz_battle from anon, authenticated;

do $$ begin
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if;
end $$;

-- Savaş fonksiyonu için oku: kayıt + sürmekte olan savaş + beklenecek süre
create or replace function public.kz_b_get(p_uid uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s record; bt record;
begin
  select data, md5(data::text) as rev into s from public.saves where user_id = p_uid;
  if not found then return jsonb_build_object('nosave', true); end if;
  select * into bt from public.kz_battle where user_id = p_uid;
  return jsonb_build_object(
    'data', s.data, 'rev', s.rev,
    'age_ms', case when bt.user_id is null then 0
                   else floor(extract(epoch from (clock_timestamp() - bt.started_at)) * 1000)::bigint end,
    'b', case when bt.user_id is null then null else bt.b end,
    'bslot', case when bt.user_id is null then null else bt.slot end,
    'wait_ms', case when bt.user_id is null then 0
                    else greatest(0, ceil(extract(epoch from (bt.lock_until - clock_timestamp())) * 1000))::int end);
end;
$$;

-- Savaş fonksiyonu için yaz: yuvayı günceller (istemci kuralları atlanır), savaş durumunu saklar/siler.
-- p_rev: okurken alınan sürüm. Bu arada kayıt değiştiyse 'cakisma' hatası verir.
create or replace function public.kz_b_put(p_uid uuid, p_rev text, p_slot int, p_pslot jsonb, p_b jsonb, p_lock_ms int)
returns void language plpgsql security definer set search_path = public as $$
declare cur jsonb;
begin
  if p_slot < 0 or p_slot > 4 then raise exception 'yuva'; end if;
  select data into cur from public.saves where user_id = p_uid for update;
  if cur is null then raise exception 'kayit yok'; end if;
  if md5(cur::text) <> p_rev then raise exception 'cakisma'; end if;
  perform set_config('kz.srv', '1', true);
  update public.saves
     set data = jsonb_set(data, array['slots', p_slot::text], p_pslot)
   where user_id = p_uid;
  perform set_config('kz.srv', '', true);
  if p_b is null then
    delete from public.kz_battle where user_id = p_uid;
  else
    insert into public.kz_battle(user_id, slot, b, lock_until, started_at)
    values (p_uid, p_slot, p_b, clock_timestamp() + (greatest(0, least(p_lock_ms, 30000)) || ' milliseconds')::interval, clock_timestamp())
    on conflict (user_id) do update
      set slot = excluded.slot, b = excluded.b, lock_until = excluded.lock_until, started_at = excluded.started_at;
  end if;
end;
$$;

revoke all on function public.kz_b_get(uuid) from public, anon, authenticated;
revoke all on function public.kz_b_put(uuid,text,int,jsonb,jsonb,int) from public, anon, authenticated;
grant execute on function public.kz_b_get(uuid) to service_role;
grant execute on function public.kz_b_put(uuid,text,int,jsonb,jsonb,int) to service_role;

-- Eşya kimliği: ad, set, bölme, sınıf, seviye, tür, yükseltme, taban güç ve efsunlar. Efsun kilidi ("l") sayılmaz.
create or replace function public.kz_item_key(it jsonb)
returns text language sql immutable set search_path = public as $$
  select concat_ws('|', it->>'name', it->>'setOre', it->>'slot', it->>'rc', it->>'rl', it->>'g', it->>'p', it->>'bp',
    case when jsonb_typeof(it->'af') = 'array' then
      coalesce((select string_agg((a->>'t') || ':' || (a->>'v'), ',' order by ord)
                from jsonb_array_elements(it->'af') with ordinality as x(a, ord)), '')
    else '' end)
$$;

-- Eşya kilidi (srv_lock >= 2): çantadaki ve kuşanılan her eşya, ya önceki kayıtta aynen vardı
-- ya da düz (Tüccar Maren'in sattığı türden: sıradan, +0, efsunsuz) bir eşya olmalı.
-- Güçlü eşya yalnızca sunucudan gelir (savaş düşüşü, sandık, demirci).
create or replace function public.kz_items_err(ns jsonb, os jsonb)
returns text language plpgsql stable security definer set search_path = public as $$
declare ok text[] := '{}'; it jsonb; kv record; k text; pos int;
begin
  if os is not null and jsonb_typeof(os) = 'object' then
    if jsonb_typeof(os->'inv') = 'array' then
      for it in select * from jsonb_array_elements(os->'inv') loop
        if jsonb_typeof(it) = 'object' then ok := ok || public.kz_item_key(it); end if;
      end loop;
    end if;
    if jsonb_typeof(os->'eq') = 'object' then
      for kv in select * from jsonb_each(os->'eq') loop
        if jsonb_typeof(kv.value) = 'object' then ok := ok || public.kz_item_key(kv.value); end if;
      end loop;
    end if;
  end if;
  for it in
    select value from jsonb_array_elements(case when jsonb_typeof(ns->'inv') = 'array' then ns->'inv' else '[]'::jsonb end)
    union all
    select value from jsonb_each(case when jsonb_typeof(ns->'eq') = 'object' then ns->'eq' else '{}'::jsonb end)
  loop
    if jsonb_typeof(it) <> 'object' then continue; end if;
    if public.kz_n(it,'g') = 1 and public.kz_n(it,'p') = 0
       and (jsonb_typeof(it->'af') <> 'array' or jsonb_array_length(it->'af') = 0) then
      continue;                                      -- düz eşya
    end if;
    k := public.kz_item_key(it);
    pos := array_position(ok, k);
    if pos is null then return 'esya sunucudan gelmeli'; end if;
    ok := ok[1:pos-1] || ok[pos+1:array_length(ok,1)];
  end loop;
  return null;
end;
$$;
revoke all on function public.kz_items_err(jsonb,jsonb) from public, anon, authenticated;

-- Ekonomi kilidi (srv_lock >= 3): altın, iksir, parşömen, sandık, malzeme istemcide yalnızca AZALABİLİR (harcama);
-- artışlar sunucudan gelir (savaş, satış, ödül...). Görev/günlük durumu ve sunucu saati (sts) istemcide değişmez.
create or replace function public.kz_pristine(ns jsonb)
returns boolean language plpgsql stable set search_path = public as $$
declare t text; sz text; m record;
begin
  if public.kz_n(ns,'gold') > 300 or public.kz_n(ns,'sc') <> 0 or public.kz_n(ns,'ch') <> 0 then return false; end if;
  foreach t in array array['hp','mp'] loop
    if public.kz_n(ns->'pot'->t,'S') > 3 or public.kz_n(ns->'pot'->t,'M') <> 0 or public.kz_n(ns->'pot'->t,'L') <> 0 then return false; end if;
  end loop;
  if jsonb_typeof(ns->'mat') = 'object' then
    for m in select * from jsonb_each(ns->'mat') loop
      if jsonb_typeof(m.value) = 'number' and (m.value#>>'{}')::numeric <> 0 then return false; end if;
    end loop;
  end if;
  if coalesce(ns->'q','{}'::jsonb) <> '{}'::jsonb then return false; end if;
  if coalesce(ns->'dl'->>'d','') <> '' or public.kz_n(ns->'dl','s') <> 0 or public.kz_n(ns->'dl','c') <> 0
     or (jsonb_typeof(ns->'dl'->'q') = 'array' and jsonb_array_length(ns->'dl'->'q') > 0) then return false; end if;
  if public.kz_n(ns,'sts') <> 0 then return false; end if;
  return true;
end;
$$;
revoke all on function public.kz_pristine(jsonb) from public, anon, authenticated;

create or replace function public.kz_eco_err(ns jsonb, os jsonb)
returns text language plpgsql stable set search_path = public as $$
declare t text; sz text; m record;
begin
  if public.kz_n(ns,'gold') > public.kz_n(os,'gold') then return 'ilerleme degistirilemez (altin)'; end if;
  if public.kz_n(ns,'sc') > public.kz_n(os,'sc') then return 'ilerleme degistirilemez (parsomen)'; end if;
  if public.kz_n(ns,'ch') > public.kz_n(os,'ch') then return 'ilerleme degistirilemez (sandik)'; end if;
  foreach t in array array['hp','mp'] loop
    foreach sz in array array['S','M','L'] loop
      if public.kz_n(ns->'pot'->t,sz) > public.kz_n(os->'pot'->t,sz) then return 'ilerleme degistirilemez (iksir)'; end if;
    end loop;
  end loop;
  if jsonb_typeof(ns->'mat') = 'object' then
    for m in select * from jsonb_each(ns->'mat') loop
      if jsonb_typeof(m.value) = 'number' and (m.value#>>'{}')::numeric > public.kz_n(os->'mat', m.key) then
        return 'ilerleme degistirilemez (malzeme)'; end if;
    end loop;
  end if;
  if coalesce(ns->'q','{}'::jsonb) <> coalesce(os->'q','{}'::jsonb) then return 'ilerleme degistirilemez (gorev)'; end if;
  if coalesce(ns->'dl','{}'::jsonb) <> coalesce(os->'dl','{}'::jsonb) then return 'ilerleme degistirilemez (gunluk)'; end if;
  if public.kz_n(ns,'sts') <> public.kz_n(os,'sts') then return 'ilerleme degistirilemez (sure)'; end if;
  return null;
end;
$$;
revoke all on function public.kz_eco_err(jsonb,jsonb) from public, anon, authenticated;

-- İlerleme alanları kilidi: seviye, tecrübe, kule, boss, öldürme/elit/kadim sayaçları yalnızca sunucu değiştirir.
create or replace function public.kz_lock_err(ns jsonb, os jsonb)
returns text language plpgsql stable security definer set search_path = public as $$
declare same boolean; fresh boolean; e text; lvl numeric := public.kz_cfg('srv_lock',0);
begin
  same := os is not null and jsonb_typeof(os) = 'object'
          and (os->>'name') = (ns->>'name') and (os->>'cls') = (ns->>'cls');
  if lvl >= 2 then
    e := public.kz_items_err(ns, case when same then os else null end);
    if e is not null then return e; end if;
  end if;
  fresh := public.kz_n(ns,'lv') = 1 and public.kz_n(ns,'xp') = 0 and public.kz_n(ns,'tw') = 0
       and public.kz_n(ns->'st','k') = 0 and public.kz_n(ns->'st','e') = 0 and public.kz_n(ns->'st','l') = 0
       and coalesce(ns->'boss','{}'::jsonb) = '{}'::jsonb;
  if fresh and (lvl < 3 or public.kz_pristine(ns)) then return null; end if;   -- yeni (ya da sıfırlanmış) karakter
  if not same then return 'yeni karakter baslangic seviyesinde olmali'; end if;
  if public.kz_n(ns,'lv') <> public.kz_n(os,'lv') or public.kz_n(ns,'xp') <> public.kz_n(os,'xp') then
    return 'ilerleme degistirilemez (seviye/tecrube)'; end if;
  if public.kz_n(ns,'tw') <> public.kz_n(os,'tw') then return 'ilerleme degistirilemez (kule)'; end if;
  if public.kz_n(ns->'st','k') <> public.kz_n(os->'st','k') or public.kz_n(ns->'st','e') <> public.kz_n(os->'st','e')
     or public.kz_n(ns->'st','l') <> public.kz_n(os->'st','l') then
    return 'ilerleme degistirilemez (sayaclar)'; end if;
  if coalesce(ns->'boss','{}'::jsonb) <> coalesce(os->'boss','{}'::jsonb) then
    return 'ilerleme degistirilemez (boss)'; end if;
  if lvl >= 3 then
    e := public.kz_eco_err(ns, os);
    if e is not null then return e; end if;
  end if;
  return null;
end;
$$;
revoke all on function public.kz_lock_err(jsonb,jsonb) from public, anon, authenticated;
