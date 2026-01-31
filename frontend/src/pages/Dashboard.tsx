import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Box,
  Center,
  Spinner,
  useToast,
  HStack,
  Avatar,
  Divider,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

interface Profile {
  id: string
  full_name: string
  email: string
  location: string
  industry: string
  bio: string
  skills: string[]
  phone?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  resume_filename?: string
  resume_filepath?: string
  resume_uploaded_at?: string
  created_at: string
  updated_at: string
}

interface Notification {
  id: string
  type: string
  message: string
  created_at: string
  related_user?: {
    id: string
    name: string
    profile_picture_url: string | null
  }
}

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    fetchProfile()
    fetchNotifications()
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setProfile(data)
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error loading profile',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/?limit=10`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'follow' && notification.related_user) {
      navigate(`/profile/${notification.related_user.id}`)
    }
  }

  if (loading) {
    return (
      <Center h="calc(100vh - 64px)">
        <Spinner size="xl" color="primary.500" thickness="4px" />
      </Center>
    )
  }

  if (!profile) {
    return (
      <Container maxW="container.md" py={16}>
        <Center>
          <VStack spacing={6}>
            <Box textAlign="center">
              <Heading size="lg" mb={3}>
                Welcome to Aurelia!
              </Heading>
              <Text color="text.500" fontSize="lg">
                Let's create your profile to get started
              </Text>
            </Box>
            <Button
              colorScheme="primary"
              size="lg"
              onClick={() => navigate('/profile/create')}
            >
              Create Profile
            </Button>
          </VStack>
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Welcome back, {profile.full_name}!
          </Heading>
          <Text color="text.500" fontSize="lg">
            Your dashboard
          </Text>
        </Box>

        <Box bg="surface.500" p={8} borderRadius="xl" boxShadow="lg" borderWidth="1px" borderColor="border.300">
          <VStack spacing={4} align="stretch">
            <Button
              colorScheme="primary"
              size="lg"
              onClick={() => navigate('/profile')}
            >
              View My Profile
            </Button>
            <Button
              variant="outline"
              colorScheme="primary"
              size="lg"
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </Button>
          </VStack>
        </Box>

        {/* Notifications Feed */}
        {notifications.length > 0 && (
          <Box bg="surface.500" p={6} borderRadius="xl" boxShadow="lg" borderWidth="1px" borderColor="border.300">
            <Heading size="md" mb={4}>
              Recent Activity
            </Heading>
            <VStack spacing={0} align="stretch">
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  {index > 0 && <Divider my={3} />}
                  <HStack
                    spacing={3}
                    cursor="pointer"
                    p={2}
                    borderRadius="md"
                    _hover={{ bg: 'secondary.200' }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Avatar
                      size="sm"
                      src={notification.related_user?.profile_picture_url || undefined}
                      name={notification.related_user?.name}
                    />
                    <VStack align="start" flex={1} spacing={0}>
                      <Text fontSize="sm">{notification.message}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {getTimeAgo(notification.created_at)}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        <Box bg="secondary.200" p={6} borderRadius="lg" borderWidth="1px" borderColor="border.300">
          <Heading size="md" mb={3}>
            Coming Soon
          </Heading>
          <VStack align="start" spacing={2}>
            <Text color="text.700">• Connect with other professionals</Text>
            <Text color="text.700">• Join and create events</Text>
            <Text color="text.700">• Send messages to your network</Text>
            <Text color="text.700">• Find mentorship opportunities</Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default Dashboard
