-- ============================================================
-- Karanlık Zindan RPG: Supabase kurulum kodu (2. aşama)
-- Liderlik tablosu + genel sohbet. kurulum.sql çalıştırıldıktan SONRA çalıştır.
-- İstediğin kadar tekrar çalıştırabilirsin.
-- ============================================================

-- 1) LİDERLİK TABLOSU (oyuncu başına tek satır)
create table if not exists public.leaderboard (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null default '',
  char_name text not null default '',
  cls text not null default 'tank',
  level int not null default 1,
  tower int not null default 0,
  elites int not null default 0,
  kills int not null default 0,
  updated_at timestamptz not null default now(),
  constraint lb_level check (level between 1 and 50),
  constraint lb_tower check (tower between 0 and 500),
  constraint lb_elites check (elites between 0 and 100000),
  constraint lb_kills check (kills between 0 and 10000000),
  constraint lb_name check (char_length(char_name) <= 20),
  constraint lb_cls check (cls in ('tank','mage','archer','assassin','healer'))
);
create index if not exists lb_level_idx on public.leaderboard (level desc, kills desc);
create index if not exists lb_tower_idx on public.leaderboard (tower desc);
create index if not exists lb_elites_idx on public.leaderboard (elites desc);

-- Kullanıcı adını sunucu atar (oyuncu başkasının adıyla yazamaz)
create or replace function public.lb_before_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select username into new.username from public.profiles where id = new.user_id;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.lb_before_write() from public, anon, authenticated;
drop trigger if exists lb_before_write on public.leaderboard;
create trigger lb_before_write before insert or update on public.leaderboard
  for each row execute function public.lb_before_write();

alter table public.leaderboard enable row level security;
drop policy if exists "lb herkes okur" on public.leaderboard;
create policy "lb herkes okur" on public.leaderboard
  for select to authenticated using (true);
drop policy if exists "lb kendi satirini ekler" on public.leaderboard;
create policy "lb kendi satirini ekler" on public.leaderboard
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "lb kendi satirini gunceller" on public.leaderboard;
create policy "lb kendi satirini gunceller" on public.leaderboard
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.leaderboard to authenticated;

-- 2) GENEL SOHBET
create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null default '',
  body text not null,
  created_at timestamptz not null default now(),
  constraint chat_len check (char_length(btrim(body)) between 1 and 200)
);
create index if not exists chat_created_idx on public.chat_messages (created_at desc);

-- Kullanıcı adını sunucu atar, 2 saniyede birden fazla mesajı engeller,
-- ara sıra 7 günden eski mesajları siler.
create or replace function public.chat_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare lastt timestamptz; uname text;
begin
  select username into uname from public.profiles where id = new.user_id;
  if uname is null then raise exception 'profil bulunamadi'; end if;
  new.username := uname;
  new.body := btrim(new.body);
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
drop trigger if exists chat_before_insert on public.chat_messages;
create trigger chat_before_insert before insert on public.chat_messages
  for each row execute function public.chat_before_insert();

alter table public.chat_messages enable row level security;
drop policy if exists "chat herkes okur" on public.chat_messages;
create policy "chat herkes okur" on public.chat_messages
  for select to authenticated using (true);
drop policy if exists "chat kendi mesajini yazar" on public.chat_messages;
create policy "chat kendi mesajini yazar" on public.chat_messages
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "chat kendi mesajini siler" on public.chat_messages;
create policy "chat kendi mesajini siler" on public.chat_messages
  for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.chat_messages to authenticated;
