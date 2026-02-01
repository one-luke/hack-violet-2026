# OpenRouter Setup (Optional)

The app includes AI-powered natural language search parsing using OpenRouter. This feature is **optional** - the app works without it using basic text matching.

## What it does

Without OpenRouter:
- User searches: "people in Seattle"
- You manually select filters

With OpenRouter:
- User searches: "software engineers in Seattle who went to MIT"
- AI automatically extracts: industry=Software Engineering, location=Seattle, school=MIT

## Getting an API Key

1. Visit https://openrouter.ai/
2. Sign up or log in
3. Go to **Keys** section
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-`)

## Adding to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

**Recommended models:**
- `openai/gpt-4o-mini` - Best balance of cost/performance ($0.15/1M tokens)
- `openai/gpt-oss-20b:free` - Free tier (default fallback)
- `anthropic/claude-3.5-sonnet` - Highest quality ($3/1M tokens)

## Cost Estimates

Natural language parsing uses ~200-300 tokens per search query:

- **Free tier**: Unlimited with `openai/gpt-oss-20b:free`
- **gpt-4o-mini**: ~$0.00005 per search (20,000 searches = $1)
- **claude-3.5-sonnet**: ~$0.0009 per search (1,100 searches = $1)

## Testing

After adding the environment variable:

1. Deploy or redeploy your Vercel app
2. Go to the Search page
3. Type: "data scientists in Boston who went to Harvard"
4. The filters should auto-populate

If it doesn't work, check:
- Environment variable is set in Vercel
- Variable name is exactly `OPENROUTER_API_KEY`
- You've redeployed after adding the variable

## Troubleshooting

**"Failed to parse search query"**
- Check if OPENROUTER_API_KEY is set correctly
- Verify you have credits on OpenRouter
- Try a different model

**"Worker threw exception"**
- This error is now fixed - the app will fallback to basic search if OpenRouter fails
- If persists, check Vercel function logs

## Without OpenRouter

The app works fine without OpenRouter! Users just need to:
1. Type their search query
2. Manually select filters (Industry, Location, etc.)
3. Click Search

The AI parsing just makes it more convenient by auto-filling filters.
