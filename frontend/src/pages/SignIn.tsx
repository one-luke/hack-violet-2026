import { useState, FormEvent, ChangeEvent } from 'react'
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

interface FormErrors {
  email?: string
  password?: string
}

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  
  const navigate = useNavigate()
  const toast = useToast()
  const { signIn } = useAuth()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const { error } = await signIn(email, password)
      
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
    } catch (error: any) {
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
            bgGradient="linear(to-r, primary.500, primary.700)"
            bgClip="text"
          >
            Welcome Back
          </Heading>
          <Text color="text.500" fontSize="lg">
            Sign in to your account
          </Text>
        </VStack>

        <Box
          py={{ base: '8', sm: '10' }}
          px={{ base: '4', sm: '10' }}
          bg="surface.500"
          boxShadow="xl"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border.300"
          w="full"
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={5}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  size="lg"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
                colorScheme="primary"
                size="lg"
                w="full"
                isLoading={loading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>
            </VStack>
          </form>

          <Text mt={6} textAlign="center" color="text.500">
            Don't have an account?{' '}
            <Link as={RouterLink} to="/signup" color="primary.700" fontWeight="semibold">
              Sign up
            </Link>
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}

export default SignIn
