# Application User Flow

## 🎯 User Journey

### 1. New User Experience

```
Landing → Sign Up → Email Verification → Create Profile (3 steps) → Dashboard
```

#### Step-by-Step:
1. **Visit Application** (`/`)
   - Redirects to `/dashboard`
   - Not authenticated → redirects to `/signin`

2. **Sign Up** (`/signup`)
   - Enter: Full Name, Email, Password
   - Validation: Email format, password min 6 chars
   - On success: User created in Supabase Auth
   - Auto-redirect to `/profile/create`

3. **Create Profile** (`/profile/create`)
   - **Step 1: Basic Info**
     - Full name (pre-filled from signup)
     - Phone number (optional)
     - Location (required)
   
   - **Step 2: Professional Info**
     - Industry/Field (dropdown, STEM-focused)
     - Bio (min 50 characters)
     - Skills & interests (tags)
     - Social links (LinkedIn, GitHub, Portfolio - all optional)
   
   - **Step 3: Resume Upload**
     - Drag & drop or click to upload
     - Accepts: PDF, DOC, DOCX
     - Max size: 5MB
     - Optional but recommended

   - On submit:
     - Resume uploaded to Supabase Storage
     - Profile data saved to database
     - Redirect to `/dashboard`

### 2. Returning User Experience

```
Landing → Sign In → Dashboard → View/Edit Profile
```

#### Step-by-Step:
1. **Sign In** (`/signin`)
   - Enter: Email, Password
   - On success: JWT token stored
   - Redirect to `/dashboard`

2. **Dashboard** (`/dashboard`)
   - Welcome message with user's name
   - Quick actions:
     - View My Profile
     - Edit Profile
   - "Coming Soon" features preview

3. **View Profile** (`/profile`)
   - See complete profile information
   - Download resume (if uploaded)
   - Edit button in header

4. **Edit Profile** (`/profile/edit`)
   - All fields pre-filled with current data
   - Can update any information
   - Can replace resume
   - Cancel or Save changes
   - On save: Redirect back to view profile

## 🎨 UI Components Overview

### Authentication Pages
- Clean, centered layout
- Purple gradient branding
- White card with shadow
- Form validation with inline errors
- Password visibility toggle
- Link to alternate auth page

### Navigation
- **Navbar** (shown on all authenticated pages)
  - Brand/logo (left)
  - User avatar menu (right)
    - My Profile
    - Edit Profile
    - Sign Out

### Profile Creation Form
- **Multi-step wizard**
  - Visual stepper indicator
  - Progress through 3 steps
  - Back/Next buttons
  - Final step: Submit button

### Profile Display
- **Header Section**
  - Large avatar with user initials
  - Name and industry badge
  - Location pin

- **Content Sections**
  - About (bio)
  - Skills & interests (tag pills)
  - Contact & links (grid layout)
  - Resume download button

### Resume Upload
- **Drag & Drop Zone**
  - Dashed border
  - Changes color on hover/drag
  - Icon and instructions
  - File type and size info

- **Selected File Display**
  - Green background (success state)
  - File name and size
  - Remove button

## 🔄 Data Flow

### Authentication
```
Frontend                    Supabase
   |                           |
   |------- signup() --------->|
   |                           | (creates user)
   |<------ JWT token ---------|
   |                           |
   | (store in browser)        |
```

### Profile Creation
```
Frontend                    Supabase
   |                           |
   |-- upload resume --------->| Storage
   |<------ file URL ----------|
   |                           |
   |-- create profile -------->| Database
   |   (with resume URL)       |
   |<------ success -----------|
```

### Profile Viewing
```
Frontend                    Supabase
   |                           |
   |-- fetch profile --------->| Database
   |<------ profile data ------|
   |                           |
   |-- get resume URL -------->| Storage
   |<------ signed URL --------|
```

## 🎯 Key Features by Page

### Sign Up / Sign In
- ✅ Form validation
- ✅ Password visibility toggle
- ✅ Error handling with toasts
- ✅ Loading states
- ✅ Responsive design

### Create Profile
- ✅ Multi-step form
- ✅ Progress indicator
- ✅ Field validation
- ✅ Skill tags management
- ✅ Drag & drop resume upload
- ✅ File type/size validation
- ✅ Privacy notice

### Dashboard
- ✅ Personalized welcome
- ✅ Quick action buttons
- ✅ Future features preview
- ✅ Profile status check

### View Profile
- ✅ Complete profile display
- ✅ Formatted sections
- ✅ Social links with icons
- ✅ Resume download
- ✅ Edit button
- ✅ Professional layout

### Edit Profile
- ✅ Pre-filled form fields
- ✅ Resume replacement
- ✅ Validation on submit
- ✅ Cancel/Save actions
- ✅ Loading states
- ✅ Success feedback

## 🔐 Protected Routes

All routes except `/signup` and `/signin` require authentication:
- `/dashboard`
- `/profile`
- `/profile/create`
- `/profile/edit`

If user tries to access without auth:
- Redirected to `/signin`
- After login, redirected to intended page

## 📱 Responsive Breakpoints

- **Mobile** (base): < 768px
  - Stacked layouts
  - Full-width forms
  - Simplified navigation

- **Tablet** (md): 768px - 1024px
  - 2-column grids
  - Optimized spacing

- **Desktop** (lg): > 1024px
  - Full layout
  - Maximum container width
  - Enhanced spacing

## 🎨 Color System

- **Primary Actions**: Purple 500
- **Hover States**: Purple 600
- **Backgrounds**: Gray 50
- **Cards**: White with shadow
- **Text**: Gray 800 (main), Gray 600 (secondary)
- **Success**: Green (file upload)
- **Error**: Red (validation)

## ⚡ Performance Optimizations

- Lazy loading of routes (future)
- Optimistic UI updates
- File size validation before upload
- Debounced form validation
- Efficient re-renders with proper state management

## 🔮 Future User Flows

### Networking
```
Dashboard → Browse Profiles → View Profile → Send Connection Request
                                                ↓
                                        Accept/Reject Request
                                                ↓
                                          My Connections
```

### Messaging
```
My Connections → Select Connection → Open Chat → Send Messages
```

### Events
```
Dashboard → Events → Browse Events → Event Details → RSVP
                                                        ↓
                                                   My Events
```
