import {
  Box,
  Flex,
  HStack,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Image,
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
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from './logo.png'
import { useState } from 'react'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const bg = useColorModeValue('surface.500', 'gray.800')
  const borderColor = useColorModeValue('border.300', 'gray.700')
  const [searchInput, setSearchInput] = useState('')

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  return (
    <Box bg={bg} px={4} borderBottom="1px" borderColor={borderColor}>
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <HStack spacing={8} alignItems="center">
            <HStack spacing={3}>
              <Box
                w="36px"
                h="36px"
                borderRadius="md"
                cursor="pointer"
                onClick={() => navigate('/dashboard')}
                display="flex"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
              >
                <Image src={logo} alt="Aurelia logo" w="100%" h="100%" objectFit="cover" />
              </Box>
              <Text
                fontSize="xl"
                fontWeight="bold"
                bgGradient="linear(to-r, primary.500, primary.700)"
                bgClip="text"
                cursor="pointer"
                onClick={() => navigate('/dashboard')}
              >
                Aurelia
              </Text>
            </HStack>
            <InputGroup  w={{ md: '300px', lg: '420px', xl: '480px' }} display={{ base: 'none', md: 'block' }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search profiles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`)
                  }
                }}
              />
            </InputGroup>
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
                    bg="primary.500"
                  />
                  <ChevronDownIcon />
                </HStack>
              </MenuButton>
              <MenuList bg="surface.500" borderColor="border.300">
                <MenuItem onClick={() => navigate('/profile')} _hover={{ bg: 'secondary.200' }}>My Profile</MenuItem>
                <MenuItem onClick={() => navigate('/profile/edit')} _hover={{ bg: 'secondary.200' }}>Edit Profile</MenuItem>
                <MenuDivider borderColor="border.300" />
                <MenuItem onClick={handleSignOut} _hover={{ bg: 'secondary.200' }}>Sign Out</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}

export default Navbar
