-- ============================================================
-- Karanlık Zindan RPG: Supabase kurulum kodu (3. aşama)
-- HİLE KORUMASI (aşama 1: "makul sınır kontrolü")
-- kurulum.sql ve topluluk.sql çalıştırıldıktan SONRA çalıştır.
-- İstediğin kadar tekrar çalıştırabilirsin.
--
-- Mantık: Sunucu her kayıtta, bir önceki kayıttan bu yana GEÇEN SÜREYE (sunucu saati)
-- bakar. O sürede oyunda kazanılması mümkün olandan fazla altın, seviye, kule katı,
-- öldürme, sandık, parşömen, malzeme veya sahte eşya varsa kaydı reddeder.
-- Sınırlar bilerek cömert tutuldu: dürüst oyuncunun reddedilmemesi, en kötü hile
-- yöntemi olan "kayıt dosyasını düzenleme"nin engellenmesi hedeflenir.
--
-- Ayarlar kz_config tablosunda. Supabase > Table Editor > kz_config'ten değiştirebilirsin:
--   guard_enabled = 0 yaparsan koruma tamamen kapanır (acil durum anahtarı)
-- ============================================================

-- 1) AYARLAR
create table if not exists public.kz_config (
  key text primary key,
  val numeric not null
);
alter table public.kz_config enable row level security;  -- kimse (oyuncular dahil) okuyamaz/yazamaz
insert into public.kz_config(key,val) values
  ('guard_enabled',1),     -- 1 açık, 0 kapalı
  ('kps',1.0),            -- saniyede en fazla kaç canavar öldürülebilir (cömert tahmin)
  ('slack_s',30),         -- her kayıtta ek tolerans süresi (saniye)
  ('min_save_s',5),      -- iki kayıt arasında en az kaç saniye olmalı
  ('first_days',3),       -- ilk yüklemede (eski kayıt yokken) kaç günlük ilerleme kabul edilsin
  ('flat_gold_base',3000),-- tek seferlik ödüller (görev, günlük giriş) için sabit pay
  ('flat_gold_per_lv',400)
on conflict (key) do nothing;

create or replace function public.kz_cfg(k text, d numeric)
returns numeric language sql stable security definer set search_path = public as $$
  select coalesce((select val from public.kz_config where key = k), d);
$$;
revoke all on function public.kz_cfg(text,numeric) from public, anon, authenticated;

-- 2) YARDIMCILAR
create or replace function public.kz_n(j jsonb, k text)
returns numeric language sql immutable as $$
  select case when jsonb_typeof(j->k) = 'number' then (j->>k)::numeric else 0 end;
$$;

-- Seviye l'den l+1'e geçmek için gereken XP (oyundaki reqXp ile aynı formül)
create or replace function public.kz_reqxp(l int)
returns numeric language sql immutable as $$
  select floor(140 * power(least(l,49), 2.38)
         * (case when least(l,49) > 25 then power(1.085, least(l,49) - 25) else 1 end)
         * (case when least(l,49) > 40 then power(1.18, least(l,49) - 40) else 1 end)
         * (case when l > 49 then power(1.115, l - 49) else 1 end));
$$;
-- Seviyeye göre bölge numarası (0-11), oyundaki rgOf ile aynı
create or replace function public.kz_rg(lv int)
returns int language sql immutable as $$
  select case when lv <= 50 then least(4, greatest(lv - 1, 0) / 10)
              when lv < 58 then 5 when lv < 65 then 6 when lv < 72 then 7
              when lv < 79 then 8 when lv < 86 then 9 when lv < 93 then 10 else 11 end;
$$;
-- Bir seviyeye gelene kadar toplam harcanan XP
create or replace function public.kz_cumxp(lv int)
returns numeric language sql immutable as $$
  select coalesce(sum(public.kz_reqxp(g)), 0) from generate_series(1, greatest(lv - 1, 0)) g;
$$;

-- Eşya kontrolü: sorun varsa nedenini, yoksa null döner
create or replace function public.kz_item_err(it jsonb, lv int)
returns text language plpgsql immutable as $$
declare
  r int := public.kz_rg(lv);
  reqs int[] := array[10,20,30,40,50,55,60,70,75,85,90,100];      -- bolgede dusebilecek en yuksek kademe
  pws  int[] := array[62,130,250,440,650,740,830,1010,1100,1280,1370,1550];
  g numeric; at text; sc numeric; p numeric; rl numeric; bp numeric; a jsonb;
begin
  if jsonb_typeof(it) <> 'object' then return 'bozuk esya'; end if;
  g := public.kz_n(it,'g'); p := public.kz_n(it,'p'); rl := public.kz_n(it,'rl'); bp := public.kz_n(it,'bp');
  if g < 1 or g > 5 or g <> floor(g) then return 'esya sinifi'; end if;
  if p < 0 or p > 15 then return 'esya artisi'; end if;
  if rl < 1 or rl > reqs[r+1] then return 'esya seviyesi'; end if;
  if bp < 1 or bp > pws[r+1] then return 'esya gucu'; end if;
  if jsonb_typeof(it->'af') = 'array' then
    if jsonb_array_length(it->'af') > 4 then return 'esya efsunu'; end if;
    for a in select * from jsonb_array_elements(it->'af') loop
      at := a->>'t';
      if at in ('atk','def','crit') then
        if public.kz_n(a,'v') < 0 or public.kz_n(a,'v') > 10 then return 'esya efsun degeri'; end if;
      elsif at in ('ba','sk') then
        -- Ozel silah efsunu: yalnizca Lv 10/30/50/75/100 silahlarda; ust sinir kademeye gore
        if (it->>'slot') is distinct from 'weapon' or rl not in (10,30,50,75,100) then return 'esya efsun turu'; end if;
        sc := case when at = 'ba' then (case rl when 10 then 20 when 30 then 35 when 50 then 50 when 75 then 65 else 80 end)
                   else (case rl when 10 then 12 when 30 then 21 when 50 then 30 when 75 then 38 else 45 end) end;
        if public.kz_n(a,'v') < 0 or public.kz_n(a,'v') > sc then return 'esya efsun degeri'; end if;
      else
        return 'esya efsun turu';
      end if;
    end loop;
  end if;
  return null;
end;
$$;

-- Bir karakter slotunu (yeni) önceki haliyle (old, yoksa null) karşılaştırır.
-- Sorun varsa nedenini, yoksa null döner. dt: geçen süre (saniye, tolerans dahil).
create or replace function public.kz_slot_err(ns jsonb, os jsonb, dt numeric)
returns text language plpgsql stable security definer set search_path = public as $$
declare
  kps numeric := public.kz_cfg('kps',1.0);
  same boolean;
  lv int; r int; xp numeric; gold numeric;
  blv int := 1; bxp numeric := 0; bgold numeric := 300; bk numeric := 0; be numeric := 0; btw numeric := 0;
  bch numeric := 0; bsc numeric := 0; bl numeric := 0; bmat numeric := 0; binv numeric := 0;
  tw numeric; m numeric; budget numeric; tn numeric; tb numeric;
  gmax numeric[] := array[25,70,160,380,1500,2772,4452,7149,11479,18433,29600,50858];
  xmax numeric[] := array[220,1200,4800,22000,120000,318570,682541,1462356,3133121,6712762,14382201,34357716];
  smax numeric[] := array[55,125,195,265,335,380,430,520,567,660,706,800];
  it jsonb; e text; ngr int := 0; sumat numeric := 0; sumsr numeric := 0; kv record; st jsonb;
begin
  if jsonb_typeof(ns) <> 'object' then return 'slot bozuk'; end if;
  st := case when jsonb_typeof(ns->'st') = 'object' then ns->'st' else '{}'::jsonb end;
  lv := public.kz_n(ns,'lv')::int; xp := public.kz_n(ns,'xp'); gold := public.kz_n(ns,'gold');
  if lv < 1 or lv > 100 or public.kz_n(ns,'lv') <> lv then return 'seviye'; end if;
  if (ns->>'cls') is null or (ns->>'cls') not in ('tank','mage','archer','assassin','healer') then return 'sinif'; end if;
  if char_length(coalesce(ns->>'name','')) not between 1 and 20 then return 'karakter adi'; end if;
  if (ns->>'race') is not null and (ns->>'race') not in ('kul','gol','tas','kem','yir','fis') then return 'irk'; end if;
  if xp < 0 or gold < 0 or gold > 2000000000 then return 'altin veya xp'; end if;
  tw := public.kz_n(ns,'tw');
  if tw < 0 or tw > 500 then return 'kule'; end if;
  r := public.kz_rg(lv);

  -- Karşılaştırma tabanı: aynı karakterse önceki değerleri, değilse yeni karakter başlangıcını kullan
  same := os is not null and jsonb_typeof(os) = 'object'
          and (os->>'name') = (ns->>'name') and (os->>'cls') = (ns->>'cls');
  -- Irk bir kez secilir; secildikten sonra degistirilemez (yeni karakter ya da irksiz eski karakter serbest)
  if same and (os->>'race') is not null and (ns->>'race') is distinct from (os->>'race')
     and not (public.kz_n(ns,'lv') = 1 and public.kz_n(ns,'xp') = 0 and public.kz_n(ns,'tw') = 0) then return 'irk degistirilemez'; end if;
  if same then
    blv := greatest(public.kz_n(os,'lv')::int, 1); bxp := public.kz_n(os,'xp'); bgold := public.kz_n(os,'gold');
    btw := public.kz_n(os,'tw'); bch := public.kz_n(os,'ch'); bsc := public.kz_n(os,'sc');
    if jsonb_typeof(os->'st') = 'object' then
      bk := public.kz_n(os->'st','k'); be := public.kz_n(os->'st','e'); bl := public.kz_n(os->'st','l');
    end if;
    if jsonb_typeof(os->'mat') = 'object' then
      select coalesce(sum(case when jsonb_typeof(value) = 'number' then (value #>> '{}')::numeric else 0 end),0)
        into bmat from jsonb_each(os->'mat');
    end if;
    if jsonb_typeof(os->'inv') = 'array' then
      for it in select * from jsonb_array_elements(os->'inv') loop
        if jsonb_typeof(it) = 'object' then
          binv := binv + 3 + public.kz_n(it,'rl')*2 + public.kz_n(it,'p')*3 + public.kz_n(it,'g')*public.kz_n(it,'rl');
        end if;
      end loop;
    end if;
  end if;

  -- Tecrübe (seviye + xp birlikte)
  tn := public.kz_cumxp(lv) + xp; tb := public.kz_cumxp(blv) + bxp;
  m := greatest(1, 0.6 * (1 + 0.07 * tw));       -- kule canavarları daha çok xp verir
  budget := dt * kps * xmax[r+1] * m;
  if tn > tb + budget then return 'tecrube (seviye cok hizli artti)'; end if;

  -- Altın: öldürme + eşya satışı + sandık + eldeki çantanın satış değeri + tek seferlik ödüller
  budget := dt * (kps * gmax[r+1] + kps * smax[r+1] + 0.5 * kps * (lv * 60 + 50))
           + binv + public.kz_cfg('flat_gold_base',3000) + lv * public.kz_cfg('flat_gold_per_lv',400);
  if gold > bgold + budget then return 'altin cok hizli artti'; end if;

  -- Sayaçlar
  if public.kz_n(st,'k') > bk + dt * kps + 10 then return 'oldurme sayisi'; end if;
  if public.kz_n(st,'e') > be + dt * kps + 5 then return 'elit sayisi'; end if;
  if public.kz_n(st,'l') > bl + 5 + dt * kps * 0.05 then return 'elit esya sayisi'; end if;
  if tw > btw + dt * kps + 3 then return 'kule kati cok hizli artti'; end if;
  if public.kz_n(ns,'ch') > bch + 5 + dt * kps * 0.6 then return 'sandik sayisi'; end if;
  if public.kz_n(ns,'sc') > bsc + 5 + dt * kps * 0.1 then return 'parsomen sayisi'; end if;

  -- Malzeme toplamı
  if jsonb_typeof(ns->'mat') = 'object' then
    select coalesce(sum(case when jsonb_typeof(value) = 'number' then (value #>> '{}')::numeric else 0 end),0)
      into sumat from jsonb_each(ns->'mat');
    if sumat > bmat + 2000 + dt * kps * 10 then return 'malzeme sayisi'; end if;
  end if;

  -- Nitelik ve yetenek puanları seviyeden fazla olamaz
  if jsonb_typeof(ns->'at') = 'object' then
    select coalesce(sum(case when jsonb_typeof(value) = 'number' then (value #>> '{}')::numeric else 0 end),0)
      into sumat from jsonb_each(ns->'at');
  else sumat := 0; end if;
  if public.kz_n(ns,'ap') + sumat > 3 * lv + 3 then return 'nitelik puani'; end if;
  if jsonb_typeof(ns->'sr') = 'object' then
    select coalesce(sum(case when jsonb_typeof(value) = 'number' then (value #>> '{}')::numeric else 0 end),0)
      into sumsr from jsonb_each(ns->'sr');
  end if;
  if public.kz_n(ns,'sp') + sumsr > 2 * lv + 2 then return 'yetenek puani'; end if;

  -- Çanta ve takılı eşyalar
  if jsonb_typeof(ns->'inv') = 'array' then
    if jsonb_array_length(ns->'inv') > 50 then return 'canta dolulugu'; end if;
    for it in select * from jsonb_array_elements(ns->'inv') loop
      e := public.kz_item_err(it, lv); if e is not null then return e; end if;
      if public.kz_n(it,'g') = 5 then ngr := ngr + 1; end if;
    end loop;
  end if;
  if jsonb_typeof(ns->'eq') = 'object' then
    for kv in select * from jsonb_each(ns->'eq') loop
      if jsonb_typeof(kv.value) = 'object' then
        e := public.kz_item_err(kv.value, lv); if e is not null then return e; end if;
        if public.kz_n(kv.value,'g') = 5 then ngr := ngr + 1; end if;
      end if;
    end loop;
  end if;
  -- Elit (GR 5) eşya sayısı, bulunan elit eşya sayacını aşamaz
  if ngr > public.kz_n(st,'l') then return 'sahte elit esya'; end if;
  return null;
end;
$$;
revoke all on function public.kz_slot_err(jsonb,jsonb,numeric) from public, anon, authenticated;

-- 3) KAYIT TETİKLEYİCİSİ
create or replace function public.saves_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  oldrow public.saves%rowtype; hasold boolean := false;
  dt numeric; i int; ns jsonb; os jsonb; e text; n int;
begin
  -- Sunucu savaşı (kz_b_put) yazarken: istemci kuralları atlanır, kayıt zamanı değişmez
  if coalesce(current_setting('kz.srv', true),'') = '1' and tg_op = 'UPDATE' then
    new.updated_at := old.updated_at; new.updated_ms := old.updated_ms; return new;
  end if;
  new.updated_at := now();                       -- zamanı sunucu belirler, istemci değil
  if public.kz_cfg('guard_enabled',1) < 1 then return new; end if;
  if jsonb_typeof(new.data) <> 'object' or jsonb_typeof(new.data->'slots') <> 'array' then
    raise exception 'hile_korumasi: bozuk kayit';
  end if;
  n := jsonb_array_length(new.data->'slots');
  if n > 5 then raise exception 'hile_korumasi: fazla karakter yuvasi'; end if;

  -- upsert'te INSERT tetikleyicisi de çalışır, bu yüzden mevcut satırı kendimiz okuruz
  if tg_op = 'UPDATE' then oldrow := old; hasold := true;
  else
    select * into oldrow from public.saves where user_id = new.user_id;
    hasold := found;
  end if;

  if hasold then
    dt := least(greatest(extract(epoch from (now() - oldrow.updated_at)), 0), 86400 * 30);
  else
    dt := public.kz_cfg('first_days',3) * 86400;
  end if;
  -- Çok sık kayıt: her kayıtta eklenen tolerans ve tek seferlik paylar yığılmasın
  if hasold and new.data is distinct from oldrow.data
     and extract(epoch from (now() - oldrow.updated_at)) < public.kz_cfg('min_save_s',5) then
    raise exception 'hile_korumasi: cok sik kayit';
  end if;
  dt := dt + public.kz_cfg('slack_s',30);

  for i in 0..4 loop
    ns := new.data->'slots'->i;
    if ns is null or jsonb_typeof(ns) = 'null' then continue; end if;
    os := case when hasold then oldrow.data->'slots'->i else null end;
    e := public.kz_slot_err(ns, os, dt);
    if e is not null then raise exception 'hile_korumasi: % (yuva %)', e, i + 1; end if;
    -- Sunucu savaşı açıksa: ilerleme alanlarını istemci değiştiremez (savas.sql tanımlar)
    if public.kz_cfg('srv_lock',0) >= 1 then
      e := public.kz_lock_err(ns, os);
      if e is not null then raise exception 'hile_korumasi: % (yuva %)', e, i + 1; end if;
    end if;
  end loop;
  return new;
end;
$$;
revoke all on function public.saves_guard() from public, anon, authenticated;
drop trigger if exists saves_guard on public.saves;
create trigger saves_guard before insert or update on public.saves
  for each row execute function public.saves_guard();

-- 4) LİDERLİK TABLOSU: değerler kayıtlı (doğrulanmış) oyun verisinden büyük olamaz
create or replace function public.lb_before_write()
returns trigger language plpgsql security definer set search_path = public as $$
declare sd jsonb; mlv int; mtw numeric; se numeric; sk numeric;
begin
  select username into new.username from public.profiles where id = new.user_id;
  new.updated_at := now();
  if public.kz_cfg('guard_enabled',1) < 1 then return new; end if;
  select data into sd from public.saves where user_id = new.user_id;
  if sd is null or jsonb_typeof(sd->'slots') <> 'array' then
    raise exception 'hile_korumasi: liderlik icin once kayit gerekli';
  end if;
  select coalesce(max(public.kz_n(s,'lv')),0), coalesce(max(public.kz_n(s,'tw')),0),
         coalesce(sum(public.kz_n(s->'st','e')),0), coalesce(sum(public.kz_n(s->'st','k')),0)
    into mlv, mtw, se, sk
    from jsonb_array_elements(sd->'slots') s where jsonb_typeof(s) = 'object';
  if new.level > mlv or new.tower > mtw or new.elites > se or new.kills > sk then
    raise exception 'hile_korumasi: liderlik degerleri kayitla uyusmuyor';
  end if;
  return new;
end;
$$;
