alter table if exists public.user_favorites
add column if not exists resource_url text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_favorites'
      and column_name = 'resource_id'
  ) then
    update public.user_favorites as uf
    set resource_url = coalesce(r.download_url, r.preview_url, r.image_url)
    from public.resources as r
    where uf.resource_url is null
      and uf.resource_id::text = r.id::text;
  end if;
end $$;

create unique index if not exists user_favorites_user_id_resource_url_key
on public.user_favorites (user_id, resource_url)
where resource_url is not null;
