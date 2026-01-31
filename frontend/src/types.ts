export interface Profile {
  id: string
  full_name: string
  email: string
  location: string
  industry: string
  bio: string
  skills: string[]
  phone?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  resume_filename?: string
  resume_filepath?: string
  resume_uploaded_at?: string
  profile_picture_url?: string
  custom_industry?: string
  current_school?: string
  career_status?: 'in_industry' | 'seeking_opportunities' | 'student' | 'career_break'
  created_at: string
  updated_at: string
}

export interface FormErrors {
  fullName?: string
  phone?: string
  location?: string
  industry?: string
  customIndustry?: string
  bio?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  currentSchool?: string
  careerStatus?: string
}
