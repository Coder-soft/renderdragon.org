-- Public read access for published blog posts.
-- Mirrors the creator_packs policy so anonymous visitors and search-engine
-- crawlers can read published posts without signing in. RLS is intentionally
-- not force-enabled here; the table already has it on, and adding a permissive
-- SELECT policy is safe either way.
DROP POLICY IF EXISTS "Published blogs are publicly readable" ON blogs;
CREATE POLICY "Published blogs are publicly readable" ON blogs
FOR SELECT
USING (published = true);
