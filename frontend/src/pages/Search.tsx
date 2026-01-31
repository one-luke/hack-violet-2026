import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Icon,
  Wrap,
  WrapItem,
  Card,
  CardBody,
  Badge,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Marketing',
  'Design',
  'Engineering',
  'Sales',
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
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedCareerStatus, setSelectedCareerStatus] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    // Load all profiles initially
    handleSearch()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Please sign in to search profiles')
        return
      }

      // Build query params
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (selectedIndustry) params.append('industry', selectedIndustry)
      if (selectedLocation) params.append('location', selectedLocation)
      if (selectedSchool) params.append('school', selectedSchool)
      if (selectedCareerStatus) params.append('career_status', selectedCareerStatus)
      selectedSkills.forEach(skill => params.append('skills', skill))

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/profile/search?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to search profiles')
      }

      const data = await response.json()
      
      // Filter out current user's profile
      const currentUserId = session.user.id
      setProfiles(data.filter((p: Profile) => p.id !== currentUserId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error searching profiles',
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
    setSelectedIndustry('')
    setSelectedLocation('')
    setSelectedSchool('')
    setSelectedCareerStatus('')
    setSelectedSkills([])
    setSkillInput('')
    setHasSearched(false)
    // Reload all profiles
    setTimeout(() => handleSearch(), 100)
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
      setSelectedSkills([...selectedSkills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (skillInput.trim()) {
        handleAddSkill()
      } else {
        handleSearch()
      }
    }
  }

  const getCareerStatusLabel = (status?: string) => {
    const found = CAREER_STATUSES.find(s => s.value === status)
    return found ? found.label : status
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Search Profiles
          </Heading>
          <Text color="gray.600">
            Find and connect with other professionals
          </Text>
        </Box>

        {/* Search and Filter Section */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Main Search Bar */}
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by name, bio, industry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </InputGroup>
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                {/* Industry Filter */}
                <FormControl>
                  <FormLabel fontSize="sm">Industry</FormLabel>
                  <Select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    placeholder="All Industries"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Location Filter */}
                <FormControl>
                  <FormLabel fontSize="sm">Location</FormLabel>
                  <Input
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., New York"
                  />
                </FormControl>

                {/* School Filter */}
                <FormControl>
                  <FormLabel fontSize="sm">School</FormLabel>
                  <Input
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., MIT"
                  />
                </FormControl>

                {/* Career Status Filter */}
                <FormControl>
                  <FormLabel fontSize="sm">Career Status</FormLabel>
                  <Select
                    value={selectedCareerStatus}
                    onChange={(e) => setSelectedCareerStatus(e.target.value)}
                    placeholder="All Statuses"
                  >
                    {CAREER_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Skills Filter */}
              <FormControl>
                <FormLabel fontSize="sm">Filter by Skills</FormLabel>
                <HStack>
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a skill and press Enter"
                  />
                  {skillInput && (
                    <Button onClick={handleAddSkill} size="sm" colorScheme="primary">
                      Add
                    </Button>
                  )}
                </HStack>
                {selectedSkills.length > 0 && (
                  <Wrap mt={2}>
                    {selectedSkills.map((skill) => (
                      <WrapItem key={skill}>
                        <Tag
                          size="md"
                          colorScheme="primary"
                          cursor="pointer"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          {skill} ×
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </FormControl>

              {/* Action Buttons */}
              <HStack spacing={3}>
                <Button
                  colorScheme="primary"
                  onClick={handleSearch}
                  isLoading={loading}
                  leftIcon={<SearchIcon />}
                >
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Results Section */}
        <Box>
          <Heading size="md" mb={4}>
            {hasSearched
              ? `${profiles.length} ${profiles.length === 1 ? 'Profile' : 'Profiles'} Found`
              : 'Results will appear here'}
          </Heading>

          {loading ? (
            <Center py={12}>
              <Spinner size="xl" color="primary.500" thickness="4px" />
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {profiles.map((profile) => (
                <Card
                  key={profile.id}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: 'lg',
                  }}
                  onClick={() => navigate(`/profile/${profile.id}`)}
                >
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <HStack spacing={3} align="start">
                        <Avatar
                          name={profile.full_name}
                          src={profile.profile_picture_url}
                          size="lg"
                        />
                        <Box flex="1" minW="0">
                          <Heading size="sm" noOfLines={1}>
                            {profile.full_name}
                          </Heading>
                          <Text fontSize="sm" color="gray.600" noOfLines={1}>
                            {profile.email}
                          </Text>
                        </Box>
                      </HStack>

                      <VStack align="stretch" spacing={1}>
                        <HStack fontSize="sm">
                          <Icon viewBox="0 0 24 24" color="gray.500">
                            <path
                              fill="currentColor"
                              d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"
                            />
                          </Icon>
                          <Text>{profile.custom_industry || profile.industry}</Text>
                        </HStack>
                        <HStack fontSize="sm">
                          <Icon viewBox="0 0 24 24" color="gray.500">
                            <path
                              fill="currentColor"
                              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                            />
                          </Icon>
                          <Text>{profile.location}</Text>
                        </HStack>
                        {profile.current_school && (
                          <HStack fontSize="sm">
                            <Icon viewBox="0 0 24 24" color="gray.500">
                              <path
                                fill="currentColor"
                                d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"
                              />
                            </Icon>
                            <Text>{profile.current_school}</Text>
                          </HStack>
                        )}
                        {profile.career_status && (
                          <Badge width="fit-content" colorScheme="green">
                            {getCareerStatusLabel(profile.career_status)}
                          </Badge>
                        )}
                      </VStack>

                      <Text
                        fontSize="sm"
                        color="gray.600"
                        noOfLines={2}
                      >
                        {profile.bio}
                      </Text>

                      {profile.skills && profile.skills.length > 0 && (
                        <>
                          <Divider />
                          <Wrap>
                            {profile.skills.slice(0, 5).map((skill) => (
                              <WrapItem key={skill}>
                                <Tag size="sm" variant="outline">
                                  {skill}
                                </Tag>
                              </WrapItem>
                            ))}
                            {profile.skills.length > 5 && (
                              <WrapItem>
                                <Tag size="sm" variant="outline">
                                  +{profile.skills.length - 5} more
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
          )}

          {hasSearched && profiles.length === 0 && !loading && (
            <Center py={12}>
              <VStack spacing={4}>
                <SearchIcon boxSize={16} color="gray.400" />
                <Heading size="md" color="gray.600">
                  No profiles found
                </Heading>
                <Text color="gray.500">
                  Try adjusting your search criteria
                </Text>
              </VStack>
            </Center>
          )}
        </Box>
      </VStack>
    </Container>
  )
}
