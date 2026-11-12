-- ============================================================
-- Karanlık Zindan RPG: Supabase kurulum kodu (6. aşama)
-- BENZERSİZ KARAKTER ADI + KÜFÜR FİLTRESİ
-- Sıra: kurulum, topluluk, koruma, sunucu, savas, EN SON bu dosya.
-- İstediğin kadar tekrar çalıştırabilirsin. sunucu.sql'i tekrar çalıştırırsan bunu da tekrar çalıştır
-- (kz_save fonksiyonunu bu dosya genişletir).
--
-- Küfür listesine kelime eklemek için (küçük harf, ASCII, tekrar eden harfleri tek yaz):
--   insert into public.kz_badwords(word, sub) values ('kelime', false);
--   sub=true: kelime başka kelimenin içinde geçse de yasak; sub=false: yalnızca ayrı bir kelimeyken yasak.
-- ============================================================

create table if not exists public.kz_names (
  key text primary key,
  user_id uuid not null references auth.users(id) on delete cascade
);
create index if not exists kz_names_user_idx on public.kz_names(user_id);
alter table public.kz_names enable row level security;
revoke all on public.kz_names from anon, authenticated;

create table if not exists public.kz_badwords (
  word text primary key,
  sub boolean not null default false
);
alter table public.kz_badwords enable row level security;
revoke all on public.kz_badwords from anon, authenticated;

insert into public.kz_badwords(word, sub) values
  ('orospu',true),('orosbu',true),('amcik',true),('yarak',true),('siktir',true),('sikeyim',true),('sikerim',true),
  ('pezevenk',true),('gotveren',true),('kahpe',true),('yavsak',true),('gavat',true),('anasini',true),('anani',true),
  ('sikis',true),('amina',true),('aminakoy',true),('aminakod',true),
  ('amk',false),('aq',false),('sik',false),('pic',false),('pust',false),('ibne',false),('oc',false),
  ('fuck',true),('shit',true),('bitch',true),('cunt',true),('fagot',true),('whore',true),('asole',true),
  ('niga',false),('niger',false),('slut',false),('dick',false),('pusy',false)
on conflict (word) do nothing;

-- Yazıyı süzgece hazırla: Türkçe harfleri ASCII yap, küçült, 0134578@$ -> harf, harf olmayanı boşluk yap, tekrar eden harfi tek yap
create or replace function public.kz_norm(t text)
returns text language sql immutable set search_path = public as $$
  select btrim(regexp_replace(regexp_replace(
    translate(lower(translate(coalesce(t,''), 'İIıĞğÜüŞşÖöÇç', 'iiigguussoocc')), '0134578@$', 'oieastbas'),
    '[^a-z0-9]+', ' ', 'g'), '(.)\1+', '\1', 'g'))
$$;

create or replace function public.kz_is_bad(t text)
returns boolean language sql stable security definer set search_path = public as $$
  with n as (select public.kz_norm(t) as s)
  select exists (
    select 1 from public.kz_badwords b, n
    where (b.sub and position(b.word in replace(n.s, ' ', '')) > 0)
       or (not b.sub and b.word = any (string_to_array(n.s, ' ')))
  )
$$;
revoke all on function public.kz_is_bad(text) from public, anon, authenticated;

-- Ad anahtarı: büyük/küçük harf, Türkçe harf, boşluk ve işaret farkı yok sayılır ("Ali", "ALİ", "A.li" aynı)
create or replace function public.kz_name_key(t text)
returns text language sql immutable set search_path = public as $$
  select case when k = '' then md5(coalesce(t,'')) else k end
  from (select regexp_replace(lower(translate(coalesce(t,''), 'İIıĞğÜüŞşÖöÇç', 'iiigguussoocc')), '[^a-z0-9]', '', 'g') as k) x
$$;

-- Oyun, karakter oluştururken sorar: 'ok' | 'alinmis' | 'uygunsuz'
create or replace function public.kz_name_status(p_name text)
returns text language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); k text; o uuid;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  if public.kz_is_bad(p_name) then return 'uygunsuz'; end if;
  k := public.kz_name_key(p_name);
  select user_id into o from public.kz_names where key = k;
  if o is not null and o <> uid then return 'alinmis'; end if;
  return 'ok';
end;
$$;
revoke all on function public.kz_name_status(text) from public, anon;
grant execute on function public.kz_name_status(text) to authenticated;

-- Kayıt fonksiyonu: sunucu.sql'dekinin aynısı + karakter adlarını sahiplenir
create or replace function public.kz_save(p_data jsonb, p_ms bigint)
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  oldd jsonb; i int; sl jsonb; nm text; k text; keys text[] := '{}'; grand boolean;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception 'hile_korumasi: bozuk kayit';
  end if;
  if jsonb_typeof(p_data->'slots') = 'array' then
    select data into oldd from public.saves where user_id = uid;
    for i in 0..4 loop
      sl := p_data->'slots'->i;
      if sl is null or jsonb_typeof(sl) <> 'object' then continue; end if;
      nm := sl->>'name';
      if nm is null then continue; end if;
      k := public.kz_name_key(nm);
      keys := keys || k;
      -- bu yuvada zaten kayıtlı olan ad dokunulmaz (eski oyuncular bozulmasın); yalnızca yeni adlar denetlenir
      grand := coalesce(oldd is not null and (oldd->'slots'->i->>'name') = nm, false);
      if not grand then
        if public.kz_is_bad(nm) then raise exception 'kufur: karakter adi'; end if;
      end if;
      insert into public.kz_names(key, user_id) values (k, uid) on conflict (key) do nothing;
      if not exists (select 1 from public.kz_names where key = k and user_id = uid) and not grand then
        raise exception 'isim_alinmis: %', nm;
      end if;
    end loop;
    delete from public.kz_names where user_id = uid and not (key = any (keys));
  end if;
  insert into public.saves(user_id, data, updated_ms)
  values (uid, p_data, coalesce(p_ms, 0))
  on conflict (user_id) do update
    set data = excluded.data, updated_ms = excluded.updated_ms;
end;
$$;
revoke all on function public.kz_save(jsonb,bigint) from public, anon;
grant execute on function public.kz_save(jsonb,bigint) to authenticated;

-- Mevcut oyuncuların adlarını sahiplen (aynı ad varsa önce kaydeden kazanır)
insert into public.kz_names(key, user_id)
select distinct on (k) k, user_id from (
  select s.user_id, s.updated_at, public.kz_name_key(sl->>'name') as k
  from public.saves s, jsonb_array_elements(case when jsonb_typeof(s.data->'slots') = 'array' then s.data->'slots' else '[]'::jsonb end) sl
  where jsonb_typeof(sl) = 'object' and (sl->>'name') is not null
) q order by k, updated_at
on conflict (key) do nothing;

-- Sohbet: küfürlü mesaj gönderilemez
create or replace function public.chat_filter()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.kz_is_bad(new.body) then raise exception 'kufur: mesaj'; end if;
  return new;
end;
$$;
revoke all on function public.chat_filter() from public, anon, authenticated;
drop trigger if exists chat_filter_before on public.chat_messages;
create trigger chat_filter_before before insert on public.chat_messages
  for each row execute function public.chat_filter();
