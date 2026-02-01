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
  Icon
} from '@chakra-ui/react'
import { DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { Insight } from '../types'

interface InsightCardProps {
  insight: Insight
  onLike: (insightId: string) => void
  onUnlike: (insightId: string) => void
  onDelete?: (insightId: string) => void
  isOwner?: boolean
}

export const InsightCard: React.FC<InsightCardProps> = ({ 
  insight, 
  onLike, 
  onUnlike, 
  onDelete,
  isOwner = false 
}) => {
  const handleLikeClick = () => {
    if (insight.liked_by_user) {
      onUnlike(insight.id)
    } else {
      onLike(insight.id)
    }
  }

  return (
    <Card mb={3}>
      <CardBody>
        <HStack justify="space-between" align="flex-start">
          <Box flex={1}>
            <Heading size="md" mb={2}>
              {insight.title}
            </Heading>
            <Text mb={3} whiteSpace="pre-wrap">
              {insight.content}
            </Text>
            
            {insight.link_url && (
              <Link 
                href={insight.link_url} 
                isExternal 
                color="primary.600"
                display="flex"
                alignItems="center"
                mb={3}
              >
                <Icon as={ExternalLinkIcon} mr={1} />
                {insight.link_title || insight.link_url}
              </Link>
            )}
            
            <HStack spacing={4} mt={3}>
              <HStack spacing={1}>
                <IconButton
                  aria-label="Like insight"
                  icon={
                    <Icon viewBox="0 0 24 24">
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
                  colorScheme={insight.liked_by_user ? "red" : "gray"}
                />
                <Text fontSize="sm">
                  {insight.likes_count} {insight.likes_count === 1 ? 'like' : 'likes'}
                </Text>
              </HStack>
              
              <Text fontSize="xs" color="text.500">
                {new Date(insight.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Text>
            </HStack>
          </Box>
          
          {isOwner && onDelete && (
            <IconButton
              aria-label="Delete insight"
              icon={<DeleteIcon />}
              onClick={() => onDelete(insight.id)}
              size="sm"
              colorScheme="red"
              variant="ghost"
            />
          )}
        </HStack>
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
    <Card mb={4} bg="surface.400">
      <CardBody>
        <Heading size="md" mb={4}>
          Share a Career Insight
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 'The Book That Changed My Career'"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Your Insight</FormLabel>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share what helped you most in your career journey..."
                rows={4}
              />
            </FormControl>
            
            <Text fontSize="sm" fontWeight="semibold" color="text.500">
              Optional: Add a link
            </Text>
            
            <FormControl>
              <FormLabel>Link URL</FormLabel>
              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
              />
            </FormControl>
            
            {linkUrl && (
              <FormControl>
                <FormLabel>Link Title (optional)</FormLabel>
                <Input
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Display text for the link"
                />
              </FormControl>
            )}
            
            {error && (
              <Text color="red.500">
                {error}
              </Text>
            )}
            
            <HStack spacing={3}>
              <Button 
                type="submit" 
                colorScheme="primary"
                isLoading={isSubmitting}
              >
                Post Insight
              </Button>
              <Button 
                onClick={onCancel} 
                variant="outline"
                isDisabled={isSubmitting}
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
}

export const InsightsList: React.FC<InsightsListProps> = ({ 
  insights, 
  currentUserId,
  onLike, 
  onUnlike,
  onDelete 
}) => {
  if (insights.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="text.500">
          No insights yet
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
        />
      ))}
    </VStack>
  )
}
