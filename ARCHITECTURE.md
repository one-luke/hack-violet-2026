# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Women in STEM Network                          │
│                     Networking Platform Architecture                  │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                │
│                     React + Vite + Chakra UI                           │
│                        Port: 5173                                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │   SignUp/    │  │   Profile    │  │   Profile    │                │
│  │   SignIn     │  │   Create/    │  │   View/      │                │
│  │   Pages      │  │   Edit       │  │   Dashboard  │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
│                                                                         │
│  ┌──────────────────────────────────────────────────────┐             │
│  │           React Context (AuthContext)                 │             │
│  │         - User state management                       │             │
│  │         - Auth methods (signUp, signIn, signOut)     │             │
│  └──────────────────────────────────────────────────────┘             │
│                                                                         │
│  ┌──────────────────────────────────────────────────────┐             │
│  │              Supabase JS Client                       │             │
│  │         - Authentication                              │             │
│  │         - Database queries                            │             │
│  │         - Storage operations                          │             │
│  └──────────────────────────────────────────────────────┘             │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/WSS
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE SERVICES                              │
│                     (Backend-as-a-Service)                              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐          │
│  │ Authentication │  │   PostgreSQL   │  │     Storage    │          │
│  │     (JWT)      │  │    Database    │  │  (File Bucket) │          │
│  ├────────────────┤  ├────────────────┤  ├────────────────┤          │
│  │ • Email/Pass   │  │ • profiles     │  │ • resumes/     │          │
│  │ • JWT Tokens   │  │   - id         │  │   {user_id}/   │          │
│  │ • User Mgmt    │  │   - full_name  │  │   resume.pdf   │          │
│  │                │  │   - email      │  │                │          │
│  │                │  │   - location   │  │ • 5MB limit    │          │
│  │                │  │   - industry   │  │ • PDF/DOC/     │          │
│  │                │  │   - bio        │  │   DOCX only    │          │
│  │                │  │   - skills[]   │  │                │          │
│  │                │  │   - links      │  │                │          │
│  │                │  │   - resume_*   │  │                │          │
│  └────────────────┘  └────────────────┘  └────────────────┘          │
│                                                                         │
│  ┌──────────────────────────────────────────────────────┐             │
│  │         Row Level Security (RLS) Policies             │             │
│  │   • Users can only edit their own profiles           │             │
│  │   • Authenticated users can view other profiles      │             │
│  │   • Storage: User-specific folder access             │             │
│  └──────────────────────────────────────────────────────┘             │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ HTTP REST API
                                    │
┌────────────────────────────────────────────────────────────────────────┐
│                          BACKEND LAYER (Optional)                       │
│                        Flask REST API                                   │
│                          Port: 5000                                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────────────────────┐               │
│  │              API Routes                             │               │
│  │  • /api/auth/signup                                 │               │
│  │  • /api/auth/signin                                 │               │
│  │  • /api/auth/signout                                │               │
│  │  • /api/profile (GET/POST/PUT/DELETE)              │               │
│  │  • /api/profile/search                              │               │
│  └────────────────────────────────────────────────────┘               │
│                                                                         │
│  ┌────────────────────────────────────────────────────┐               │
│  │         Authentication Middleware                   │               │
│  │  • JWT token verification                           │               │
│  │  • Request user context                             │               │
│  └────────────────────────────────────────────────────┘               │
│                                                                         │
│  ┌────────────────────────────────────────────────────┐               │
│  │         Supabase Python Client                      │               │
│  │  • Server-side operations                           │               │
│  │  • Admin privileges                                 │               │
│  └────────────────────────────────────────────────────┘               │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                        DATA FLOW EXAMPLES
═══════════════════════════════════════════════════════════════════════

1. USER SIGNUP
   ┌─────────┐     ┌──────────┐     ┌──────────────┐
   │ Browser │────>│ Frontend │────>│   Supabase   │
   │         │     │  React   │     │     Auth     │
   │         │     │          │     │              │
   │         │<────│          │<────│ (JWT Token)  │
   └─────────┘     └──────────┘     └──────────────┘
        │
        └──> Store token in browser

2. CREATE PROFILE
   ┌─────────┐     ┌──────────┐     ┌──────────────┐
   │ Browser │────>│ Frontend │────>│   Supabase   │
   │         │     │          │     │   Storage    │
   │  Form   │     │  Upload  │     │ (Resume PDF) │
   │  Submit │     │  Resume  │     │              │
   │         │     │          │<────│ File URL     │
   │         │     │          │     └──────────────┘
   │         │     │          │            │
   │         │     │          │            ▼
   │         │     │          │     ┌──────────────┐
   │         │     │          │────>│   Supabase   │
   │         │     │          │     │   Database   │
   │         │     │          │     │ (Profile +   │
   │         │<────│          │<────│  File URL)   │
   └─────────┘     └──────────┘     └──────────────┘

3. VIEW PROFILE
   ┌─────────┐     ┌──────────┐     ┌──────────────┐
   │ Browser │────>│ Frontend │────>│   Supabase   │
   │         │     │          │     │   Database   │
   │         │     │          │<────│ Profile Data │
   │         │     │          │     └──────────────┘
   │         │     │          │            │
   │         │     │          │            ▼
   │         │     │          │     ┌──────────────┐
   │         │     │          │────>│   Supabase   │
   │         │     │          │     │   Storage    │
   │ Display │<────│  Render  │<────│ Resume URL   │
   └─────────┘     └──────────┘     └──────────────┘


═══════════════════════════════════════════════════════════════════════
                        SECURITY LAYERS
═══════════════════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────────────────┐
│ Layer 1: Frontend Validation                                    │
│ • Form validation (React Hook Form + Zod)                      │
│ • File type and size checks                                     │
│ • Input sanitization                                            │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ Layer 2: JWT Authentication                                     │
│ • Token required for all authenticated routes                  │
│ • Token validation on every request                            │
│ • Automatic token refresh                                       │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ Layer 3: Row Level Security (RLS)                              │
│ • Database-level access control                                │
│ • Users can only modify their own data                         │
│ • Queries automatically filtered by user ID                    │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│ Layer 4: Storage Policies                                       │
│ • User-specific folder access                                  │
│ • File type restrictions                                        │
│ • Size limitations (5MB)                                        │
└────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                    TECHNOLOGY CHOICES RATIONALE
═══════════════════════════════════════════════════════════════════════

React + Vite
  ✓ Fast development with Hot Module Replacement
  ✓ Modern build tooling
  ✓ Large ecosystem and community

Chakra UI
  ✓ Accessible components out of the box
  ✓ Consistent design system
  ✓ Easy theming and customization
  ✓ Responsive props built-in

Supabase
  ✓ PostgreSQL (powerful and scalable)
  ✓ Built-in authentication
  ✓ File storage included
  ✓ Real-time capabilities for future features
  ✓ Row Level Security for data protection
  ✓ Free tier for development

Flask (Optional Backend)
  ✓ Lightweight and flexible
  ✓ Great for REST APIs
  ✓ Python ecosystem
  ✓ Easy to extend

Note: Most functionality works directly from frontend to Supabase,
      backend is optional for additional business logic.
