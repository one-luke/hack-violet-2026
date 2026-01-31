import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app

app = create_app()

# Vercel serverless function handler
def handler(request, response):
    return app(request, response)

# Export the app for Vercel
# Vercel will use this as the WSGI application
