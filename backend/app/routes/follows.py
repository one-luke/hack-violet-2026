from flask import Blueprint, request, jsonify
from app.middleware.auth import require_auth
from app.supabase_client import supabase
from datetime import datetime

follows_bp = Blueprint('follows', __name__)

@follows_bp.route('/follow/<user_id>', methods=['POST'])
@require_auth
def follow_user(user_id):
    """Follow another user"""
    try:
        current_user_id = request.user.user.id
        
        # Prevent self-follow
        if current_user_id == user_id:
            return jsonify({'error': 'Cannot follow yourself'}), 400
        
        # Check if already following
        existing = supabase.table('follows').select('*').eq('follower_id', current_user_id).eq('following_id', user_id).execute()
        
        if existing.data:
            return jsonify({'error': 'Already following this user'}), 400
        
        # Create follow relationship
        follow_data = {
            'follower_id': current_user_id,
            'following_id': user_id
        }
        
        result = supabase.table('follows').insert(follow_data).execute()
        
        # Get follower's profile info for notification
        follower_profile = supabase.table('profiles').select('full_name').eq('id', current_user_id).single().execute()
        follower_name = follower_profile.data.get('full_name', 'Someone') if follower_profile.data else 'Someone'
        
        # Create notification for the followed user
        notification_data = {
            'user_id': user_id,
            'type': 'follow',
            'message': f'{follower_name} started following you',
            'related_user_id': current_user_id
        }
        
        supabase.table('notifications').insert(notification_data).execute()
        
        return jsonify({
            'message': 'Successfully followed user',
            'follow': result.data[0]
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@follows_bp.route('/unfollow/<user_id>', methods=['DELETE'])
@require_auth
def unfollow_user(user_id):
    """Unfollow a user"""
    try:
        current_user_id = request.user.user.id
        
        # Delete follow relationship
        result = supabase.table('follows').delete().eq('follower_id', current_user_id).eq('following_id', user_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Not following this user'}), 404
        
        return jsonify({'message': 'Successfully unfollowed user'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@follows_bp.route('/followers/<user_id>', methods=['GET'])
@require_auth
def get_followers(user_id):
    """Get list of followers for a user"""
    try:
        # Get followers with profile information
        result = supabase.table('follows').select(
            '*, follower:follower_id(id, email), follower_profile:profiles!follows_follower_id_fkey(full_name, bio, skills, looking_for, profile_picture_url)'
        ).eq('following_id', user_id).execute()
        
        followers = []
        for follow in result.data:
            if follow.get('follower') and follow.get('follower_profile'):
                followers.append({
                    'user_id': follow['follower']['id'],
                    'email': follow['follower']['email'],
                    'name': follow['follower_profile'][0]['full_name'] if follow['follower_profile'] else None,
                    'bio': follow['follower_profile'][0]['bio'] if follow['follower_profile'] else None,
                    'skills': follow['follower_profile'][0]['skills'] if follow['follower_profile'] else [],
                    'looking_for': follow['follower_profile'][0]['looking_for'] if follow['follower_profile'] else [],
                    'profile_picture_url': follow['follower_profile'][0]['profile_picture_url'] if follow['follower_profile'] else None,
                    'followed_at': follow['created_at']
                })
        
        return jsonify({'followers': followers, 'count': len(followers)}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@follows_bp.route('/following/<user_id>', methods=['GET'])
@require_auth
def get_following(user_id):
    """Get list of users that a user is following"""
    try:
        # Get following with profile information
        result = supabase.table('follows').select(
            '*, following:following_id(id, email), following_profile:profiles!follows_following_id_fkey(full_name, bio, skills, looking_for, profile_picture_url)'
        ).eq('follower_id', user_id).execute()
        
        following = []
        for follow in result.data:
            if follow.get('following') and follow.get('following_profile'):
                following.append({
                    'user_id': follow['following']['id'],
                    'email': follow['following']['email'],
                    'name': follow['following_profile'][0]['full_name'] if follow['following_profile'] else None,
                    'bio': follow['following_profile'][0]['bio'] if follow['following_profile'] else None,
                    'skills': follow['following_profile'][0]['skills'] if follow['following_profile'] else [],
                    'looking_for': follow['following_profile'][0]['looking_for'] if follow['following_profile'] else [],
                    'profile_picture_url': follow['following_profile'][0]['profile_picture_url'] if follow['following_profile'] else None,
                    'followed_at': follow['created_at']
                })
        
        return jsonify({'following': following, 'count': len(following)}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@follows_bp.route('/is-following/<user_id>', methods=['GET'])
@require_auth
def check_is_following(user_id):
    """Check if current user is following another user"""
    try:
        current_user_id = request.user.user.id
        
        result = supabase.table('follows').select('id').eq('follower_id', current_user_id).eq('following_id', user_id).execute()
        
        return jsonify({'is_following': len(result.data) > 0}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@follows_bp.route('/stats/<user_id>', methods=['GET'])
@require_auth
def get_follow_stats(user_id):
    """Get follower and following counts for a user"""
    try:
        # Count followers
        followers_result = supabase.table('follows').select('id', count='exact').eq('following_id', user_id).execute()
        followers_count = followers_result.count or 0
        
        # Count following
        following_result = supabase.table('follows').select('id', count='exact').eq('follower_id', user_id).execute()
        following_count = following_result.count or 0
        
        return jsonify({
            'followers_count': followers_count,
            'following_count': following_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
