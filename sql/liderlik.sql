-- ============================================================
-- Karanlık Zindan RPG: SIRALAMA GÜNCELLEMESİ (sürüm 1.9.0)
--  * Silinen karakter sıralamadan düşer.
--  * En yüksek tek vuruş hasarı (maxhit) sıralaması.
--  * kz_rank_find: karakter adıyla sıralamada arama (sırasını bulur).
--  * kz_profile: bir oyuncunun en güçlü karakterinin profilini (kuşanılan eşyalar dahil) gösterir.
-- Çalıştırma: SQL Editor'de yeni sekme, bu dosyanın hepsini yapıştır, Run. (Tekrar çalıştırmak zararsızdır.)
-- sunucu.sql tekrar çalıştırılırsa bu dosya da tekrar çalıştırılmalıdır.
-- ============================================================
alter table public.leaderboard add column if not exists maxhit bigint not null default 0;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'lb_maxhit') then
    alter table public.leaderboard add constraint lb_maxhit check (maxhit between 0 and 2000000000);
  end if;
end $$;
create index if not exists lb_maxhit_idx on public.leaderboard (maxhit desc);

create or replace function public.kz_lb_refresh()
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  sd jsonb; best jsonb; cl text;
  mtw numeric; se numeric; sk numeric; mh numeric;
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
         coalesce(sum(public.kz_n(s->'st','k')),0),
         coalesce(max(public.kz_n(s->'st','mh')),0)
    into mtw, se, sk, mh
    from jsonb_array_elements(sd->'slots') s where jsonb_typeof(s) = 'object';

  cl := best->>'cls';
  if cl is null or cl not in ('tank','mage','archer','assassin','healer') then cl := 'tank'; end if;

  insert into public.leaderboard(user_id, char_name, cls, level, tower, elites, kills, maxhit)
  values (uid,
          left(coalesce(best->>'name',''), 14),
          cl,
          greatest(1, least(50, public.kz_n(best,'lv')::int)),
          greatest(0, least(500, mtw::int)),
          greatest(0, least(100000, se::int)),
          greatest(0, least(10000000, sk::bigint)),
          greatest(0, least(2000000000, mh::bigint)))
  on conflict (user_id) do update
    set char_name = excluded.char_name, cls = excluded.cls, level = excluded.level,
        tower = excluded.tower, elites = excluded.elites, kills = excluded.kills, maxhit = excluded.maxhit;
end;
$$;
revoke all on function public.kz_lb_refresh() from public, anon;
grant execute on function public.kz_lb_refresh() to authenticated;

-- Karakter adıyla sıralamada arama: eşleşen oyuncuların sırasını döndürür
create or replace function public.kz_rank_find(p_col text, p_q text)
returns table(rk bigint, user_id uuid, char_name text, cls text, level int, tower int, elites int, kills int, maxhit bigint)
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
                 l.kills desc, l.user_id) as rnk
      from public.leaderboard l)
    select r.rnk, r.user_id, r.char_name, r.cls, r.level, r.tower, r.elites, r.kills, r.maxhit
      from r where r.char_name ilike '%' || q || '%' order by r.rnk limit 10;
end;
$$;
revoke all on function public.kz_rank_find(text, text) from public, anon;
grant execute on function public.kz_rank_find(text, text) to authenticated;

-- Oyuncu profili: en güçlü karakterin herkese açık bilgileri
create or replace function public.kz_profile(p_user uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare sd jsonb; best jsonb; lb record; eqj jsonb := '{}'::jsonb; k text; it jsonb;
begin
  if auth.uid() is null then raise exception 'giris gerekli'; end if;
  select * into lb from public.leaderboard where user_id = p_user;
  if not found then return null; end if;
  select data into sd from public.saves where user_id = p_user;
  if sd is null or jsonb_typeof(sd->'slots') <> 'array' then return null; end if;
  select s into best
    from jsonb_array_elements(sd->'slots') s
   where jsonb_typeof(s) = 'object' and (s->>'name') = lb.char_name
   order by public.kz_n(s,'lv') desc limit 1;
  if best is null then
    select s into best from jsonb_array_elements(sd->'slots') s
     where jsonb_typeof(s) = 'object' order by public.kz_n(s,'lv') desc, public.kz_n(s->'st','k') desc limit 1;
  end if;
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
  return jsonb_build_object(
    'user_id', p_user, 'name', best->>'name', 'cls', best->>'cls', 'lv', public.kz_n(best,'lv'),
    'tw', public.kz_n(best,'tw'), 'title', best->>'title',
    'kills', lb.kills, 'elites', lb.elites, 'tower', lb.tower, 'maxhit', lb.maxhit,
    'eq', eqj);
end;
$$;
revoke all on function public.kz_profile(uuid) from public, anon;
grant execute on function public.kz_profile(uuid) to authenticated;
