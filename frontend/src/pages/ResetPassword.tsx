import { useState, FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Image,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { supabase } from '../lib/supabase'
import { keyframes } from '@emotion/react'
import logo from '../components/logo.png'

interface FormErrors {
  password?: string
  confirmPassword?: string
}

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  
  const navigate = useNavigate()
  const toast = useToast()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        toast({
          title: 'Password reset failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Password updated!',
          description: 'Your password has been successfully updated.',
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

      <Container maxW="md" py={{ base: '12', md: '24' }} px={{ base: '4', sm: '8' }} position="relative">
        <VStack spacing={8}>
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

          <VStack spacing={2} textAlign="center">
            <Heading
              fontSize={{ base: '2xl', md: '3xl' }}
              bgGradient="linear(to-r, primary.500, primary.700)"
              bgClip="text"
            >
              Reset Your Password
            </Heading>
            <Text color="text.500" fontSize="lg">
              Enter your new password below
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
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel fontWeight="medium" color="text.700">New Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="Enter your new password"
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

                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel fontWeight="medium" color="text.700">Confirm Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      borderRadius="lg"
                      _focus={{ borderColor: 'primary.400', boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)' }}
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        borderRadius="full"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="primary"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Updating password..."
                  borderRadius="full"
                  fontWeight="semibold"
                  boxShadow="md"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Update Password
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default ResetPassword
