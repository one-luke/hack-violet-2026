# Vercel Deployment Guide

This guide will help you deploy the Aurelia application to Vercel with both the React frontend and Flask backend.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed (optional, for local testing)
3. Environment variables from your Supabase project

## Project Structure for Vercel

```
hack-violet-2026/
├── api/                    # Backend serverless functions
│   └── index.py           # Flask app entry point
├── frontend/              # React application
│   ├── dist/             # Build output (generated)
│   └── src/
├── backend/              # Original Flask app code
│   ├── app/
│   └── requirements.txt
├── vercel.json           # Vercel configuration
├── requirements.txt      # Root Python dependencies (for Vercel)
└── .vercelignore        # Files to exclude from deployment
```

## Configuration Files Created

### 1. vercel.json
- Defines build configuration for both frontend and backend
- Routes API requests to `/api/*` to the Flask backend
- Routes all other requests to the React frontend

### 2. api/index.py
- Entry point for serverless Flask backend
- Imports and configures the Flask app from `backend/app/`

### 3. requirements.txt (root)
- Python dependencies for the serverless functions
- Copy of backend/requirements.txt

### 4. .vercelignore
- Excludes development files, caches, and environment files

## Environment Variables

You'll need to set these in the Vercel dashboard:

### Required Environment Variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key
- `FLASK_SECRET_KEY` - A secure random string for Flask sessions
- `JWT_SECRET_KEY` - Secret key for JWT token generation

### Setting Environment Variables in Vercel:
1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add each variable for all environments (Production, Preview, Development)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **Import Project in Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables:**
   - In the import screen, add all required environment variables
   - Or add them later in Project Settings → Environment Variables

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

## Important Notes

### Frontend Considerations:
- The React app will be built and served as static files
- API calls should use relative paths like `/api/profile` instead of `http://localhost:5001/api/profile`
- Update your frontend code to use environment variables for the API base URL

### Backend Considerations:
- Flask runs as serverless functions on Vercel
- Each API request starts a new function instance
- Cold starts may occur (first request might be slower)
- Database connections should be handled efficiently (connection pooling)

### CORS Configuration:
- The Flask app already has CORS configured
- In production, consider restricting origins to your Vercel domain

## Updating API Base URL in Frontend

You may need to update your frontend code to use the correct API base URL. Here's an example:

```typescript
// In frontend/src/lib/api.ts or similar
const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // Production: use relative path
  : 'http://localhost:5001/api';  // Development: use local backend

export const apiClient = {
  get: (endpoint: string) => fetch(`${API_BASE_URL}${endpoint}`),
  // ... other methods
};
```

## Testing Your Deployment

1. **Check the Build Logs:**
   - View the deployment logs in Vercel dashboard
   - Look for any build errors

2. **Test the Frontend:**
   - Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
   - Check that the React app loads correctly

3. **Test the Backend:**
   - Visit `https://your-project.vercel.app/api/health`
   - Should return `{"status": "healthy"}`

4. **Test Full Flow:**
   - Try signing up, logging in, and using the app features
   - Check browser console for any API errors

## Troubleshooting

### Build Fails:
- Check that all dependencies are in package.json
- Verify Node.js and Python versions are compatible
- Review build logs for specific errors

### API Routes Not Working:
- Ensure `/api` prefix is used in all backend routes
- Check that `api/index.py` correctly imports the Flask app
- Verify environment variables are set

### Frontend Can't Connect to Backend:
- Update API calls to use relative paths (`/api/...`)
- Check CORS configuration in Flask app
- Verify routes in `vercel.json` are correct

### Cold Starts:
- First request to an API after inactivity may be slow
- Consider using Vercel Pro for better performance
- Implement proper connection pooling for database

## Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- Deploy on every push to `main` branch (production)
- Create preview deployments for pull requests
- Run builds and show deployment status in GitHub

## Custom Domain (Optional)

1. Go to Project Settings → Domains in Vercel
2. Add your custom domain
3. Configure DNS records as instructed
4. Vercel automatically provisions SSL certificates

## Monitoring and Logs

- **View Logs:** Project → Deployments → Click deployment → View Function Logs
- **Analytics:** Available in the Vercel dashboard
- **Error Tracking:** Consider integrating Sentry or similar services

## Performance Optimization

1. **Frontend:**
   - Vite already does code splitting
   - Images are optimized during build
   - Consider lazy loading routes

2. **Backend:**
   - Minimize cold start time by keeping dependencies lean
   - Use connection pooling for database
   - Cache frequently accessed data

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- Flask on Vercel: https://vercel.com/docs/frameworks/flask

## Next Steps

After deployment:
1. ✅ Test all features thoroughly
2. ✅ Set up custom domain (if applicable)
3. ✅ Configure production environment variables
4. ✅ Enable analytics and monitoring
5. ✅ Set up error tracking
6. ✅ Update your README with the live URL
