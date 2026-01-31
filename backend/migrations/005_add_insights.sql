-- Create insights table
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link_url TEXT,
    link_title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insight_likes table
CREATE TABLE IF NOT EXISTS insight_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insight_id UUID NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(insight_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_insights_user_id ON insights(user_id);
CREATE INDEX idx_insights_created_at ON insights(created_at DESC);
CREATE INDEX idx_insight_likes_insight_id ON insight_likes(insight_id);
CREATE INDEX idx_insight_likes_user_id ON insight_likes(user_id);

-- Enable RLS
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_likes ENABLE ROW LEVEL SECURITY;

-- Policies for insights table
CREATE POLICY "Anyone can view insights"
    ON insights FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own insights"
    ON insights FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
    ON insights FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights"
    ON insights FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for insight_likes table
CREATE POLICY "Anyone can view insight likes"
    ON insight_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can like insights"
    ON insight_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike insights"
    ON insight_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER insights_updated_at
    BEFORE UPDATE ON insights
    FOR EACH ROW
    EXECUTE FUNCTION update_insights_updated_at();
