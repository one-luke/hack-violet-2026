import {
  Box,
  Flex,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  useColorModeValue,
  Text,
  Container,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  return (
    <Box bg={bg} px={4} borderBottom="1px" borderColor={borderColor}>
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <HStack spacing={8} alignItems="center">
            <Text
              fontSize="xl"
              fontWeight="bold"
              bgGradient="linear(to-r, purple.400, purple.600)"
              bgClip="text"
              cursor="pointer"
              onClick={() => navigate('/dashboard')}
            >
              Women in STEM Network
            </Text>
          </HStack>

          <Flex alignItems="center">
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <HStack>
                  <Avatar
                    size="sm"
                    name={user?.user_metadata?.full_name || user?.email}
                    bg="purple.500"
                  />
                  <ChevronDownIcon />
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => navigate('/profile')}>My Profile</MenuItem>
                <MenuItem onClick={() => navigate('/profile/edit')}>Edit Profile</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}

export default Navbar
