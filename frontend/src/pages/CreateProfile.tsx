import { useState, ChangeEvent, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Avatar,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  Card,
  CardBody,
  Icon,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import ResumeUpload from '../components/ResumeUpload'
import { FormErrors } from '../types'

const STEM_FIELDS = [
  'Software Engineering',
  'Data Science',
  'Manufacturing',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Robotics',
  'Aerospace',
  'Research & Development',
  'Quality Assurance',
  'Other',
]

const steps = [
  { title: 'Basic Info', description: 'Name and contact' },
  { title: 'Professional', description: 'Industry and experience' },
  { title: 'Resume', description: 'Upload your resume' },
]

const CreateProfile = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  
  // Form fields
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [industry, setIndustry] = useState('')
  const [customIndustry, setCustomIndustry] = useState('')
  const [currentSchool, setCurrentSchool] = useState('')
  const [careerStatus, setCareerStatus] = useState<string>('')
  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validatePhoneNumber = (phone: string): boolean => {
    // Allow empty phone (optional field)
    if (!phone.trim()) return true
    // US/International phone format: +1-234-567-8900, (234) 567-8900, 234-567-8900, etc.
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Profile picture must be less than 5MB',
          status: 'error',
          duration: 3000,
        })
        return
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file',
          status: 'error',
          duration: 3000,
        })
        return
      }
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()])
      setCurrentSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}
    
    if (step === 0) {
      if (!fullName.trim()) newErrors.fullName = 'Full name is required'
      if (!location.trim()) newErrors.location = 'Location is required'
      if (phone && !validatePhoneNumber(phone)) {
        newErrors.phone = 'Please enter a valid phone number'
      }
    } else if (step === 1) {
      if (!industry) newErrors.industry = 'Industry/field is required'
      if (industry === 'Other' && !customIndustry.trim()) {
        newErrors.customIndustry = 'Please specify your industry'
      }
      if (!careerStatus) newErrors.careerStatus = 'Career status is required'
      if (!bio.trim()) newErrors.bio = 'Bio is required'
      if (bio.trim().length < 50) newErrors.bio = 'Bio should be at least 50 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  const uploadProfilePicture = async (): Promise<string | null> => {
    if (!profilePicture) return null

    const fileExt = profilePicture.name.split('.').pop()
    const fileName = `${user!.id}_${Date.now()}.${fileExt}`
    const filePath = `${user!.id}/${fileName}`

    const { error } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, profilePicture, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error
    
    // Get public URL
    const { data } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }

  const uploadResume = async (): Promise<{ fileName: string; filePath: string } | null> => {
    if (!resumeFile) return null

    const fileExt = resumeFile.name.split('.').pop()
    const fileName = `${user!.id}_${Date.now()}.${fileExt}`
    const filePath = `${user!.id}/${fileName}`

    const { error } = await supabase.storage
      .from('resumes')
      .upload(filePath, resumeFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error
    return { fileName, filePath }
  }

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return
    }

    setLoading(true)

    try {
      let resumeData = {}
      let profilePictureUrl = null
      
      if (profilePicture) {
        profilePictureUrl = await uploadProfilePicture()
      }
      
      if (resumeFile) {
        const result = await uploadResume()
        if (result) {
          const { fileName, filePath } = result
          resumeData = {
            resume_filename: fileName,
            resume_filepath: filePath,
            resume_uploaded_at: new Date().toISOString(),
          }
        }
      }

      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user!.id,
            email: user!.email,
            full_name: fullName,
            phone: phone || null,
            location,
            industry: industry === 'Other' ? customIndustry : industry,
            custom_industry: industry === 'Other' ? customIndustry : null,
            current_school: currentSchool || null,
            career_status: careerStatus || null,
            bio,
            linkedin_url: linkedinUrl || null,
            github_url: githubUrl || null,
            portfolio_url: portfolioUrl || null,
            profile_picture_url: profilePictureUrl,
            skills,
            ...resumeData,
          },
        ])

      if (error) throw error

      toast({
        title: 'Profile created!',
        description: 'Your profile has been successfully created.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      navigate('/dashboard')
    } catch (error: any) {
      console.error('Error creating profile:', error)
      toast({
        title: 'Error creating profile',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)">
      {/* Header with Gradient */}
      <Box bgGradient="linear(135deg, primary.600 0%, primary.800 100%)" color="white" py={10} mb={8}>
        <Container maxW="container.lg">
          <VStack spacing={4}>
            <Heading size="xl">Create Your Profile</Heading>
            <Text fontSize="lg" color="whiteAlpha.900" textAlign="center" maxW="2xl">
              Let's set up your profile to connect with other professionals in STEM
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.lg" pb={10}>
        <VStack spacing={8} align="stretch">
          {/* Progress Stepper */}
          <Card shadow="md" borderRadius="xl">
            <CardBody p={6}>
              <Stepper index={activeStep} colorScheme="primary" size="lg">
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>

                    <Box flexShrink="0">
                      <StepTitle>{step.title}</StepTitle>
                      <StepDescription>{step.description}</StepDescription>
                    </Box>

                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            </CardBody>
          </Card>

          {/* Form Content Card */}
          <Card shadow="lg" borderRadius="xl">
            <CardBody p={8}>
              {activeStep === 0 && (
                <VStack spacing={6}>
                  <HStack spacing={2} alignSelf="start" mb={2}>
                    <Box w={1} h={6} bg="primary.500" borderRadius="full" />
                    <Heading size="md" color="gray.800">Basic Information</Heading>
                  </HStack>
                  
                  <FormControl>
                    <FormLabel textAlign="center" fontWeight="semibold">Profile Picture</FormLabel>
                    <VStack spacing={4}>
                      <Avatar
                        size="2xl"
                        src={profilePicturePreview}
                        name={fullName}
                        cursor="pointer"
                        onClick={() => fileInputRef.current?.click()}
                        border="4px solid"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'primary.400', transform: 'scale(1.05)' }}
                        transition="all 0.2s"
                      />
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        display="none"
                      />
                      <Button
                        size="md"
                        colorScheme="primary"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Photo
                      </Button>
                      <Text fontSize="xs" color="gray.500">
                        Max 5MB • JPG, PNG, or GIF
                      </Text>
                    </VStack>
                  </FormControl>

                  <FormControl isInvalid={!!errors.fullName}>
                    <FormLabel fontWeight="semibold">Full Name *</FormLabel>
                    <Input
                      value={fullName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      size="lg"
                      bg="white"
                    />
                    <FormErrorMessage>{errors.fullName}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.phone}>
                    <FormLabel fontWeight="semibold">Phone Number</FormLabel>
                    <Input
                      value={phone}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      size="lg"
                      bg="white"
                    />
                    <FormHelperText fontSize="xs">
                      Optional - Format: +1 234-567-8900 or (234) 567-8900
                    </FormHelperText>
                    <FormErrorMessage>{errors.phone}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.location}>
                    <FormLabel fontWeight="semibold">Location *</FormLabel>
                    <Input
                      value={location}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                      placeholder="San Francisco, CA"
                      size="lg"
                      bg="white"
                    />
                    <FormErrorMessage>{errors.location}</FormErrorMessage>
                  </FormControl>
                </VStack>
              )}

              {activeStep === 1 && (
                <VStack spacing={6}>
                  <HStack spacing={2} alignSelf="start" mb={2}>
                    <Box w={1} h={6} bgGradient="linear(to-b, primary.500, accent.500)" borderRadius="full" />
                    <Heading size="md" color="gray.800">Professional Details</Heading>
                  </HStack>
                  
                  <FormControl isInvalid={!!errors.industry}>
                    <FormLabel fontWeight="semibold">Industry / Field *</FormLabel>
                    <Select
                      value={industry}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setIndustry(e.target.value)}
                      placeholder="Select your field"
                      size="lg"
                      bg="white"
                    >
                      {STEM_FIELDS.map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.industry}</FormErrorMessage>
                  </FormControl>

                  {industry === 'Other' && (
                    <FormControl isInvalid={!!errors.customIndustry}>
                      <FormLabel fontWeight="semibold">Specify Your Industry *</FormLabel>
                      <Input
                        value={customIndustry}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomIndustry(e.target.value)}
                        placeholder="e.g., Environmental Science, Biomedical Engineering"
                        size="lg"
                        bg="white"
                      />
                      <FormErrorMessage>{errors.customIndustry}</FormErrorMessage>
                    </FormControl>
                  )}

                  <FormControl>
                    <FormLabel fontWeight="semibold">Current School</FormLabel>
                    <Input
                      value={currentSchool}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentSchool(e.target.value)}
                      placeholder="e.g., MIT, Stanford University"
                      size="lg"
                      bg="white"
                    />
                    <FormHelperText fontSize="xs">
                      Optional - Current or most recent school
                    </FormHelperText>
                  </FormControl>

                  <FormControl isInvalid={!!errors.careerStatus}>
                    <FormLabel fontWeight="semibold">Career Status *</FormLabel>
                    <RadioGroup value={careerStatus} onChange={setCareerStatus}>
                      <Stack spacing={3}>
                        <Box p={4} borderRadius="lg" bg={careerStatus === 'in_industry' ? 'primary.50' : 'gray.50'} border="2px solid" borderColor={careerStatus === 'in_industry' ? 'primary.300' : 'transparent'} transition="all 0.2s">
                          <Radio value="in_industry" size="lg" colorScheme="primary">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold">Currently in Industry</Text>
                              <Text fontSize="sm" color="gray.600">Working in my field</Text>
                            </VStack>
                          </Radio>
                        </Box>
                        <Box p={4} borderRadius="lg" bg={careerStatus === 'seeking_opportunities' ? 'primary.50' : 'gray.50'} border="2px solid" borderColor={careerStatus === 'seeking_opportunities' ? 'primary.300' : 'transparent'} transition="all 0.2s">
                          <Radio value="seeking_opportunities" size="lg" colorScheme="primary">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold">Seeking Opportunities</Text>
                              <Text fontSize="sm" color="gray.600">Actively looking for positions</Text>
                            </VStack>
                          </Radio>
                        </Box>
                        <Box p={4} borderRadius="lg" bg={careerStatus === 'student' ? 'primary.50' : 'gray.50'} border="2px solid" borderColor={careerStatus === 'student' ? 'primary.300' : 'transparent'} transition="all 0.2s">
                          <Radio value="student" size="lg" colorScheme="primary">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold">Student</Text>
                              <Text fontSize="sm" color="gray.600">Currently studying</Text>
                            </VStack>
                          </Radio>
                        </Box>
                        <Box p={4} borderRadius="lg" bg={careerStatus === 'career_break' ? 'primary.50' : 'gray.50'} border="2px solid" borderColor={careerStatus === 'career_break' ? 'primary.300' : 'transparent'} transition="all 0.2s">
                          <Radio value="career_break" size="lg" colorScheme="primary">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold">Career Break</Text>
                              <Text fontSize="sm" color="gray.600">Taking time off</Text>
                            </VStack>
                          </Radio>
                        </Box>
                      </Stack>
                    </RadioGroup>
                    <FormErrorMessage>{errors.careerStatus}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.bio}>
                    <FormLabel fontWeight="semibold">Bio *</FormLabel>
                    <Textarea
                      value={bio}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                      placeholder="Tell us about yourself, your experience, and what you're looking for in this community..."
                      rows={6}
                      size="lg"
                      bg="white"
                    />
                    <HStack justify="space-between" mt={2}>
                      <FormHelperText fontSize="xs" m={0}>
                        {bio.length} characters (minimum 50)
                      </FormHelperText>
                      <Text fontSize="xs" color={bio.length >= 50 ? 'green.500' : 'gray.400'} fontWeight="medium">
                        {bio.length >= 50 ? '✓ Looks good!' : 'Keep writing...'}
                      </Text>
                    </HStack>
                    <FormErrorMessage>{errors.bio}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Skills & Interests</FormLabel>
                    <HStack>
                      <Input
                        value={currentSkill}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentSkill(e.target.value)}
                        placeholder="e.g., Python, Machine Learning, Leadership"
                        size="lg"
                        bg="white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addSkill()
                          }
                        }}
                      />
                      <Button onClick={addSkill} colorScheme="primary" size="lg">
                        Add
                      </Button>
                    </HStack>
                    {skills.length > 0 && (
                      <Box mt={4} p={4} bg="gray.50" borderRadius="lg">
                        <HStack spacing={2} flexWrap="wrap">
                          {skills.map((skill) => (
                            <Tag
                              key={skill}
                              size="lg"
                              borderRadius="full"
                              variant="solid"
                              colorScheme="primary"
                            >
                              <TagLabel>{skill}</TagLabel>
                              <TagCloseButton onClick={() => removeSkill(skill)} />
                            </Tag>
                          ))}
                        </HStack>
                      </Box>
                    )}
                  </FormControl>

                  <Box w="full" pt={4}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>Social Links (Optional)</Text>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="medium">LinkedIn URL</FormLabel>
                        <Input
                          value={linkedinUrl}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          bg="white"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="medium">GitHub URL</FormLabel>
                        <Input
                          value={githubUrl}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/..."
                          bg="white"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="medium">Portfolio / Website</FormLabel>
                        <Input
                          value={portfolioUrl}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setPortfolioUrl(e.target.value)}
                          placeholder="https://yourwebsite.com"
                          bg="white"
                        />
                      </FormControl>
                    </VStack>
                  </Box>
                </VStack>
              )}

              {activeStep === 2 && (
                <VStack spacing={6}>
                  <VStack spacing={2} w="full" align="start">
                    <HStack spacing={2}>
                      <Box w={1} h={6} bg="green.500" borderRadius="full" />
                      <Heading size="md" color="gray.800">Upload Resume</Heading>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      Upload your resume to make it easier for others to learn about your experience
                    </Text>
                  </VStack>
                  
                  <FormControl>
                    <ResumeUpload
                      onFileSelect={setResumeFile}
                      currentFile={resumeFile}
                    />
                  </FormControl>

                  <Box p={5} bg="blue.50" borderRadius="lg" w="full" borderWidth="1px" borderColor="blue.200">
                    <HStack spacing={3} align="start">
                      <Icon viewBox="0 0 24 24" color="blue.600" boxSize={5} mt={0.5}>
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </Icon>
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="sm" fontWeight="semibold" color="blue.800">Privacy Note</Text>
                        <Text fontSize="xs" color="blue.700">
                          Your resume will be stored securely and only visible to authenticated members of the platform.
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </VStack>
              )}

              <HStack mt={8} justify="space-between" pt={6} borderTop="1px" borderColor="gray.200">
                <Button
                  onClick={handleBack}
                  isDisabled={activeStep === 0}
                  variant="outline"
                  size="lg"
                  colorScheme="gray"
                >
                  Back
                </Button>

                {activeStep < steps.length - 1 ? (
                  <Button onClick={handleNext} colorScheme="primary" size="lg" px={8}>
                    Next Step
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    colorScheme="primary"
                    size="lg"
                    isLoading={loading}
                    loadingText="Creating profile..."
                    px={8}
                  >
                    Create Profile
                  </Button>
                )}
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}

export default CreateProfile
