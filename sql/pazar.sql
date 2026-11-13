-- ============================================================
-- Karanlık Zindan RPG: Supabase kurulum kodu (Paket D)
-- BANKA, PAZAR (tezgâh) ve OYUNCULAR ARASI TAKAS
-- Sıra: ... savas.sql, liderlik.sql, EN SON bu dosya. İstediğin kadar tekrar çalıştırabilirsin.
--
-- Tüm yazma işlemleri "battle" Edge Function'ından (service_role) geçer ve tek işlemde yapılır:
-- eşya bir yerden çıkıp başka yere girer, hiçbir aşamada kopyalanamaz ya da kaybolmaz.
--   kz_bank   : hesap başına banka (altın + en çok 100 eşya, tüm karakterler ortak)
--   kz_market : pazar tezgâhları (24 saat açık kalır; sahibi çevrimdışı olsa da satış sürer)
--   kz_trade  : oyuncudan oyuncuya takas teklifleri (teklif eden taraf eşya+altın verir, karşı taraf altın öder)
-- ============================================================

create table if not exists public.kz_bank (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gold bigint not null default 0 check (gold >= 0),
  items jsonb not null default '[]'::jsonb,
  ver int not null default 0
);
alter table public.kz_bank enable row level security;
revoke all on public.kz_bank from anon, authenticated;

create table if not exists public.kz_market (
  id bigserial primary key,
  seller uuid not null references auth.users(id) on delete cascade,
  seller_name text not null default '',
  item jsonb not null,
  price bigint not null check (price between 1 and 100000000),
  created timestamptz not null default now(),
  expires timestamptz not null default (now() + interval '24 hours'),
  status text not null default 'open' check (status in ('open','sold')),
  buyer_name text not null default '',
  proceeds bigint not null default 0
);
create index if not exists kz_market_seller_idx on public.kz_market(seller);
create index if not exists kz_market_open_idx on public.kz_market(status, expires);
alter table public.kz_market enable row level security;
revoke all on public.kz_market from anon, authenticated;

create table if not exists public.kz_trade (
  id bigserial primary key,
  from_uid uuid not null references auth.users(id) on delete cascade,
  from_name text not null default '',
  to_uid uuid not null references auth.users(id) on delete cascade,
  to_name text not null default '',
  items jsonb not null default '[]'::jsonb,
  gold bigint not null default 0 check (gold >= 0),
  want bigint not null default 0 check (want >= 0),
  created timestamptz not null default now(),
  expires timestamptz not null default (now() + interval '24 hours'),
  status text not null default 'open' check (status in ('open','done','back'))
);
alter table public.kz_trade add column if not exists want_n int not null default 0 check (want_n between 0 and 5);
alter table public.kz_trade add column if not exists want_slot text not null default '';
alter table public.kz_trade add column if not exists ret_items jsonb not null default '[]'::jsonb;
create index if not exists kz_trade_from_idx on public.kz_trade(from_uid);
create index if not exists kz_trade_to_idx on public.kz_trade(to_uid);
alter table public.kz_trade enable row level security;
revoke all on public.kz_trade from anon, authenticated;

-- ---------- OKUMA (oyuncu çağırır) ----------
create or replace function public.kz_bank_get()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); b record;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select gold, items, ver into b from public.kz_bank where user_id = uid;
  if not found then return jsonb_build_object('gold', 0, 'items', '[]'::jsonb, 'ver', 0); end if;
  return jsonb_build_object('gold', b.gold, 'items', b.items, 'ver', b.ver);
end;
$$;
revoke all on function public.kz_bank_get() from public, anon;
grant execute on function public.kz_bank_get() to authenticated;

-- Pazar: açık ve süresi dolmamış ilanlar. p_q: eşya adında arama, p_slot: bölme ('' = hepsi)
create or replace function public.kz_market_list(p_q text, p_slot text, p_off int)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', m.id, 'seller_name', m.seller_name, 'item', m.item, 'price', m.price,
                                        'expires', m.expires, 'mine', m.seller = uid) order by m.created desc)
    from (select * from public.kz_market
           where status = 'open' and expires > now()
             and (coalesce(p_q,'') = '' or item->>'name' ilike '%' || replace(replace(replace(p_q,'\','\\'),'%','\%'),'_','\_') || '%')
             and (coalesce(p_slot,'') = '' or item->>'slot' = p_slot)
           order by created desc limit 20 offset greatest(0, coalesce(p_off,0))) m
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.kz_market_list(text,text,int) from public, anon;
grant execute on function public.kz_market_list(text,text,int) to authenticated;

create or replace function public.kz_market_mine()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', m.id, 'item', m.item, 'price', m.price, 'expires', m.expires,
             'state', case when m.status = 'sold' then 'sold' when m.expires > now() then 'open' else 'expired' end,
             'buyer', m.buyer_name, 'proceeds', m.proceeds) order by m.created desc)
    from public.kz_market m where m.seller = uid
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.kz_market_mine() from public, anon;
grant execute on function public.kz_market_mine() to authenticated;

create or replace function public.kz_trade_list()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  return jsonb_build_object(
    'in', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'from_name', t.from_name, 'items', t.items,
              'gold', t.gold, 'want', t.want, 'want_n', t.want_n, 'want_slot', t.want_slot, 'expires', t.expires) order by t.created desc)
            from public.kz_trade t where t.to_uid = uid and t.status = 'open' and t.expires > now()), '[]'::jsonb),
    'out', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'to_name', t.to_name, 'items', t.items,
              'gold', t.gold, 'want', t.want, 'want_n', t.want_n, 'want_slot', t.want_slot, 'ret_items', t.ret_items, 'expires', t.expires,
              'state', case when t.status = 'done' then 'done' when t.status = 'back' then 'back'
                            when t.expires > now() then 'open' else 'expired' end) order by t.created desc)
            from public.kz_trade t where t.from_uid = uid), '[]'::jsonb));
end;
$$;
revoke all on function public.kz_trade_list() from public, anon;
grant execute on function public.kz_trade_list() to authenticated;

-- ---------- YAZMA (yalnızca Edge Function / service_role) ----------
-- Önce okur: banka satırı + (varsa) ilgili ilan/takas satırı + sayaçlar
create or replace function public.kz_m_get(p_uid uuid, p_act jsonb)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r jsonb := '{}'::jsonb; b record; rw jsonb; rid bigint; k text; tu uuid;
begin
  select gold, items, ver into b from public.kz_bank where user_id = p_uid;
  if found then r := r || jsonb_build_object('bank', jsonb_build_object('gold', b.gold, 'items', b.items, 'ver', b.ver));
  else r := r || jsonb_build_object('bank', jsonb_build_object('gold', 0, 'items', '[]'::jsonb, 'ver', 0)); end if;
  r := r || jsonb_build_object('mcnt', (select count(*) from public.kz_market where seller = p_uid),
                               'tcnt', (select count(*) from public.kz_trade where from_uid = p_uid and status = 'open' and expires > now()));
  if (p_act->>'id') is not null and (p_act->>'id') ~ '^[0-9]{1,18}$' then
    rid := (p_act->>'id')::bigint;
    k := p_act->>'k';
    if k = 'm' then
      select to_jsonb(m) || jsonb_build_object('live', m.status = 'open' and m.expires > now()) into rw from public.kz_market m where m.id = rid;
    elsif k = 't' then
      select to_jsonb(t) || jsonb_build_object('live', t.status = 'open' and t.expires > now()) into rw from public.kz_trade t where t.id = rid;
    end if;
    if rw is not null then r := r || jsonb_build_object('row', rw); end if;
  end if;
  if p_act->>'to' is not null then
    select user_id into tu from public.kz_names where key = public.kz_name_key(p_act->>'to');
    if tu is not null then r := r || jsonb_build_object('to_uid', tu); end if;
  end if;
  return r;
end;
$$;
revoke all on function public.kz_m_get(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.kz_m_get(uuid,jsonb) to service_role;

-- Sonra yazar: kayıt yuvasını (kz_b_put) ve tablo etkisini TEK işlemde uygular. Herhangi bir kontrol başarısız olursa hepsi geri alınır.
create or replace function public.kz_m_put(p_uid uuid, p_rev text, p_slot int, p_pslot jsonb, p_b jsonb, p_act jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare t text := p_act->>'t'; n int; m record; tr record; rid bigint := nullif(p_act->>'id','')::bigint;
begin
  perform public.kz_b_put(p_uid, p_rev, p_slot, p_pslot, p_b, 0);

  if t = 'bank' then
    if jsonb_typeof(p_act->'items') <> 'array' or jsonb_array_length(p_act->'items') > 100 then raise exception 'banka dolu'; end if;
    if (p_act->>'gold')::bigint < 0 then raise exception 'gecersiz'; end if;
    if coalesce((p_act->>'ver')::int, 0) = 0 then
      insert into public.kz_bank(user_id, gold, items, ver) values (p_uid, (p_act->>'gold')::bigint, p_act->'items', 1)
      on conflict (user_id) do nothing;
      get diagnostics n = row_count;
      if n = 0 then raise exception 'cakisma'; end if;
    else
      update public.kz_bank set gold = (p_act->>'gold')::bigint, items = p_act->'items', ver = ver + 1
       where user_id = p_uid and ver = (p_act->>'ver')::int;
      get diagnostics n = row_count;
      if n = 0 then raise exception 'cakisma'; end if;
    end if;

  elsif t = 'msell' then
    if (select count(*) from public.kz_market where seller = p_uid) >= 10 then raise exception 'limit'; end if;
    insert into public.kz_market(seller, seller_name, item, price)
    values (p_uid, left(coalesce(p_act->>'name',''), 14), p_act->'item', (p_act->>'price')::bigint);

  elsif t = 'mbuy' then
    select * into m from public.kz_market where id = rid for update;
    if not found or m.status <> 'open' or m.expires <= now() or m.seller = p_uid
       or m.price <> (p_act->>'price')::bigint then raise exception 'satildi'; end if;
    update public.kz_market set status = 'sold', buyer_name = left(coalesce(p_act->>'name',''), 14),
           proceeds = (m.price * 95) / 100 where id = rid;

  elsif t = 'mcancel' then
    delete from public.kz_market where id = rid and seller = p_uid and status = 'open' and expires > now();
    get diagnostics n = row_count;
    if n = 0 then raise exception 'ilan yok'; end if;

  elsif t = 'mclaim' then
    delete from public.kz_market
     where id = rid and seller = p_uid
       and ((status = 'sold' and p_act->>'st' = 'sold') or (status = 'open' and expires <= now() and p_act->>'st' = 'expired'));
    get diagnostics n = row_count;
    if n = 0 then raise exception 'ilan yok'; end if;

  elsif t = 'tsend' then
    if (p_act->>'to_uid') is null or (p_act->>'to_uid')::uuid = p_uid then raise exception 'alici'; end if;
    if (select count(*) from public.kz_trade where from_uid = p_uid and status = 'open' and expires > now()) >= 5 then raise exception 'limit'; end if;
    insert into public.kz_trade(from_uid, from_name, to_uid, to_name, items, gold, want, want_n, want_slot)
    values (p_uid, left(coalesce(p_act->>'name',''), 14), (p_act->>'to_uid')::uuid, left(coalesce(p_act->>'to',''), 14),
            p_act->'items', (p_act->>'gold')::bigint, (p_act->>'want')::bigint,
            coalesce((p_act->>'want_n')::int, 0), left(coalesce(p_act->>'want_slot',''), 12));

  elsif t = 'tacc' then
    select * into tr from public.kz_trade where id = rid and to_uid = p_uid for update;
    if not found or tr.status <> 'open' or tr.expires <= now() or tr.want <> (p_act->>'want')::bigint then raise exception 'teklif yok'; end if;
    if jsonb_typeof(p_act->'ret') <> 'array' or jsonb_array_length(p_act->'ret') <> tr.want_n then raise exception 'teklif yok'; end if;
    update public.kz_trade set status = 'done', ret_items = p_act->'ret' where id = rid;

  elsif t = 'tdec' then
    update public.kz_trade set status = 'back' where id = rid and to_uid = p_uid and status = 'open' and expires > now();
    get diagnostics n = row_count;
    if n = 0 then raise exception 'teklif yok'; end if;

  elsif t = 'tcancel' then
    delete from public.kz_trade where id = rid and from_uid = p_uid and status = 'open' and expires > now();
    get diagnostics n = row_count;
    if n = 0 then raise exception 'teklif yok'; end if;

  elsif t = 'tclaim' then
    delete from public.kz_trade
     where id = rid and from_uid = p_uid
       and ((status = 'done' and p_act->>'st' = 'done') or (status = 'back' and p_act->>'st' = 'back')
            or (status = 'open' and expires <= now() and p_act->>'st' = 'expired'));
    get diagnostics n = row_count;
    if n = 0 then raise exception 'teklif yok'; end if;

  else
    raise exception 'gecersiz islem';
  end if;
end;
$$;
revoke all on function public.kz_m_put(uuid,text,int,jsonb,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.kz_m_put(uuid,text,int,jsonb,jsonb,jsonb) to service_role;
