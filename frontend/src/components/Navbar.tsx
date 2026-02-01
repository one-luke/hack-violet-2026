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
  Text,
  Container,
} from '@chakra-ui/react'
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from './logo.png'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [searchInput, setSearchInput] = useState('')
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!user?.id) return
      
      const { data } = await supabase
        .from('profiles')
        .select('profile_picture_url')
        .eq('id', user.id)
        .single()
      
      if (data?.profile_picture_url) {
        setProfilePictureUrl(data.profile_picture_url)
      }
    }

    fetchProfilePicture()
  }, [user?.id])

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  return (
    <Box bg="white" px={4} boxShadow="sm" position="sticky" top={0} zIndex={100}>
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
                borderRadius="full"
                bg="gray.50"
                borderColor="gray.200"
                _hover={{ bg: 'gray.100', borderColor: 'gray.300' }}
                _focus={{ bg: 'white', borderColor: 'primary.400', boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)' }}
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
                    src={profilePictureUrl || undefined}
                    bg="primary.500"
                  />
                  <ChevronDownIcon />
                </HStack>
              </MenuButton>
              <MenuList bg="white" borderColor="gray.200" boxShadow="lg" borderRadius="xl">
                <MenuItem onClick={() => navigate('/profile')} _hover={{ bg: 'gray.50' }} borderRadius="md">My Profile</MenuItem>
                <MenuItem onClick={() => navigate('/profile/edit')} _hover={{ bg: 'gray.50' }} borderRadius="md">Edit Profile</MenuItem>
                <MenuDivider borderColor="gray.200" />
                <MenuItem onClick={handleSignOut} _hover={{ bg: 'red.50', color: 'red.600' }} borderRadius="md">Sign Out</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}

export default Navbar
