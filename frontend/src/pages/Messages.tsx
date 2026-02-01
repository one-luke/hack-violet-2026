import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Container,
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Avatar,
  Spinner,
  Flex,
  Badge,
  useToast,
  Center,
} from '@chakra-ui/react'
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Conversation, Message } from '../types'

export default function Messages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { conversationId } = useParams<{ conversationId?: string }>()
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) return

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for a conversation
  const fetchMessages = async (convId: string) => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) return

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/conversations/${convId}/messages`, {
        headers: {
          'Authorization': `Bearer ${session.data.session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    setSending(true)

    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) return

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({ content: newMessage })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([...messages, data.message])
        setNewMessage('')
        fetchConversations()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error || 'Failed to send message',
          status: 'error',
          duration: 3000,
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
      })
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  // Handle conversation selection
  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    navigate(`/messages/${conversation.id}`)
    await fetchMessages(conversation.id)
  }

  // Load conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Load specific conversation if conversationId in URL
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationId)
      if (conv) {
        setSelectedConversation(conv)
        fetchMessages(conversationId)
      }
    }
  }, [conversationId, conversations])

  // Poll for new messages every 3 seconds when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return

    const interval = setInterval(() => {
      fetchMessages(selectedConversation.id)
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedConversation])

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center h="60vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="primary.500" thickness="4px" />
            <Text color="gray.500" fontSize="sm">Loading conversations...</Text>
          </VStack>
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={6}>
      <Flex gap={6} h="calc(100vh - 180px)">
        {/* Conversations List */}
        <Box
          w={{ base: selectedConversation ? '0' : 'full', md: '380px' }}
          display={{ base: selectedConversation ? 'none' : 'block', md: 'block' }}
          borderRadius="xl"
          overflow="hidden"
          bg="white"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
        >
          <Box
            p={6}
            bgGradient="linear(to-br, primary.500, primary.600)"
            color="white"
          >
            <Text fontSize="2xl" fontWeight="bold">Messages</Text>
            <Text fontSize="sm" opacity={0.9} mt={1}>
              {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
            </Text>
          </Box>
          <VStack spacing={0} align="stretch" overflowY="auto" maxH="calc(100% - 100px)">
            {conversations.length === 0 ? (
              <Center p={8} flexDir="column">
                <Box
                  w={16}
                  h={16}
                  borderRadius="full"
                  bg="gray.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb={4}
                >
                  <Text fontSize="2xl">💬</Text>
                </Box>
                <Text color="gray.600" fontWeight="medium" mb={1}>
                  No conversations yet
                </Text>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Visit a profile to start chatting!
                </Text>
              </Center>
            ) : (
              conversations.map((conv) => (
                <Box
                  key={conv.id}
                  p={4}
                  cursor="pointer"
                  bg={selectedConversation?.id === conv.id ? 'primary.50' : 'white'}
                  borderLeft={selectedConversation?.id === conv.id ? '3px solid' : 'none'}
                  borderLeftColor="primary.500"
                  _hover={{ bg: selectedConversation?.id === conv.id ? 'primary.50' : 'gray.50' }}
                  onClick={() => handleSelectConversation(conv)}
                  transition="all 0.2s"
                  position="relative"
                >
                  <HStack spacing={3} align="start">
                    <Box position="relative">
                      <Avatar
                        size="md"
                        src={conv.other_user.profile_picture_url}
                        name={conv.other_user.name}
                      />
                      {conv.unread_count > 0 && (
                        <Box
                          position="absolute"
                          top={-1}
                          right={-1}
                          w={5}
                          h={5}
                          bg="accent.500"
                          borderRadius="full"
                          border="2px solid white"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize="xs" color="white" fontWeight="bold">
                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                          </Text>
                        </Box>
                      )}
                    </Box>
                    <VStack flex={1} align="stretch" spacing={1}>
                      <Text fontWeight="semibold" fontSize="md" noOfLines={1}>
                        {conv.other_user.name}
                      </Text>
                      <Text
                        fontSize="sm"
                        color={conv.unread_count > 0 ? 'gray.700' : 'gray.500'}
                        noOfLines={2}
                        fontWeight={conv.unread_count > 0 ? 'medium' : 'normal'}
                      >
                        {conv.last_message
                          ? `${conv.last_message.sender_id === user?.id ? 'You: ' : ''}${conv.last_message.content}`
                          : 'No messages yet'}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))
            )}
          </VStack>
        </Box>

        {/* Messages View */}
        {selectedConversation ? (
          <Flex
            flex={1}
            direction="column"
            borderRadius="xl"
            overflow="hidden"
            bg="white"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.100"
          >
            {/* Header */}
            <Box
              p={4}
              bg="white"
              borderBottom="1px solid"
              borderColor="gray.100"
              boxShadow="sm"
            >
              <HStack spacing={3}>
                <IconButton
                  aria-label="Back"
                  icon={<ArrowBackIcon />}
                  display={{ base: 'flex', md: 'none' }}
                  onClick={() => {
                    setSelectedConversation(null)
                    navigate('/messages')
                  }}
                  size="sm"
                  variant="ghost"
                  borderRadius="full"
                />
                <Avatar
                  size="md"
                  src={selectedConversation.other_user.profile_picture_url}
                  name={selectedConversation.other_user.name}
                  cursor="pointer"
                  onClick={() => navigate(`/profile/${selectedConversation.other_user.id}`)}
                  border="2px solid"
                  borderColor="gray.100"
                />
                <VStack align="start" spacing={0} flex={1}>
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    cursor="pointer"
                    _hover={{ color: 'primary.600' }}
                    onClick={() => navigate(`/profile/${selectedConversation.other_user.id}`)}
                    transition="color 0.2s"
                  >
                    {selectedConversation.other_user.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Click to view profile
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Messages */}
            <Box
              flex={1}
              overflowY="auto"
              px={6}
              py={8}
              bgGradient="linear(to-br, gray.50, white)"
              position="relative"
              css={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(0,0,0,0.15)',
                },
              }}
            >
              {messages.length === 0 ? (
                <Center h="full" flexDir="column">
                  <Box
                    w={20}
                    h={20}
                    borderRadius="full"
                    bg="primary.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mb={4}
                  >
                    <Text fontSize="3xl">👋</Text>
                  </Box>
                  <Text color="gray.600" fontWeight="semibold" fontSize="lg" mb={2}>
                    Start the conversation!
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Send a message to get things started
                  </Text>
                </Center>
              ) : (
                <VStack spacing={3} align="stretch">
                  {messages.map((message, index) => {
                    const isOwn = message.sender_id === user?.id
                    const prevMessage = messages[index - 1]
                    const nextMessage = messages[index + 1]
                    const showTimeGap = !prevMessage || 
                      (new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime()) > 300000
                    const showAvatar = !nextMessage || nextMessage.sender_id !== message.sender_id
                    const isFirstInGroup = !prevMessage || prevMessage.sender_id !== message.sender_id
                    const isLastInGroup = !nextMessage || nextMessage.sender_id !== message.sender_id
                    
                    return (
                      <Box key={message.id}>
                        {showTimeGap && (
                          <Center py={3}>
                            <Box bg="white" px={3} py={1} borderRadius="full" boxShadow="xs">
                              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                {new Date(message.created_at).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Text>
                            </Box>
                          </Center>
                        )}
                        <Flex
                          justify={isOwn ? 'flex-end' : 'flex-start'}
                          align="flex-end"
                          gap={2}
                        >
                          {!isOwn && (
                            <Avatar
                              size="sm"
                              src={selectedConversation.other_user.profile_picture_url}
                              name={selectedConversation.other_user.name}
                              opacity={showAvatar ? 1 : 0}
                              visibility={showAvatar ? 'visible' : 'hidden'}
                              mb={1}
                            />
                          )}
                          <Flex
                            direction="column"
                            align={isOwn ? 'flex-end' : 'flex-start'}
                            maxW="60%"
                          >
                            <Box
                              bg={isOwn ? 'primary.500' : 'white'}
                              color={isOwn ? 'white' : 'gray.800'}
                              px={4}
                              py={2.5}
                              borderRadius={
                                isOwn
                                  ? isFirstInGroup && isLastInGroup
                                    ? '16px'
                                    : isFirstInGroup
                                    ? '16px 16px 16px 4px'
                                    : isLastInGroup
                                    ? '16px 4px 16px 16px'
                                    : '16px 4px 4px 16px'
                                  : isFirstInGroup && isLastInGroup
                                  ? '16px'
                                  : isFirstInGroup
                                  ? '16px 16px 16px 4px'
                                  : isLastInGroup
                                  ? '4px 16px 16px 16px'
                                  : '4px 16px 16px 4px'
                              }
                              boxShadow={isOwn ? '0 2px 8px rgba(99, 102, 241, 0.3)' : '0 1px 3px rgba(0,0,0,0.08)'}
                              position="relative"
                              transition="all 0.2s ease"
                              _hover={{ 
                                transform: 'translateY(-1px)',
                                boxShadow: isOwn ? '0 4px 12px rgba(99, 102, 241, 0.4)' : '0 2px 6px rgba(0,0,0,0.12)'
                              }}
                            >
                              <Text fontSize="sm" lineHeight="1.6" letterSpacing="0.01em">
                                {message.content}
                              </Text>
                            </Box>
                            {showAvatar && (
                              <Text
                                fontSize="xs"
                                color="gray.400"
                                mt={1}
                                px={1}
                                fontWeight="medium"
                              >
                                {new Date(message.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Text>
                            )}
                          </Flex>
                          {isOwn && (
                            <Box w="32px" />
                          )}
                        </Flex>
                      </Box>
                    )
                  })}
                </VStack>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box 
              p={5} 
              bg="white" 
              borderTop="1px solid" 
              borderColor="gray.100"
              boxShadow="0 -2px 10px rgba(0,0,0,0.03)"
            >
              <HStack spacing={3}>
                <Box flex={1}>
                  <Input
                    placeholder="Message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="full"
                    px={6}
                    py={6}
                    fontSize="sm"
                    _hover={{ borderColor: 'gray.300', bg: 'gray.100' }}
                    _focus={{ 
                      borderColor: 'primary.400', 
                      bg: 'white', 
                      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                    }}
                    _placeholder={{ color: 'gray.400' }}
                    transition="all 0.2s"
                  />
                </Box>
                <IconButton
                  aria-label="Send message"
                  icon={<ArrowForwardIcon />}
                  colorScheme="primary"
                  onClick={handleSendMessage}
                  isDisabled={!newMessage.trim() || sending}
                  isLoading={sending}
                  size="lg"
                  borderRadius="full"
                  w={12}
                  h={12}
                  boxShadow="0 2px 8px rgba(99, 102, 241, 0.3)"
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                  }}
                  _active={{
                    transform: 'scale(0.95)',
                  }}
                  transition="all 0.2s"
                />
              </HStack>
            </Box>
          </Flex>
        ) : (
          <Flex
            flex={1}
            display={{ base: 'none', md: 'flex' }}
            align="center"
            justify="center"
            borderRadius="xl"
            bg="white"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.100"
            flexDir="column"
          >
            <Box
              w={24}
              h={24}
              borderRadius="full"
              bg="gray.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={4}
            >
              <Text fontSize="4xl">💬</Text>
            </Box>
            <Text color="gray.600" fontWeight="semibold" fontSize="lg" mb={2}>
              Your messages
            </Text>
            <Text color="gray.500" fontSize="sm">
              Select a conversation to start messaging
            </Text>
          </Flex>
        )}
      </Flex>
    </Container>
  )
}
