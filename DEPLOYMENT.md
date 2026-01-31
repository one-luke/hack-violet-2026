# 🚀 Production Deployment Guide

This guide covers deploying your Women in STEM Network platform to production.

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Supabase project set up correctly
- [ ] Database migrations run
- [ ] Storage bucket configured
- [ ] Environment variables documented
- [ ] Git repository ready
- [ ] Domain name purchased (optional)

## 🌐 Recommended Deployment Stack

### Frontend: Vercel (Free Tier Available)
- Zero configuration for Vite/React
- Automatic HTTPS
- Global CDN
- Preview deployments for PRs

### Backend: Railway / Render (Free Tier Available)
- Easy Python/Flask deployment
- Automatic HTTPS
- Environment variable management
- Auto-deploy from Git

### Database & Auth: Supabase (Free Tier)
- Already set up ✅
- No additional deployment needed
- Production-ready infrastructure

## 🎯 Deployment Options

### Option 1: Frontend-Only Deployment (Recommended for MVP)

Since most operations go directly from frontend to Supabase, you can deploy just the frontend:

**Pros:**
- Simpler deployment
- Lower costs (free)
- Fewer moving parts
- Easier maintenance

**Cons:**
- Limited server-side logic
- All API calls from client

### Option 2: Full Stack Deployment

Deploy both frontend and backend for maximum flexibility.

---

## 📦 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Update Environment Variables**
   ```bash
   cd frontend
   # Create production .env
   ```

   Your production `.env` should have:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_production_anon_key
   VITE_API_URL=https://your-backend.railway.app  # If using backend
   ```

2. **Test Production Build Locally**
   ```bash
   npm run build
   npm run preview
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub** (Recommended)
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   
3. **Add Environment Variables in Vercel**
   - Project Settings → Environment Variables
   - Add all `VITE_*` variables
   - Deploy!

4. **Custom Domain** (Optional)
   - Project Settings → Domains
   - Add your domain
   - Update DNS records as instructed

### Vercel Configuration File (Optional)

Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🔧 Backend Deployment (Railway)

### Step 1: Prepare Backend

1. **Create `Procfile`** (if using Heroku-style deployment)
   ```bash
   cd backend
   echo "web: python run.py" > Procfile
   ```

2. **Update CORS Origins**
   In your `.env`:
   ```env
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```

3. **Create `railway.json`** (optional)
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "python run.py",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

### Step 2: Deploy to Railway

1. **Sign up at** [railway.app](https://railway.app)

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Set root directory to `backend`

3. **Configure Environment Variables**
   - Add all variables from `.env`:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_KEY`
     - `FLASK_SECRET_KEY`
     - `FLASK_ENV=production`
     - `CORS_ORIGINS=https://your-frontend.vercel.app`

4. **Set Python Version** (if needed)
   - Settings → Environment → Add variable
   - `PYTHON_VERSION=3.9.18`

5. **Deploy!**
   - Railway will auto-build and deploy
   - Note your deployment URL

### Alternative: Render.com

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python run.py`
5. Add environment variables
6. Deploy!

---

## 🔒 Production Security Checklist

### Supabase

- [ ] Enable email verification
- [ ] Set up custom SMTP (optional)
- [ ] Review RLS policies
- [ ] Enable 2FA for your Supabase account
- [ ] Set up database backups
- [ ] Review storage bucket policies
- [ ] Enable SSL/TLS enforcement

### Frontend

- [ ] Remove console.logs
- [ ] Enable production mode
- [ ] Set up error tracking (Sentry)
- [ ] Configure CSP headers
- [ ] Enable HTTPS only
- [ ] Add security headers
- [ ] Set up monitoring (Vercel Analytics)

### Backend

- [ ] Use strong `FLASK_SECRET_KEY` (generate with `python -c "import secrets; print(secrets.token_hex(32))"`)
- [ ] Set `FLASK_ENV=production`
- [ ] Enable HTTPS only
- [ ] Add rate limiting
- [ ] Set up logging
- [ ] Configure CORS properly
- [ ] Use environment variables (never hardcode)
- [ ] Set up error monitoring

### General

- [ ] Use strong passwords for all accounts
- [ ] Enable 2FA where available
- [ ] Regular security updates
- [ ] Monitor for unusual activity
- [ ] Set up alerts for errors
- [ ] Regular backups

---

## 📊 Post-Deployment

### Update Frontend Environment

After backend is deployed, update frontend `.env`:
```env
VITE_API_URL=https://your-backend.railway.app
```

Redeploy frontend on Vercel.

### Test Everything

- [ ] Sign up new user
- [ ] Verify email works
- [ ] Create profile
- [ ] Upload resume
- [ ] Edit profile
- [ ] Download resume
- [ ] Sign out/in
- [ ] Test on mobile
- [ ] Test on different browsers

### Set Up Monitoring

1. **Vercel Analytics**
   - Automatic with deployment
   - View in Vercel dashboard

2. **Sentry (Error Tracking)**
   ```bash
   npm install @sentry/react
   ```
   
   Initialize in `frontend/src/main.jsx`:
   ```javascript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: "production",
   });
   ```

3. **Supabase Monitoring**
   - Database usage
   - Storage usage
   - Auth activity
   - Available in Supabase dashboard

### Configure Domain (Optional)

1. **Buy domain** (Namecheap, Google Domains, etc.)

2. **Set up DNS** (example for Vercel):
   ```
   Type    Name    Value
   CNAME   www     cname.vercel-dns.com
   A       @       76.76.21.21
   ```

3. **Update CORS** in backend:
   ```env
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

4. **SSL Certificate**: Automatic with Vercel!

---

## 🔄 CI/CD Setup

### Automatic Deployments

**Vercel:**
- Automatically deploys on push to `main`
- Preview deployments for PRs

**Railway:**
- Automatically deploys on push to `main`
- Configure in Railway settings

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm ci && npm run build
      
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - run: cd backend && pip install -r requirements.txt
```

---

## 💰 Cost Estimates

### Free Tier (Sufficient for MVP)
- **Vercel**: Free (hobby plan)
- **Railway**: $5 credit/month (free starter)
- **Supabase**: Free tier (500MB database, 1GB storage)
- **Domain**: ~$12/year (optional)

**Total: $0-5/month** (plus optional domain)

### Scaling Up
- **Vercel Pro**: $20/month (for team features)
- **Railway**: Pay-as-you-go (~$5-20/month)
- **Supabase Pro**: $25/month (8GB database, 100GB storage)

**Total: ~$50-65/month** for professional use

---

## 🐛 Troubleshooting Production Issues

### Frontend not loading
- Check Vercel deployment logs
- Verify environment variables
- Check browser console for errors
- Verify build succeeded

### Backend not responding
- Check Railway/Render logs
- Verify environment variables
- Test API endpoints directly
- Check CORS configuration

### Supabase connection issues
- Verify API keys are production keys
- Check Supabase project status
- Review RLS policies
- Check database connection limits

### Resume upload fails
- Verify storage bucket exists
- Check bucket policies
- Verify file size limits
- Review CORS configuration

---

## 📈 Performance Optimization

### Frontend
- Enable Vercel Analytics
- Use lazy loading for routes
- Optimize images
- Enable compression
- Use CDN (automatic with Vercel)

### Backend
- Add Redis caching (if needed)
- Database connection pooling
- Optimize queries
- Add rate limiting

### Supabase
- Use database indexes
- Optimize RLS policies
- Enable replication (paid plans)
- Monitor query performance

---

## 🎉 You're Live!

Once deployed, share your platform:
- Social media announcement
- Submit to Hack Violet
- Share with STEM communities
- Gather user feedback
- Iterate and improve

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Flask Docs**: https://flask.palletsprojects.com

---

**🚀 Good luck with your launch!**
