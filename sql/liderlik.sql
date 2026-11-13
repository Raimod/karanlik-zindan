-- ============================================================
-- Karanlık Zindan RPG: SIRALAMA GÜNCELLEMESİ
-- Silinen karakter sıralamadan düşer (son karakter de silinirse oyuncu tamamen düşer).
-- Çalıştırma: SQL Editor'de yeni sekme, bu dosyanın hepsini yapıştır, Run.
-- sunucu.sql tekrar çalıştırılırsa bu dosya da tekrar çalıştırılmalıdır.
-- ============================================================
create or replace function public.kz_lb_refresh()
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  sd jsonb; best jsonb; cl text;
  mtw numeric; se numeric; sk numeric;
begin
  if uid is null then raise exception 'giris gerekli'; end if;
  select data into sd from public.saves where user_id = uid;
  if sd is null or jsonb_typeof(sd->'slots') <> 'array' then delete from public.leaderboard where user_id = uid; return; end if;

  select s into best
    from jsonb_array_elements(sd->'slots') s
   where jsonb_typeof(s) = 'object'
   order by public.kz_n(s,'lv') desc, public.kz_n(s->'st','k') desc
   limit 1;
  if best is null then delete from public.leaderboard where user_id = uid; return; end if;   -- tüm karakterler silindiyse sıralamadan da düşer

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
