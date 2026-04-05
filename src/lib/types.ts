export interface Class {
  id: string
  name: string
  subject: string
  yearLevel: number
  createdAt: string
}

export interface Student {
  id: string
  classId: string
  firstName: string
  lastName: string
  gender: 'male' | 'female' | 'nonbinary' | 'unspecified'
  iep: boolean
  eald: boolean
  notes: string
}

export interface Assessment {
  id: string
  studentId: string
  classId: string
  grade: '' | 'A' | 'B' | 'C' | 'D' | 'E'
  effort: '' | 'Excellent' | 'Very Good' | 'Satisfactory' | 'Needs Improvement'
  strengths: string
  areasForGrowth: string
  attendancePct: number
  notes: string
}

export interface ReportComment {
  id: string
  studentId: string
  classId: string
  aiDraft: string
  editedText: string
  status: 'pending' | 'draft' | 'approved'
  createdAt: string
  updatedAt: string
}

export interface Settings {
  schoolName: string
  styleGuide: string
  tone: 'formal' | 'warm' | 'balanced'
  commentLength: 'short' | 'medium' | 'long'
  pronouns: 'they' | 'gendered' | 'name-only'
}

export type Grade = Assessment['grade']
export type Effort = Assessment['effort']
export type CommentStatus = ReportComment['status']
export type Tone = Settings['tone']
