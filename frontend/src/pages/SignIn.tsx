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
  useToast,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  HStack,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Grid,
  GridItem,
  Image,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { keyframes } from '@emotion/react'
import logo from '../components/logo.png'

interface FormErrors {
  email?: string
  password?: string
}

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  
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

  const handleForgotPassword = async () => {
    console.log('Reset email:', resetEmail)
    if (!resetEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setResetLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      toast({
        title: 'Check your email',
        description: 'We sent you a password reset link',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      onClose()
      setResetEmail('')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="gray.50" position="relative" overflow="hidden">
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-100px"
        right="-100px"
        width="400px"
        height="400px"
        borderRadius="full"
        bgGradient="linear(to-br, primary.400, accent.400)"
        opacity={0.1}
        filter="blur(80px)"
        animation={`${float} 6s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        bottom="-150px"
        left="-150px"
        width="500px"
        height="500px"
        borderRadius="full"
        bgGradient="linear(to-tr, accent.400, primary.400)"
        opacity={0.1}
        filter="blur(80px)"
        animation={`${float} 8s ease-in-out infinite`}
      />

      <Container maxW="6xl" py={{ base: '12', md: '24' }} px={{ base: '4', sm: '8' }} position="relative">
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
          {/* Left side - Branding */}
          <GridItem display={{ base: 'none', lg: 'block' }}>
            <VStack align="start" spacing={6}>
              {/* Logo */}
              <HStack spacing={3}>
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
              </HStack>
              
              <Box>
                <Heading
                  fontSize="5xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, primary.500, accent.400)"
                  bgClip="text"
                  mb={4}
                >
                  Welcome to Aurelia
                </Heading>
                <Text fontSize="xl" color="gray.600" lineHeight="tall">
                  Connect with inspiring women in STEM and break barriers together.
                </Text>
              </Box>

              <VStack align="start" spacing={4} mt={8}>
                <HStack spacing={3}>
                  <Icon viewBox="0 0 24 24" boxSize={6} color="primary.500">
                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </Icon>
                  <Text fontSize="lg" color="gray.700">Build your professional network</Text>
                </HStack>
                <HStack spacing={3}>
                  <Icon viewBox="0 0 24 24" boxSize={6} color="accent.500">
                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </Icon>
                  <Text fontSize="lg" color="gray.700">Share career insights</Text>
                </HStack>
                <HStack spacing={3}>
                  <Icon viewBox="0 0 24 24" boxSize={6} color="highlight.500">
                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </Icon>
                  <Text fontSize="lg" color="gray.700">Find mentors and opportunities</Text>
                </HStack>
              </VStack>
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
                  Welcome Back
                </Heading>
                <Text color="text.500" fontSize="lg">
                  Sign in to your account
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
                  background: 'linear-gradient(135deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              >
                <form onSubmit={handleSubmit}>
                  <VStack spacing={5}>
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
                      loadingText="Signing in..."
                      borderRadius="full"
                      fontWeight="semibold"
                      boxShadow="md"
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      Sign In
                    </Button>
                  </VStack>
                </form>

                <HStack justify="space-between" mt={4}>
                  <Button
                    variant="link"
                    color="primary.600"
                    fontSize="sm"
                    fontWeight="medium"
                    onClick={onOpen}
                    _hover={{ color: 'primary.700', textDecoration: 'underline' }}
                  >
                    Forgot password?
                  </Button>
                </HStack>

                <Text mt={6} textAlign="center" color="text.500">
                  Don't have an account?{' '}
                  <Button
                    as={RouterLink}
                    to="/signup"
                    variant="link"
                    color="primary.600"
                    fontWeight="semibold"
                    _hover={{ color: 'primary.700' }}
                  >
                    Sign up
                  </Button>
                </Text>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Container>

      {/* Forgot Password Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" mx={4}>
          <ModalHeader>Reset your password</ModalHeader>
          <ModalCloseButton borderRadius="full" />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text color="gray.600">
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              <FormControl>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  size="lg"
                  borderRadius="lg"
                  _focus={{ borderColor: 'primary.400', boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)' }}
                />
              </FormControl>
              <Button
                colorScheme="primary"
                size="lg"
                w="full"
                onClick={handleForgotPassword}
                isLoading={resetLoading}
                loadingText="Sending..."
                borderRadius="full"
              >
                Send reset link
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default SignIn
