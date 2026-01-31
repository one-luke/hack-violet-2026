# Theme System Documentation

## Overview

The application now uses a comprehensive theme system based on warm, positive colors that create an inviting and professional environment. The theme is built with Chakra UI and provides consistent colors across all components.

## Color Palette

### Primary Colors
- **Primary**: `#F4C430` - Golden yellow, used for main actions and highlights
- **Secondary**: `#FFE7A3` - Light golden yellow, used for secondary highlights

### Background Colors
- **Background**: `#FFFBF3` - Warm off-white, main page background
- **Surface**: `#FFFFFF` - Pure white, used for cards and containers

### Text Colors
- **Text Primary**: `#2E2E2E` - Dark gray, main text
- **Text Secondary**: `#6B6B6B` - Medium gray, secondary text

### Border Colors
- **Border**: `#E6D8B8` - Warm beige, used for borders and dividers

### Semantic Colors
- **Success**: `#4CAF50` - Green, success states
- **Warning**: `#F2A900` - Amber, warnings
- **Error**: `#D64545` - Red, errors
- **Info**: `#E8C86C` - Light gold, informational messages

## Using the Theme

### In Chakra UI Components

The theme automatically applies to Chakra UI components through the configured color schemes:

```tsx
// Buttons automatically use primary colors
<Button colorScheme="primary">Click Me</Button>

// Use semantic colors for specific states
<Button colorScheme="success">Save</Button>
<Button colorScheme="error">Delete</Button>

// Background and text colors
<Box bg="surface.500">  {/* White background */}
  <Text color="text.800">Primary text</Text>
  <Text color="text.500">Secondary text</Text>
</Box>

// Borders
<Box borderWidth="1px" borderColor="border.300">
  Content
</Box>
```

### Color Scale

Each color has a scale from 50 (lightest) to 900 (darkest):

- **50-200**: Very light shades, backgrounds
- **300-400**: Light shades, borders and hover states
- **500**: Main color value
- **600-700**: Darker shades, text on light backgrounds
- **800-900**: Very dark shades, headings

### Common Patterns

#### Cards/Containers
```tsx
<Box 
  bg="surface.500" 
  borderWidth="1px" 
  borderColor="border.300"
  borderRadius="xl"
  boxShadow="lg"
>
  {/* Content */}
</Box>
```

#### Text Hierarchy
```tsx
<Heading color="text.800">Main Heading</Heading>
<Text color="text.700">Body text</Text>
<Text color="text.500">Secondary text</Text>
```

#### Interactive Elements
```tsx
{/* Primary action */}
<Button colorScheme="primary">Submit</Button>

{/* Secondary action */}
<Button variant="outline" colorScheme="primary">Cancel</Button>

{/* Destructive action */}
<Button colorScheme="error">Delete</Button>
```

#### Form Elements
```tsx
{/* Input automatically uses theme colors */}
<Input placeholder="Enter text" />

{/* Custom focus colors are already configured */}
<Textarea placeholder="Enter description" />

{/* Select with theme colors */}
<Select>
  <option>Option 1</option>
</Select>
```

#### Tags and Badges
```tsx
<Tag colorScheme="primary">Skill</Tag>
<Badge colorScheme="info">Status</Badge>
```

#### Links
```tsx
<Link color="primary.700" href="#">Link Text</Link>
```

## Direct Color Access

For cases where you need direct color values (e.g., for custom styling or non-Chakra components):

```tsx
import { themeColors } from './theme'

// Use in custom CSS or inline styles
const customStyle = {
  backgroundColor: themeColors.primary,
  color: themeColors.textPrimary,
}
```

## Changing Colors

To update the color scheme:

1. Open `frontend/src/theme.ts`
2. Modify the color values in the `colors` object
3. Update the `themeColors` export if needed
4. The changes will automatically apply throughout the application

### Example: Changing Primary Color

```typescript
// In theme.ts
const colors = {
  primary: {
    // ... other shades
    500: '#YOUR_NEW_COLOR',  // Main primary color
    // ... other shades
  }
}
```

## Component Configuration

The theme includes pre-configured component styles:

- **Buttons**: Use primary color scheme by default, rounded corners
- **Inputs**: Primary focus border color, custom border colors
- **Textareas**: Matches input styling
- **Selects**: Matches input styling
- **Cards**: Surface background with border
- **Dividers**: Border color

## Best Practices

1. **Always use theme colors** instead of hardcoded colors
2. **Use semantic colors** (success, error, warning) for appropriate states
3. **Maintain consistency** by using the same color scales across similar components
4. **Test accessibility** - ensure sufficient contrast ratios
5. **Use the color scale** - don't create new colors outside the theme

## Color Testing

The warm color palette has been designed to:
- ✅ Create a positive, welcoming environment
- ✅ Maintain professional appearance
- ✅ Provide good contrast for readability
- ✅ Work well together without clashing
- ✅ Support the application's purpose of connecting professionals

## Migration Notes

All components have been updated to use the new theme system:
- ✅ Authentication pages (SignIn, SignUp)
- ✅ Dashboard
- ✅ Profile pages (View, Create, Edit)
- ✅ Navigation components
- ✅ Form components
- ✅ Layout components

The purple color scheme has been fully replaced with the new golden/warm color palette.
