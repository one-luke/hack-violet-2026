import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app

app = create_app()

# For Vercel serverless functions, the app itself is the handler
# Vercel's Python runtime will call this directly
