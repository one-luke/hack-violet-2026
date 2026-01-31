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
  created_at: string
  updated_at: string
}

export interface FormErrors {
  fullName?: string
  phone?: string
  location?: string
  industry?: string
  bio?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
}
