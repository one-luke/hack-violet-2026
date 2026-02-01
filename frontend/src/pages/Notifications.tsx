import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Avatar,
  IconButton,
  Divider,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  related_user?: {
    id: string;
    name: string;
    profile_picture_url: string | null;
  };
}

export const NotificationInbox: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      setNotifications(data.notifications);
      
      // Automatically mark all unread notifications as read
      const hasUnread = data.notifications.some((n: Notification) => !n.read);
      if (hasUnread) {
        await markAllAsReadSilently(session.access_token);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load notifications',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const markAllAsReadSilently = async (accessToken: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.ok) {
        // Update local state to mark all as read
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
        );
      }
    } catch (err) {
      // Silently fail - don't show error to user
      console.error('Error marking notifications as read:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const deleteNotification = async (notificationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      
      toast({
        title: 'Deleted',
        description: 'Notification deleted',
        status: 'info',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const clearAll = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/clear-all`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to clear notifications');

      setNotifications([]);
      
      toast({
        title: 'Success',
        description: 'All notifications cleared',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to clear notifications',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Navigate based on notification type
    if (notification.type === 'follow' && notification.related_user) {
      navigate(`/profile/${notification.related_user.id}`);
    } else if (notification.type === 'message' && notification.related_user) {
      // Get or create conversation with the message sender
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/messages/conversations/${notification.related_user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          navigate(`/messages/${data.conversation.id}`);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to open conversation',
            status: 'error',
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Error opening conversation:', error);
        toast({
          title: 'Error',
          description: 'Failed to open conversation',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Center h="60vh">
          <Spinner size="xl" color="primary.500" thickness="4px" />
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading
            size="lg"
            bgGradient="linear(to-r, primary.500, accent.400)"
            bgClip="text"
          >
            Notifications
          </Heading>
          <Button
            size="sm"
            onClick={clearAll}
            colorScheme="red"
            variant="ghost"
            isDisabled={notifications.length === 0}
            borderRadius="full"
          >
            Clear All
          </Button>
        </HStack>

        {notifications.length === 0 ? (
          <Box
            bg="white"
            p={12}
            borderRadius="2xl"
            textAlign="center"
            borderWidth={1}
            borderColor="gray.100"
            boxShadow="sm"
          >
            <Text fontSize="4xl" mb={4}>
              🔔
            </Text>
            <Heading size="md" mb={2} color="text.800">
              No notifications yet
            </Heading>
            <Text color="gray.500">
              You'll see notifications here when people follow you or interact with your profile
            </Text>
          </Box>
        ) : (
          <VStack spacing={0} bg="white" borderRadius="2xl" borderWidth={1} borderColor="gray.100" overflow="hidden" boxShadow="sm">
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                {index > 0 && <Divider borderColor="gray.100" />}
                <HStack
                  w="full"
                  p={4}
                  spacing={4}
                  bg={notification.read ? 'white' : 'primary.50'}
                  cursor="pointer"
                  _hover={{ bg: notification.read ? 'gray.50' : 'primary.100' }}
                  onClick={() => handleNotificationClick(notification)}
                  transition="all 0.2s"
                >
                  <Avatar
                    size="md"
                    src={notification.related_user?.profile_picture_url || undefined}
                    name={notification.related_user?.name}
                    border="2px solid"
                    borderColor="accent.400"
                  />
                  <VStack align="start" flex={1} spacing={1}>
                    <Text fontWeight={notification.read ? 'normal' : 'semibold'} color="text.800">
                      {notification.message}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {getTimeAgo(notification.created_at)}
                    </Text>
                  </VStack>
                  <IconButton
                    aria-label="Delete notification"
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    borderRadius="full"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  />
                </HStack>
              </React.Fragment>
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default NotificationInbox;
