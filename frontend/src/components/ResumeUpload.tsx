import { useState, useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Icon,
  useToast,
} from '@chakra-ui/react'
import { AttachmentIcon, CheckCircleIcon, CloseIcon } from '@chakra-ui/icons'

interface ResumeUploadProps {
  onFileSelect: (file: File | null) => void
  currentFile?: File | null
}

const ResumeUpload = ({ onFileSelect, currentFile }: ResumeUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(currentFile || null)
  const toast = useToast()

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0]
      toast({
        title: 'Invalid file',
        description: error.code === 'file-too-large' 
          ? 'File size must be less than 5MB' 
          : 'Please upload a PDF or Word document',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      onFileSelect(file)
      
      toast({
        title: 'File selected',
        description: `${file.name} is ready to upload`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [onFileSelect, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  })

  const removeFile = () => {
    setSelectedFile(null)
    onFileSelect(null)
  }

  return (
    <VStack spacing={4} align="stretch">
      {!selectedFile ? (
        <Box
          {...getRootProps()}
          p={8}
          border="2px dashed"
          borderColor={isDragActive ? 'primary.400' : 'border.300'}
          borderRadius="lg"
          bg={isDragActive ? 'secondary.200' : 'surface.100'}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            borderColor: 'primary.400',
            bg: 'secondary.200',
          }}
        >
          <input {...getInputProps()} />
          <VStack spacing={3}>
            <Icon as={AttachmentIcon} w={10} h={10} color="text.400" />
            <Text fontSize="lg" fontWeight="medium" color="text.700">
              {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
            </Text>
            <Text fontSize="sm" color="text.500">
              or click to browse
            </Text>
            <Text fontSize="xs" color="text.400">
              PDF or Word document, up to 5MB
            </Text>
          </VStack>
        </Box>
      ) : (
        <Box
          p={4}
          border="1px solid"
          borderColor="success.200"
          borderRadius="lg"
          bg="success.50"
        >
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Icon as={CheckCircleIcon} color="success.500" w={5} h={5} />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium" color="text.700">
                  {selectedFile.name}
                </Text>
                <Text fontSize="xs" color="text.500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </Text>
              </VStack>
            </HStack>
            <Button
              size="sm"
              variant="ghost"
              colorScheme="error"
              leftIcon={<CloseIcon />}
              onClick={removeFile}
            >
              Remove
            </Button>
          </HStack>
        </Box>
      )}


    </VStack>
  )
}

export default ResumeUpload
