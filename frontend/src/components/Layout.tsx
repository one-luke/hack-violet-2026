import { Outlet } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Navbar from './Navbar'

const Layout = () => {
  return (
    <Box minH="100vh" bg="surface.100">
      <Navbar />
      <Box as="main">
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout
