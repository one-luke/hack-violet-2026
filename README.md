# Women in STEM Networking Platform 🚀

A platform connecting women in male-dominated fields such as STEM and Manufacturing.

## 🎯 Overview

Built for **Hack Violet 2026**, this platform empowers women in STEM to create professional profiles, share resumes, and build meaningful connections in their fields.

## ✨ Tech Stack

- **Frontend**: React 18 + Vite + Chakra UI
- **Backend**: Flask 3.0 (Python)
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage)

## 🎨 Features

### ✅ Implemented
- 🔐 User authentication (email/password signup & login)
- 👤 Comprehensive profile creation and management
- 📄 Resume upload and storage (PDF, DOC, DOCX)
- 🏭 Industry-specific fields (STEM-focused)
- 🏷️ Skills and interests tagging
- 🔗 Social links (LinkedIn, GitHub, Portfolio)
- 📱 Fully responsive design
- ✨ Polished UI with loading states and animations

### 🔮 Coming Soon
- 💬 Messaging system between connections
- 📅 Event creation and management
- 🤝 Mentorship matching
- 📚 Resource sharing
- 🔍 Advanced profile search

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Supabase account (free tier works!)

### One-Command Start
```bash
./start.sh
```

This script will:
- Set up Python virtual environment
- Install backend dependencies
- Start Flask backend (port 5000)
- Start React frontend (port 5173)

### First Time Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a project
   - Follow the detailed guide in [`SETUP_CHECKLIST.md`](SETUP_CHECKLIST.md)

2. **Configure Environment Variables**
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env.local
   # Edit frontend/.env.local with your Supabase credentials
   
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your Supabase service key
   ```

3. **Run Database Migrations**
   - Open Supabase Dashboard → SQL Editor
   - Run the SQL in `backend/migrations/001_initial_schema.sql`

4. **Create Storage Bucket**
   - Supabase Dashboard → Storage → Create bucket named `resumes`
   - Follow storage setup in [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)

5. **Start the Application**
   ```bash
   ./start.sh
   ```

6. **Visit** http://localhost:5173 and create your account!

## 📚 Documentation

- **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Step-by-step setup guide
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Detailed Supabase configuration
- **[PROJECT_DOCS.md](PROJECT_DOCS.md)** - Architecture and technical details
- **[USER_FLOW.md](USER_FLOW.md)** - User journey and UI components

## 🏗️ Project Structure

```
hack-violet-2026/
├── frontend/          # React + Chakra UI application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React Context (Auth)
│   │   ├── pages/       # Page components
│   │   └── lib/         # Supabase client
│   └── package.json
├── backend/           # Flask REST API
│   ├── app/
│   │   ├── routes/      # API endpoints
│   │   └── middleware/  # Auth middleware
│   ├── migrations/      # Database schema
│   └── requirements.txt
└── start.sh          # Quick start script
```

## 🎨 Screenshots & Features

### Authentication
- Clean signup/login forms with validation
- Password visibility toggle
- Email verification support

### Profile Creation
- Multi-step form with progress indicator
- Industry selection (STEM fields)
- Skill tagging system
- Drag-and-drop resume upload

### Profile Management
- View complete profile with formatted sections
- Edit any information easily
- Download resume functionality
- Social links integration

## 🧪 Testing the Application

1. **Create an Account**
   - Navigate to http://localhost:5173
   - Click "Sign Up"
   - Fill in your information

2. **Create Your Profile**
   - Complete the 3-step profile form
   - Add skills and interests
   - Upload your resume (optional)

3. **Explore Features**
   - View your profile
   - Edit your information
   - Download your resume
   - Sign out and sign back in

## 🐛 Troubleshooting

**"Cannot connect to Supabase"**
- Verify `.env` files have correct credentials
- Check Supabase project is active

**"Resume upload fails"**
- Ensure storage bucket is named exactly `resumes`
- Verify bucket policies are configured
- Check file is under 5MB

**Port already in use**
```bash
lsof -ti:5000 | xargs kill -9  # Kill backend
lsof -ti:5173 | xargs kill -9  # Kill frontend
```

See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for more troubleshooting tips.

## 🤝 Contributing

This project was built for Hack Violet 2026. Future contributions are welcome!

## 📄 License

Created for educational purposes as part of Hack Violet 2026.

## 🙏 Acknowledgments

Built to empower women in STEM and male-dominated industries to connect, collaborate, and support each other's professional growth.

---

**Made with 💜 for Women in STEM**
