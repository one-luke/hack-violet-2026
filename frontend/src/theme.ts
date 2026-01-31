import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

// Theme color palette - cohesive warm, positive colors
const colors = {
  primary: {
    50: '#FFFDF8',
    100: '#FFF9EC',
    200: '#FFF3D6',
    300: '#FFEDB3',
    400: '#F9DC7A',
    500: '#F4C430',  // Main primary color
    600: '#D6A81F',
    700: '#B88C15',
    800: '#8F6B0E',
    900: '#665008',
  },
  secondary: {
    50: '#FFFEF9',
    100: '#FFFBF3',
    200: '#FFF8E6',
    300: '#FFF3D0',
    400: '#FFEDB3',
    500: '#FFE7A3',  // Main secondary color
    600: '#E6CE8A',
    700: '#CCB571',
    800: '#B39C58',
    900: '#99833F',
  },
  surface: {
    50: '#FFFFFF',
    100: '#FFFBF3',  // Main background
    200: '#FFF9EC',
    300: '#FFF6E0',
    400: '#FFF3D6',
    500: '#FFFFFF',  // Main surface
    600: '#F5F5F5',
    700: '#E6E6E6',
    800: '#CCCCCC',
    900: '#B3B3B3',
  },
  text: {
    50: '#F5F5F5',
    100: '#E0E0E0',
    200: '#CCCCCC',
    300: '#B3B3B3',
    400: '#8F8F8F',
    500: '#6B6B6B',  // Secondary text
    600: '#4D4D4D',
    700: '#3B3B3B',
    800: '#2E2E2E',  // Primary text
    900: '#1A1A1A',
  },
  border: {
    50: '#FAF8F3',
    100: '#F5F0E6',
    200: '#EEE8D9',
    300: '#E6D8B8',  // Main border color
    400: '#D9C89F',
    500: '#CCB886',
    600: '#B39F6D',
    700: '#998654',
    800: '#806D3B',
    900: '#665422',
  },
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',  // Main success
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#F2A900',  // Main warning
    600: '#D69500',
    700: '#BA8100',
    800: '#9E6D00',
    900: '#825900',
  },
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#D64545',  // Main error
    600: '#C13939',
    700: '#AB2E2E',
    800: '#962222',
    900: '#801717',
  },
  info: {
    50: '#FDF8EA',
    100: '#FAF0D5',
    200: '#F5E1AB',
    300: '#F0D281',
    400: '#ECC377',
    500: '#E8C86C',  // Main info
    600: '#D1B45E',
    700: '#BA9F50',
    800: '#A38B42',
    900: '#8C7634',
  },
}

const fonts = {
  heading: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  body: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
}

const styles = {
  global: {
    body: {
      bg: 'surface.100',
      color: 'text.800',
    },
  },
}

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'primary',
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorScheme === 'primary' ? 'primary.500' : undefined,
        color: 'text.800',
        borderRadius: 'lg',
        _hover: {
          bg: props.colorScheme === 'primary' ? 'primary.600' : undefined,
        },
      }),
      outline: (props: any) => ({
        borderColor: props.colorScheme === 'primary' ? 'primary.500' : undefined,
        color: props.colorScheme === 'primary' ? 'primary.700' : undefined,
        borderRadius: 'lg',
        _hover: {
          bg: props.colorScheme === 'primary' ? 'primary.50' : undefined,
        },
      }),
    },
  },
  Input: {
    defaultProps: {
      focusBorderColor: 'primary.400',
    },
    variants: {
      outline: {
        field: {
          borderColor: 'border.300',
          _hover: {
            borderColor: 'border.400',
          },
          _focus: {
            borderColor: 'primary.400',
            boxShadow: `0 0 0 1px var(--chakra-colors-primary-400)`,
          },
        },
      },
    },
  },
  Textarea: {
    defaultProps: {
      focusBorderColor: 'primary.400',
    },
    variants: {
      outline: {
        borderColor: 'border.300',
        _hover: {
          borderColor: 'border.400',
        },
        _focus: {
          borderColor: 'primary.400',
          boxShadow: `0 0 0 1px var(--chakra-colors-primary-400)`,
        },
      },
    },
  },
  Select: {
    defaultProps: {
      focusBorderColor: 'primary.400',
    },
    variants: {
      outline: {
        field: {
          borderColor: 'border.300',
          _hover: {
            borderColor: 'border.400',
          },
          _focus: {
            borderColor: 'primary.400',
            boxShadow: `0 0 0 1px var(--chakra-colors-primary-400)`,
          },
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'surface.500',
        borderColor: 'border.300',
      },
    },
  },
  Divider: {
    baseStyle: {
      borderColor: 'border.300',
    },
  },
}

const theme = extendTheme({ config, colors, fonts, styles, components })

// Export theme colors for use in components
export const themeColors = {
  primary: '#F4C430',
  secondary: '#FFE7A3',
  bg: '#FFFBF3',
  surface: '#FFFFFF',
  textPrimary: '#2E2E2E',
  textSecondary: '#6B6B6B',
  border: '#E6D8B8',
  success: '#4CAF50',
  warning: '#F2A900',
  error: '#D64545',
  info: '#E8C86C',
}

export default theme
