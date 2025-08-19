-- Add settings fields to users table
-- This migration adds the necessary fields for user settings functionality

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS show_email_publicly BOOLEAN DEFAULT false;

-- Create index for profile visibility for efficient filtering
CREATE INDEX IF NOT EXISTS idx_users_profile_visibility ON users(profile_visibility);

-- Comments for clarity
COMMENT ON COLUMN users.display_name IS 'User-chosen display name for messages and profile';
COMMENT ON COLUMN users.bio IS 'User biography for profile page';
COMMENT ON COLUMN users.profile_visibility IS 'Profile visibility setting: public or private';
COMMENT ON COLUMN users.show_email_publicly IS 'Whether to show email address on public profile';
