-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS personality_profile JSONB;

-- Update existing profiles to have profile_completed = false
UPDATE profiles 
SET profile_completed = FALSE 
WHERE profile_completed IS NULL; 