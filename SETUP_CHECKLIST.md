# 🚀 Setup Checklist

Complete these steps to get your platform running:

## ✅ Prerequisites

- [ ] Node.js 18+ installed
- [ ] Python 3.9+ installed
- [ ] Supabase account created

## 🗄️ Supabase Setup

### 1. Create Project
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Click "New Project"
- [ ] Choose organization and set project name
- [ ] Set database password (save this!)
- [ ] Wait for project to be created

### 2. Database Setup
- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy contents of `backend/migrations/001_initial_schema.sql`
- [ ] Paste and run the SQL
- [ ] Verify `profiles` table exists in Table Editor

### 3. Storage Setup
- [ ] Go to Storage section
- [ ] Click "Create a new bucket"
- [ ] Name it `resumes`
- [ ] Make it **private** (uncheck Public)
- [ ] Click on the bucket → Policies tab
- [ ] Add the 4 policies from `SUPABASE_SETUP.md`:
  - [ ] Upload policy
  - [ ] Update policy
  - [ ] Delete policy
  - [ ] View policy

### 4. Authentication Setup
- [ ] Go to Authentication → Providers
- [ ] Verify Email provider is enabled
- [ ] (Optional) Customize email templates

### 5. Get API Keys
- [ ] Go to Settings → API
- [ ] Copy **Project URL**
- [ ] Copy **anon public** key
- [ ] Copy **service_role** key (keep secret!)

## 🔧 Local Setup

### Frontend
- [ ] Navigate to `frontend/` directory
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add your Supabase URL to `VITE_SUPABASE_URL`
- [ ] Add your anon key to `VITE_SUPABASE_ANON_KEY`
- [ ] Dependencies already installed ✅

### Backend
- [ ] Navigate to `backend/` directory
- [ ] Copy `.env.example` to `.env`
- [ ] Add your Supabase URL to `SUPABASE_URL`
- [ ] Add your service role key to `SUPABASE_SERVICE_KEY`
- [ ] Generate a random secret for `FLASK_SECRET_KEY`
- [ ] Create virtual environment: `python3 -m venv venv`
- [ ] Activate: `source venv/bin/activate` (Mac/Linux)
- [ ] Install: `pip install -r requirements.txt`

## 🏃 Run the Application

### Option 1: Quick Start (Recommended)
```bash
./start.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## ✅ Verify Everything Works

- [ ] Frontend opens at http://localhost:5173
- [ ] Backend responds at http://localhost:5000/health
- [ ] Click "Sign Up" and create an account
- [ ] Check email for verification (may be in spam)
- [ ] Create a profile with all fields
- [ ] Upload a test resume (PDF)
- [ ] Verify profile appears in Supabase Dashboard → Table Editor
- [ ] Verify resume appears in Supabase Dashboard → Storage
- [ ] Edit profile and verify changes save
- [ ] Download resume and verify it works
- [ ] Sign out and sign back in

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- [ ] Check .env files have correct credentials
- [ ] Verify Supabase project is active
- [ ] Check for typos in URLs/keys

### "Profile not found"
- [ ] Verify database migrations ran successfully
- [ ] Check RLS policies are created
- [ ] Try creating profile through UI

### "Resume upload fails"
- [ ] Verify storage bucket named exactly `resumes`
- [ ] Check bucket is private
- [ ] Verify all 4 storage policies are added
- [ ] Check file is under 5MB and is PDF/DOC/DOCX

### "Port already in use"
```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9  # backend
lsof -ti:5173 | xargs kill -9  # frontend
```

## 📚 Next Steps

After setup is complete:

- [ ] Read `PROJECT_DOCS.md` for architecture overview
- [ ] Review `USER_FLOW.md` to understand user journey
- [ ] Test all features thoroughly
- [ ] Customize theme in `frontend/src/theme.js`
- [ ] Add your branding/logo
- [ ] Deploy to production (Vercel + Railway/Heroku)

## 🎉 You're Ready!

Once all checkboxes are complete, your Women in STEM Network platform is fully operational!

## 📞 Need Help?

- Check the documentation files
- Review Supabase logs in dashboard
- Check browser console for frontend errors
- Check terminal for backend errors

---

**Remember:** Never commit `.env` or `.env.local` files to git!
