# Women in STEM Network - Project Documentation

## 🎯 Project Overview

A networking platform designed to connect women in male-dominated fields, particularly in STEM (Science, Technology, Engineering, and Manufacturing). The platform focuses on building meaningful professional connections through detailed profiles and resume sharing.

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with Vite
- **UI Library**: Chakra UI v2
- **State Management**: React Context API
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod validation
- **File Upload**: React Dropzone
- **HTTP Client**: Supabase JS Client

### Backend
- **Framework**: Flask 3.0
- **Authentication**: Supabase Auth with JWT
- **Database**: PostgreSQL (via Supabase)
- **File Storage**: Supabase Storage
- **CORS**: Flask-CORS

### Database & Services
- **Supabase**: Authentication, PostgreSQL database, File storage
- **Row Level Security (RLS)**: Enforced at database level
- **Real-time**: Available for future features

## 📁 Project Structure

```
hack-violet-2026/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ResumeUpload.jsx
│   │   ├── context/            # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── lib/                # Utilities
│   │   │   └── supabase.js
│   │   ├── pages/              # Page components
│   │   │   ├── SignUp.jsx
│   │   │   ├── SignIn.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateProfile.jsx
│   │   │   ├── EditProfile.jsx
│   │   │   └── ViewProfile.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── theme.js            # Chakra UI theme
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.local              # Environment variables
│
├── backend/                     # Flask application
│   ├── app/
│   │   ├── routes/             # API endpoints
│   │   │   ├── auth.py
│   │   │   └── profile.py
│   │   ├── middleware/         # Middleware
│   │   │   └── auth.py
│   │   ├── __init__.py         # App factory
│   │   └── supabase_client.py  # Supabase client
│   ├── migrations/             # Database migrations
│   │   └── 001_initial_schema.sql
│   ├── requirements.txt
│   ├── run.py
│   └── .env                    # Environment variables
│
├── .gitignore
├── README.md
├── SUPABASE_SETUP.md
└── start.sh                     # Quick start script
```

## 🔐 Authentication Flow

1. User signs up with email/password
2. Supabase creates user account and sends verification email
3. JWT token is stored in browser (managed by Supabase client)
4. Token is sent with each API request via Authorization header
5. Backend validates token using Supabase admin client
6. User can access protected routes and resources

## 📊 Database Schema

### Profiles Table
```sql
- id (UUID, references auth.users)
- email (TEXT, unique)
- full_name (TEXT)
- phone (TEXT, nullable)
- location (TEXT)
- industry (TEXT)
- bio (TEXT)
- linkedin_url (TEXT, nullable)
- github_url (TEXT, nullable)
- portfolio_url (TEXT, nullable)
- skills (TEXT[], array)
- resume_filename (TEXT, nullable)
- resume_filepath (TEXT, nullable)
- resume_uploaded_at (TIMESTAMPTZ, nullable)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### Storage Buckets
- **resumes**: Private bucket for resume files
  - Structure: `{user_id}/{filename}`
  - Max size: 5MB
  - Allowed types: PDF, DOC, DOCX

## 🎨 Design System

### Colors
- **Primary**: Purple (`purple.500`)
- **Background**: Gray 50
- **Text**: Gray 800
- **Accent**: Purple gradient

### Components
- Custom purple theme for buttons and links
- Consistent spacing using Chakra's spacing scale
- Responsive design with breakpoints (base, md, lg)
- Accessible form controls with validation

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user
- `GET /api/auth/user` - Get current user

### Profile Management
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create profile
- `PUT /api/profile` - Update profile
- `DELETE /api/profile` - Delete profile
- `GET /api/profile/search` - Search profiles

## 🚀 Features Implemented

### ✅ Core Features
1. **User Authentication**
   - Email/password signup and login
   - JWT-based session management
   - Protected routes and API endpoints

2. **Profile Management**
   - Multi-step profile creation form
   - Profile editing with pre-filled data
   - Profile viewing with formatted display
   - Field validation with helpful error messages

3. **Resume Upload**
   - Drag-and-drop file upload
   - File type and size validation
   - Progress indicators
   - Direct upload to Supabase Storage
   - Resume download functionality

4. **Professional Information**
   - Industry/field selection (STEM-focused)
   - Skills and interests (tags)
   - Bio and professional summary
   - Social links (LinkedIn, GitHub, Portfolio)
   - Location information

### 🎨 UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Loading states and skeletons
- Toast notifications for feedback
- Form validation with inline errors
- Polished animations and transitions
- Accessible components

## 🔮 Future Features (Planned)

1. **Networking**
   - Browse and search profiles
   - Connection requests
   - Network management

2. **Messaging**
   - Direct messaging between connections
   - Group conversations
   - Real-time notifications

3. **Events**
   - Create and manage events
   - RSVP functionality
   - Calendar integration

4. **Mentorship**
   - Mentor/mentee matching
   - Mentorship programs
   - Progress tracking

5. **Resources**
   - Share articles and resources
   - Discussion forums
   - Job board

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase account

### Quick Start

1. **Clone and navigate to project**
   ```bash
   cd /Users/redraccoon/Documents/Github/hack-violet-2026
   ```

2. **Set up Supabase**
   - Follow instructions in `SUPABASE_SETUP.md`
   - Run database migrations
   - Create storage bucket
   - Copy API keys

3. **Configure environment variables**
   ```bash
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   # Edit both files with your Supabase credentials
   ```

4. **Start the application**
   ```bash
   ./start.sh
   ```

### Manual Start

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

### Frontend Testing
- Create a new user account
- Complete profile creation with all fields
- Upload a resume
- Edit profile and verify changes
- Download resume

### Backend Testing
- Test API endpoints with curl or Postman
- Verify JWT authentication
- Check database records in Supabase dashboard
- Confirm file uploads in storage bucket

## 🔒 Security Considerations

1. **Authentication**
   - JWT tokens with expiration
   - Secure token storage (httpOnly cookies in production)
   - Password hashing by Supabase

2. **Authorization**
   - Row Level Security (RLS) on all tables
   - User can only access their own data
   - Storage bucket policies restrict file access

3. **Input Validation**
   - Frontend: React Hook Form + Zod
   - Backend: Flask request validation
   - File type and size restrictions

4. **API Security**
   - CORS configuration
   - Rate limiting (recommended for production)
   - Environment variable protection

## 📝 Environment Variables

### Frontend (.env.local)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
FLASK_SECRET_KEY=your_secret_key
FLASK_ENV=development
CORS_ORIGINS=http://localhost:5173
```

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Supabase Connection Error
- Verify credentials in .env files
- Check Supabase project status
- Ensure database migrations are run
- Confirm storage bucket is created

### Resume Upload Fails
- Check file size (max 5MB)
- Verify file type (PDF, DOC, DOCX)
- Confirm storage bucket policies
- Check browser console for errors

## 📚 Technologies Used

### Frontend
- React 18.2
- Chakra UI 2.8
- React Router 6.21
- React Hook Form 7.49
- Zod 3.22
- React Dropzone 14.2
- Supabase JS 2.39
- Vite 5.0

### Backend
- Flask 3.0
- Flask-CORS 4.0
- Supabase Python 2.3
- Python-dotenv 1.0
- PyJWT 2.8

## 👥 Contributing

Future contributions welcome for:
- Bug fixes
- Feature enhancements
- UI/UX improvements
- Documentation updates
- Testing coverage

## 📄 License

This project is created for Hack Violet 2026.

## 🙏 Acknowledgments

Built to empower women in STEM and male-dominated fields to connect, collaborate, and support each other's professional growth.
