create table if not exists public.looney_check_rate_limits (
  id bigint generated always as identity primary key,
  bucket_type text not null check (bucket_type in ('browser', 'ip', 'account')),
  bucket_hash text not null,
  user_id uuid references auth.users(id) on delete cascade,
  window_started_at timestamptz not null,
  check_count integer not null default 0 check (check_count >= 0),
  last_check_at timestamptz not null default now(),
  unique (bucket_type, bucket_hash, window_started_at)
);

create index if not exists looney_check_rate_limits_user_idx
  on public.looney_check_rate_limits (user_id, window_started_at);

create extension if not exists pg_cron with schema extensions;

do $$
begin
  if not exists (
    select 1 from cron.job where jobname = 'looney-check-rate-limit-retention'
  ) then
    perform cron.schedule(
      'looney-check-rate-limit-retention',
      '17 3 * * *',
      $job$delete from public.looney_check_rate_limits where window_started_at < now() - interval '7 days'$job$
    );
  end if;
end;
$$;

alter table public.looney_check_rate_limits enable row level security;

revoke all on public.looney_check_rate_limits from anon, authenticated;

create or replace function public.consume_looney_check_rate_limit(
  p_buckets jsonb,
  p_limit integer default 5,
  p_consume boolean default true
)
returns table (
  allowed boolean,
  retry_after_seconds integer,
  browser_count integer,
  ip_count integer,
  account_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  bucket jsonb;
  bucket_type_value text;
  bucket_hash_value text;
  current_window timestamptz := date_trunc('day', now() at time zone 'utc') at time zone 'utc';
  bucket_count integer;
  blocked boolean := false;
  browser_total integer := 0;
  ip_total integer := 0;
  account_total integer := 0;
begin
  if p_limit is null or p_limit < 1 then
    raise exception 'Rate-limit must be positive';
  end if;

  if jsonb_typeof(p_buckets) <> 'array' or jsonb_array_length(p_buckets) = 0 then
    raise exception 'At least one rate-limit bucket is required';
  end if;

  for bucket in
    select value
    from (
      select distinct on (value->>'type', value->>'hash') value
      from jsonb_array_elements(p_buckets)
      order by value->>'type', value->>'hash'
    ) unique_buckets
  loop
    bucket_type_value := bucket->>'type';
    bucket_hash_value := bucket->>'hash';
    if bucket_type_value not in ('browser', 'ip', 'account') or bucket_hash_value is null or length(bucket_hash_value) < 16 then
      raise exception 'Invalid rate-limit bucket';
    end if;

    insert into public.looney_check_rate_limits (bucket_type, bucket_hash, user_id, window_started_at)
    values (bucket_type_value, bucket_hash_value, nullif(bucket->>'user_id', '')::uuid, current_window)
    on conflict (bucket_type, bucket_hash, window_started_at) do nothing;

    select check_count into bucket_count
    from public.looney_check_rate_limits
    where bucket_type = bucket_type_value
      and bucket_hash = bucket_hash_value
      and window_started_at = current_window
    for update;

    if bucket_type_value = 'browser' then browser_total := bucket_count; end if;
    if bucket_type_value = 'ip' then ip_total := bucket_count; end if;
    if bucket_type_value = 'account' then account_total := bucket_count; end if;
    if bucket_count >= p_limit then blocked := true; end if;
  end loop;

  if not blocked and p_consume then
    update public.looney_check_rate_limits as limits
    set check_count = limits.check_count + 1, last_check_at = now()
    from (
      select distinct on (value->>'type', value->>'hash') value
      from jsonb_array_elements(p_buckets)
      order by value->>'type', value->>'hash'
    ) unique_buckets
    where limits.bucket_type = unique_buckets.value->>'type'
      and limits.bucket_hash = unique_buckets.value->>'hash'
      and limits.window_started_at = current_window;
    browser_total := browser_total + case when exists (
      select 1 from jsonb_array_elements(p_buckets) item where item->>'type' = 'browser'
    ) then 1 else 0 end;
    ip_total := ip_total + case when exists (
      select 1 from jsonb_array_elements(p_buckets) item where item->>'type' = 'ip'
    ) then 1 else 0 end;
    account_total := account_total + case when exists (
      select 1 from jsonb_array_elements(p_buckets) item where item->>'type' = 'account'
    ) then 1 else 0 end;
  end if;

  return query select not blocked,
    greatest(0, extract(epoch from ((current_window + interval '1 day') - now()))::integer),
    browser_total, ip_total, account_total;
end;
$$;

revoke all on function public.consume_looney_check_rate_limit(jsonb, integer, boolean) from public, anon, authenticated;
grant execute on function public.consume_looney_check_rate_limit(jsonb, integer, boolean) to service_role;
