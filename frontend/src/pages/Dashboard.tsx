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

const Dashboard = () => {
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

  if (loading) {
    return (
      <Center h="calc(100vh - 64px)">
        <Spinner size="xl" color="purple.500" thickness="4px" />
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
              <Text color="gray.600" fontSize="lg">
                Let's create your profile to get started
              </Text>
            </Box>
            <Button
              colorScheme="purple"
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
          <Text color="gray.600" fontSize="lg">
            Your dashboard
          </Text>
        </Box>

        <Box bg="white" p={8} borderRadius="xl" boxShadow="lg">
          <VStack spacing={4} align="stretch">
            <Button
              colorScheme="purple"
              size="lg"
              onClick={() => navigate('/profile')}
            >
              View My Profile
            </Button>
            <Button
              variant="outline"
              colorScheme="purple"
              size="lg"
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </Button>
          </VStack>
        </Box>

        <Box bg="purple.50" p={6} borderRadius="lg">
          <Heading size="md" mb={3}>
            Coming Soon
          </Heading>
          <VStack align="start" spacing={2}>
            <Text color="gray.700">• Connect with other professionals</Text>
            <Text color="gray.700">• Join and create events</Text>
            <Text color="gray.700">• Send messages to your network</Text>
            <Text color="gray.700">• Find mentorship opportunities</Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default Dashboard
