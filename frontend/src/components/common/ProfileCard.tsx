import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Avatar,
  Text,
  Badge,
  Button,
  Box,
} from '@chakra-ui/react'
import { Profile } from '../../types'

interface ProfileCardProps {
  profile: Profile & { recommendation_reason?: string }
  showActions?: boolean
  onMessageClick?: () => void
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  showActions = true,
  onMessageClick,
}) => {
  const navigate = useNavigate()

  const handleViewProfile = () => {
    navigate(`/profile/${profile.id}`)
  }

  return (
    <Card
      bg="white"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.100"
      transition="all 0.3s"
      _hover={{ boxShadow: 'lg', borderColor: 'primary.200', transform: 'translateY(-2px)' }}
      overflow="hidden"
      cursor="pointer"
      onClick={handleViewProfile}
    >
      <CardBody p={6}>
        <VStack spacing={4} align="stretch" h="full">
          <HStack spacing={4}>
            <Avatar
              size="lg"
              name={profile.full_name}
              src={profile.profile_picture_url}
              border="2px solid"
              borderColor="primary.100"
            />
            <VStack align="start" spacing={1} flex={1}>
              <Text fontWeight="bold" fontSize="lg" color="gray.800">
                {profile.full_name}
              </Text>
              {profile.current_school && (
                <Text fontSize="sm" color="primary.600" fontWeight="medium">
                  {profile.current_school}
                </Text>
              )}
              <Text fontSize="sm" color="gray.600">
                {profile.location}
              </Text>
            </VStack>
          </HStack>

          {profile.industry && (
            <Badge
              colorScheme="primary"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="semibold"
              alignSelf="start"
            >
              {profile.industry}
            </Badge>
          )}

          <Box minH="42px">
            {profile.bio && (
              <Text fontSize="sm" color="gray.700" noOfLines={2} lineHeight="tall">
                {profile.bio}
              </Text>
            )}
          </Box>
          {profile.recommendation_reason && (
            <Box
              p={3}
              bg="accent.50"
              borderRadius="lg"
              borderLeft="3px solid"
              borderColor="accent.400"
              mt="auto"
            >
              <Text fontSize="xs" fontWeight="semibold" color="accent.700" mb={1}>
                Recommended for you
              </Text>
              <Text fontSize="sm" color="gray.700">
                {profile.recommendation_reason}
              </Text>
            </Box>
          )}

          {showActions && (
            <HStack spacing={2} pt={2}>
              {onMessageClick && (
                <Button
                  size="sm"
                  colorScheme="primary"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMessageClick()
                  }}
                  flex={1}
                >
                  Message
                </Button>
              )}
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
