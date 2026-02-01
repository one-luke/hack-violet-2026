import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

// Modern sleek color palette - Deep indigo/slate with vibrant cyan accents
const colors = {
  primary: {
    50: '#F0F4FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',  // Main primary color (indigo)
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',  // Main secondary color (slate)
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  accent: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',  // Main accent color (cyan)
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  highlight: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',  // Main highlight color (green)
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  surface: {
    50: '#FAFAFA',
    100: '#F8FAFC',  // Main background
    200: '#F1F5F9',
    300: '#E2E8F0',
    400: '#CBD5E1',
    500: '#FFFFFF',  // Main surface
    600: '#F9FAFB',
    700: '#F3F4F6',
    800: '#E5E7EB',
    900: '#D1D5DB',
  },
  text: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',  // Secondary text
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',  // Primary text
    900: '#111827',
  },
  border: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',  // Main border color
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',  // Main success
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Main warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Main error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',  // Main info
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
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
        color: props.colorScheme === 'primary' ? 'white' : undefined,
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
  primary: '#6366F1',
  secondary: '#64748B',
  accent: '#06B6D4',
  highlight: '#22C55E',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  border: '#D4D4D4',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
}

export default theme
