from flask import Blueprint, request, jsonify
from app.middleware.auth import require_auth
from app.supabase_client import supabase

bp = Blueprint('profile', __name__, url_prefix='/profile')

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
    """Search and filter profiles by multiple criteria"""
    try:
        # Get search and filter parameters
        search_query = request.args.get('q', '').strip()
        industry = request.args.get('industry', '').strip()
        location = request.args.get('location', '').strip()
        school = request.args.get('school', '').strip()
        career_status = request.args.get('career_status', '').strip()
        skills = request.args.getlist('skills')  # Can pass multiple skills
        
        # Start with base query selecting all fields
        query = supabase.table('profiles').select('*')
        
        # Apply text search if provided (searches name, bio, custom_industry)
        if search_query:
            # Use Supabase's text search on multiple fields
            # We'll filter on the backend after fetching
            pass  # Will filter after fetch
        
        # Apply exact match filters
        if industry:
            query = query.eq('industry', industry)
        
        if location:
            query = query.ilike('location', f'%{location}%')
        
        if school:
            query = query.ilike('current_school', f'%{school}%')
        
        if career_status:
            query = query.eq('career_status', career_status)
        
        # Apply skills filter (check if profile has any of the specified skills)
        if skills:
            for skill in skills:
                query = query.contains('skills', [skill])
        
        response = query.execute()
        profiles = response.data
        
        # Post-process for text search if query provided
        if search_query and profiles:
            search_lower = search_query.lower()
            profiles = [
                p for p in profiles
                if (search_lower in (p.get('full_name') or '').lower() or
                    search_lower in (p.get('bio') or '').lower() or
                    search_lower in (p.get('custom_industry') or '').lower() or
                    search_lower in (p.get('industry') or '').lower())
            ]
        
        return jsonify(profiles), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<user_id>', methods=['GET'])
@require_auth
def get_profile_by_id(user_id):
    """Get a specific user's profile by ID"""
    try:
        response = supabase.table('profiles').select('*').eq('id', user_id).single().execute()
        
        if not response.data:
            return jsonify({'error': 'Profile not found'}), 404
        
        return jsonify(response.data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
