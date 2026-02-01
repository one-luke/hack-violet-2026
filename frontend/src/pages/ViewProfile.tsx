import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  Badge,
  SimpleGrid,
  Link,
  Icon,
  Tag,
  Card,
  CardBody,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { ExternalLinkIcon, EditIcon, DownloadIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Profile, Insight } from '../types'
import { InsightsList } from '../components/Insights'

// Helper function to ensure URLs have proper protocol
const ensureHttps = (url: string | null | undefined): string => {
  if (!url) return ''
  const trimmedUrl = url.trim()
  if (!trimmedUrl) return ''
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl
  }
  return `https://${trimmedUrl}`
}

const ViewProfile = () => {
  const { user } = useAuth()
  const { userId } = useParams<{ userId?: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const [insights, setInsights] = useState<Insight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  
  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === user?.id
  const profileIdToFetch = userId || user?.id

  useEffect(() => {
    fetchProfile()
    if (!isOwnProfile && profileIdToFetch) {
      fetchFollowStatus()
    }
    if (profileIdToFetch) {
      fetchFollowStats()
      fetchInsights()
    }
  }, [userId, user])

  const fetchProfile = async () => {
    if (!profileIdToFetch) return
    
    try {
      if (isOwnProfile) {
        // Fetch own profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileIdToFetch)
          .single()

        if (error) throw error
        setProfile(data as Profile)
      } else {
        // Fetch another user's profile via backend API
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')

        const response = await fetch(
          `http://localhost:5001/api/profile/${profileIdToFetch}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        )

        if (!response.ok) throw new Error('Failed to fetch profile')
        const data = await response.json()
        setProfile(data as Profile)
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error loading profile',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      if (isOwnProfile) {
        navigate('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchFollowStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !profileIdToFetch) return

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/follows/is-following/${profileIdToFetch}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.is_following)
      }
    } catch (error) {
      console.error('Error fetching follow status:', error)
    }
  }

  const fetchFollowStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !profileIdToFetch) return

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/follows/stats/${profileIdToFetch}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setFollowersCount(data.followers_count)
        setFollowingCount(data.following_count)
      }
    } catch (error) {
      console.error('Error fetching follow stats:', error)
    }
  }

  const handleFollowToggle = async () => {
    if (!profileIdToFetch || isOwnProfile) return

    setFollowLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const endpoint = isFollowing
        ? `${import.meta.env.VITE_API_URL}/api/follows/unfollow/${profileIdToFetch}`
        : `${import.meta.env.VITE_API_URL}/api/follows/follow/${profileIdToFetch}`

      const response = await fetch(endpoint, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) throw new Error(isFollowing ? 'Failed to unfollow' : 'Failed to follow')

      setIsFollowing(!isFollowing)
      setFollowersCount((prev) => isFollowing ? prev - 1 : prev + 1)
      
      toast({
        title: isFollowing ? 'Unfollowed' : 'Following',
        description: isFollowing
          ? `You unfollowed ${profile?.full_name}`
          : `You are now following ${profile?.full_name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setFollowLoading(false)
    }
  }

  const fetchInsights = async () => {
    if (!profileIdToFetch) return
    
    setInsightsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${profileIdToFetch}/insights`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setInsightsLoading(false)
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
      if (!session) throw new Error('Not authenticated')

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/insights/${insightId}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      )
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
      if (!session) throw new Error('Not authenticated')

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/insights/${insightId}/unlike`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      )
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

  const handleDeleteInsight = async (insightId: string) => {
    if (!confirm('Are you sure you want to delete this insight?')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/insights/${insightId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      )

      if (response.ok) {
        toast({
          title: 'Insight deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        fetchInsights()
      }
    } catch (error) {
      console.error('Error deleting insight:', error)
    }
  }

  const downloadResume = async () => {
    if (!profile?.resume_filepath) return

    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(profile.resume_filepath)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = profile.resume_filename || 'resume.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error: any) {
      toast({
        title: 'Error downloading resume',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
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
            <Text fontSize="lg">Profile not found</Text>
            <Button colorScheme="primary" onClick={() => navigate('/profile/create')}>
              Create Profile
            </Button>
          </VStack>
        </Center>
      </Container>
    )
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)">
      {/* Hero Header Section with Gradient Background */}
      <Box
        bgGradient="linear(135deg, primary.600 0%, primary.800 100%)"
        color="white"
        py={8}
        boxShadow="lg"
      >
        <Container maxW="container.lg">
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" align="start">
              <HStack spacing={4}>
                {!isOwnProfile && (
                  <Button
                    leftIcon={<Icon viewBox="0 0 24 24">
                      <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </Icon>}
                    variant="ghost"
                    color="white"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </Button>
                )}
                <Avatar
                  size="xl"
                  name={profile.full_name}
                  src={profile.profile_picture_url}
                  border="4px solid"
                  borderColor="whiteAlpha.400"
                  boxShadow="xl"
                />
                <VStack align="start" spacing={1}>
                  <Heading size="xl">{profile.full_name}</Heading>
                  <HStack spacing={4} color="whiteAlpha.900">
                    <HStack spacing={1}>
                      <Text fontSize="lg" fontWeight="bold">{followersCount}</Text>
                      <Text fontSize="sm">followers</Text>
                    </HStack>
                    <Text>•</Text>
                    <HStack spacing={1}>
                      <Text fontSize="lg" fontWeight="bold">{followingCount}</Text>
                      <Text fontSize="sm">following</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </HStack>
              <HStack spacing={3}>
                {!isOwnProfile && (
                  <>
                    <Button
                      bg="whiteAlpha.200"
                      color="white"
                      _hover={{ bg: 'whiteAlpha.300' }}
                      backdropFilter="blur(10px)"
                      onClick={async () => {
                        try {
                          const { data: { session } } = await supabase.auth.getSession()
                          if (!session || !profileIdToFetch) return

                          const response = await fetch(
                            `${import.meta.env.VITE_API_URL}/api/messages/conversations/${profileIdToFetch}`,
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
                          toast({
                            title: 'Error',
                            description: 'Failed to start conversation',
                            status: 'error',
                            duration: 3000,
                            isClosable: true,
                          })
                        }
                      }}
                      leftIcon={
                        <Icon viewBox="0 0 24 24">
                          <path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                        </Icon>
                      }
                    >
                      Message
                    </Button>
                    <Button
                      bg={isFollowing ? 'whiteAlpha.200' : 'white'}
                      color={isFollowing ? 'white' : 'primary.600'}
                      _hover={{ bg: isFollowing ? 'whiteAlpha.300' : 'gray.100' }}
                      onClick={handleFollowToggle}
                      isLoading={followLoading}
                      fontWeight="bold"
                      leftIcon={
                        <Icon viewBox="0 0 24 24">
                          {isFollowing ? (
                            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          ) : (
                            <path fill="currentColor" d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          )}
                        </Icon>
                      }
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  </>
                )}
                {isOwnProfile && (
                  <Button
                    leftIcon={<EditIcon />}
                    bg="white"
                    color="primary.600"
                    _hover={{ bg: 'gray.100' }}
                    fontWeight="bold"
                    onClick={() => navigate('/profile/edit')}
                  >
                    Edit Profile
                  </Button>
                )}
              </HStack>
            </HStack>

            {/* Quick Info Pills */}
            <HStack spacing={3} flexWrap="wrap">
              <Badge colorScheme="purple" fontSize="md" px={4} py={2} borderRadius="full" bg="whiteAlpha.300" color="white">
                {profile.industry}
              </Badge>
              {profile.career_status && (
                <Badge fontSize="md" px={4} py={2} borderRadius="full" bg="whiteAlpha.300" color="white">
                  {profile.career_status === 'in_industry' && '💼 In Industry'}
                  {profile.career_status === 'seeking_opportunities' && '🔍 Seeking Opportunities'}
                  {profile.career_status === 'student' && '🎓 Student'}
                  {profile.career_status === 'career_break' && '✨ Career Break'}
                </Badge>
              )}
              {profile.location && (
                <Badge fontSize="md" px={4} py={2} borderRadius="full" bg="whiteAlpha.300" color="white">
                  📍 {profile.location}
                </Badge>
              )}
              {profile.current_school && (
                <Badge fontSize="md" px={4} py={2} borderRadius="full" bg="whiteAlpha.300" color="white">
                  🎓 {profile.current_school}
                </Badge>
              )}
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="stretch">
          {/* About Card */}
          <Card shadow="md" borderRadius="xl" overflow="hidden">
            <CardBody p={6}>
              <HStack spacing={2} mb={4}>
                <Box w={1} h={6} bgGradient="linear(to-b, primary.500, accent.500)" borderRadius="full" />
                <Heading size="md" color="gray.800">About</Heading>
              </HStack>
              <Text color="gray.700" fontSize="md" lineHeight="1.8" whiteSpace="pre-wrap">
                {profile.bio}
              </Text>
            </CardBody>
          </Card>

          {/* Two Column Layout for Skills and Info */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Skills Card */}
            {profile.skills && profile.skills.length > 0 && (
              <Card shadow="md" borderRadius="xl" h="fit-content">
                <CardBody p={6}>
                  <HStack spacing={2} mb={4}>
                    <Box w={1} h={6} bg="accent.500" borderRadius="full" />
                    <Heading size="md" color="gray.800">Skills & Interests</Heading>
                  </HStack>
                  <Wrap spacing={2}>
                    {profile.skills.map((skill) => (
                      <WrapItem key={skill}>
                        <Tag
                          size="lg"
                          borderRadius="full"
                          colorScheme="primary"
                          fontWeight="medium"
                          px={4}
                          py={2}
                        >
                          {skill}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CardBody>
              </Card>
            )}

            {/* Contact & Links Card */}
            <Card shadow="md" borderRadius="xl" h="fit-content">
              <CardBody p={6}>
                <HStack spacing={2} mb={4}>
                  <Box w={1} h={6} bg="highlight.500" borderRadius="full" />
                  <Heading size="md" color="gray.800">Contact & Links</Heading>
                </HStack>
                <VStack spacing={4} align="stretch">
                  <Box p={3} bg="gray.50" borderRadius="lg">
                    <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" mb={1}>Email</Text>
                    <Text fontWeight="medium" color="gray.800">{profile.email}</Text>
                  </Box>
                  {isOwnProfile && profile.phone && (
                    <Box p={3} bg="gray.50" borderRadius="lg">
                      <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" mb={1}>Phone</Text>
                      <Text fontWeight="medium" color="gray.800">{profile.phone}</Text>
                    </Box>
                  )}
                  {profile.linkedin_url && (
                    <Box p={3} bg="blue.50" borderRadius="lg">
                      <Text fontSize="xs" fontWeight="semibold" color="blue.600" textTransform="uppercase" mb={1}>LinkedIn</Text>
                      <Link href={ensureHttps(profile.linkedin_url)} isExternal color="blue.600" fontWeight="medium" _hover={{ color: 'blue.700' }}>
                        View Profile <Icon as={ExternalLinkIcon} mx="2px" />
                      </Link>
                    </Box>
                  )}
                  {profile.github_url && (
                    <Box p={3} bg="purple.50" borderRadius="lg">
                      <Text fontSize="xs" fontWeight="semibold" color="purple.600" textTransform="uppercase" mb={1}>GitHub</Text>
                      <Link href={ensureHttps(profile.github_url)} isExternal color="purple.600" fontWeight="medium" _hover={{ color: 'purple.700' }}>
                        View Profile <Icon as={ExternalLinkIcon} mx="2px" />
                      </Link>
                    </Box>
                  )}
                  {profile.portfolio_url && (
                    <Box p={3} bg="green.50" borderRadius="lg">
                      <Text fontSize="xs" fontWeight="semibold" color="green.600" textTransform="uppercase" mb={1}>Portfolio</Text>
                      <Link href={ensureHttps(profile.portfolio_url)} isExternal color="green.600" fontWeight="medium" _hover={{ color: 'green.700' }}>
                        Visit Website <Icon as={ExternalLinkIcon} mx="2px" />
                      </Link>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Resume Card - Only for own profile */}
          {isOwnProfile && profile.resume_filepath && (
            <Card shadow="md" borderRadius="xl">
              <CardBody p={6}>
                <HStack justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Box w={1} h={6} bg="purple.500" borderRadius="full" />
                    <Box>
                      <Heading size="md" mb={1} color="gray.800">Resume</Heading>
                      {profile.resume_uploaded_at && (
                        <Text fontSize="sm" color="gray.500">
                          Uploaded {new Date(profile.resume_uploaded_at).toLocaleDateString()}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                  <Button
                    leftIcon={<DownloadIcon />}
                    colorScheme="primary"
                    onClick={downloadResume}
                  >
                    Download
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* Insights Section */}
          <Card shadow="md" borderRadius="xl">
            <CardBody p={6}>
              <HStack justify="space-between" align="center" mb={4}>
                <HStack spacing={2}>
                  <Box w={1} h={6} bg="cyan.500" borderRadius="full" />
                  <Heading size="md" color="gray.800">Career Insights</Heading>
                </HStack>
                {isOwnProfile && (
                  <Button
                    colorScheme="primary"
                    size="sm"
                    onClick={() => navigate('/insights/create')}
                  >
                    Share Insight
                  </Button>
                )}
              </HStack>

              {insightsLoading ? (
                <Center py={8}>
                  <Spinner size="md" color="primary.500" />
                </Center>
              ) : (
                <InsightsList
                  insights={insights}
                  currentUserId={user?.id}
                  onLike={handleLikeInsight}
                  onUnlike={handleUnlikeInsight}
                  onDelete={isOwnProfile ? handleDeleteInsight : undefined}
                />
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}

export default ViewProfile
