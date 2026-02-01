from functools import wraps
from flask import request, jsonify
import jwt
import traceback
from app.supabase_client import supabase

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            print("Authentication failed: No authorization header")
            return jsonify({'error': 'No authorization header'}), 401
        
        try:
            # Extract token from "Bearer <token>"
            token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
            
            # Verify token with Supabase
            user = supabase.auth.get_user(token)
            
            if not user:
                print("Authentication failed: Invalid token")
                return jsonify({'error': 'Invalid token'}), 401
            
            # Add user to request context
            request.user = user
            
            return f(*args, **kwargs)
            
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            traceback.print_exc()
            return jsonify({'error': f'Authentication failed: {str(e)}'}), 401
    
    return decorated_function
