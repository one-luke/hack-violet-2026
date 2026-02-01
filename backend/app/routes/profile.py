import traceback
import os
import random
from flask import Blueprint, request, jsonify
from app.middleware.auth import require_auth
from app.supabase_client import supabase
from app.services.openrouter_nlp import recommend_profile_ids
from app.services.embedding_service import generate_embedding, generate_profile_embedding

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
        
        # Generate embedding for the new profile
        embedding = generate_profile_embedding(data)
        if embedding:
            data['embedding'] = embedding
        
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
        
        # Generate new embedding for the updated profile
        # First get the existing profile to merge with updates
        existing_response = supabase.table('profiles').select('*').eq('id', user_id).single().execute()
        if existing_response.data:
            merged_profile = {**existing_response.data, **data}
            embedding = generate_profile_embedding(merged_profile)
            if embedding:
                data['embedding'] = embedding
        
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
        
        # Apply semantic search if query exists - do this first for best relevance ordering
        if search_query:
            # Generate embedding for the search query
            query_embedding = generate_embedding(search_query)
            
            if query_embedding:
                try:
                    # Use Supabase RPC to call the semantic search function
                    result = supabase.rpc(
                        'search_profiles_semantic',
                        {
                            'query_embedding': query_embedding,
                            'match_threshold': 0.2,  # Lower threshold for more results
                            'match_count': 200  # Get more results to have enough after filtering
                        }
                    ).execute()
                    
                    if result.data:
                        # Create a map of profile IDs with their similarity scores
                        similarity_map = {p['id']: p['similarity'] for p in result.data}
                        semantic_profile_ids = set(similarity_map.keys())
                        
                        # Filter to only include profiles that match both:
                        # 1. Semantic search results (for relevance)
                        # 2. Sidebar filters (for precision)
                        filtered_profiles = [
                            p for p in filtered_profiles
                            if p.get('id') in semantic_profile_ids
                        ]
                        
                        # Sort by similarity score (highest first) - this ensures relevance ordering
                        filtered_profiles.sort(
                            key=lambda p: similarity_map.get(p.get('id'), 0),
                            reverse=True
                        )
                        
                        # Add similarity score to each profile for debugging/display
                        for p in filtered_profiles:
                            p['_similarity'] = similarity_map.get(p.get('id'), 0)
                    else:
                        # No semantic matches found
                        filtered_profiles = []
                        
                except Exception as semantic_error:
                    print(f"Semantic search error: {str(semantic_error)}")
                    import traceback
                    traceback.print_exc()
                    # Fall back to basic text search if semantic search fails
                    search_lower = search_query.lower()
                    filtered_profiles = [
                        p for p in filtered_profiles
                        if (search_lower in (p.get('full_name') or '').lower() or
                            search_lower in (p.get('bio') or '').lower() or
                            search_lower in (p.get('custom_industry') or '').lower() or
                            search_lower in (p.get('industry') or '').lower())
                    ]
            else:
                # Fall back to basic text search if embedding generation fails
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

@bp.route('/embeddings/generate', methods=['POST'])
@require_auth
def generate_embeddings():
    """Regenerate embeddings for all profiles (or only missing ones if force=false)"""
    try:
        # Check if we should regenerate all or only missing embeddings
        force_regenerate = request.args.get('force', 'true').lower() == 'true'
        
        if force_regenerate:
            # Get all profiles to regenerate embeddings
            response = supabase.table('profiles').select('*').execute()
            profiles_to_update = response.data or []
            print(f"Regenerating embeddings for all {len(profiles_to_update)} profiles")
        else:
            # Only get profiles without embeddings
            response = supabase.table('profiles').select('*').is_('embedding', 'null').execute()
            profiles_to_update = response.data or []
            print(f"Found {len(profiles_to_update)} profiles without embeddings")
        
        updated_count = 0
        failed_count = 0
        
        for profile in profiles_to_update:
            try:
                embedding = generate_profile_embedding(profile)
                if embedding:
                    # Update the profile with the embedding
                    supabase.table('profiles').update(
                        {'embedding': embedding}
                    ).eq('id', profile['id']).execute()
                    updated_count += 1
                    print(f"Generated embedding for profile {profile['id']}")
                else:
                    failed_count += 1
                    print(f"Failed to generate embedding for profile {profile['id']}")
            except Exception as e:
                failed_count += 1
                print(f"Error updating profile {profile['id']}: {str(e)}")
        
        return jsonify({
            'message': 'Embeddings generated',
            'updated': updated_count,
            'failed': failed_count,
            'total': len(profiles_to_update),
            'regenerated_all': force_regenerate
        }), 200
        
    except Exception as e:
        print(f"Error generating embeddings: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@bp.route('/recommendations', methods=['GET'])
@require_auth
def get_recommendations():
    """Recommend profiles based on the current user's profile with AI-generated reasons"""
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

        # Get list of users the current user is already following
        follows_resp = (
            supabase.table('follows')
            .select('following_id')
            .eq('follower_id', user_id)
            .execute()
        )
        following_ids = {f['following_id'] for f in (follows_resp.data or [])}

        candidates_resp = (
            supabase.table('profiles')
            .select('id,full_name,email,location,industry,custom_industry,current_school,career_status,skills,bio,profile_picture_url')
            .neq('id', user_id)
            .execute()
        )
        candidates = candidates_resp.data or []
        
        # Filter out profiles the user is already following
        candidates = [c for c in candidates if c['id'] not in following_ids]
        
        if not candidates:
            return jsonify([]), 200

        # Use LLM to get recommendations with reasons
        # If OpenRouter API key is missing, return simple random recommendations
        api_key = os.environ.get('OPENROUTER_API_KEY')
        if not api_key:
            print("Warning: OPENROUTER_API_KEY not set, returning random recommendations")
            import random
            result = random.sample(candidates, min(limit, len(candidates)))
            for profile in result:
                profile['recommendation_reason'] = "Recommended based on your profile"
            return jsonify(result), 200
        
        from app.services.openrouter_nlp import recommend_profiles_with_reasons
        recommendations_with_reasons = recommend_profiles_with_reasons(
            user_resp.data, 
            candidates, 
            limit
        )
        
        # Map recommendations back to full profile data
        candidate_map = {c['id']: c for c in candidates}
        result = []
        for rec in recommendations_with_reasons:
            profile_id = rec['id']
            if profile_id in candidate_map:
                profile_data = candidate_map[profile_id]
                profile_data['recommendation_reason'] = rec['reason']
                result.append(profile_data)

        return jsonify(result), 200
    except Exception as e:
        print(f"Recommendation error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e), 'details': traceback.format_exc()}), 500

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
