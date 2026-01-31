from flask import Blueprint, request, jsonify
from app.middleware.auth import require_auth
from app.supabase_client import supabase

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@require_auth
def get_notifications():
    """Get all notifications for the current user"""
    try:
        user_id = request.user.user.id
        
        # Get query parameters
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        # Build query - simplified to avoid complex joins
        query = supabase.table('notifications').select('*').eq('user_id', user_id).order('created_at', desc=True)
        
        # Execute query with pagination
        result = query.range(offset, offset + limit - 1).execute()
        
        # Format notifications and fetch related profile data
        notifications = []
        for notif in result.data:
            notification_data = {
                'id': notif['id'],
                'type': notif['type'],
                'message': notif['message'],
                'created_at': notif['created_at']
            }
            
            # Fetch related user profile if available
            if notif.get('related_user_id'):
                try:
                    profile_result = supabase.table('profiles').select('id, full_name, profile_picture_url').eq('id', notif['related_user_id']).single().execute()
                    if profile_result.data:
                        notification_data['related_user'] = {
                            'id': profile_result.data['id'],
                            'name': profile_result.data['full_name'],
                            'profile_picture_url': profile_result.data['profile_picture_url']
                        }
                except Exception:
                    # If profile fetch fails, continue without related user info
                    pass
            
            notifications.append(notification_data)
        
        return jsonify({
            'notifications': notifications,
            'count': len(notifications)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<notification_id>', methods=['DELETE'])
@require_auth
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        user_id = request.user.user.id
        
        result = supabase.table('notifications').delete().eq('id', notification_id).eq('user_id', user_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Notification not found'}), 404
        
        return jsonify({'message': 'Notification deleted'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/clear-all', methods=['DELETE'])
@require_auth
def clear_all_notifications():
    """Delete all notifications for current user"""
    try:
        user_id = request.user.user.id
        
        result = supabase.table('notifications').delete().eq('user_id', user_id).execute()
        
        return jsonify({
            'message': 'All notifications cleared',
            'deleted_count': len(result.data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
