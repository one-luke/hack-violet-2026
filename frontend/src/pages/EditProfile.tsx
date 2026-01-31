import { useState, useEffect, ChangeEvent, KeyboardEvent, FormEvent } from 'react'
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
  Center,
  Spinner,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import ResumeUpload from '../components/ResumeUpload'
import { Profile, FormErrors } from '../types'

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
  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [existingResume, setExistingResume] = useState<ExistingResume | null>(null)

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
      setBio(profile.bio || '')
      setLinkedinUrl(profile.linkedin_url || '')
      setGithubUrl(profile.github_url || '')
      setPortfolioUrl(profile.portfolio_url || '')
      setSkills(profile.skills || [])
      
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
    if (!bio.trim()) newErrors.bio = 'Bio is required'
    if (bio.trim().length < 50) newErrors.bio = 'Bio should be at least 50 characters'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
          industry,
          bio,
          linkedin_url: linkedinUrl || null,
          github_url: githubUrl || null,
          portfolio_url: portfolioUrl || null,
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
    return (
      <Center h="calc(100vh - 64px)">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Center>
    )
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Edit Profile</Heading>
          <Text color="gray.600">
            Update your profile information
          </Text>
        </Box>

        <Box bg="white" p={8} borderRadius="xl" boxShadow="lg">
          <form onSubmit={handleSubmit}>
            <VStack spacing={5}>
              <FormControl isInvalid={!!errors.fullName}>
                <FormLabel>Full Name *</FormLabel>
                <Input
                  value={fullName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  size="lg"
                />
                <FormErrorMessage>{errors.fullName}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  value={phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  size="lg"
                />
              </FormControl>

              <FormControl isInvalid={!!errors.location}>
                <FormLabel>Location *</FormLabel>
                <Input
                  value={location}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  size="lg"
                />
                <FormErrorMessage>{errors.location}</FormErrorMessage>
              </FormControl>

              <Divider />

              <FormControl isInvalid={!!errors.industry}>
                <FormLabel>Industry / Field *</FormLabel>
                <Select
                  value={industry}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setIndustry(e.target.value)}
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

              <FormControl isInvalid={!!errors.bio}>
                <FormLabel>Bio *</FormLabel>
                <Textarea
                  value={bio}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSkill()
                      }
                    }}
                    placeholder="e.g., Python, Machine Learning"
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>GitHub URL</FormLabel>
                  <Input
                    value={githubUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Portfolio / Website</FormLabel>
                <Input
                  value={portfolioUrl}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </FormControl>

              <Divider />

              <FormControl>
                <FormLabel>
                  {existingResume ? 'Replace Resume' : 'Upload Resume'}
                </FormLabel>
                {existingResume && !resumeFile && (
                  <Text fontSize="sm" color="gray.600" mb={3}>
                    Current: {existingResume.name}
                  </Text>
                )}
                <ResumeUpload
                  onFileSelect={setResumeFile}
                  currentFile={resumeFile}
                />
              </FormControl>

              <HStack spacing={4} w="full" pt={4}>
                <Button
                  variant="outline"
                  size="lg"
                  flex={1}
                  onClick={() => navigate('/profile')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="purple"
                  size="lg"
                  flex={1}
                  isLoading={saving}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
              </HStack>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  )
}

export default EditProfile
