-- Add embedding column to insights table
ALTER TABLE insights ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for faster similarity searches
CREATE INDEX IF NOT EXISTS insights_embedding_idx ON insights 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function to search insights semantically
CREATE OR REPLACE FUNCTION search_insights_semantic(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  content text,
  link_url text,
  link_title text,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    insights.id,
    insights.user_id,
    insights.title,
    insights.content,
    insights.link_url,
    insights.link_title,
    insights.created_at,
    insights.updated_at,
    1 - (insights.embedding <=> query_embedding) as similarity
  FROM insights
  WHERE insights.embedding IS NOT NULL
    AND 1 - (insights.embedding <=> query_embedding) > match_threshold
  ORDER BY insights.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
