import React, { useState } from 'react'
import { 
  Box, 
  Card, 
  CardBody,
  Heading,
  Text, 
  Textarea, 
  Button, 
  IconButton, 
  Link,
  VStack,
  HStack,
  Input,
  FormControl,
  FormLabel,
  Icon,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Divider,
} from '@chakra-ui/react'
import { DeleteIcon, ExternalLinkIcon, ChatIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { Insight } from '../types'

interface InsightCardProps {
  insight: Insight
  onLike: (insightId: string) => void
  onUnlike: (insightId: string) => void
  onDelete?: (insightId: string) => void
  isOwner?: boolean
}

interface InsightCardProps {
  insight: Insight
  onLike: (insightId: string) => void
  onUnlike: (insightId: string) => void
  onDelete?: (insightId: string) => void
  isOwner?: boolean
  onComment?: (insightId: string) => void
}

export const InsightCard: React.FC<InsightCardProps> = ({ 
  insight, 
  onLike, 
  onUnlike, 
  onDelete,
  isOwner = false,
  onComment
}) => {
  const navigate = useNavigate()
  
  const handleLikeClick = () => {
    if (insight.liked_by_user) {
      onUnlike(insight.id)
    } else {
      onLike(insight.id)
    }
  }

  const handleProfileClick = () => {
    navigate(`/profile/${insight.user_id}`)
  }

  return (
    <Card
      mb={4}
      bg="white"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="gray.100"
      transition="all 0.3s"
      _hover={{ boxShadow: 'lg', borderColor: 'primary.200', transform: 'translateY(-2px)' }}
      overflow="hidden"
    >
      <CardBody p={0}>
        {/* Header with user info */}
        <Flex
          align="center"
          justify="space-between"
          p={4}
          pb={3}
          borderBottom="1px solid"
          borderColor="gray.50"
        >
          <HStack spacing={3} cursor="pointer" onClick={handleProfileClick} flex={1}>
            <Avatar
              size="md"
              name={insight.profiles?.full_name || 'User'}
              src={insight.profiles?.profile_picture_url}
              border="2px solid"
              borderColor="gray.100"
              _hover={{ borderColor: 'primary.400' }}
              transition="all 0.2s"
            />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="md" color="gray.800" _hover={{ color: 'primary.600' }}>
                {insight.profiles?.full_name || 'Anonymous'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {new Date(insight.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </VStack>
          </HStack>
          
          {isOwner && onDelete && (
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<Icon viewBox="0 0 24 24" boxSize={5}>
                  <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </Icon>}
                variant="ghost"
                size="sm"
                borderRadius="full"
              />
              <MenuList>
                <MenuItem onClick={() => onDelete(insight.id)} color="red.600" icon={<DeleteIcon />}>
                  Delete Insight
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>

        {/* Content */}
        <Box p={5} pt={4}>
          <Heading 
            size="md" 
            mb={3} 
            fontWeight="bold" 
            color="gray.900"
            lineHeight="shorter"
          >
            {insight.title}
          </Heading>
          <Text 
            mb={4} 
            whiteSpace="pre-wrap" 
            color="gray.700" 
            lineHeight="tall"
            fontSize="md"
          >
            {insight.content}
          </Text>
          
          {insight.link_url && (
            <Link 
              href={insight.link_url} 
              isExternal 
              display="inline-flex"
              alignItems="center"
              px={4}
              py={2.5}
              bg="primary.50"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="primary.200"
              color="primary.700"
              fontWeight="medium"
              fontSize="sm"
              mb={4}
              transition="all 0.2s"
              _hover={{ 
                bg: 'primary.100', 
                borderColor: 'primary.300',
                transform: 'translateX(2px)'
              }}
            >
              <Icon as={ExternalLinkIcon} mr={2} />
              {insight.link_title || insight.link_url}
            </Link>
          )}
        </Box>

        {/* Footer with actions */}
        <Divider borderColor="gray.100" />
        <Flex
          px={5}
          py={3}
          align="center"
          justify="space-between"
          bg="gray.50"
        >
          <HStack spacing={1}>
            <IconButton
              aria-label="Like insight"
              icon={
                <Icon viewBox="0 0 24 24" boxSize={5}>
                  {insight.liked_by_user ? (
                    <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  ) : (
                    <path fill="currentColor" d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
                  )}
                </Icon>
              }
              onClick={handleLikeClick}
              size="sm"
              variant="ghost"
              borderRadius="lg"
              colorScheme={insight.liked_by_user ? "red" : "gray"}
              _hover={{ bg: insight.liked_by_user ? 'red.50' : 'gray.100' }}
            />
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" minW="60px">
              {insight.likes_count} {insight.likes_count === 1 ? 'like' : 'likes'}
            </Text>
          </HStack>

          {/* Comment button placeholder - can be implemented later */}
          {onComment && (
            <IconButton
              aria-label="Comment on insight"
              icon={<ChatIcon />}
              onClick={() => onComment(insight.id)}
              size="sm"
              variant="ghost"
              borderRadius="lg"
              colorScheme="gray"
              _hover={{ bg: 'gray.100' }}
            />
          )}
        </Flex>
      </CardBody>
    </Card>
  )
}

interface CreateInsightFormProps {
  onSubmit: (data: { title: string; content: string; link_url?: string; link_title?: string }) => Promise<void>
  onCancel: () => void
}

export const CreateInsightForm: React.FC<CreateInsightFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
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

      await onSubmit(data)
      
      // Reset form
      setTitle('')
      setContent('')
      setLinkUrl('')
      setLinkTitle('')
    } catch (err: any) {
      setError(err.message || 'Failed to create insight')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card mb={4} bg="white" borderRadius="xl" borderWidth="1px" borderColor="gray.100" boxShadow="sm">
      <CardBody p={6}>
        <Heading size="md" mb={5} fontWeight="semibold" color="text.800">
          Share a Career Insight
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontWeight="medium" color="text.700">Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 'The Book That Changed My Career'"
                borderRadius="lg"
                _focus={{ borderColor: 'primary.400', boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)' }}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel fontWeight="medium" color="text.700">Your Insight</FormLabel>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share what helped you most in your career journey..."
                rows={4}
                borderRadius="lg"
                _focus={{ borderColor: 'primary.400', boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)' }}
              />
            </FormControl>
            
            <Text fontSize="sm" fontWeight="semibold" color="text.600">
              Optional: Add a link
            </Text>
            
            <FormControl>
              <FormLabel fontWeight="medium" color="text.700">Link URL</FormLabel>
              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                borderRadius="lg"
                _focus={{ borderColor: 'primary.400', boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)' }}
              />
            </FormControl>
            
            {linkUrl && (
              <FormControl>
                <FormLabel fontWeight="medium" color="text.700">Link Title (optional)</FormLabel>
                <Input
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Display text for the link"
                  borderRadius="lg"
                  _focus={{ borderColor: 'primary.400', boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)' }}
                />
              </FormControl>
            )}
            
            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}
            
            <HStack spacing={3}>
              <Button 
                type="submit" 
                colorScheme="primary"
                isLoading={isSubmitting}
                borderRadius="full"
                px={6}
              >
                Post Insight
              </Button>
              <Button 
                onClick={onCancel} 
                variant="ghost"
                isDisabled={isSubmitting}
                borderRadius="full"
              >
                Cancel
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  )
}

interface InsightsListProps {
  insights: Insight[]
  currentUserId?: string
  onLike: (insightId: string) => void
  onUnlike: (insightId: string) => void
  onDelete?: (insightId: string) => void
  onComment?: (insightId: string) => void
}

export const InsightsList: React.FC<InsightsListProps> = ({ 
  insights, 
  currentUserId,
  onLike, 
  onUnlike,
  onDelete,
  onComment
}) => {
  if (insights.length === 0) {
    return (
      <Box textAlign="center" py={12}>
        <Box
          w={20}
          h={20}
          borderRadius="full"
          bg="gray.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mx="auto"
          mb={4}
        >
          <Text fontSize="3xl">💡</Text>
        </Box>
        <Text color="gray.600" fontWeight="medium" fontSize="lg" mb={2}>
          No insights yet
        </Text>
        <Text color="gray.500" fontSize="sm">
          Share your career experiences and knowledge
        </Text>
      </Box>
    )
  }

  return (
    <VStack spacing={0} align="stretch">
      {insights.map((insight) => (
        <InsightCard
          key={insight.id}
          insight={insight}
          onLike={onLike}
          onUnlike={onUnlike}
          onDelete={onDelete}
          isOwner={currentUserId === insight.user_id}
          onComment={onComment}
        />
      ))}
    </VStack>
  )
}
