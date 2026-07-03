-- Ensure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to profiles (required for foreign-key joins from creator_packs, blogs, etc.)
-- Column-level REVOKE below prevents exposure of sensitive columns
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
FOR SELECT
USING (true);

-- Revoke SELECT on sensitive profile columns from anonymous users.
-- This prevents the REST API from exposing email, internal settings, etc.,
-- while still allowing the RLS policy (USING true) to resolve foreign-key joins.
REVOKE SELECT(email, first_name, last_name, theme_config, social_links, created_at, updated_at) ON profiles FROM anon;
