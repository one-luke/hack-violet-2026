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

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const navigate = useNavigate()
  const toast = useToast()
  const { signIn } = useAuth()

  const validateForm = () => {
    const newErrors = {}
    
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
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
      const { data, error } = await signIn(email, password)
      
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        navigate('/dashboard')
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
            Welcome Back
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Sign in to your account
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
                loadingText="Signing in..."
              >
                Sign In
              </Button>
            </VStack>
          </form>

          <Text mt={6} textAlign="center" color="gray.600">
            Don't have an account?{' '}
            <Link as={RouterLink} to="/signup" color="purple.500" fontWeight="semibold">
              Sign up
            </Link>
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}

export default SignIn
