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

export interface BehaviourIncident {
  id: string
  studentId: string
  classId: string
  date: string
  time: string
  type: 'positive' | 'concern'
  category: string
  description: string
  actionTaken: string
  severity: 'minor' | 'moderate' | 'major'
}

export interface ParentComm {
  id: string
  studentId: string
  date: string
  commType: 'email' | 'phone' | 'meeting' | 'note'
  subject: string
  notes: string
  followUpDate: string
  followUpDone: boolean
}

export interface FeedbackEntry {
  id: string
  studentId: string
  classId: string
  date: string
  taskName: string
  studentWork: string
  feedback: string
}

export type Grade = Assessment['grade']
export type Effort = Assessment['effort']
export type CommentStatus = ReportComment['status']
export type Tone = Settings['tone']
