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

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  other_user: {
    id: string
    name: string
    profile_picture_url?: string
  }
  last_message?: Message
  unread_count: number
  created_at: string
  updated_at: string
}

export interface Insight {
  id: string
  user_id: string
  title: string
  content: string
  link_url?: string
  link_title?: string
  created_at: string
  updated_at: string
  likes_count: number
  liked_by_user: boolean
  profiles?: {
    full_name: string
    profile_picture_url?: string
  }
}
