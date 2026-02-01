import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Only load .env in development (Vercel sets env vars directly)
if os.getenv('VERCEL') != '1':
    load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

print(f"Initializing Supabase client...")
print(f"SUPABASE_URL set: {'Yes' if SUPABASE_URL else 'No'}")
print(f"SUPABASE_KEY set: {'Yes' if SUPABASE_KEY else 'No'}")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Missing Supabase credentials in environment variables")
    raise ValueError("Missing Supabase credentials in environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Supabase client initialized successfully")
except Exception as e:
    print(f"ERROR: Failed to initialize Supabase client: {str(e)}")
    raise
