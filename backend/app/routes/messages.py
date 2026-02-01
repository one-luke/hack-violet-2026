from flask import Blueprint, request, jsonify
from app.middleware.auth import require_auth
from app.supabase_client import supabase
from datetime import datetime

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/conversations', methods=['GET'])
@require_auth
def get_conversations():
    """Get all conversations for the current user"""
    try:
        user_id = request.user.user.id
        
        # Get all conversations where user is either user1 or user2
        result = supabase.table('conversations').select('*').or_(f'user1_id.eq.{user_id},user2_id.eq.{user_id}').order('updated_at', desc=True).execute()
        
        conversations = []
        for conv in result.data:
            # Determine the other user
            other_user_id = conv['user2_id'] if conv['user1_id'] == user_id else conv['user1_id']
            
            # Get other user's profile
            profile_result = supabase.table('profiles').select('id, full_name, profile_picture_url').eq('id', other_user_id).single().execute()
            
            # Get last message
            last_message_result = supabase.table('messages').select('*').eq('conversation_id', conv['id']).order('created_at', desc=True).limit(1).execute()
            
            # Count unread messages
            unread_result = supabase.table('messages').select('id', count='exact').eq('conversation_id', conv['id']).eq('is_read', False).neq('sender_id', user_id).execute()
            
            conversation_data = {
                'id': conv['id'],
                'other_user': {
                    'id': profile_result.data['id'],
                    'name': profile_result.data['full_name'],
                    'profile_picture_url': profile_result.data.get('profile_picture_url')
                },
                'last_message': last_message_result.data[0] if last_message_result.data else None,
                'unread_count': unread_result.count if unread_result.count else 0,
                'created_at': conv['created_at'],
                'updated_at': conv['updated_at']
            }
            
            conversations.append(conversation_data)
        
        return jsonify({'conversations': conversations}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/conversations/<other_user_id>', methods=['GET'])
@require_auth
def get_or_create_conversation(other_user_id):
    """Get or create a conversation with another user"""
    try:
        user_id = request.user.user.id
        
        if user_id == other_user_id:
            return jsonify({'error': 'Cannot create conversation with yourself'}), 400
        
        # Ensure user1_id < user2_id for consistency
        user1_id = min(user_id, other_user_id)
        user2_id = max(user_id, other_user_id)
        
        # Try to find existing conversation
        result = supabase.table('conversations').select('*').eq('user1_id', user1_id).eq('user2_id', user2_id).execute()
        
        if result.data:
            conversation = result.data[0]
        else:
            # Create new conversation
            create_result = supabase.table('conversations').insert({
                'user1_id': user1_id,
                'user2_id': user2_id
            }).execute()
            conversation = create_result.data[0]
        
        # Get other user's profile
        profile_result = supabase.table('profiles').select('id, full_name, profile_picture_url').eq('id', other_user_id).single().execute()
        
        return jsonify({
            'conversation': {
                'id': conversation['id'],
                'other_user': {
                    'id': profile_result.data['id'],
                    'name': profile_result.data['full_name'],
                    'profile_picture_url': profile_result.data.get('profile_picture_url')
                },
                'created_at': conversation['created_at'],
                'updated_at': conversation['updated_at']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/conversations/<conversation_id>/messages', methods=['GET'])
@require_auth
def get_messages(conversation_id):
    """Get all messages in a conversation"""
    try:
        user_id = request.user.user.id
        
        # Verify user is part of this conversation
        conv_result = supabase.table('conversations').select('*').eq('id', conversation_id).single().execute()
        
        if not conv_result.data:
            return jsonify({'error': 'Conversation not found'}), 404
        
        conversation = conv_result.data
        if conversation['user1_id'] != user_id and conversation['user2_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get pagination parameters
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        # Get messages
        result = supabase.table('messages').select('*').eq('conversation_id', conversation_id).order('created_at', desc=False).range(offset, offset + limit - 1).execute()
        
        # Mark messages as read
        supabase.table('messages').update({'is_read': True}).eq('conversation_id', conversation_id).neq('sender_id', user_id).eq('is_read', False).execute()
        
        return jsonify({
            'messages': result.data,
            'count': len(result.data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/conversations/<conversation_id>/messages', methods=['POST'])
@require_auth
def send_message(conversation_id):
    """Send a message in a conversation"""
    try:
        user_id = request.user.user.id
        data = request.json
        content = data.get('content', '').strip()
        
        if not content:
            return jsonify({'error': 'Message content is required'}), 400
        
        # Verify user is part of this conversation
        conv_result = supabase.table('conversations').select('*').eq('id', conversation_id).single().execute()
        
        if not conv_result.data:
            return jsonify({'error': 'Conversation not found'}), 404
        
        conversation = conv_result.data
        if conversation['user1_id'] != user_id and conversation['user2_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Create message
        result = supabase.table('messages').insert({
            'conversation_id': conversation_id,
            'sender_id': user_id,
            'content': content
        }).execute()
        
        return jsonify({'message': result.data[0]}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/conversations/<conversation_id>/mark-read', methods=['POST'])
@require_auth
def mark_conversation_read(conversation_id):
    """Mark all messages in a conversation as read"""
    try:
        user_id = request.user.user.id
        
        # Verify user is part of this conversation
        conv_result = supabase.table('conversations').select('*').eq('id', conversation_id).single().execute()
        
        if not conv_result.data:
            return jsonify({'error': 'Conversation not found'}), 404
        
        conversation = conv_result.data
        if conversation['user1_id'] != user_id and conversation['user2_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Mark all messages from other user as read
        supabase.table('messages').update({'is_read': True}).eq('conversation_id', conversation_id).neq('sender_id', user_id).execute()
        
        return jsonify({'message': 'Messages marked as read'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/unread-count', methods=['GET'])
@require_auth
def get_unread_count():
    """Get total unread message count for current user"""
    try:
        user_id = request.user.user.id
        
        # Get all conversations for user
        conv_result = supabase.table('conversations').select('id').or_(f'user1_id.eq.{user_id},user2_id.eq.{user_id}').execute()
        
        conversation_ids = [conv['id'] for conv in conv_result.data]
        
        if not conversation_ids:
            return jsonify({'unread_count': 0}), 200
        
        # Count unread messages across all conversations
        total_unread = 0
        for conv_id in conversation_ids:
            unread_result = supabase.table('messages').select('id', count='exact').eq('conversation_id', conv_id).eq('is_read', False).neq('sender_id', user_id).execute()
            total_unread += unread_result.count if unread_result.count else 0
        
        return jsonify({'unread_count': total_unread}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
