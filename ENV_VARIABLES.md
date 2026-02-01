# Environment Variables Quick Reference

## Complete List for Vercel Deployment

### Backend Variables (Flask/Python)
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc... (service_role key)
FLASK_SECRET_KEY=your-random-secret-string
```

### Frontend Variables (React/Vite)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (anon/public key)
VITE_API_URL=
```
**Note:** Leave `VITE_API_URL` empty (blank value) in production!

---

## Where to Find These Values

### Supabase Dashboard
1. Go to your project: https://supabase.com/dashboard/project/YOUR_PROJECT
2. Click "Settings" → "API"

You'll see:
- **Project URL** → Use for `SUPABASE_URL` and `VITE_SUPABASE_URL`
- **anon public** key → Use for `VITE_SUPABASE_ANON_KEY` (frontend)
- **service_role** key → Use for `SUPABASE_SERVICE_KEY` (backend)

### Flask Secret Key
Generate a random string:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```
Use the output for `FLASK_SECRET_KEY`

---

## Common Mistakes to Avoid

❌ **DON'T:**
- Use service_role key in frontend (security risk!)
- Forget the `VITE_` prefix on frontend variables
- Set `VITE_API_URL` to `http://localhost:5001` in production
- Mix up anon key and service key

✅ **DO:**
- Use service_role key only in backend
- Use anon key only in frontend
- Leave `VITE_API_URL` empty in production
- Double-check variable names for typos
- Set variables for all environments (Production, Preview, Development)

---

## Testing Your Configuration

After deploying, test each part:

1. **Frontend loads:** Visit `https://your-app.vercel.app`
2. **Auth works:** Try signing up/in
3. **API works:** Visit `https://your-app.vercel.app/api/health`
4. **Supabase works:** Check if data loads in your app

---

## Development vs Production

### Local Development (.env)
```bash
# Backend
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc... (service_role)
FLASK_SECRET_KEY=dev-secret-key

# Frontend (in frontend/.env)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (anon)
VITE_API_URL=http://localhost:5001
```

### Vercel Production
```bash
# Backend
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc... (service_role)
FLASK_SECRET_KEY=<secure-random-string>

# Frontend
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (anon)
VITE_API_URL=     (EMPTY!)
```

The key difference: `VITE_API_URL` is `http://localhost:5001` locally and **empty** in production.
