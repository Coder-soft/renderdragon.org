-- Public read access for published blog posts.
-- Mirrors the creator_packs policy so anonymous visitors and search-engine
-- crawlers can read published posts without signing in.
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published blogs are publicly readable" ON blogs;
CREATE POLICY "Published blogs are publicly readable" ON blogs
FOR SELECT
USING (published = true);
