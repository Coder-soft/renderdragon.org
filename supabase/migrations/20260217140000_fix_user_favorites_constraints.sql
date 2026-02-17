-- Delete orphaned favorites (referencing non-existent resources)
delete from public.user_favorites
where resource_url is null
  and not exists (
    select 1 from public.resources r where r.id::text = user_favorites.resource_id::text
  );

-- Backfill remaining missing resource_url values from resources table
update public.user_favorites as uf
set resource_url = coalesce(r.download_url, r.preview_url, r.image_url)
from public.resources as r
where uf.resource_url is null
  and uf.resource_id::text = r.id::text;

-- Drop the old unique constraint on (user_id, resource_id)
alter table public.user_favorites
drop constraint if exists user_favorites_user_id_resource_id_key;

-- Drop the partial unique index on (user_id, resource_url)
drop index if exists public.user_favorites_user_id_resource_url_key;

-- Create a proper unique constraint on (user_id, resource_url)
alter table public.user_favorites
add constraint user_favorites_user_id_resource_url_key
unique (user_id, resource_url);

-- Make resource_url NOT NULL
alter table public.user_favorites
alter column resource_url set not null;

-- Drop the now-unused resource_id column
alter table public.user_favorites
drop column if exists resource_id;
