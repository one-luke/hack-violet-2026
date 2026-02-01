import React, { ChangeEvent } from 'react'
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Textarea,
  Select,
} from '@chakra-ui/react'

interface BaseFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  helperText?: string
  isRequired?: boolean
  isDisabled?: boolean
}

interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'tel' | 'url'
  placeholder?: string
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  isRequired = false,
  isDisabled = false,
  type = 'text',
  placeholder,
}) => {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error} isDisabled={isDisabled}>
      <FormLabel fontWeight="semibold" color="gray.700">
        {label}
      </FormLabel>
      <Input
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        bg="gray.50"
        borderColor="gray.200"
        _hover={{ borderColor: 'gray.300', bg: 'gray.100' }}
        _focus={{
          borderColor: 'primary.400',
          bg: 'white',
          boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)'
        }}
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
      {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string
  rows?: number
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  isRequired = false,
  isDisabled = false,
  placeholder,
  rows = 4,
}) => {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error} isDisabled={isDisabled}>
      <FormLabel fontWeight="semibold" color="gray.700">
        {label}
      </FormLabel>
      <Textarea
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        bg="gray.50"
        borderColor="gray.200"
        _hover={{ borderColor: 'gray.300', bg: 'gray.100' }}
        _focus={{
          borderColor: 'primary.400',
          bg: 'white',
          boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)'
        }}
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
      {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string
  options: Array<{ value: string; label: string }>
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  isRequired = false,
  isDisabled = false,
  placeholder,
  options,
}) => {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error} isDisabled={isDisabled}>
      <FormLabel fontWeight="semibold" color="gray.700">
        {label}
      </FormLabel>
      <Select
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        bg="gray.50"
        borderColor="gray.200"
        _hover={{ borderColor: 'gray.300', bg: 'gray.100' }}
        _focus={{
          borderColor: 'primary.400',
          bg: 'white',
          boxShadow: '0 0 0 1px var(--chakra-colors-primary-400)'
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
      {helperText && !error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
