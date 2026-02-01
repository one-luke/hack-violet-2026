import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Container,
  Input,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Heading,
  Text,
  Tag,
  Select,
  FormControl,
  FormLabel,
  Avatar,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useToast,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Icon,
  Wrap,
  WrapItem,
  Card,
  CardBody,
  Badge,
  Flex,
  ButtonGroup,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { supabase } from '../lib/supabase'
import { Profile, Insight } from '../types'
import { InsightCard } from '../components/Insights'

const INDUSTRIES = [
  'Software Engineering',
  'Data Science',
  'Manufacturing',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Robotics',
  'Aerospace',
  'Research & Development',
  'Quality Assurance',
  'Other',
]

const CAREER_STATUSES = [
  { value: 'in_industry', label: 'Currently in Industry' },
  { value: 'seeking_opportunities', label: 'Seeking Opportunities' },
  { value: 'student', label: 'Student' },
  { value: 'career_break', label: 'Career Break' },
]

export default function Search() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [searchType, setSearchType] = useState<'profiles' | 'insights'>('profiles')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(true)
  const [generatingEmbeddings, setGeneratingEmbeddings] = useState(false)

  useEffect(() => {
    handleSearch()
  }, [])

  // Trigger search when searchType changes
  useEffect(() => {
    if (hasSearched) {
      handleSearch()
    }
  }, [searchType])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = (params.get('q') || '').trim()
    if (q && q !== searchQuery) {
      setSearchQuery(q)
      setHasSearched(false)
      handleSearch({ query: q })
    }
  }, [location.search])

  const handleSearch = async (override?: { query?: string }) => {
    setError('')
    setHasSearched(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Please sign in to search')
        return
      }

      const effectiveQuery = override?.query ?? searchQuery
      
      // Show loading
      setLoading(true)

      const params = new URLSearchParams()
      if (effectiveQuery) params.append('q', effectiveQuery)

      const apiBase = import.meta.env.VITE_API_URL || ''
      
      if (searchType === 'profiles') {
        const apiUrl = `${apiBase}/api/profile/search?${params.toString()}`
        console.log('Fetching profiles from:', apiUrl)
        
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        console.log('Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Search error:', errorText)
          throw new Error(`Failed to search profiles: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        const currentUserId = session.user.id
        setProfiles(data.filter((p: Profile) => p.id !== currentUserId))
        setInsights([])
      } else {
        // Search insights
        const apiUrl = `${apiBase}/api/insights/search?${params.toString()}`
        console.log('Fetching insights from:', apiUrl)
        
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Search error:', errorText)
          throw new Error(`Failed to search insights: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        setInsights(data)
        setProfiles([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: `Error searching ${searchType}`,
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setProfiles([])
    setInsights([])
    setTimeout(() => handleSearch({ query: '' }), 100)
  }

  const handleSearchTypeChange = (type: 'profiles' | 'insights') => {
    setSearchType(type)
    setLoading(true)
  }

  const handleGenerateEmbeddings = async () => {
    setGeneratingEmbeddings(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to generate embeddings',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }

      const apiBase = import.meta.env.VITE_API_URL || ''
      const endpoint = searchType === 'profiles' 
        ? `${apiBase}/api/profile/embeddings/generate`
        : `${apiBase}/api/insights/embeddings/generate`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate embeddings')
      }

      const data = await response.json()
      
      toast({
        title: 'Embeddings generated',
        description: `Updated ${data.updated} ${searchType}, ${data.failed} failed out of ${data.total} total`,
        status: 'success',
        duration: 7000,
        isClosable: true,
      })
    } catch (err) {
      toast({
        title: 'Error generating embeddings',
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setGeneratingEmbeddings(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const getCareerStatusLabel = (status?: string) => {
    const found = CAREER_STATUSES.find(s => s.value === status)
    return found ? found.label : status
  }

  const handleLikeInsight = async (insightId: string) => {
    try {
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
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, liked_by_user: false, likes_count: insight.likes_count - 1 }
          : insight
      ))
    }
  }

  const handleUnlikeInsight = async (insightId: string) => {
    try {
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
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, liked_by_user: true, likes_count: insight.likes_count + 1 }
          : insight
      ))
    }
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <Box
        bgGradient="linear(to-b, white, gray.50)"
        pt={12}
        pb={12}
      >
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <VStack align="start" spacing={2}>
              <Heading
                size="2xl"
                bgGradient="linear(to-r, primary.600, accent.500)"
                bgClip="text"
                fontWeight="extrabold"
                letterSpacing="tight"
              >
                Discover
              </Heading>
              <Text color="gray.600" fontSize="lg" fontWeight="medium">
                Find and connect with women in STEM
              </Text>
            </VStack>

            <Box maxW="1000px" mx="auto" w="full">
              <VStack spacing={4} w="full">
                <Box
                  w="full"
                  position="relative"
                  bg="white"
                  borderRadius="full"
                  shadow="lg"
                  border="1px"
                  borderColor="gray.100"
                >
                  <Flex align="center" gap={2} p={2}>
                  <InputGroup size="lg" flex="1">
                    <InputLeftElement h="full" pl={2} pointerEvents="none">
                      <SearchIcon color="primary.500" boxSize={5} />
                    </InputLeftElement>
                    <Input
                      placeholder={searchType === 'profiles' 
                        ? "Search by name, location, school, industry, skills..."
                        : "Search insights by title, content, or topic..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      borderRadius="full"
                      fontSize="md"
                      h="56px"
                      pl="52px"
                      pr={4}
                      border="none"
                      bg="transparent"
                      _placeholder={{ color: 'gray.400' }}
                      _focus={{
                        outline: 'none',
                        boxShadow: 'none'
                      }}
                    />
                  </InputGroup>
                  
                  {searchQuery && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleClearFilters}
                      isDisabled={loading}
                      borderRadius="full"
                      fontSize="sm"
                      color="gray.500"
                      mr={2}
                    >
                      Clear
                    </Button>
                  )}

                  <Button
                    colorScheme="primary"
                    onClick={() => handleSearch()}
                    isLoading={loading}
                    loadingText="Searching..."
                    leftIcon={!loading ? <SearchIcon /> : undefined}
                    size="lg"
                    px={8}
                    h="52px"
                    borderRadius="full"
                    fontWeight="bold"
                    fontSize="md"
                    shadow="sm"
                    flexShrink={0}
                    _hover={{
                      shadow: 'md',
                      transform: 'translateY(-1px)',
                      bgGradient: 'linear(to-r, primary.600, primary.500)'
                    }}
                    _active={{
                      transform: 'translateY(0)',
                      shadow: 'sm'
                    }}
                    transition="all 0.2s"
                  >
                    Search
                  </Button>
                </Flex>
              </Box>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" pt={8} pb={12}>
        <VStack spacing={6} align="stretch">
          {error && (
            <Alert status="error" borderRadius="xl" bg="red.50" borderColor="red.200" borderWidth="1px">
              <AlertIcon color="red.500" />
              <Text color="red.700">{error}</Text>
            </Alert>
          )}

            {hasSearched && (
              <HStack justify="space-between" align="center" mb={6}>
                <Heading size="md" color="text.700" fontWeight="semibold">
                  {loading ? (
                    <HStack spacing={2}>
                      <Text>Searching {searchType}...</Text>
                    </HStack>
                  ) : (
                    <>
                      {searchType === 'profiles' 
                        ? `${profiles.length} ${profiles.length === 1 ? 'Profile' : 'Profiles'} Found`
                        : `${insights.length} ${insights.length === 1 ? 'Insight' : 'Insights'} Found`}
                    </>
                  )}
                </Heading>
                
                <HStack spacing={3}>
                  <ButtonGroup size="sm" isAttached variant="outline" spacing={0}>
                    <Button
                      onClick={() => handleSearchTypeChange('profiles')}
                      bg={searchType === 'profiles' ? 'primary.500' : 'white'}
                      color={searchType === 'profiles' ? 'white' : 'gray.600'}
                      borderColor="gray.200"
                      borderRightWidth={searchType === 'profiles' ? '1px' : '0'}
                      _hover={{
                        bg: searchType === 'profiles' ? 'primary.600' : 'gray.50'
                      }}
                      fontWeight="semibold"
                      px={5}
                      h="36px"
                      isDisabled={loading}
                    >
                      Profiles
                    </Button>
                    <Button
                      onClick={() => handleSearchTypeChange('insights')}
                      bg={searchType === 'insights' ? 'primary.500' : 'white'}
                      color={searchType === 'insights' ? 'white' : 'gray.600'}
                      borderColor="gray.200"
                      _hover={{
                        bg: searchType === 'insights' ? 'primary.600' : 'gray.50'
                      }}
                      fontWeight="semibold"
                      px={5}
                      h="36px"
                      isDisabled={loading}
                    >
                      Insights
                    </Button>
                  </ButtonGroup>

                  {/* <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="purple"
                    onClick={handleGenerateEmbeddings}
                    isLoading={generatingEmbeddings}
                    loadingText="Generating..."
                    fontSize="xs"
                  >
                    Regenerate Embeddings
                  </Button> */}
                </HStack>
              </HStack>
            )}

            {loading ? (
              <Center py={20}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="primary.500" thickness="4px" speed="0.8s" />
                  <VStack spacing={1}>
                    <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                      Searching...
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Looking for {searchType}
                    </Text>
                  </VStack>
                </VStack>
              </Center>
            ) : searchType === 'profiles' ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {profiles.map((profile) => (
                  <Card
                    key={profile.id}
                    cursor="pointer"
                    transition="all 0.3s ease"
                    bg="white"
                    borderRadius="2xl"
                    borderWidth="1px"
                    borderColor="gray.100"
                    overflow="hidden"
                    shadow="sm"
                    _hover={{
                      transform: 'translateY(-4px)',
                      shadow: 'xl',
                      borderColor: 'primary.200',
                    }}
                    onClick={() => navigate(`/profile/${profile.id}`)}
                  >
                    <CardBody p={6}>
                      <VStack align="stretch" spacing={4}>
                        <HStack spacing={4} align="start">
                          <Avatar
                            name={profile.full_name}
                            src={profile.profile_picture_url}
                            size="lg"
                            border="3px solid"
                            borderColor="primary.100"
                            shadow="sm"
                          />
                          <Box flex="1" minW="0">
                            <Heading size="sm" noOfLines={1} fontWeight="bold" mb={1}>
                              {profile.full_name}
                            </Heading>
                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                              {profile.email}
                            </Text>
                          </Box>
                        </HStack>

                        <VStack align="stretch" spacing={2}>
                          <HStack fontSize="sm" color="gray.700">
                            <Icon viewBox="0 0 24 24" color="primary.500" boxSize={4}>
                              <path
                                fill="currentColor"
                                d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"
                              />
                            </Icon>
                            <Text fontWeight="medium" noOfLines={1}>{profile.custom_industry || profile.industry}</Text>
                          </HStack>
                          {profile.location && (
                            <HStack fontSize="sm" color="gray.700">
                              <Icon viewBox="0 0 24 24" color="accent.500" boxSize={4}>
                                <path
                                  fill="currentColor"
                                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                />
                              </Icon>
                              <Text noOfLines={1}>{profile.location}</Text>
                            </HStack>
                          )}
                          {profile.current_school && (
                            <HStack fontSize="sm" color="gray.700">
                              <Icon viewBox="0 0 24 24" color="highlight.500" boxSize={4}>
                                <path
                                  fill="currentColor"
                                  d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"
                                />
                              </Icon>
                              <Text noOfLines={1}>{profile.current_school}</Text>
                            </HStack>
                          )}
                          {profile.career_status && (
                            <Badge
                              width="fit-content"
                              colorScheme="purple"
                              fontSize="xs"
                              px={3}
                              py={1}
                              borderRadius="full"
                              fontWeight="semibold"
                            >
                              {getCareerStatusLabel(profile.career_status)}
                            </Badge>
                          )}
                        </VStack>

                        {profile.bio && (
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            noOfLines={3}
                            lineHeight="tall"
                          >
                            {profile.bio}
                          </Text>
                        )}

                        {profile.skills && profile.skills.length > 0 && (
                          <>
                            <Divider borderColor="gray.200" />
                            <Wrap spacing={2}>
                              {profile.skills.slice(0, 4).map((skill) => (
                                <WrapItem key={skill}>
                                  <Tag
                                    size="sm"
                                    variant="subtle"
                                    colorScheme="purple"
                                    borderRadius="full"
                                    fontSize="xs"
                                    fontWeight="medium"
                                  >
                                    {skill}
                                  </Tag>
                                </WrapItem>
                              ))}
                              {profile.skills.length > 4 && (
                                <WrapItem>
                                  <Tag
                                    size="sm"
                                    variant="subtle"
                                    colorScheme="gray"
                                    borderRadius="full"
                                    fontSize="xs"
                                  >
                                    +{profile.skills.length - 4}
                                  </Tag>
                                </WrapItem>
                              )}
                            </Wrap>
                          </>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <VStack spacing={0} align="stretch">
                {insights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onLike={handleLikeInsight}
                    onUnlike={handleUnlikeInsight}
                    isOwner={false}
                  />
                ))}
              </VStack>
            )}

            {hasSearched && ((searchType === 'profiles' && profiles.length === 0) || (searchType === 'insights' && insights.length === 0)) && !loading && (
              <Center py={20}>
                <VStack spacing={4}>
                  <Box
                    p={6}
                    borderRadius="full"
                    bg="gray.100"
                  >
                    <SearchIcon boxSize={12} color="gray.400" />
                  </Box>
                  <Heading size="md" color="gray.600" fontWeight="semibold">
                    No {searchType} found
                  </Heading>
                  <Text color="gray.500" textAlign="center" maxW="md">
                    {searchQuery 
                      ? `We couldn't find any ${searchType} matching "${searchQuery}". Try adjusting your search terms or try a different query.`
                      : `No ${searchType} available yet. ${searchType === 'profiles' ? 'Be the first to create a profile!' : 'Check back later for new insights.'}`
                    }
                  </Text>
                  {searchQuery && (
                    <Button
                      onClick={handleClearFilters}
                      colorScheme="primary"
                      variant="ghost"
                      mt={2}
                    >
                      Clear search and view all
                    </Button>
                  )}
                </VStack>
              </Center>
            )}
        </VStack>
      </Container>
    </Box>
  )
}
