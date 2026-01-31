from flask import Blueprint, request, jsonify
from app.supabase_client import supabase
from app.middleware.auth import require_auth

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('/insights/feed', methods=['GET'])
@require_auth
def get_insights_feed():
    """Get insights from users that the current user follows"""
    try:
        user_id = request.user.user.id
        
        # Get list of users that current user follows
        follows_response = supabase.table('follows').select('following_id').eq(
            'follower_id', user_id
        ).execute()
        
        if not follows_response.data:
            return jsonify([]), 200
        
        following_ids = [f['following_id'] for f in follows_response.data]
        
        # Get insights from followed users
        insights_response = supabase.table('insights').select(
            '*'
        ).in_('user_id', following_ids).order('created_at', desc=True).limit(50).execute()
        
        insights = insights_response.data
        
        # Get profile info and like counts for each insight
        for insight in insights:
            # Get profile info
            profile_response = supabase.table('profiles').select(
                'full_name, profile_picture_url'
            ).eq('id', insight['user_id']).execute()
            if profile_response.data:
                insight['profile'] = profile_response.data[0]
            
            # Get like count
            likes_response = supabase.table('insight_likes').select(
                'id', count='exact'
            ).eq('insight_id', insight['id']).execute()
            insight['likes_count'] = likes_response.count or 0
            
            # Check if current user liked it
            user_like = supabase.table('insight_likes').select('id').eq(
                'insight_id', insight['id']
            ).eq('user_id', user_id).execute()
            insight['liked_by_user'] = len(user_like.data) > 0
        
        return jsonify(insights), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@insights_bp.route('/insights', methods=['POST'])
@require_auth
def create_insight():
    """Create a new insight"""
    try:
        user_id = request.user.user.id
        data = request.get_json()
        
        if not data.get('title') or not data.get('content'):
            return jsonify({'error': 'Title and content are required'}), 400
        
        insight_data = {
            'user_id': user_id,
            'title': data['title'],
            'content': data['content'],
            'link_url': data.get('link_url'),
            'link_title': data.get('link_title')
        }
        
        response = supabase.table('insights').insert(insight_data).execute()
        
        return jsonify(response.data[0]), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@insights_bp.route('/insights/<insight_id>', methods=['GET'])
def get_insight(insight_id):
    """Get a specific insight with like count and whether current user liked it"""
    try:
        # Get insight with user profile
        insight_response = supabase.table('insights').select(
            '*'
        ).eq('id', insight_id).execute()
        
        if not insight_response.data:
            return jsonify({'error': 'Insight not found'}), 404
        
        insight = insight_response.data[0]
        
        # Get like count
        likes_response = supabase.table('insight_likes').select(
            'id', count='exact'
        ).eq('insight_id', insight_id).execute()
        
        insight['likes_count'] = likes_response.count or 0
        
        # Check if current user liked it
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                user_response = supabase.auth.get_user(auth_header.replace('Bearer ', ''))
                if user_response.user:
                    user_like = supabase.table('insight_likes').select('id').eq(
                        'insight_id', insight_id
                    ).eq('user_id', user_response.user.id).execute()
                    insight['liked_by_user'] = len(user_like.data) > 0
            except:
                insight['liked_by_user'] = False
        else:
            insight['liked_by_user'] = False
        
        return jsonify(insight), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@insights_bp.route('/insights/<insight_id>', methods=['PUT'])
@require_auth
def update_insight(insight_id):
    """Update an insight"""
    try:
        user_id = request.user.user.id
        data = request.get_json()
        
        # Verify ownership
        insight = supabase.table('insights').select('user_id').eq('id', insight_id).execute()
        if not insight.data:
            return jsonify({'error': 'Insight not found'}), 404
        
        if insight.data[0]['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title']
        if 'content' in data:
            update_data['content'] = data['content']
        if 'link_url' in data:
            update_data['link_url'] = data['link_url']
        if 'link_title' in data:
            update_data['link_title'] = data['link_title']
        
        response = supabase.table('insights').update(update_data).eq('id', insight_id).execute()
        
        return jsonify(response.data[0]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@insights_bp.route('/insights/<insight_id>', methods=['DELETE'])
@require_auth
def delete_insight(insight_id):
    """Delete an insight"""
    try:
        user_id = request.user.user.id
        
        # Verify ownership
        insight = supabase.table('insights').select('user_id').eq('id', insight_id).execute()
        if not insight.data:
            return jsonify({'error': 'Insight not found'}), 404
        
        if insight.data[0]['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        supabase.table('insights').delete().eq('id', insight_id).execute()
        
        return jsonify({'message': 'Insight deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@insights_bp.route('/users/<user_id>/insights', methods=['GET'])
def get_user_insights(user_id):
    """Get all insights for a specific user"""
    try:
        # Get insights
        insights_response = supabase.table('insights').select(
            '*'
        ).eq('user_id', user_id).order('created_at', desc=True).execute()
        
        # Get like counts for each insight
        insights = insights_response.data
        for insight in insights:
            likes_response = supabase.table('insight_likes').select(
                'id', count='exact'
            ).eq('insight_id', insight['id']).execute()
            insight['likes_count'] = likes_response.count or 0
            
            # Check if current user liked it
            auth_header = request.headers.get('Authorization')
            if auth_header:
                try:
                    user_response = supabase.auth.get_user(auth_header.replace('Bearer ', ''))
                    if user_response.user:
                        user_like = supabase.table('insight_likes').select('id').eq(
                            'insight_id', insight['id']
                        ).eq('user_id', user_response.user.id).execute()
                        insight['liked_by_user'] = len(user_like.data) > 0
                except:
                    insight['liked_by_user'] = False
            else:
                insight['liked_by_user'] = False
        
        return jsonify(insights), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@insights_bp.route('/insights/<insight_id>/like', methods=['POST'])
@require_auth
def like_insight(insight_id):
    """Like an insight"""
    try:
        user_id = request.user.user.id
        
        # Check if already liked
        existing_like = supabase.table('insight_likes').select('id').eq(
            'insight_id', insight_id
        ).eq('user_id', user_id).execute()
        
        if existing_like.data:
            return jsonify({'error': 'Already liked'}), 400
        
        # Add like
        like_data = {
            'insight_id': insight_id,
            'user_id': user_id
        }
        
        supabase.table('insight_likes').insert(like_data).execute()
        
        # Get updated like count
        likes_response = supabase.table('insight_likes').select(
            'id', count='exact'
        ).eq('insight_id', insight_id).execute()
        
        return jsonify({
            'message': 'Insight liked successfully',
            'likes_count': likes_response.count or 0
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@insights_bp.route('/insights/<insight_id>/unlike', methods=['DELETE'])
@require_auth
def unlike_insight(insight_id):
    """Unlike an insight"""
    try:
        user_id = request.user.user.id
        
        # Remove like
        supabase.table('insight_likes').delete().eq(
            'insight_id', insight_id
        ).eq('user_id', user_id).execute()
        
        # Get updated like count
        likes_response = supabase.table('insight_likes').select(
            'id', count='exact'
        ).eq('insight_id', insight_id).execute()
        
        return jsonify({
            'message': 'Insight unliked successfully',
            'likes_count': likes_response.count or 0
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
