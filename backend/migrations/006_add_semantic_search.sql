-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to profiles table
-- Using 1536 dimensions for OpenAI text-embedding-3-small or similar models
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create an index for faster similarity search using cosine distance
CREATE INDEX IF NOT EXISTS profiles_embedding_idx ON profiles 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add a function to search profiles by semantic similarity
CREATE OR REPLACE FUNCTION search_profiles_semantic(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  bio text,
  location text,
  industry text,
  custom_industry text,
  current_school text,
  career_status text,
  skills text[],
  profile_picture_url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    profiles.id,
    profiles.full_name,
    profiles.email,
    profiles.bio,
    profiles.location,
    profiles.industry,
    profiles.custom_industry,
    profiles.current_school,
    profiles.career_status,
    profiles.skills,
    profiles.profile_picture_url,
    1 - (profiles.embedding <=> query_embedding) as similarity
  FROM profiles
  WHERE profiles.embedding IS NOT NULL
    AND 1 - (profiles.embedding <=> query_embedding) > match_threshold
  ORDER BY profiles.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add updated_at trigger for when embeddings are updated
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_embedding_updated_at
    BEFORE UPDATE OF embedding ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_updated_at();
