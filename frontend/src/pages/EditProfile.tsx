import { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  VStack,
  Heading,
  Text,
  useToast,
  HStack,
  Avatar,
  Card,
  CardBody,
  RadioGroup,
  Stack,
  Radio,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  Textarea,
  FormHelperText,
  FormErrorMessage,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import ResumeUpload from '../components/ResumeUpload'
import { Profile, FormErrors } from '../types'
import { InputField, SelectField, LoadingSpinner } from '../components/common'

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

interface ExistingResume {
  name: string
  path: string
}

const EditProfile = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  
  const [fullName, setFullName] = useState('')
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
  const [existingResume, setExistingResume] = useState<ExistingResume | null>(null)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('')
  const [existingProfilePicture, setExistingProfilePicture] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error) throw error

      const profile = data as Profile
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
      setLocation(profile.location || '')
      setIndustry(profile.industry || '')
      setCustomIndustry(profile.custom_industry || '')
      setCurrentSchool(profile.current_school || '')
      setCareerStatus(profile.career_status || '')
      setBio(profile.bio || '')
      setLinkedinUrl(profile.linkedin_url || '')
      setGithubUrl(profile.github_url || '')
      setPortfolioUrl(profile.portfolio_url || '')
      setSkills(profile.skills || [])
      setExistingProfilePicture(profile.profile_picture_url || '')
      setProfilePicturePreview(profile.profile_picture_url || '')
      
      if (profile.resume_filepath) {
        setExistingResume({
          name: profile.resume_filename || '',
          path: profile.resume_filepath,
        })
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error loading profile',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone.trim()) return true
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!location.trim()) newErrors.location = 'Location is required'
    if (!industry) newErrors.industry = 'Industry/field is required'
    if (industry === 'Other' && !customIndustry.trim()) {
      newErrors.customIndustry = 'Please specify your industry'
    }
    if (phone && !validatePhoneNumber(phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    if (!bio.trim()) newErrors.bio = 'Bio is required'
    if (bio.trim().length < 50) newErrors.bio = 'Bio should be at least 50 characters'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadProfilePicture = async (): Promise<string | null> => {
    if (!profilePicture) return null

    // Delete old profile picture if exists
    if (existingProfilePicture) {
      const oldPath = existingProfilePicture.split('/profile-pictures/')[1]
      if (oldPath) {
        await supabase.storage.from('profile-pictures').remove([oldPath])
      }
    }

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
    
    const { data } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }

  const uploadResume = async (): Promise<{ fileName: string; filePath: string } | null> => {
    if (!resumeFile) return null

    // Delete old resume if exists
    if (existingResume?.path) {
      await supabase.storage.from('resumes').remove([existingResume.path])
    }

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      let resumeData = {}
      let profilePictureUrl = existingProfilePicture
      
      if (profilePicture) {
        const newUrl = await uploadProfilePicture()
        if (newUrl) profilePictureUrl = newUrl
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
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id)

      if (error) throw error

      toast({
        title: 'Profile updated!',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      navigate('/profile')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error updating profile',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 64px)">
      {/* Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" py={6} mb={8}>
        <Container maxW="container.lg">
          <VStack spacing={2} align="start">
            <HStack spacing={3}>
              <Avatar
                size="md"
                src={profilePicturePreview}
                name={fullName}
              />
              <Box>
                <Heading size="lg" color="gray.800">Edit Profile</Heading>
                <Text color="gray.600" fontSize="sm">
                  Update your profile information to keep your connections informed
                </Text>
              </Box>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.lg" pb={8}>
        <form 
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
            }
          }}
        >
          <VStack spacing={6} align="stretch">
            {/* Profile Picture Section */}
            <Card shadow="md" borderRadius="xl">
              <CardBody p={6}>
                <HStack spacing={2} mb={6}>
                  <Box w={1} h={6} bg="purple.500" borderRadius="full" />
                  <Heading size="md" color="gray.800">Profile Picture</Heading>
                </HStack>
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
                    Change Photo
                  </Button>
                  <Text fontSize="xs" color="gray.500">
                    Max 5MB • JPG, PNG, or GIF
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Basic Information */}
            <Card shadow="md" borderRadius="xl">
              <CardBody p={6}>
                <HStack spacing={2} mb={6}>
                  <Box w={1} h={6} bg="primary.500" borderRadius="full" />
                  <Heading size="md" color="gray.800">Basic Information</Heading>
                </HStack>
                <VStack spacing={5}>
                  <InputField
                    label="Full Name"
                    value={fullName}
                    onChange={setFullName}
                    error={errors.fullName}
                    placeholder="Jane Doe"
                    isRequired
                  />

                  <InputField
                    label="Phone Number"
                    value={phone}
                    onChange={setPhone}
                    error={errors.phone}
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    helperText="Optional - Format: +1 234-567-8900 or (234) 567-8900"
                  />

                  <InputField
                    label="Location"
                    value={location}
                    onChange={setLocation}
                    error={errors.location}
                    placeholder="San Francisco, CA"
                    isRequired
                  />
                </VStack>
              </CardBody>
            </Card>

            {/* Professional Information */}
            <Card shadow="md" borderRadius="xl">
              <CardBody p={6}>
                <HStack spacing={2} mb={6}>
                  <Box w={1} h={6} bg="accent.500" borderRadius="full" />
                  <Heading size="md" color="gray.800">Professional Information</Heading>
                </HStack>
                <VStack spacing={5}>
                  <SelectField
                    label="Industry / Field"
                    value={industry}
                    onChange={setIndustry}
                    error={errors.industry}
                    placeholder="Select your field"
                    options={STEM_FIELDS.map(field => ({ value: field, label: field }))}
                    isRequired
                  />

                  {industry === 'Other' && (
                    <InputField
                      label="Specify Your Industry"
                      value={customIndustry}
                      onChange={setCustomIndustry}
                      error={errors.customIndustry}
                      placeholder="e.g., Environmental Science, Biomedical Engineering"
                      isRequired
                    />
                  )}

                  <InputField
                    label="Current School"
                    value={currentSchool}
                    onChange={setCurrentSchool}
                    placeholder="e.g., MIT, Stanford University"
                    helperText="Optional - Current or most recent school"
                  />

                  <FormControl>
                    <FormLabel fontWeight="semibold">Career Status</FormLabel>
                    <RadioGroup value={careerStatus} onChange={setCareerStatus}>
                      <Stack spacing={3}>
                        <Box p={3} borderRadius="lg" bg={careerStatus === 'in_industry' ? 'primary.50' : 'gray.50'} border="2px solid" borderColor={careerStatus === 'in_industry' ? 'primary.300' : 'transparent'}>
                          <Radio value="in_industry" size="lg" colorScheme="primary">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">Currently in Industry</Text>
                              <Text fontSize="sm" color="gray.600">Working in my field</Text>
                            </VStack>
                          </Radio>
                        </Box>
                        <Box p={3} borderRadius="lg" bg={careerStatus === 'seeking_opportunities' ? 'primary.50' : 'gray.50'} border="2px solid" borderColor={careerStatus === 'seeking_opportunities' ? 'primary.300' : 'transparent'}>
                          <Radio value="seeking_opportunities" size="lg" colorScheme="primary">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">Seeking Opportunities</Text>
                              <Text fontSize="sm" color="gray.600">Actively looking for positions</Text>
                            </VStack>
                          </Radio>
                        </Box>
                        <Box p={3} borderRadius="lg" bg={careerStatus === 'student' ? 'primary.50' : 'gray.50'} border="2px solid" borderColor={careerStatus === 'student' ? 'primary.300' : 'transparent'}>
                          <Radio value="student" size="lg" colorScheme="primary">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">Student</Text>
                              <Text fontSize="sm" color="gray.600">Currently studying</Text>
                            </VStack>
                          </Radio>
                        </Box>
                        <Box p={3} borderRadius="lg" bg={careerStatus === 'career_break' ? 'primary.50' : 'gray.50'} border="2px solid" borderColor={careerStatus === 'career_break' ? 'primary.300' : 'transparent'}>
                          <Radio value="career_break" size="lg" colorScheme="primary">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">Career Break</Text>
                              <Text fontSize="sm" color="gray.600">Taking time off</Text>
                            </VStack>
                          </Radio>
                        </Box>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* About Me */}
            <Card shadow="md" borderRadius="xl">
              <CardBody p={6}>
                <HStack spacing={2} mb={6}>
                  <Box w={1} h={6} bgGradient="linear(to-b, primary.500, accent.500)" borderRadius="full" />
                  <Heading size="md" color="gray.800">About Me</Heading>
                </HStack>
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
              </CardBody>
            </Card>

            {/* Skills & Interests */}
            <Card shadow="md" borderRadius="xl">
              <CardBody p={6}>
                <HStack spacing={2} mb={6}>
                  <Box w={1} h={6} bg="highlight.500" borderRadius="full" />
                  <Heading size="md" color="gray.800">Skills & Interests</Heading>
                </HStack>
                <FormControl>
                  <FormLabel fontWeight="semibold">Add Skills</FormLabel>
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
              </CardBody>
            </Card>

            {/* Social Links */}
            <Card shadow="md" borderRadius="xl">
              <CardBody p={6}>
                <HStack spacing={2} mb={6}>
                  <Box w={1} h={6} bg="cyan.500" borderRadius="full" />
                  <Heading size="md" color="gray.800">Social Links</Heading>
                </HStack>
                <VStack spacing={5}>
                  <FormControl>
                    <FormLabel fontWeight="semibold">LinkedIn URL</FormLabel>
                    <Input
                      value={linkedinUrl}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      size="lg"
                      bg="white"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="semibold">GitHub URL</FormLabel>
                    <Input
                      value={githubUrl}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      size="lg"
                      bg="white"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="semibold">Portfolio / Website</FormLabel>
                    <Input
                      value={portfolioUrl}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      size="lg"
                      bg="white"
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>

            {/* Resume */}
            <Card shadow="md" borderRadius="xl">
              <CardBody p={6}>
                <HStack spacing={2} mb={6}>
                  <Box w={1} h={6} bg="green.500" borderRadius="full" />
                  <Heading size="md" color="gray.800">
                    {existingResume ? 'Replace Resume' : 'Upload Resume'}
                  </Heading>
                </HStack>
                {existingResume && !resumeFile && (
                  <Box mb={4} p={3} bg="blue.50" borderRadius="lg" borderWidth="1px" borderColor="blue.200">
                    <Text fontSize="sm" color="blue.700" fontWeight="medium">
                      Current: {existingResume.name}
                    </Text>
                  </Box>
                )}
                <ResumeUpload
                  onFileSelect={setResumeFile}
                  currentFile={resumeFile}
                />
              </CardBody>
            </Card>

            {/* Action Buttons */}
            <Card shadow="md" borderRadius="xl" bg="gray.50">
              <CardBody p={6}>
                <HStack spacing={4} justify="flex-end">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/profile')}
                    colorScheme="gray"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="primary"
                    size="lg"
                    isLoading={saving}
                    loadingText="Saving..."
                    px={12}
                  >
                    Save Changes
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          </VStack>
        </form>
      </Container>
    </Box>
  )
}

export default EditProfile
