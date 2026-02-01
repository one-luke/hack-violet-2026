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
  Grid,
  GridItem,
  List,
  ListItem,
  ListIcon,
  Image,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon, CheckCircleIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'
import { keyframes } from '@emotion/react'
import logo from '../components/logo.png'

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
`

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
}

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  
  const navigate = useNavigate()
  const toast = useToast()
  const { signUp } = useAuth()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const { error } = await signUp(email, password, fullName)
      
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
    <Box minH="100vh" bg="gray.50" position="relative" overflow="hidden">
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-50px"
        left="-50px"
        width="300px"
        height="300px"
        borderRadius="full"
        bgGradient="linear(to-br, accent.400, primary.400)"
        opacity={0.15}
        filter="blur(60px)"
        animation={`${float} 7s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        bottom="-100px"
        right="-100px"
        width="400px"
        height="400px"
        borderRadius="full"
        bgGradient="linear(to-tl, primary.400, highlight.400)"
        opacity={0.15}
        filter="blur(70px)"
        animation={`${float} 9s ease-in-out infinite`}
      />

      <Container maxW="6xl" py={{ base: '12', md: '20' }} px={{ base: '4', sm: '8' }} position="relative">
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
          {/* Left side - Features */}
          <GridItem display={{ base: 'none', lg: 'block' }}>
            <VStack align="start" spacing={8}>
              {/* Logo */}
              <Box
                w="64px"
                h="64px"
                borderRadius="xl"
                overflow="hidden"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Image src={logo} alt="Aurelia logo" w="100%" h="100%" objectFit="cover" />
              </Box>
              
              <Box>
                <Heading
                  fontSize="5xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, primary.500, accent.400)"
                  bgClip="text"
                  mb={4}
                >
                  Join Aurelia Today
                </Heading>
                <Text fontSize="xl" color="gray.600" lineHeight="tall">
                  Become part of a thriving community of women excelling in STEM fields.
                </Text>
              </Box>

              <Box>
                <Heading size="md" mb={6} color="text.800">
                  What you'll get:
                </Heading>
                <List spacing={4}>
                  <ListItem display="flex" alignItems="start">
                    <ListIcon as={CheckCircleIcon} color="primary.500" mt={1} boxSize={5} />
                    <Box>
                      <Text fontWeight="semibold" color="text.800">Smart Matching</Text>
                      <Text fontSize="sm" color="gray.600">Connect with professionals in your field</Text>
                    </Box>
                  </ListItem>
                  <ListItem display="flex" alignItems="start">
                    <ListIcon as={CheckCircleIcon} color="accent.500" mt={1} boxSize={5} />
                    <Box>
                      <Text fontWeight="semibold" color="text.800">Career Insights</Text>
                      <Text fontSize="sm" color="gray.600">Share and discover valuable career advice</Text>
                    </Box>
                  </ListItem>
                  <ListItem display="flex" alignItems="start">
                    <ListIcon as={CheckCircleIcon} color="highlight.500" mt={1} boxSize={5} />
                    <Box>
                      <Text fontWeight="semibold" color="text.800">Mentorship</Text>
                      <Text fontSize="sm" color="gray.600">Find mentors and guide others</Text>
                    </Box>
                  </ListItem>
                  <ListItem display="flex" alignItems="start">
                    <ListIcon as={CheckCircleIcon} color="primary.500" mt={1} boxSize={5} />
                    <Box>
                      <Text fontWeight="semibold" color="text.800">Community Support</Text>
                      <Text fontSize="sm" color="gray.600">Join a network that understands your journey</Text>
                    </Box>
                  </ListItem>
                </List>
              </Box>
            </VStack>
          </GridItem>

          {/* Right side - Form */}
          <GridItem>
            <VStack spacing={6}>
              <VStack spacing={2} textAlign="center">
                <Heading
                  fontSize={{ base: '2xl', md: '3xl' }}
                  bgGradient="linear(to-r, primary.500, primary.700)"
                  bgClip="text"
                >
                  Create Your Account
                </Heading>
                <Text color="text.500" fontSize="lg">
                  Start your journey with us
                </Text>
              </VStack>

              <Box
                py={{ base: '8', sm: '10' }}
                px={{ base: '4', sm: '10' }}
                bg="white"
                boxShadow="xl"
                borderRadius="2xl"
                borderWidth="1px"
                borderColor="gray.100"
                w="full"
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  inset: '-2px',
                  borderRadius: '2xl',
                  padding: '2px',
                  background: 'linear-gradient(135deg, transparent, rgba(6, 182, 212, 0.1), transparent)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              >
                <form onSubmit={handleSubmit}>
                  <VStack spacing={5}>
                    <FormControl isInvalid={!!errors.fullName}>
                      <FormLabel fontWeight="medium" color="text.700">Full Name</FormLabel>
                      <Input
                        type="text"
                        value={fullName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        size="lg"
                        borderRadius="lg"
                        _focus={{ borderColor: 'primary.400', boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)' }}
                      />
                      <FormErrorMessage>{errors.fullName}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel fontWeight="medium" color="text.700">Email</FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        size="lg"
                        borderRadius="lg"
                        _focus={{ borderColor: 'primary.400', boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)' }}
                      />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.password}>
                      <FormLabel fontWeight="medium" color="text.700">Password</FormLabel>
                      <InputGroup size="lg">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          borderRadius="lg"
                          _focus={{ borderColor: 'primary.400', boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)' }}
                        />
                        <InputRightElement>
                          <IconButton
                            variant="ghost"
                            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            borderRadius="full"
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
                      loadingText="Creating account..."
                      borderRadius="full"
                      fontWeight="semibold"
                      boxShadow="md"
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      Create Account
                    </Button>
                  </VStack>
                </form>

                <Text mt={6} textAlign="center" color="text.500">
                  Already have an account?{' '}
                  <Button
                    as={RouterLink}
                    to="/signin"
                    variant="link"
                    color="primary.600"
                    fontWeight="semibold"
                    _hover={{ color: 'primary.700' }}
                  >
                    Sign in
                  </Button>
                </Text>

                <Text mt={4} fontSize="xs" textAlign="center" color="gray.500">
                  By creating an account, you agree to our{' '}
                  <Link color="primary.600" _hover={{ textDecoration: 'underline' }}>Terms</Link>
                  {' '}and{' '}
                  <Link color="primary.600" _hover={{ textDecoration: 'underline' }}>Privacy Policy</Link>
                </Text>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}

export default SignUp
