'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Class, Student, Assessment, ReportComment, Settings } from './types'
import { generateId } from './utils'
import { seedTerm2 } from './seed-term2'

const defaultSettings: Settings = {
  schoolName: '',
  styleGuide: '',
  tone: 'balanced',
  commentLength: 'medium',
  pronouns: 'they',
}

interface StoreData {
  classes: Class[]
  students: Student[]
  assessments: Assessment[]
  comments: ReportComment[]
  settings: Settings
}

const empty: StoreData = {
  classes: [],
  students: [],
  assessments: [],
  comments: [],
  settings: defaultSettings,
}

const KEY = 'teacher-os-data'

function load(): StoreData {
  if (typeof window === 'undefined') return empty
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...empty, ...parsed, settings: { ...defaultSettings, ...parsed.settings } }
    }
  } catch { /* corrupt data, start fresh */ }
  return empty
}

function save(data: StoreData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

interface Store {
  data: StoreData
  ready: boolean

  addClass(input: { name: string; subject: string; yearLevel: number }): Class
  updateClass(id: string, updates: Partial<Class>): void
  deleteClass(id: string): void

  addStudent(input: { classId: string; firstName: string; lastName: string; gender?: Student['gender']; iep?: boolean; eald?: boolean; notes?: string }): Student
  updateStudent(id: string, updates: Partial<Student>): void
  deleteStudent(id: string): void
  importStudents(classId: string, rows: { firstName: string; lastName: string; gender?: string; iep?: boolean; eald?: boolean }[]): void
  importStudentsWithData(classId: string, rows: { firstName: string; lastName: string; gender?: string; iep?: boolean; eald?: boolean; grade?: string; effort?: string; strengths?: string; areasForGrowth?: string; attendance?: number; notes?: string }[]): void
  getStudentsForClass(classId: string): Student[]

  getAssessment(studentId: string, classId: string): Assessment
  updateAssessment(studentId: string, classId: string, updates: Partial<Assessment>): void

  getComment(studentId: string, classId: string): ReportComment
  updateComment(studentId: string, classId: string, updates: Partial<ReportComment>): void

  updateSettings(updates: Partial<Settings>): void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>(empty)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    seedTerm2()
    setData(load())
    setReady(true)
  }, [])

  const persist = useCallback((updater: (prev: StoreData) => StoreData) => {
    setData(prev => {
      const next = updater(prev)
      save(next)
      return next
    })
  }, [])

  // Class operations
  const addClass = useCallback((input: { name: string; subject: string; yearLevel: number }): Class => {
    const cls: Class = { id: generateId(), ...input, createdAt: new Date().toISOString() }
    persist(d => ({ ...d, classes: [...d.classes, cls] }))
    return cls
  }, [persist])

  const updateClass = useCallback((id: string, updates: Partial<Class>) => {
    persist(d => ({ ...d, classes: d.classes.map(c => c.id === id ? { ...c, ...updates } : c) }))
  }, [persist])

  const deleteClass = useCallback((id: string) => {
    persist(d => ({
      ...d,
      classes: d.classes.filter(c => c.id !== id),
      students: d.students.filter(s => s.classId !== id),
      assessments: d.assessments.filter(a => a.classId !== id),
      comments: d.comments.filter(c => c.classId !== id),
    }))
  }, [persist])

  // Student operations
  const addStudent = useCallback((input: { classId: string; firstName: string; lastName: string; gender?: Student['gender']; iep?: boolean; eald?: boolean; notes?: string }): Student => {
    const student: Student = {
      id: generateId(),
      classId: input.classId,
      firstName: input.firstName,
      lastName: input.lastName,
      gender: input.gender || 'unspecified',
      iep: input.iep || false,
      eald: input.eald || false,
      notes: input.notes || '',
    }
    persist(d => ({ ...d, students: [...d.students, student] }))
    return student
  }, [persist])

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    persist(d => ({ ...d, students: d.students.map(s => s.id === id ? { ...s, ...updates } : s) }))
  }, [persist])

  const deleteStudent = useCallback((id: string) => {
    persist(d => ({
      ...d,
      students: d.students.filter(s => s.id !== id),
      assessments: d.assessments.filter(a => a.studentId !== id),
      comments: d.comments.filter(c => c.studentId !== id),
    }))
  }, [persist])

  const importStudents = useCallback((classId: string, rows: { firstName: string; lastName: string; gender?: string; iep?: boolean; eald?: boolean }[]) => {
    const newStudents: Student[] = rows.map(r => ({
      id: generateId(),
      classId,
      firstName: r.firstName,
      lastName: r.lastName,
      gender: (['male', 'female', 'nonbinary'].includes(r.gender || '') ? r.gender : 'unspecified') as Student['gender'],
      iep: r.iep || false,
      eald: r.eald || false,
      notes: '',
    }))
    persist(d => ({ ...d, students: [...d.students, ...newStudents] }))
  }, [persist])

  const importStudentsWithData = useCallback((classId: string, rows: {
    firstName: string; lastName: string; gender?: string; iep?: boolean; eald?: boolean
    grade?: string; effort?: string; strengths?: string; areasForGrowth?: string; attendance?: number; notes?: string
  }[]) => {
    const newStudents: Student[] = []
    const newAssessments: Assessment[] = []
    for (const r of rows) {
      const sid = generateId()
      newStudents.push({
        id: sid,
        classId,
        firstName: r.firstName,
        lastName: r.lastName,
        gender: (['male', 'female', 'nonbinary'].includes(r.gender || '') ? r.gender : 'unspecified') as Student['gender'],
        iep: r.iep || false,
        eald: r.eald || false,
        notes: '',
      })
      const hasAssessment = r.grade || r.effort || r.strengths || r.areasForGrowth || r.attendance || r.notes
      if (hasAssessment) {
        newAssessments.push({
          id: generateId(),
          studentId: sid,
          classId,
          grade: (['A','B','C','D','E'].includes(r.grade?.toUpperCase() || '') ? r.grade!.toUpperCase() : '') as Assessment['grade'],
          effort: (['Excellent','Very Good','Satisfactory','Needs Improvement'].find(e => e.toLowerCase() === (r.effort || '').toLowerCase()) || '') as Assessment['effort'],
          strengths: r.strengths || '',
          areasForGrowth: r.areasForGrowth || '',
          attendancePct: r.attendance || 0,
          notes: r.notes || '',
        })
      }
    }
    persist(d => ({
      ...d,
      students: [...d.students, ...newStudents],
      assessments: [...d.assessments, ...newAssessments],
    }))
  }, [persist])

  const getStudentsForClass = useCallback((classId: string): Student[] => {
    return data.students.filter(s => s.classId === classId).sort((a, b) => a.lastName.localeCompare(b.lastName))
  }, [data.students])

  // Assessment operations
  const getAssessment = useCallback((studentId: string, classId: string): Assessment => {
    const existing = data.assessments.find(a => a.studentId === studentId && a.classId === classId)
    if (existing) return existing
    return { id: '', studentId, classId, grade: '', effort: '', strengths: '', areasForGrowth: '', attendancePct: 0, notes: '' }
  }, [data.assessments])

  const updateAssessment = useCallback((studentId: string, classId: string, updates: Partial<Assessment>) => {
    persist(d => {
      const idx = d.assessments.findIndex(a => a.studentId === studentId && a.classId === classId)
      if (idx >= 0) {
        const updated = [...d.assessments]
        updated[idx] = { ...updated[idx], ...updates }
        return { ...d, assessments: updated }
      }
      const newAssessment: Assessment = {
        id: generateId(),
        studentId,
        classId,
        grade: '',
        effort: '',
        strengths: '',
        areasForGrowth: '',
        attendancePct: 0,
        notes: '',
        ...updates,
      }
      return { ...d, assessments: [...d.assessments, newAssessment] }
    })
  }, [persist])

  // Comment operations
  const getComment = useCallback((studentId: string, classId: string): ReportComment => {
    const existing = data.comments.find(c => c.studentId === studentId && c.classId === classId)
    if (existing) return existing
    return { id: '', studentId, classId, aiDraft: '', editedText: '', status: 'pending', createdAt: '', updatedAt: '' }
  }, [data.comments])

  const updateComment = useCallback((studentId: string, classId: string, updates: Partial<ReportComment>) => {
    persist(d => {
      const idx = d.comments.findIndex(c => c.studentId === studentId && c.classId === classId)
      const now = new Date().toISOString()
      if (idx >= 0) {
        const updated = [...d.comments]
        updated[idx] = { ...updated[idx], ...updates, updatedAt: now }
        return { ...d, comments: updated }
      }
      const newComment: ReportComment = {
        id: generateId(),
        studentId,
        classId,
        aiDraft: '',
        editedText: '',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        ...updates,
      }
      return { ...d, comments: [...d.comments, newComment] }
    })
  }, [persist])

  // Settings
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    persist(d => ({ ...d, settings: { ...d.settings, ...updates } }))
  }, [persist])

  const store: Store = {
    data, ready,
    addClass, updateClass, deleteClass,
    addStudent, updateStudent, deleteStudent, importStudents, importStudentsWithData, getStudentsForClass,
    getAssessment, updateAssessment,
    getComment, updateComment,
    updateSettings,
  }

  return <StoreContext value={store}>{children}</StoreContext>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
