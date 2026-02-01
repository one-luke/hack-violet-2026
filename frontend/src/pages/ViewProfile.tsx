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
  Divider,
  SimpleGrid,
  Link,
  Icon,
  Tag,
} from '@chakra-ui/react'
import { ExternalLinkIcon, EditIcon, DownloadIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Profile, Insight } from '../types'
import { InsightsList } from '../components/Insights'

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
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <HStack>
            {!isOwnProfile && (
              <Button
                leftIcon={<Icon viewBox="0 0 24 24">
                  <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </Icon>}
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
            )}
            <Heading size="lg">{isOwnProfile ? 'My Profile' : `${profile.full_name}'s Profile`}</Heading>
          </HStack>
          <HStack>
            {!isOwnProfile && (
              <>
                <Button
                  colorScheme="purple"
                  variant="outline"
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
                  colorScheme={isFollowing ? 'gray' : 'primary'}
                  onClick={handleFollowToggle}
                  isLoading={followLoading}
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
                colorScheme="primary"
                onClick={() => navigate('/profile/edit')}
              >
                Edit Profile
              </Button>
            )}
          </HStack>
        </HStack>

        <Box bg="surface.500" p={8} borderRadius="xl" boxShadow="lg" borderWidth="1px" borderColor="border.300">
          <VStack spacing={6} align="stretch">
            {/* Header Section */}
            <HStack spacing={6} align="start">
              <Avatar
                size="2xl"
                name={profile.full_name}
                src={profile.profile_picture_url}
                bg="primary.500"
                color="text.800"
              />
              <VStack align="start" flex={1} spacing={2}>
                <Heading size="lg">{profile.full_name}</Heading>
                <HStack spacing={4}>
                  <Text fontSize="sm" color="text.600">
                    <Text as="span" fontWeight="bold">{followersCount}</Text> followers
                  </Text>
                  <Text fontSize="sm" color="text.600">
                    <Text as="span" fontWeight="bold">{followingCount}</Text> following
                  </Text>
                </HStack>
                <Badge colorScheme="primary" fontSize="md" px={3} py={1} borderRadius="full">
                  {profile.industry}
                </Badge>
                {profile.career_status && (
                  <Badge colorScheme="info" fontSize="sm" px={3} py={1} borderRadius="full">
                    {profile.career_status === 'in_industry' && '💼 Currently in Industry'}
                    {profile.career_status === 'seeking_opportunities' && '🔍 Seeking Opportunities'}
                    {profile.career_status === 'student' && '🎓 Student'}
                    {profile.career_status === 'career_break' && '✨ Career Break'}
                  </Badge>
                )}
                {profile.current_school && (
                  <Text color="text.700" fontSize="md" fontWeight="medium">
                    🎓 {profile.current_school}
                  </Text>
                )}
                {profile.location && (
                  <Text color="text.500" fontSize="md">
                    📍 {profile.location}
                  </Text>
                )}
              </VStack>
            </HStack>

            <Divider />

            {/* Bio Section */}
            <Box>
              <Heading size="md" mb={3}>About</Heading>
              <Text color="text.700" whiteSpace="pre-wrap">
                {profile.bio}
              </Text>
            </Box>

            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Heading size="md" mb={3}>Skills & Interests</Heading>
                  <HStack spacing={2} flexWrap="wrap">
                    {profile.skills.map((skill) => (
                      <Tag
                        key={skill}
                        size="lg"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="primary"
                      >
                        {skill}
                      </Tag>
                    ))}
                  </HStack>
                </Box>
              </>
            )}

            {/* Contact & Links Section */}
            <Divider />
            <Box>
              <Heading size="md" mb={3}>Contact & Links</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Box>
                  <Text fontWeight="semibold" color="text.500" fontSize="sm">Email</Text>
                  <Text>{profile.email}</Text>
                </Box>
                {isOwnProfile && profile.phone && (
                  <Box>
                    <Text fontWeight="semibold" color="text.500" fontSize="sm">Phone</Text>
                    <Text>{profile.phone}</Text>
                  </Box>
                )}
                {profile.linkedin_url && (
                  <Box>
                    <Text fontWeight="semibold" color="text.500" fontSize="sm">LinkedIn</Text>
                    <Link href={profile.linkedin_url} isExternal color="primary.700">
                      View Profile <Icon as={ExternalLinkIcon} mx="2px" />
                    </Link>
                  </Box>
                )}
                {profile.github_url && (
                  <Box>
                    <Text fontWeight="semibold" color="text.500" fontSize="sm">GitHub</Text>
                    <Link href={profile.github_url} isExternal color="primary.700">
                      View Profile <Icon as={ExternalLinkIcon} mx="2px" />
                    </Link>
                  </Box>
                )}
                {profile.portfolio_url && (
                  <Box>
                    <Text fontWeight="semibold" color="text.500" fontSize="sm">Portfolio</Text>
                    <Link href={profile.portfolio_url} isExternal color="primary.700">
                      Visit Website <Icon as={ExternalLinkIcon} mx="2px" />
                    </Link>
                  </Box>
                )}
              </SimpleGrid>
            </Box>

            {/* Resume Section - Only for own profile */}
            {isOwnProfile && profile.resume_filepath && (
              <>
                <Divider />
                <Box>
                  <Heading size="md" mb={3}>Resume</Heading>
                  <HStack>
                    <Button
                      leftIcon={<DownloadIcon />}
                      colorScheme="primary"
                      variant="outline"
                      onClick={downloadResume}
                    >
                      Download Resume
                    </Button>
                    {profile.resume_uploaded_at && (
                      <Text fontSize="sm" color="text.500">
                        Uploaded {new Date(profile.resume_uploaded_at).toLocaleDateString()}
                      </Text>
                    )}
                  </HStack>
                </Box>
              </>
            )}
          </VStack>
        </Box>

        {/* Insights Section */}
        <Box bg="surface.500" p={8} borderRadius="xl" boxShadow="lg" borderWidth="1px" borderColor="border.300">
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" align="center">
              <Heading size="md">Career Insights</Heading>
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
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default ViewProfile
