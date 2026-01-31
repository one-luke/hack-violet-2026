import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

// Theme color palette - vibrant coral, peach, and yellow colors
const colors = {
  primary: {
    50: '#FFF5F5',
    100: '#FFE3E3',
    200: '#FFC9C9',
    300: '#FFA8A8',
    400: '#FC7F7F',
    500: '#FA5C5C',  // Main primary color (coral red)
    600: '#E54848',
    700: '#CF3636',
    800: '#B82626',
    900: '#A11818',
  },
  secondary: {
    50: '#FFF8F5',
    100: '#FFEEE6',
    200: '#FFDACC',
    300: '#FFC0AD',
    400: '#FEA58C',
    500: '#FD8A6B',  // Main secondary color (coral salmon)
    600: '#E87756',
    700: '#D26543',
    800: '#BC5432',
    900: '#A64422',
  },
  accent: {
    50: '#FFF9F2',
    100: '#FFF2E3',
    200: '#FFE7CC',
    300: '#FFDAAF',
    400: '#FECE9B',
    500: '#FEC288',  // Main accent color (peach)
    600: '#E9AD73',
    700: '#D3975F',
    800: '#BD824C',
    900: '#A76D3A',
  },
  highlight: {
    50: '#FFFEF5',
    100: '#FFFDE0',
    200: '#FFFBC2',
    300: '#FDF89D',
    400: '#FCF489',
    500: '#FBEF76',  // Main highlight color (yellow)
    600: '#E6D961',
    700: '#D0C34D',
    800: '#BAAD3A',
    900: '#A49728',
  },
  surface: {
    50: '#FFFFFF',
    100: '#FFFDF8',  // Main background
    200: '#FFFBF0',
    300: '#FFF9E8',
    400: '#FFF7E0',
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
    500: '#6A6A6A',  // Secondary text
    600: '#4D4D4D',
    700: '#3B3B3B',
    800: '#2B2B2B',  // Primary text
    900: '#1A1A1A',
  },
  border: {
    50: '#FAF9F5',
    100: '#F5F2EA',
    200: '#F0EBDF',
    300: '#E9E3D7',  // Main border color
    400: '#D9D2C4',
    500: '#C9C1B1',
    600: '#B3AB9B',
    700: '#9D9585',
    800: '#87806F',
    900: '#716A59',
  },
  success: {
    50: '#EDF9F3',
    100: '#D4F1E3',
    200: '#AAE4CA',
    300: '#7DD7AF',
    400: '#66C49A',
    500: '#4FAF7B',  // Main success
    600: '#459D6D',
    700: '#3B8B5F',
    800: '#317951',
    900: '#276743',
  },
  warning: {
    50: '#FFF9F2',
    100: '#FFF2E3',
    200: '#FFE7CC',
    300: '#FFDAAF',
    400: '#FECE9B',
    500: '#FEC288',  // Main warning (same as accent)
    600: '#E9AD73',
    700: '#D3975F',
    800: '#BD824C',
    900: '#A76D3A',
  },
  error: {
    50: '#FFF5F5',
    100: '#FFE3E3',
    200: '#FFC9C9',
    300: '#FFA8A8',
    400: '#FC7F7F',
    500: '#FA5C5C',  // Main error (same as primary)
    600: '#E54848',
    700: '#CF3636',
    800: '#B82626',
    900: '#A11818',
  },
  info: {
    50: '#FFF8F5',
    100: '#FFEEE6',
    200: '#FFDACC',
    300: '#FFC0AD',
    400: '#FEA58C',
    500: '#FD8A6B',  // Main info (same as secondary)
    600: '#E87756',
    700: '#D26543',
    800: '#BC5432',
    900: '#A64422',
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
  primary: '#FA5C5C',
  secondary: '#FD8A6B',
  accent: '#FEC288',
  highlight: '#FBEF76',
  bg: '#FFFDF8',
  surface: '#FFFFFF',
  textPrimary: '#2B2B2B',
  textSecondary: '#6A6A6A',
  border: '#E9E3D7',
  success: '#4FAF7B',
  warning: '#FEC288',
  error: '#FA5C5C',
  info: '#FD8A6B',
}

export default theme
