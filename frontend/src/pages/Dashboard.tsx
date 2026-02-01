import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Box,
  useToast,
  HStack,
  Avatar,
  Divider,
  SimpleGrid,
  Center,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Insight } from '../types'
import { InsightsList } from '../components/Insights'
import { LoadingSpinner, ProfileCard } from '../components/common'

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
  recommendation_reason?: string
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
  const [insights, setInsights] = useState<Insight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<Profile[]>([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchNotifications()
    fetchInsightsFeed()
  }, [user])

  useEffect(() => {
    if (profile) {
      fetchRecommendations()
    }
  }, [profile])

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

  const fetchInsightsFeed = async () => {
    setInsightsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/insights/feed`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      }
    } catch (err) {
      console.error('Error fetching insights feed:', err)
    } finally {
      setInsightsLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    setRecommendationsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/profile/recommendations?limit=3`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data)
      } else {
        console.error('Error fetching recommendations:', response.statusText)
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err)
    } finally {
      setRecommendationsLoading(false)
    }
  }

  const handleLikeInsight = async (insightId: string) => {
    try {
      // Optimistically update UI
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, liked_by_user: true, likes_count: insight.likes_count + 1 }
          : insight
      ))

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      await fetch(`${import.meta.env.VITE_API_URL}/api/insights/${insightId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
    } catch (error) {
      console.error('Error liking insight:', error)
      // Revert optimistic update on error
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, liked_by_user: false, likes_count: insight.likes_count - 1 }
          : insight
      ))
    }
  }

  const handleUnlikeInsight = async (insightId: string) => {
    try {
      // Optimistically update UI
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, liked_by_user: false, likes_count: insight.likes_count - 1 }
          : insight
      ))

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      await fetch(`${import.meta.env.VITE_API_URL}/api/insights/${insightId}/unlike`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
    } catch (error) {
      console.error('Error unliking insight:', error)
      // Revert optimistic update on error
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, liked_by_user: true, likes_count: insight.likes_count + 1 }
          : insight
      ))
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

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.type === 'follow' && notification.related_user) {
      navigate(`/profile/${notification.related_user.id}`)
    } else if (notification.type === 'message' && notification.related_user) {
      // Get or create conversation with the message sender
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/messages/conversations/${notification.related_user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          navigate(`/messages/${data.conversation.id}`)
        }
      } catch (error) {
        console.error('Error opening conversation:', error)
        toast({
          title: 'Error',
          description: 'Failed to open conversation',
          status: 'error',
          duration: 3000,
        })
      }
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />
  }

  if (!profile) {
    return (
      <Container maxW="container.md" py={16}>
        <Center>
          <VStack spacing={6}>
            <Box
              textAlign="center"
              p={8}
              borderRadius="2xl"
              bg="white"
              boxShadow="lg"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Heading
                size="xl"
                mb={3}
                bgGradient="linear(to-r, primary.500, accent.400)"
                bgClip="text"
              >
                Welcome to Aurelia!
              </Heading>
              <Text color="text.500" fontSize="lg" mb={6}>
                Let's create your profile to get started
              </Text>
              <Button
                colorScheme="primary"
                size="lg"
                borderRadius="full"
                px={8}
                boxShadow="md"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.2s"
                onClick={() => navigate('/profile/create')}
              >
                Create Profile
              </Button>
            </Box>
          </VStack>
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Welcome Section with Gradient */}
        <Box
          bgGradient="linear(to-r, primary.500, accent.400)"
          p={8}
          borderRadius="2xl"
          boxShadow="xl"
          position="relative"
          overflow="hidden"
        >
          <Box position="relative" zIndex={1}>
            <Heading size="xl" color="white" mb={2} fontWeight="bold">
              Welcome back, {profile.full_name}!
            </Heading>
            <Text color="whiteAlpha.900" fontSize="lg" fontWeight="medium">
              Your personalized dashboard
            </Text>
          </Box>
          {/* Decorative element */}
          <Box
            position="absolute"
            right="-20px"
            top="-20px"
            width="200px"
            height="200px"
            borderRadius="full"
            bg="whiteAlpha.200"
            filter="blur(40px)"
          />
        </Box>

        {/* Notifications Feed */}
        {notifications.length > 0 && (
          <Box
            bg="white"
            p={6}
            borderRadius="2xl"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="gray.100"
            transition="all 0.3s"
            _hover={{ boxShadow: 'md' }}
          >
            <HStack justify="space-between" mb={4}>
              <HStack spacing={2}>
                <Box w={1} h={6} bg="accent.500" borderRadius="full" />
                <Heading size="md" fontWeight="semibold" color="text.800">
                  Recent Activity
                </Heading>
              </HStack>
            </HStack>
            <VStack spacing={0} align="stretch">
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  {index > 0 && <Divider my={2} borderColor="gray.100" />}
                  <HStack
                    spacing={3}
                    cursor="pointer"
                    p={3}
                    borderRadius="xl"
                    transition="all 0.2s"
                    _hover={{ bg: 'gray.50', transform: 'translateX(4px)' }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Avatar
                      size="sm"
                      src={notification.related_user?.profile_picture_url || undefined}
                      name={notification.related_user?.name}
                      border="2px solid"
                      borderColor="accent.400"
                    />
                    <VStack align="start" flex={1} spacing={0}>
                      <Text fontSize="sm" fontWeight="medium" color="text.800">{notification.message}</Text>
                      <Text fontSize="xs" color="text.500">
                        {getTimeAgo(notification.created_at)}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Insights Feed from Following */}
        <Box
          bg="white"
          p={6}
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          transition="all 0.3s"
          _hover={{ boxShadow: 'md' }}
        >
          <HStack justify="space-between" mb={4}>
            <HStack spacing={2}>
              <Box w={1} h={6} bgGradient="linear(to-b, primary.500, accent.500)" borderRadius="full" />
              <Heading size="md" fontWeight="semibold" color="text.800">
                Career Insights from Your Network
              </Heading>
            </HStack>
          </HStack>
          {insightsLoading ? (
            <LoadingSpinner message="Loading insights..." size="md" height="200px" />
          ) : insights.length > 0 ? (
            <InsightsList
              insights={insights}
              currentUserId={user?.id}
              onLike={handleLikeInsight}
              onUnlike={handleUnlikeInsight}
            />
          ) : (
            <Box textAlign="center" py={8}>
              <Text color="text.500" mb={4}>
                Follow people to see their career insights here
              </Text>
              <Button
                colorScheme="primary"
                size="md"
                borderRadius="full"
                onClick={() => navigate('/search')}
              >
                Find People to Follow
              </Button>
            </Box>
          )}
        </Box>

        {/* Profiles For You */}
        <Box
          bg="white"
          p={6}
          borderRadius="2xl"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          transition="all 0.3s"
          _hover={{ boxShadow: 'md' }}
        >
          <HStack justify="space-between" mb={5}>
            <Box>
              <HStack spacing={2} mb={1}>
                <Box w={1} h={6} bg="highlight.500" borderRadius="full" />
                <Heading size="md" fontWeight="semibold" color="text.800">Profiles For You</Heading>
              </HStack>
              <Text color="text.500" fontSize="sm" ml={3}>Matched based on your profile</Text>
            </Box>
            <Button
              variant="ghost"
              size="sm"
              colorScheme="primary"
              borderRadius="full"
              onClick={() => navigate('/search?mode=recommendations')}
            >
              See All
            </Button>
          </HStack>

          {recommendationsLoading ? (
            <LoadingSpinner message="Loading recommendations..." size="md" height="200px" />
          ) : recommendations.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {recommendations.map((rec) => (
                <ProfileCard key={rec.id} profile={rec} showActions={true} />
              ))}
            </SimpleGrid>
          ) : (
            <Box textAlign="center" py={6}>
              <Text color="text.500">No recommendations yet.</Text>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  )
}

export default Dashboard
