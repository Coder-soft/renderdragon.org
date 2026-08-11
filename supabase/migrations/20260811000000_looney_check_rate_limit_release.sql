create or replace function public.release_looney_check_rate_limit(p_buckets jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  bucket jsonb;
  current_window timestamptz := date_trunc('day', now() at time zone 'utc') at time zone 'utc';
begin
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
    update public.looney_check_rate_limits
    set check_count = greatest(0, check_count - 1), last_check_at = now()
    where bucket_type = bucket->>'type'
      and bucket_hash = bucket->>'hash'
      and window_started_at = current_window
      and check_count > 0;
  end loop;
end;
$$;

revoke all on function public.release_looney_check_rate_limit(jsonb) from public, anon, authenticated;
grant execute on function public.release_looney_check_rate_limit(jsonb) to service_role;
