import React from 'react'
import { HStack, VStack, Text } from '@chakra-ui/react'

interface FollowStatsProps {
  followersCount: number
  followingCount: number
  size?: 'sm' | 'md' | 'lg'
}

export const FollowStats: React.FC<FollowStatsProps> = ({ 
  followersCount, 
  followingCount,
  size = 'md'
}) => {
  const fontSize = size === 'sm' ? 'xs' : size === 'lg' ? 'lg' : 'md'
  const numberSize = size === 'sm' ? 'md' : size === 'lg' ? 'xl' : 'lg'

  return (
    <HStack spacing={8} justify="center">
      <VStack spacing={0}>
        <Text fontSize={numberSize} fontWeight="bold" color="gray.800">
          {followersCount}
        </Text>
        <Text fontSize={fontSize} color="gray.600">
          Followers
        </Text>
      </VStack>
      <VStack spacing={0}>
        <Text fontSize={numberSize} fontWeight="bold" color="gray.800">
          {followingCount}
        </Text>
        <Text fontSize={fontSize} color="gray.600">
          Following
        </Text>
      </VStack>
    </HStack>
  )
}
