import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  useToast,
  Card,
  CardBody,
  Icon,
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { supabase } from '../lib/supabase'

export default function CreateInsight() {
  const navigate = useNavigate()
  const toast = useToast()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Title and content are required',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create an insight',
          status: 'error',
          duration: 3000,
        })
        return
      }

      const data: any = {
        title: title.trim(),
        content: content.trim()
      }

      if (linkUrl.trim()) {
        data.link_url = linkUrl.trim()
        if (linkTitle.trim()) {
          data.link_title = linkTitle.trim()
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Your insight has been shared',
          status: 'success',
          duration: 3000,
        })
        navigate('/dashboard')
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to create insight',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create insight',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading
            size="xl"
            mb={2}
            bgGradient="linear(to-r, primary.500, primary.700)"
            bgClip="text"
          >
            Share a Career Insight
          </Heading>
          <Text color="gray.600" fontSize="md">
            Share your knowledge, experiences, or recommendations with your network
          </Text>
        </Box>

        <Card
          bg="white"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.100"
          boxShadow="md"
        >
          <CardBody p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Title
                  </FormLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 'The Book That Changed My Career'"
                    size="lg"
                    borderRadius="lg"
                    bg="gray.50"
                    borderColor="gray.200"
                    _hover={{ borderColor: 'gray.300', bg: 'gray.100' }}
                    _focus={{
                      borderColor: 'primary.400',
                      bg: 'white',
                      boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)'
                    }}
                  />
                  <FormHelperText color="gray.500">
                    Give your insight a clear, descriptive title
                  </FormHelperText>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    Content
                  </FormLabel>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts, experiences, or recommendations..."
                    rows={8}
                    borderRadius="lg"
                    bg="gray.50"
                    borderColor="gray.200"
                    _hover={{ borderColor: 'gray.300', bg: 'gray.100' }}
                    _focus={{
                      borderColor: 'primary.400',
                      bg: 'white',
                      boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)'
                    }}
                  />
                  <FormHelperText color="gray.500">
                    Share details that will be valuable to others in your network
                  </FormHelperText>
                </FormControl>

                <Box
                  p={6}
                  bg="gray.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontWeight="semibold" color="gray.700" mb={4}>
                    Optional: Add a Link
                  </Text>
                  
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
                        Link URL
                      </FormLabel>
                      <Input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        type="url"
                        borderRadius="lg"
                        bg="white"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'gray.300' }}
                        _focus={{
                          borderColor: 'primary.400',
                          boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)'
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
                        Link Title (Optional)
                      </FormLabel>
                      <Input
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                        placeholder="e.g., 'Read the full article'"
                        borderRadius="lg"
                        bg="white"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'gray.300' }}
                        _focus={{
                          borderColor: 'primary.400',
                          boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)'
                        }}
                      />
                      <FormHelperText color="gray.500" fontSize="xs">
                        If left empty, the URL will be displayed
                      </FormHelperText>
                    </FormControl>
                  </VStack>
                </Box>

                <HStack spacing={4} pt={4}>
                  <Button
                    type="submit"
                    colorScheme="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    loadingText="Sharing..."
                    flex={1}
                    borderRadius="lg"
                    boxShadow="md"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.2s"
                  >
                    Share Insight
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    size="lg"
                    borderRadius="lg"
                    colorScheme="gray"
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}
