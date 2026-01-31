-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  location TEXT NOT NULL,
  industry TEXT NOT NULL,
  bio TEXT NOT NULL,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  skills TEXT[] DEFAULT '{}',
  resume_filename TEXT,
  resume_filepath TEXT,
  resume_uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Allow authenticated users to view other profiles (for networking)
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX idx_profiles_industry ON profiles(industry);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket policies (run these in Supabase Dashboard > Storage)
-- 
-- 1. Create a bucket named 'resumes' with the following settings:
--    - Public: false
--    - File size limit: 5MB
--    - Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
--
-- 2. Add the following policies for the 'resumes' bucket:

-- Policy: Users can upload to their own folder
-- CREATE POLICY "Users can upload their own resumes"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'resumes' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Users can update their own resumes
-- CREATE POLICY "Users can update their own resumes"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'resumes' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Users can delete their own resumes
-- CREATE POLICY "Users can delete their own resumes"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'resumes' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Authenticated users can view resumes (for networking)
-- CREATE POLICY "Authenticated users can view resumes"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'resumes' AND
--   auth.role() = 'authenticated'
-- );
