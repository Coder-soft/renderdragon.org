create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_url text not null,
  created_at timestamptz not null default now(),
  unique (user_id, resource_url)
);

alter table public.user_favorites enable row level security;

drop policy if exists "Users can view their favorites" on public.user_favorites;
drop policy if exists "Users can insert their favorites" on public.user_favorites;
drop policy if exists "Users can delete their favorites" on public.user_favorites;

create policy "Users can view their favorites"
  on public.user_favorites
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their favorites"
  on public.user_favorites
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their favorites"
  on public.user_favorites
  for delete
  using (auth.uid() = user_id);
