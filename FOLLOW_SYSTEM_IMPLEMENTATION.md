# Follow System and Notifications Implementation

## Overview
This document describes the implementation of a follow system and notification inbox for the Aurelia platform. Users can now follow other users they want to connect with, and receive notifications when someone follows them.

## Features Implemented

### 1. Follow System
- **Follow/Unfollow**: Users can follow and unfollow other users
- **Follow Statistics**: Display follower and following counts on profiles
- **Follow Status**: Check if current user is following another user
- **Prevent Self-Follow**: Users cannot follow themselves

### 2. Notification System
- **Follow Notifications**: Automatic notifications when someone follows you
- **Notification Inbox**: View all notifications with read/unread status
- **Mark as Read**: Mark individual or all notifications as read
- **Delete Notifications**: Delete individual or all notifications
- **Unread Count**: Real-time unread notification count in navbar
- **Navigation**: Click notifications to navigate to related profiles

## Database Changes

### New Tables

#### `follows` table
- `id` (UUID, primary key)
- `follower_id` (UUID, references auth.users)
- `following_id` (UUID, references auth.users)
- `created_at` (timestamp)
- Unique constraint on (follower_id, following_id)
- Check constraint to prevent self-follows

#### `notifications` table
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `type` (varchar)
- `message` (text)
- `related_user_id` (UUID, references auth.users)
- `related_profile_id` (UUID, references profiles)
- `read` (boolean, default false)
- `created_at` (timestamp)

### Row Level Security (RLS)
Both tables have RLS enabled with appropriate policies:
- Users can view all follows
- Users can only create/delete their own follows
- Users can only view and update their own notifications
- System can create notifications for any user

## Backend Implementation

### New Routes

#### Follow Routes (`/api/follows`)
- `POST /follow/<user_id>` - Follow a user
- `DELETE /unfollow/<user_id>` - Unfollow a user
- `GET /followers/<user_id>` - Get list of followers
- `GET /following/<user_id>` - Get list of users being followed
- `GET /is-following/<user_id>` - Check follow status
- `GET /stats/<user_id>` - Get follower/following counts

#### Notification Routes (`/api/notifications`)
- `GET /` - Get all notifications (with pagination and filters)
- `GET /unread-count` - Get count of unread notifications
- `PATCH /<notification_id>/mark-read` - Mark notification as read
- `PATCH /mark-all-read` - Mark all notifications as read
- `DELETE /<notification_id>` - Delete a notification
- `DELETE /clear-all` - Clear all notifications

### Files Created/Modified

**Backend:**
- `backend/migrations/003_add_follows_and_notifications.sql` - Database migration
- `backend/app/routes/follows.py` - Follow endpoints
- `backend/app/routes/notifications.py` - Notification endpoints
- `backend/app/__init__.py` - Register new blueprints

**Frontend:**
- `frontend/src/pages/Notifications.tsx` - Notification inbox page
- `frontend/src/pages/ViewProfile.tsx` - Added follow button and stats
- `frontend/src/components/Navbar.tsx` - Added notification bell with badge
- `frontend/src/App.tsx` - Added notifications route

## Setup Instructions

### 1. Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `backend/migrations/003_add_follows_and_notifications.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the migration

### 2. Restart Backend Server

The backend server should automatically pick up the new routes. If not, restart it:

```bash
cd backend
python run.py
```

### 3. Test the Features

#### Test Follow System:
1. Navigate to another user's profile
2. Click the "Follow" button
3. Verify the follower count increases
4. Check that the button changes to "Following"
5. Click "Following" to unfollow

#### Test Notifications:
1. Have another user follow you
2. Click the notification bell icon in the navbar
3. Verify you see a notification about the new follower
4. Click the notification to navigate to the follower's profile
5. Test marking notifications as read
6. Test clearing notifications

## API Examples

### Follow a User
```bash
curl -X POST http://localhost:5001/api/follows/follow/{user_id} \
  -H "Authorization: Bearer {token}"
```

### Get Notifications
```bash
curl http://localhost:5001/api/notifications/ \
  -H "Authorization: Bearer {token}"
```

### Mark Notification as Read
```bash
curl -X PATCH http://localhost:5001/api/notifications/{notification_id}/mark-read \
  -H "Authorization: Bearer {token}"
```

## User Flow

### Following Someone
1. User views another person's profile
2. Clicks "Follow" button
3. Follow relationship is created in database
4. Notification is sent to the followed user
5. Button changes to "Following"
6. Follower count increases

### Receiving a Follow Notification
1. Someone follows the user
2. Notification appears in the notification bell (red badge)
3. User clicks the bell icon
4. Sees notification: "{Name} started following you"
5. Clicks notification
6. Navigates to the follower's profile
7. Can optionally follow back

### Managing Notifications
1. View all notifications in the inbox
2. Unread notifications are highlighted in blue
3. Click individual notifications to mark as read
4. Click "Mark All Read" to mark all as read
5. Click "Clear All" to delete all notifications
6. Delete individual notifications with the delete icon

## Security Considerations

- All endpoints require authentication
- RLS policies prevent unauthorized access to data
- Users can only follow/unfollow through proper API endpoints
- Notification creation is system-level (via INSERT policy)
- Follow relationships are unique (no duplicate follows)

## Future Enhancements

Potential improvements for the future:
- Real-time notifications using Supabase Realtime
- Email notifications for follows
- Follow request system (approve/deny)
- Block user functionality
- Notification preferences (enable/disable certain types)
- Follow suggestions based on skills/interests
- Mutual follow indicators
- Follow activity feed
