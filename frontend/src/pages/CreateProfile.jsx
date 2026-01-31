import { useState } from 'react'
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
  SimpleGrid,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Divider,
  Progress,
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
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import ResumeUpload from '../components/ResumeUpload'

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
  const [errors, setErrors] = useState({})
  
  // Form fields
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [industry, setIndustry] = useState('')
  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [skills, setSkills] = useState([])
  const [currentSkill, setCurrentSkill] = useState('')
  const [resumeFile, setResumeFile] = useState(null)

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()])
      setCurrentSkill('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 0) {
      if (!fullName.trim()) newErrors.fullName = 'Full name is required'
      if (!location.trim()) newErrors.location = 'Location is required'
    } else if (step === 1) {
      if (!industry) newErrors.industry = 'Industry/field is required'
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

  const uploadResume = async () => {
    if (!resumeFile) return null

    const fileExt = resumeFile.name.split('.').pop()
    const fileName = `${user.id}_${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { data, error } = await supabase.storage
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
      
      if (resumeFile) {
        const { fileName, filePath } = await uploadResume()
        resumeData = {
          resume_filename: fileName,
          resume_filepath: filePath,
          resume_uploaded_at: new Date().toISOString(),
        }
      }

      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            full_name: fullName,
            phone: phone || null,
            location,
            industry,
            bio,
            linkedin_url: linkedinUrl || null,
            github_url: githubUrl || null,
            portfolio_url: portfolioUrl || null,
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
    } catch (error) {
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
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={2}>Create Your Profile</Heading>
          <Text color="gray.600">
            Let's set up your profile to connect with other women in STEM
          </Text>
        </Box>

        <Stepper index={activeStep} colorScheme="purple">
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

        <Box bg="white" p={8} borderRadius="xl" boxShadow="lg">
          {activeStep === 0 && (
            <VStack spacing={5}>
              <FormControl isInvalid={errors.fullName}>
                <FormLabel>Full Name *</FormLabel>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  size="lg"
                />
                <FormErrorMessage>{errors.fullName}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  size="lg"
                />
              </FormControl>

              <FormControl isInvalid={errors.location}>
                <FormLabel>Location *</FormLabel>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  size="lg"
                />
                <FormErrorMessage>{errors.location}</FormErrorMessage>
              </FormControl>
            </VStack>
          )}

          {activeStep === 1 && (
            <VStack spacing={5}>
              <FormControl isInvalid={errors.industry}>
                <FormLabel>Industry / Field *</FormLabel>
                <Select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Select your field"
                  size="lg"
                >
                  {STEM_FIELDS.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.industry}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.bio}>
                <FormLabel>Bio *</FormLabel>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself, your experience, and what you're looking for in this community..."
                  rows={6}
                  size="lg"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {bio.length} characters (minimum 50)
                </Text>
                <FormErrorMessage>{errors.bio}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Skills & Interests</FormLabel>
                <HStack>
                  <Input
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="e.g., Python, Machine Learning, Leadership"
                    size="lg"
                  />
                  <Button onClick={addSkill} colorScheme="purple">
                    Add
                  </Button>
                </HStack>
                {skills.length > 0 && (
                  <HStack spacing={2} mt={3} flexWrap="wrap">
                    {skills.map((skill) => (
                      <Tag
                        key={skill}
                        size="lg"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="purple"
                      >
                        <TagLabel>{skill}</TagLabel>
                        <TagCloseButton onClick={() => removeSkill(skill)} />
                      </Tag>
                    ))}
                  </HStack>
                )}
              </FormControl>

              <Divider />

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <Input
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>GitHub URL</FormLabel>
                  <Input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Portfolio / Website</FormLabel>
                <Input
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </FormControl>
            </VStack>
          )}

          {activeStep === 2 && (
            <VStack spacing={5}>
              <FormControl>
                <FormLabel>Upload Resume (Optional)</FormLabel>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  Upload your resume to make it easier for others to learn about your experience
                </Text>
                <ResumeUpload
                  onFileSelect={setResumeFile}
                  currentFile={resumeFile}
                />
              </FormControl>

              <Box p={4} bg="purple.50" borderRadius="lg" w="full">
                <Text fontSize="sm" color="purple.800">
                  <strong>Privacy Note:</strong> Your resume will be stored securely and only visible to authenticated members of the platform.
                </Text>
              </Box>
            </VStack>
          )}

          <HStack mt={8} justify="space-between">
            <Button
              onClick={handleBack}
              isDisabled={activeStep === 0}
              variant="outline"
            >
              Back
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button onClick={handleNext} colorScheme="purple">
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                colorScheme="purple"
                isLoading={loading}
                loadingText="Creating profile..."
              >
                Create Profile
              </Button>
            )}
          </HStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default CreateProfile
