import traceback
from flask import Blueprint, request, jsonify
from app.middleware.auth import require_auth
from app.supabase_client import supabase
from app.services.openrouter_nlp import parse_search_query, recommend_profile_ids

bp = Blueprint('profile', __name__)

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
        
        print(f"Search params - q:{search_query}, industry:{industry}, location:{location}, school:{school}, career_status:{career_status}, skills:{skills}")
        
        # Fetch all profiles first to avoid Supabase query issues
        # Then filter in Python
        try:
            response = supabase.table('profiles').select('*').execute()
            print(f"Fetched {len(response.data) if response.data else 0} profiles from database")
            profiles = response.data or []
        except Exception as db_error:
            print(f"Database query error: {type(db_error).__name__}: {str(db_error)}")
            # Try a simpler query with limit if full query fails
            try:
                response = supabase.table('profiles').select('*').limit(100).execute()
                profiles = response.data or []
                print(f"Fallback query returned {len(profiles)} profiles")
            except Exception as fallback_error:
                print(f"Fallback query also failed: {str(fallback_error)}")
                return jsonify({'error': 'Database query failed', 'details': str(db_error)}), 500
        
        # Apply filters in Python
        filtered_profiles = profiles
        
        # Filter by industry (case-insensitive)
        if industry:
            industry_lower = industry.lower()
            filtered_profiles = [
                p for p in filtered_profiles
                if (p.get('industry') or '').lower() == industry_lower
            ]
        
        # Filter by location (case-insensitive, partial match)
        if location:
            location_lower = location.lower()
            filtered_profiles = [
                p for p in filtered_profiles
                if location_lower in (p.get('location') or '').lower()
            ]
        
        # Filter by school (case-insensitive, partial match)
        if school:
            school_lower = school.lower()
            filtered_profiles = [
                p for p in filtered_profiles
                if school_lower in (p.get('current_school') or '').lower()
            ]
        
        # Filter by career status (exact match)
        if career_status:
            filtered_profiles = [
                p for p in filtered_profiles
                if p.get('career_status') == career_status
            ]
        
        # Filter by skills (contains any)
        if skills:
            filtered_profiles = [
                p for p in filtered_profiles
                if any(skill in (p.get('skills') or []) for skill in skills)
            ]
        
        # Filter by text search
        if search_query:
            search_lower = search_query.lower()
            filtered_profiles = [
                p for p in filtered_profiles
                if (search_lower in (p.get('full_name') or '').lower() or
                    search_lower in (p.get('bio') or '').lower() or
                    search_lower in (p.get('custom_industry') or '').lower() or
                    search_lower in (p.get('industry') or '').lower())
            ]
        
        print(f"Returning {len(filtered_profiles)} filtered profiles")
        return jsonify(filtered_profiles), 200
        
    except Exception as e:
        print(f"Search error: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'{type(e).__name__}: {str(e)}'}), 500

@bp.route('/search/parse', methods=['POST'])
@require_auth
def parse_search():
    """Parse a natural language query into structured filters"""
    try:
        data = request.json or {}
        query = (data.get('query') or '').strip()
        if not query:
            return jsonify({'error': 'Query is required'}), 400

        parsed = parse_search_query(query)
        # Normalize missing fields
        result = {
            'text_query': parsed.get('text_query', '') or '',
            'industry': parsed.get('industry', '') or '',
            'location': parsed.get('location', '') or '',
            'school': parsed.get('school', '') or '',
            'career_status': parsed.get('career_status', '') or '',
            'skills': parsed.get('skills', []) or [],
        }

        return jsonify({'filters': result}), 200
    except Exception as e:
        print("OpenRouter parse error:", str(e))
        traceback.print_exc()
        # Return a graceful fallback instead of 500 error
        return jsonify({
            'filters': {
                'text_query': query if 'query' in locals() else '',
                'industry': '',
                'location': '',
                'school': '',
                'career_status': '',
                'skills': []
            }
        }), 200

@bp.route('/recommendations', methods=['GET'])
@require_auth
def get_recommendations():
    """Recommend profiles based on the current user's profile"""
    try:
        limit = request.args.get('limit', '5')
        try:
            limit = int(limit)
        except ValueError:
            limit = 5
        limit = max(1, min(limit, 20))

        user_id = request.user.user.id
        user_resp = (
            supabase.table('profiles')
            .select('id,full_name,email,location,industry,custom_industry,current_school,career_status,skills,bio,profile_picture_url')
            .eq('id', user_id)
            .single()
            .execute()
        )
        if not user_resp.data:
            return jsonify({'error': 'Profile not found'}), 404

        candidates_resp = (
            supabase.table('profiles')
            .select('id,full_name,email,location,industry,custom_industry,current_school,career_status,skills,bio,profile_picture_url')
            .neq('id', user_id)
            .execute()
        )
        candidates = candidates_resp.data or []
        if not candidates:
            return jsonify([]), 200

        ranked_ids = recommend_profile_ids(user_resp.data, candidates)
        if ranked_ids:
            candidate_map = {c['id']: c for c in candidates}
            ordered = [candidate_map[cid] for cid in ranked_ids if cid in candidate_map]
        else:
            ordered = candidates

        return jsonify(ordered[:limit]), 200
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
