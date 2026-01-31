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
import { Profile } from '../types'

const ViewProfile = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error) throw error

      const profileData = data as Profile
      setProfile(profileData)
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error loading profile',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
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
          <Heading size="lg">My Profile</Heading>
          <Button
            leftIcon={<EditIcon />}
            colorScheme="primary"
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </Button>
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
                {profile.phone && (
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

            {/* Resume Section */}
            {profile.resume_filepath && (
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
      </VStack>
    </Container>
  )
}

export default ViewProfile
