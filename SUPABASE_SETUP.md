# Supabase Setup Guide

## Database Setup

Run migrations in order in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in sequence:
   - `migrations/001_initial_schema.sql` - Initial profiles table
   - `migrations/002_add_profile_features.sql` - Add profile features
   - `migrations/003_add_follows_and_notifications.sql` - Add follows & notifications
   - `migrations/004_add_messaging.sql` - **NEW: Add messaging system**
4. Click **Run** to execute each SQL file

For each migration:
- Copy the contents of the file
- Paste into SQL Editor
- Click **Run**
- Verify success before moving to the next migration

## Storage Setup

1. Navigate to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Configure the bucket:
   - **Name**: `resumes`
   - **Public**: ❌ Uncheck (private bucket)
   - **File size limit**: 5242880 (5MB)
   - **Allowed MIME types**: 
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

4. Click **Create bucket**

## Storage Policies

After creating the bucket, add these policies:

1. Click on the `resumes` bucket
2. Go to **Policies** tab
3. Click **New Policy**

### Policy 1: Upload
- **Name**: Users can upload their own resumes
- **Policy command**: INSERT
- **Target roles**: authenticated
- **USING expression**:
```sql
bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 2: Update
- **Name**: Users can update their own resumes
- **Policy command**: UPDATE
- **Target roles**: authenticated
- **USING expression**:
```sql
bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 3: Delete
- **Name**: Users can delete their own resumes
- **Policy command**: DELETE
- **Target roles**: authenticated
- **USING expression**:
```sql
bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 4: View
- **Name**: Authenticated users can view resumes
- **Policy command**: SELECT
- **Target roles**: authenticated
- **USING expression**:
```sql
bucket_id = 'resumes' AND auth.role() = 'authenticated'
```

## Authentication Setup

1. Navigate to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure email templates if desired
4. (Optional) Enable additional providers like Google, GitHub, etc.

## API Keys

Get your API keys from **Settings** > **API**:
- **Project URL**: Your Supabase project URL
- **anon public**: For frontend (VITE_SUPABASE_ANON_KEY)
- **service_role**: For backend (SUPABASE_SERVICE_KEY) - Keep this secret!

## Environment Variables

### Frontend (.env.local)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
FLASK_SECRET_KEY=your-random-secret-key
FLASK_ENV=development
CORS_ORIGINS=http://localhost:5173
```

## Testing the Setup

1. Sign up a new user through the frontend
2. Create a profile with all fields
3. Upload a resume
4. Verify the data appears in Supabase dashboard:
   - Check **Table Editor** > `profiles`
   - Check **Storage** > `resumes`

## Security Notes

- Never commit `.env` or `.env.local` files to git
- Keep service role key secure (backend only)
- Use anon key for frontend (has RLS protection)
- Enable email verification in production
- Consider rate limiting for API endpoints
