export interface User {
    _id: string
    name: string
    email: string
    username: string
    role: "user" | "admin"
    created_at: string
    updated_at?: string
    progress?: UserProgress
    preferences?: UserPreferences
    course_progress?: CourseProgress
  }
  
  export interface LoginResponse {
    message: string
    access_token: string
    user: User
  }
  
  export interface RegisterResponse {
    message: string
    access_token: string
    user: User
  }
  
  export interface Course {
    _id: string
    title: string
    description: string
    category: string
    difficulty: string
    prerequisites: string[]
    content: {
      sections: CourseSection[]
      tags: string[]
    }
    enrollment_count: number
    enrolled_users: string[]
    completed_users: string[]
    created_at: string
    updated_at: string
  }
  
  export interface CourseSection {
    section_id: string
    title: string
    order: number
    sub_sections: CourseSubSection[]
  }
  
  export interface CourseSubSection {
    subsection_id: string
    title: string
    order: number
    data: CourseContent[]
  }
  
  export interface CourseContent {
    data_id: string
    type: "text" | "image" | "video" | "code"
    content: string
    order: number
    language?: string
    url?: string
    alt_text?: string
    caption?: string
  }
  
  export interface Assessment {
    _id: string
    title: string
    time_limit: number
    course_id: string
    questions: string[]
    created_at: string
    updated_at: string
  }
  
  export interface Question {
    _id: string
    question_text: string
    options: string[]
    correct_answer: string
    tags: string[]
    assessment_ids: string[]
    created_at: string
    updated_at: string
  }
  
  export interface AssessmentResult {
    _id: string
    user_id: string
    assessment_id: string
    answers: string[]
    score: number
    passed: boolean
    knowledge_gaps: string[]
    demonstrated_strengths: string[]
    created_at: string
    completed_at: string
    started_at: string
    time_spent: number
    questions: Question[]
  }
  
  export interface LearningPath {
    _id: string
    title: string
    description: string
    courses: string[]
    progress: number
    target_skills: string[]
    created_at: string
    updated_at: string
  }
  
  export interface UserProgress {
    completed_courses: CourseProgress[]
    in_progress_courses: string[]
    completed_assessments: string[]
  }
  
  export interface UserPreferences {
    categories: string[]
    skills: string[]
    difficulty: "beginner" | "intermediate" | "advanced"
    learning_style: "visual" | "auditory" | "reading" | "kinesthetic"
    time_commitment: "low" | "medium" | "high"
    goals: string[]
  }

  export interface PaginatedResponse<T> {
    data: T[]
    count: number
    skip: number
    limit: number
  }

  export interface ContactSupport {
    name: string
    email: string
    subject: string
    message: string
  }
  
  export interface ProgressResponse {
    message: string
    progress: CourseProgress
  }

  export interface CourseProgress {
    course_id: string
    percentage: number
  }
