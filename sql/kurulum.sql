-- ============================================================
-- Karanlık Zindan RPG: Supabase kurulum kodu (1. aşama)
-- Hesap profili + bulut kayıt. İstediğin kadar tekrar çalıştırabilirsin.
-- ============================================================

-- 1) Oyuncu profili (kullanıcı adı)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,16}$')
);
create unique index if not exists profiles_username_key
  on public.profiles (lower(username));

-- 2) Bulut kayıt (oyuncu başına tek satır)
create table if not exists public.saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_ms bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint saves_size check (octet_length(data::text) < 1000000)
);

-- 3) Güvenlik: satır bazlı erişim kuralları (RLS)
alter table public.profiles enable row level security;
alter table public.saves enable row level security;

drop policy if exists "profiller giris yapana acik" on public.profiles;
create policy "profiller giris yapana acik" on public.profiles
  for select to authenticated using (true);

drop policy if exists "kendi kaydini okur" on public.saves;
create policy "kendi kaydini okur" on public.saves
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "kendi kaydini ekler" on public.saves;
create policy "kendi kaydini ekler" on public.saves
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "kendi kaydini gunceller" on public.saves;
create policy "kendi kaydini gunceller" on public.saves
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) Yetkiler (otomatik açma kapalı olduğu için elle veriyoruz)
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update on public.saves to authenticated;

-- 5) Kayıt olunca profil satırını otomatik oluştur
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    lower(coalesce(new.raw_user_meta_data->>'username', 'oyuncu_' || substr(new.id::text, 1, 6)))
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
