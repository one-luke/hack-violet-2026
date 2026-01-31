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
import { ArrowBackIcon } from '@chakra-ui/icons'
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
      <Container py={8}>
        <Center>
          <Spinner size="xl" />
        </Center>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={6}>
      <Flex gap={4} h="calc(100vh - 180px)">
        {/* Conversations List */}
        <Box
          w={{ base: selectedConversation ? '0' : 'full', md: '360px' }}
          display={{ base: selectedConversation ? 'none' : 'block', md: 'block' }}
          borderWidth={1}
          borderRadius="lg"
          overflow="hidden"
          bg="white"
        >
          <Box p={4} borderBottomWidth={1}>
            <Text fontSize="xl" fontWeight="bold">Messages</Text>
          </Box>
          <VStack spacing={0} align="stretch" overflowY="auto" maxH="calc(100% - 73px)">
            {conversations.length === 0 ? (
              <Box p={6} textAlign="center">
                <Text color="gray.500">
                  No conversations yet. Visit a profile to start chatting!
                </Text>
              </Box>
            ) : (
              conversations.map((conv) => (
                <Box
                  key={conv.id}
                  p={4}
                  cursor="pointer"
                  bg={selectedConversation?.id === conv.id ? 'purple.50' : 'white'}
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handleSelectConversation(conv)}
                  borderBottomWidth={1}
                >
                  <HStack spacing={3}>
                    <Avatar
                      size="md"
                      src={conv.other_user.profile_picture_url}
                      name={conv.other_user.name}
                    />
                    <VStack flex={1} align="stretch" spacing={0}>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold">{conv.other_user.name}</Text>
                        {conv.unread_count > 0 && (
                          <Badge colorScheme="purple" borderRadius="full">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </HStack>
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        noOfLines={1}
                        fontWeight={conv.unread_count > 0 ? 'semibold' : 'normal'}
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
            borderWidth={1}
            borderRadius="lg"
            overflow="hidden"
            bg="white"
          >
            {/* Header */}
            <HStack p={4} borderBottomWidth={1} spacing={3}>
              <IconButton
                aria-label="Back"
                icon={<ArrowBackIcon />}
                display={{ base: 'flex', md: 'none' }}
                onClick={() => {
                  setSelectedConversation(null)
                  navigate('/messages')
                }}
                size="sm"
              />
              <Avatar
                size="sm"
                src={selectedConversation.other_user.profile_picture_url}
                name={selectedConversation.other_user.name}
              />
              <Text fontSize="lg" fontWeight="semibold">
                {selectedConversation.other_user.name}
              </Text>
            </HStack>

            {/* Messages */}
            <VStack
              flex={1}
              overflowY="auto"
              p={4}
              spacing={3}
              align="stretch"
              bg="gray.50"
            >
              {messages.length === 0 ? (
                <Center py={8}>
                  <Text color="gray.500">
                    No messages yet. Start the conversation!
                  </Text>
                </Center>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender_id === user?.id
                  return (
                    <Flex
                      key={message.id}
                      justify={isOwn ? 'flex-end' : 'flex-start'}
                    >
                      <Box
                        maxW="70%"
                        bg={isOwn ? 'purple.500' : 'white'}
                        color={isOwn ? 'white' : 'gray.800'}
                        px={4}
                        py={2}
                        borderRadius="lg"
                        boxShadow="sm"
                      >
                        <Text>{message.content}</Text>
                        <Text
                          fontSize="xs"
                          opacity={0.7}
                          mt={1}
                        >
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </Box>
                    </Flex>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </VStack>

            {/* Message Input */}
            <HStack p={4} borderTopWidth={1} spacing={2}>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <IconButton
                aria-label="Send message"
                icon={<Text>➤</Text>}
                colorScheme="purple"
                onClick={handleSendMessage}
                isDisabled={!newMessage.trim() || sending}
                isLoading={sending}
              />
            </HStack>
          </Flex>
        ) : (
          <Flex
            flex={1}
            display={{ base: 'none', md: 'flex' }}
            align="center"
            justify="center"
            borderWidth={1}
            borderRadius="lg"
            bg="white"
          >
            <Text color="gray.500">
              Select a conversation to start messaging
            </Text>
          </Flex>
        )}
      </Flex>
    </Container>
  )
}
