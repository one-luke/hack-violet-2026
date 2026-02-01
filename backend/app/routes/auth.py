from flask import Blueprint, request, jsonify
from app.supabase_client import supabase

bp = Blueprint('auth', __name__)

@bp.route('/signup', methods=['POST'])
def signup():
    """Sign up a new user"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        response = supabase.auth.sign_up({
            'email': email,
            'password': password,
            'options': {
                'data': {
                    'full_name': full_name
                }
            }
        })
        
        return jsonify({
            'user': response.user,
            'session': response.session
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/signin', methods=['POST'])
def signin():
    """Sign in an existing user"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        response = supabase.auth.sign_in_with_password({
            'email': email,
            'password': password
        })
        
        return jsonify({
            'user': response.user,
            'session': response.session
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/signout', methods=['POST'])
def signout():
    """Sign out the current user"""
    try:
        supabase.auth.sign_out()
        return jsonify({'message': 'Signed out successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/user', methods=['GET'])
def get_user():
    """Get current user from token"""
    try:
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
        
        token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
        user = supabase.auth.get_user(token)
        
        return jsonify({'user': user}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 401
