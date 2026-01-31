import { extendTheme } from '@chakra-ui/react'

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const colors = {
  brand: {
    50: '#f5e9ff',
    100: '#dbc2ff',
    200: '#c19bff',
    300: '#a673ff',
    400: '#8c4cff',
    500: '#7225ff',
    600: '#5a1acc',
    700: '#430f99',
    800: '#2b0566',
    900: '#140033',
  },
  purple: {
    50: '#faf5ff',
    100: '#e9d8fd',
    200: '#d6bcfa',
    300: '#b794f4',
    400: '#9f7aea',
    500: '#805ad5',
    600: '#6b46c1',
    700: '#553c9a',
    800: '#44337a',
    900: '#322659',
  }
}

const fonts = {
  heading: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  body: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
}

const styles = {
  global: {
    body: {
      bg: 'gray.50',
      color: 'gray.800',
    },
  },
}

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'purple',
    },
    variants: {
      solid: {
        borderRadius: 'lg',
      },
      outline: {
        borderRadius: 'lg',
      },
    },
  },
  Input: {
    defaultProps: {
      focusBorderColor: 'purple.400',
    },
  },
  Textarea: {
    defaultProps: {
      focusBorderColor: 'purple.400',
    },
  },
}

const theme = extendTheme({ config, colors, fonts, styles, components })

export default theme
