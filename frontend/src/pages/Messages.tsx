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
      <Flex gap={4} h="calc(100vh - 180px)">
        {/* Conversations List */}
        <Box
          w={{ base: selectedConversation ? '0' : 'full', md: '380px' }}
          display={{ base: selectedConversation ? 'none' : 'block', md: 'block' }}
          borderRadius="2xl"
          overflow="hidden"
          bg="white"
          boxShadow="lg"
          border="1px solid"
          borderColor="gray.200"
          transition="all 0.3s ease"
        >
          <Box
            p={6}
            bgGradient="linear(135deg, primary.600 0%, primary.500 50%, accent.500 100%)"
            color="white"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgGradient: 'radial(circle at top right, whiteAlpha.200, transparent)',
              pointerEvents: 'none',
            }}
          >
            <HStack spacing={3} position="relative" zIndex={1}>
              <Box
                w={12}
                h={12}
                borderRadius="xl"
                bgGradient="linear(to-br, whiteAlpha.300, whiteAlpha.100)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 4px 12px rgba(0,0,0,0.1)"
                backdropFilter="blur(10px)"
              >
                <Text fontSize="2xl">💬</Text>
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
                  Messages
                </Text>
                <Text fontSize="sm" opacity={0.95} fontWeight="medium">
                  {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
                </Text>
              </VStack>
            </HStack>
          </Box>
          <VStack 
            spacing={0} 
            align="stretch" 
            overflowY="auto" 
            maxH="calc(100% - 112px)"
            css={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(99, 102, 241, 0.2)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(99, 102, 241, 0.3)',
              },
            }}
          >
            {conversations.length === 0 ? (
              <Center p={12} flexDir="column">
                <Box
                  w={20}
                  h={20}
                  borderRadius="2xl"
                  bgGradient="linear(to-br, primary.50, accent.50)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb={4}
                  boxShadow="0 4px 12px rgba(99, 102, 241, 0.1)"
                >
                  <Text fontSize="3xl">✨</Text>
                </Box>
                <Text color="gray.700" fontWeight="semibold" mb={2} fontSize="lg">
                  No conversations yet
                </Text>
                <Text color="gray.500" fontSize="sm" textAlign="center" maxW="250px">
                  Visit a profile and start connecting with others!
                </Text>
              </Center>
            ) : (
              conversations.map((conv) => (
                <Box
                  key={conv.id}
                  p={4}
                  cursor="pointer"
                  bg={selectedConversation?.id === conv.id ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(6, 182, 212, 0.08))' : 'white'}
                  borderLeft={selectedConversation?.id === conv.id ? '4px solid' : 'none'}
                  borderLeftColor="primary.500"
                  borderBottom="1px solid"
                  borderBottomColor="gray.100"
                  _hover={{ 
                    bg: selectedConversation?.id === conv.id 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(6, 182, 212, 0.12))'
                      : 'linear-gradient(to right, gray.50, transparent)',
                  }}
                  onClick={() => handleSelectConversation(conv)}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  position="relative"
                >
                  <HStack spacing={3} align="start">
                    <Box position="relative">
                      <Avatar
                        size="md"
                        src={conv.other_user.profile_picture_url}
                        name={conv.other_user.name}
                        border="2px solid"
                        borderColor={selectedConversation?.id === conv.id ? 'primary.200' : 'transparent'}
                        transition="all 0.2s"
                      />
                      {conv.unread_count > 0 && (
                        <Box
                          position="absolute"
                          top={-1}
                          right={-1}
                          minW={5}
                          h={5}
                          px={1.5}
                          bgGradient="linear(to-br, accent.500, accent.600)"
                          borderRadius="full"
                          border="2px solid white"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          boxShadow="0 2px 8px rgba(6, 182, 212, 0.4)"
                          animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                        >
                          <Text fontSize="xs" color="white" fontWeight="bold">
                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                          </Text>
                        </Box>
                      )}
                    </Box>
                    <VStack flex={1} align="stretch" spacing={1}>
                      <HStack justify="space-between" align="center">
                        <Text 
                          fontWeight={conv.unread_count > 0 ? 'bold' : 'semibold'} 
                          fontSize="md" 
                          noOfLines={1}
                          color={conv.unread_count > 0 ? 'gray.800' : 'gray.700'}
                        >
                          {conv.other_user.name}
                        </Text>
                        {conv.last_message && (
                          <Text fontSize="xs" color="gray.400" fontWeight="medium">
                            {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </Text>
                        )}
                      </HStack>
                      <Text
                        fontSize="sm"
                        color={conv.unread_count > 0 ? 'gray.600' : 'gray.500'}
                        noOfLines={1}
                        fontWeight={conv.unread_count > 0 ? 'medium' : 'normal'}
                      >
                        {conv.last_message
                          ? `${conv.last_message.sender_id === user?.id ? 'You: ' : ''}${conv.last_message.content}`
                          : 'Start the conversation...'}
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
            borderRadius="2xl"
            overflow="hidden"
            bg="white"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.200"
          >
            {/* Header */}
            <Box
              p={5}
              bg="white"
              borderBottom="1px solid"
              borderColor="gray.200"
              bgGradient="linear(to-r, white, gray.50)"
              backdropFilter="blur(10px)"
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
                  _hover={{ bg: 'gray.100', transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                />
                <Avatar
                  size="md"
                  src={selectedConversation.other_user.profile_picture_url}
                  name={selectedConversation.other_user.name}
                  cursor="pointer"
                  onClick={() => navigate(`/profile/${selectedConversation.other_user.id}`)}
                  border="3px solid"
                  borderColor="white"
                  boxShadow="0 4px 12px rgba(99, 102, 241, 0.2)"
                  _hover={{ 
                    transform: 'scale(1.05)',
                    boxShadow: '0 6px 16px rgba(99, 102, 241, 0.3)',
                  }}
                  transition="all 0.2s"
                />
                <VStack align="start" spacing={0} flex={1}>
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    cursor="pointer"
                    bgGradient="linear(to-r, gray.800, primary.600)"
                    bgClip="text"
                    _hover={{ 
                      bgGradient: "linear(to-r, primary.600, accent.600)",
                    }}
                    onClick={() => navigate(`/profile/${selectedConversation.other_user.id}`)}
                    transition="all 0.3s"
                  >
                    {selectedConversation.other_user.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
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
              py={6}
              bgGradient="linear(to-br, gray.50, white, primary.50)"
              position="relative"
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(99, 102, 241, 0.2)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(99, 102, 241, 0.3)',
                },
              }}
            >
              {messages.length === 0 ? (
                <Center h="full" flexDir="column">
                  <Box
                    w={24}
                    h={24}
                    borderRadius="2xl"
                    bgGradient="linear(135deg, primary.400, accent.400)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mb={4}
                    boxShadow="0 8px 24px rgba(99, 102, 241, 0.3)"
                    position="relative"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      inset: '-2px',
                      borderRadius: '2xl',
                      padding: '2px',
                      background: 'linear-gradient(135deg, primary.300, accent.300)',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                    }}
                  >
                    <Text fontSize="4xl" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">👋</Text>
                  </Box>
                  <Text color="gray.700" fontWeight="bold" fontSize="xl" mb={2}>
                    Start the conversation!
                  </Text>
                  <Text color="gray.500" fontSize="sm" textAlign="center" maxW="300px">
                    Send your first message and break the ice ✨
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
                          <Center py={4}>
                            <Box 
                              bg="white" 
                              px={4} 
                              py={2} 
                              borderRadius="full" 
                              boxShadow="0 2px 8px rgba(0,0,0,0.08)"
                              border="1px solid"
                              borderColor="gray.200"
                            >
                              <Text fontSize="xs" color="gray.600" fontWeight="semibold" letterSpacing="wide">
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
                              border="2px solid white"
                              boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            />
                          )}
                          <Flex
                            direction="column"
                            align={isOwn ? 'flex-end' : 'flex-start'}
                            maxW="65%"
                          >
                            <Box
                              bgGradient={isOwn ? 'linear(135deg, primary.500, primary.600)' : undefined}
                              bg={isOwn ? undefined : 'white'}
                              color={isOwn ? 'white' : 'gray.800'}
                              px={5}
                              py={3}
                              borderRadius={
                                isOwn
                                  ? isFirstInGroup && isLastInGroup
                                    ? '20px'
                                    : isFirstInGroup
                                    ? '20px 20px 20px 6px'
                                    : isLastInGroup
                                    ? '20px 6px 20px 20px'
                                    : '20px 6px 6px 20px'
                                  : isFirstInGroup && isLastInGroup
                                  ? '20px'
                                  : isFirstInGroup
                                  ? '20px 20px 20px 6px'
                                  : isLastInGroup
                                  ? '6px 20px 20px 20px'
                                  : '6px 20px 20px 6px'
                              }
                              boxShadow={isOwn 
                                ? '0 4px 14px rgba(99, 102, 241, 0.35)' 
                                : '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)'
                              }
                              position="relative"
                              transition="all 0.2s ease"
                              _hover={{ 
                                boxShadow: isOwn 
                                  ? '0 6px 20px rgba(99, 102, 241, 0.45)' 
                                  : '0 4px 12px rgba(0,0,0,0.12)'
                              }}
                            >
                              <Text 
                                fontSize="sm" 
                                lineHeight="1.6" 
                                letterSpacing="0.01em"
                                fontWeight="medium"
                              >
                                {message.content}
                              </Text>
                            </Box>
                            {showAvatar && (
                              <Text
                                fontSize="xs"
                                color="gray.400"
                                mt={1.5}
                                px={2}
                                fontWeight="semibold"
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
              borderColor="gray.200"
              bgGradient="linear(to-r, white, gray.50)"
              boxShadow="0 -4px 20px rgba(0,0,0,0.04)"
            >
              <HStack spacing={3}>
                <Box 
                  flex={1} 
                  position="relative"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    inset: '-2px',
                    borderRadius: 'full',
                    padding: '2px',
                    background: 'linear-gradient(135deg, transparent, transparent)',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                  }}
                  _focusWithin={{
                    _before: {
                      background: 'linear-gradient(135deg, primary.400, accent.400)',
                      opacity: 0.6,
                    }
                  }}
                >
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    bg="gray.50"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="full"
                    px={6}
                    py={6}
                    fontSize="sm"
                    fontWeight="medium"
                    _hover={{ 
                      borderColor: 'gray.300', 
                      bg: 'white',
                    }}
                    _focus={{ 
                      borderColor: 'primary.400', 
                      bg: 'white', 
                      boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)',
                      transform: 'translateY(-1px)',
                    }}
                    _placeholder={{ color: 'gray.400', fontWeight: 'normal' }}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
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
                  w={14}
                  h={14}
                  bgGradient="linear(135deg, primary.500, primary.600)"
                  boxShadow="0 4px 14px rgba(99, 102, 241, 0.4)"
                  _hover={{
                    transform: 'scale(1.08)',
                    bgGradient: "linear(135deg, primary.600, accent.500)",
                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                  }}
                  _active={{
                    transform: 'scale(0.96)',
                  }}
                  _disabled={{
                    opacity: 0.4,
                    cursor: 'not-allowed',
                    transform: 'scale(1)',
                  }}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
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
            borderRadius="2xl"
            bg="white"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.200"
            flexDir="column"
            bgGradient="linear(to-br, white, gray.50, primary.50)"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '60%',
              height: '150%',
              bgGradient: 'radial(circle, primary.100, transparent 70%)',
              opacity: 0.3,
              pointerEvents: 'none',
            }}
          >
            <Box
              w={32}
              h={32}
              borderRadius="3xl"
              bgGradient="linear(135deg, primary.400, accent.400)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={6}
              boxShadow="0 12px 40px rgba(99, 102, 241, 0.3)"
              position="relative"
              zIndex={1}
            >
              <Text fontSize="5xl" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))">💬</Text>
            </Box>
            <Text color="gray.700" fontWeight="bold" fontSize="2xl" mb={2} zIndex={1}>
              Your messages
            </Text>
            <Text color="gray.500" fontSize="md" textAlign="center" maxW="350px" zIndex={1}>
              Select a conversation to start messaging
            </Text>
          </Flex>
        )}
      </Flex>
    </Container>
  )
}
