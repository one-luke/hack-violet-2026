# Semantic Search Setup Guide

## Overview

This application now uses **semantic search** powered by Supabase's pgvector extension instead of NLP parsing. This provides more intelligent and context-aware search results based on the meaning of the search query rather than just keyword matching.

## Features

- **Semantic Search**: Search queries are converted to embeddings and matched against profile embeddings using cosine similarity
- **Filter Support**: Sidebar filters (industry, location, school, career status, skills) work alongside semantic search
- **Automatic Embeddings**: New and updated profiles automatically generate embeddings
- **Fallback**: Falls back to basic text search if embedding generation fails

## Setup Steps

### 1. Run the Migration

Execute the new migration to add pgvector support and the embedding column:

```bash
# In Supabase SQL Editor, run:
cat backend/migrations/006_add_semantic_search.sql
```

Or directly in your Supabase dashboard:
1. Go to SQL Editor
2. Copy and paste the contents of `backend/migrations/006_add_semantic_search.sql`
3. Click "Run"

### 2. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Generate Embeddings for Existing Profiles

After the migration is applied, you need to generate embeddings for existing profiles:

**Option A: Via API (Recommended)**

```bash
# Start your backend server
cd backend
python run.py

# In another terminal, call the endpoint (requires authentication)
curl -X POST http://localhost:5000/api/profile/embeddings/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Option B: Via Supabase Dashboard**

You can manually trigger embedding generation by calling the endpoint from your frontend after signing in, or use a tool like Postman with your JWT token.

### 4. How It Works

#### Frontend (Search.tsx)
- User enters a search query in the search box
- Sidebar filters can be applied (industry, location, school, etc.)
- Search query is sent directly to the backend (no NLP parsing)
- Results are displayed based on semantic similarity and filters

#### Backend (profile.py)
1. Receives search parameters (query + filters)
2. Applies sidebar filters first (industry, location, school, career status, skills)
3. If a search query exists:
   - Generates an embedding for the query using OpenRouter's embedding API
   - Calls Supabase's `search_profiles_semantic` function
   - Filters results to match both semantic search AND sidebar filters
   - Sorts by similarity score
4. Returns filtered and ranked results

#### Embedding Generation (embedding_service.py)
- Combines profile fields (name, bio, industry, location, school, career status, skills) into a text representation
- Sends to OpenRouter API (using `openai/text-embedding-3-small` model)
- Returns 1536-dimensional vector
- Automatically generated on profile create/update

### 5. Environment Variables

Make sure you have the following in your `.env`:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key
APP_URL=http://localhost:3000  # or your production URL
```

## Technical Details

### Embedding Model
- **Model**: `openai/text-embedding-3-small` (via OpenRouter)
- **Dimensions**: 1536
- **Distance Metric**: Cosine similarity

### Database Function
The migration creates a `search_profiles_semantic` function that:
- Takes a query embedding as input
- Returns profiles sorted by similarity score
- Includes similarity threshold (default: 0.3)
- Limits results (default: 100)

### Performance
- **Index Type**: IVFFlat with 100 lists
- **Search Time**: Sub-second for thousands of profiles
- **Accuracy**: Trade-off between speed and accuracy (adjustable via index parameters)

## Troubleshooting

### No Search Results
- Check if profiles have embeddings: `SELECT COUNT(*) FROM profiles WHERE embedding IS NOT NULL;`
- Run the embedding generation endpoint
- Verify OpenRouter API key is set correctly

### Slow Searches
- Increase the IVFFlat list count in the migration
- Reduce the match_count parameter in the search function
- Consider using HNSW index instead of IVFFlat for larger datasets

### Embedding Generation Fails
- Check OpenRouter API key
- Verify API quota/limits
- Check network connectivity
- Review backend logs for specific error messages

## Cost Considerations

- **Embedding Generation**: Small cost per API call (usually <$0.0001 per profile)
- **Search**: Free (computed in database)
- **Storage**: ~6KB per profile for embedding vector

## Comparison: NLP vs Semantic Search

### Old System (NLP Parsing)
- Parse natural language query to extract filters
- Use extracted filters for exact matching
- Simple keyword-based text search

### New System (Semantic Search)
- Convert search query to embedding vector
- Match against profile embedding vectors
- Understands context and meaning
- Works with sidebar filters for precise control

### Benefits
✅ Better understanding of context and intent
✅ Finds semantically similar content even without exact keyword matches
✅ More accurate results for complex queries
✅ Sidebar filters still work for precise filtering
✅ No need for complex NLP parsing logic
