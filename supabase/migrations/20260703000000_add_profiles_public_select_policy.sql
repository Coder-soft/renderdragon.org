-- Enable RLS on profiles table (idempotent)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Allow anyone to read public profile fields (username, display_name, avatar_url)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
FOR SELECT
USING (true);
