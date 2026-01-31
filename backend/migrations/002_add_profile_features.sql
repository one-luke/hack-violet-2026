-- Add new fields to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS custom_industry TEXT,
  ADD COLUMN IF NOT EXISTS current_school TEXT,
  ADD COLUMN IF NOT EXISTS career_status TEXT CHECK (career_status IN ('in_industry', 'seeking_opportunities', 'student', 'career_break'));

-- Add comment for career_status field
COMMENT ON COLUMN profiles.career_status IS 'User career status: in_industry (Currently working in industry), seeking_opportunities (Looking for opportunities), student (Currently a student), career_break (Taking a break)';
