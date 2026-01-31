import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const navigate = useNavigate()
  const toast = useToast()
  const { signUp } = useAuth()

  const validateForm = () => {
    const newErrors = {}
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const { data, error } = await signUp(email, password, fullName)
      
      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        navigate('/profile/create')
      }
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <VStack spacing={8}>
        <VStack spacing={2} textAlign="center">
          <Heading
            fontSize={{ base: '2xl', md: '3xl' }}
            bgGradient="linear(to-r, purple.400, purple.600)"
            bgClip="text"
          >
            Join Women in STEM Network
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Connect with women in male-dominated fields
          </Text>
        </VStack>

        <Box
          py={{ base: '8', sm: '10' }}
          px={{ base: '4', sm: '10' }}
          bg="white"
          boxShadow="xl"
          borderRadius="xl"
          w="full"
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={5}>
              <FormControl isInvalid={errors.fullName}>
                <FormLabel>Full Name</FormLabel>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  size="lg"
                />
                <FormErrorMessage>{errors.fullName}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  size="lg"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="purple"
                size="lg"
                w="full"
                isLoading={loading}
                loadingText="Creating account..."
              >
                Sign Up
              </Button>
            </VStack>
          </form>

          <Text mt={6} textAlign="center" color="gray.600">
            Already have an account?{' '}
            <Link as={RouterLink} to="/signin" color="purple.500" fontWeight="semibold">
              Sign in
            </Link>
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}

export default SignUp
