-- ============================================================
-- Karanlık Zindan RPG: Supabase kurulum kodu (4. aşama)
-- SUNUCU KAYDIN SAHİBİ (aşama 2)
-- Sıra: kurulum.sql, topluluk.sql, koruma.sql, EN SON bu dosya.
-- İstediğin kadar tekrar çalıştırabilirsin.
--
-- Bu dosyadan sonra oyun, kayıt ve liderlik tablolarına doğrudan YAZAMAZ.
-- Yazma yalnızca aşağıdaki sunucu fonksiyonlarından geçer:
--   kz_save(...)        : kaydı koruma kurallarından geçirip yazar
--   kz_lb_refresh()     : liderlik satırını, kayıtlı (doğrulanmış) veriden sunucu hesaplar
-- Not: kurulum.sql veya topluluk.sql'i sonradan tekrar çalıştırırsan bu dosyayı da
-- tekrar çalıştır (yoksa doğrudan yazma izni geri açılır).
-- ============================================================

-- 1) Yeni hesaplar yalnızca yeni (başlangıç) karakterle başlayabilir
--    Eski ayar: ilk yüklemede 3 günlük ilerleme kabul ediliyordu. Artık yalnızca birkaç saniyelik.
insert into public.kz_config(key,val) values ('first_days',0),('slack_s',10)
on conflict (key) do update set val = excluded.val;

-- 2) KAYIT FONKSİYONU
create or replace function public.kz_save(p_data jsonb, p_ms bigint)
returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception 'hile_korumasi: bozuk kayit';
  end if;
  -- kullanıcı numarasını istemci değil sunucu belirler; koruma tetikleyicisi burada da çalışır
  insert into public.saves(user_id, data, updated_ms)
  values (uid, p_data, coalesce(p_ms, 0))
  on conflict (user_id) do update
    set data = excluded.data, updated_ms = excluded.updated_ms;
end;
$$;
revoke all on function public.kz_save(jsonb,bigint) from public, anon;
grant execute on function public.kz_save(jsonb,bigint) to authenticated;

-- 3) LİDERLİK FONKSİYONU: istemci hiçbir değer göndermez, sunucu kayıttan hesaplar
create or replace function public.kz_lb_refresh()
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  sd jsonb; best jsonb; cl text;
  mtw numeric; se numeric; sk numeric;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select data into sd from public.saves where user_id = uid;
  if sd is null or jsonb_typeof(sd->'slots') <> 'array' then return; end if;

  select s into best
    from jsonb_array_elements(sd->'slots') s
   where jsonb_typeof(s) = 'object'
   order by public.kz_n(s,'lv') desc, public.kz_n(s->'st','k') desc
   limit 1;
  if best is null then return; end if;

  select coalesce(max(public.kz_n(s,'tw')),0),
         coalesce(sum(public.kz_n(s->'st','e')),0),
         coalesce(sum(public.kz_n(s->'st','k')),0)
    into mtw, se, sk
    from jsonb_array_elements(sd->'slots') s where jsonb_typeof(s) = 'object';

  cl := best->>'cls';
  if cl is null or cl not in ('tank','mage','archer','assassin','healer') then cl := 'tank'; end if;

  insert into public.leaderboard(user_id, char_name, cls, level, tower, elites, kills)
  values (uid,
          left(coalesce(best->>'name',''), 14),
          cl,
          greatest(1, least(50, public.kz_n(best,'lv')::int)),
          greatest(0, least(500, mtw::int)),
          greatest(0, least(100000, se::int)),
          greatest(0, least(10000000, sk::bigint)))
  on conflict (user_id) do update
    set char_name = excluded.char_name, cls = excluded.cls, level = excluded.level,
        tower = excluded.tower, elites = excluded.elites, kills = excluded.kills;
end;
$$;
revoke all on function public.kz_lb_refresh() from public, anon;
grant execute on function public.kz_lb_refresh() to authenticated;

-- 4) DOĞRUDAN YAZMAYI KAPAT (okuma açık kalır)
revoke insert, update, delete on public.saves from authenticated, anon;
revoke insert, update, delete on public.leaderboard from authenticated, anon;
