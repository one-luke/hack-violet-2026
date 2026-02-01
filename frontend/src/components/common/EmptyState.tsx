import React from 'react'
import { Center, VStack, Text, Icon, Button } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  height?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = SearchIcon,
  title, 
  description,
  action,
  height = '50vh'
}) => {
  return (
    <Center h={height}>
      <VStack spacing={4} textAlign="center" px={4}>
        <Icon as={icon} boxSize={16} color="gray.300" />
        <VStack spacing={2}>
          <Text fontSize="xl" fontWeight="bold" color="gray.600">
            {title}
          </Text>
          {description && (
            <Text fontSize="md" color="gray.500" maxW="md">
              {description}
            </Text>
          )}
        </VStack>
        {action && (
          <Button
            colorScheme="primary"
            onClick={action.onClick}
            mt={2}
          >
            {action.label}
          </Button>
        )}
      </VStack>
    </Center>
  )
}
