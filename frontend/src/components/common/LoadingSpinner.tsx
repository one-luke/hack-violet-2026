import React from 'react'
import { Center, Spinner, VStack, Text } from '@chakra-ui/react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  height?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'xl',
  height = '60vh'
}) => {
  return (
    <Center h={height}>
      <VStack spacing={4}>
        <Spinner size={size} color="primary.500" thickness="4px" />
        <Text color="gray.500" fontSize="sm">{message}</Text>
      </VStack>
    </Center>
  )
}
