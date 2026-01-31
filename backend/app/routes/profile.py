from flask import Blueprint, request, jsonify
from app.middleware.auth import require_auth
from app.supabase_client import supabase

bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@bp.route('', methods=['GET'])
@require_auth
def get_profile():
    """Get user profile"""
    try:
        user_id = request.user.user.id
        
        response = supabase.table('profiles').select('*').eq('id', user_id).single().execute()
        
        if not response.data:
            return jsonify({'error': 'Profile not found'}), 404
        
        return jsonify(response.data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])
@require_auth
def create_profile():
    """Create a new profile"""
    try:
        user_id = request.user.user.id
        data = request.json
        
        # Add user_id to profile data
        data['id'] = user_id
        
        response = supabase.table('profiles').insert(data).execute()
        
        return jsonify(response.data[0]), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['PUT'])
@require_auth
def update_profile():
    """Update user profile"""
    try:
        user_id = request.user.user.id
        data = request.json
        
        response = supabase.table('profiles').update(data).eq('id', user_id).execute()
        
        if not response.data:
            return jsonify({'error': 'Profile not found'}), 404
        
        return jsonify(response.data[0]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['DELETE'])
@require_auth
def delete_profile():
    """Delete user profile"""
    try:
        user_id = request.user.user.id
        
        response = supabase.table('profiles').delete().eq('id', user_id).execute()
        
        return jsonify({'message': 'Profile deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/search', methods=['GET'])
@require_auth
def search_profiles():
    """Search profiles by industry or skills"""
    try:
        industry = request.args.get('industry')
        skill = request.args.get('skill')
        
        query = supabase.table('profiles').select('*')
        
        if industry:
            query = query.eq('industry', industry)
        
        if skill:
            query = query.contains('skills', [skill])
        
        response = query.execute()
        
        return jsonify(response.data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
