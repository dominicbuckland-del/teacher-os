'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { parseCSV } from '@/lib/utils'

const steps = ['Welcome', 'Your Details', 'Add a Class', 'Add Students', 'Style Guide', 'Ready']

export default function OnboardingPage() {
  const store = useStore()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [className, setClassName] = useState('')
  const [subject, setSubject] = useState('')
  const [yearLevel, setYearLevel] = useState(7)
  const [createdClassId, setCreatedClassId] = useState('')
  const [csvText, setCsvText] = useState('')
  const [styleGuide, setStyleGuide] = useState('')
  const [studentCount, setStudentCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!store.ready) return null

  const subjects = ['English', 'Mathematics', 'Science', 'Humanities', 'Health & Physical Education', 'The Arts', 'Technologies', 'Languages']

  function handleCreateClass() {
    if (!className.trim() || !subject) return
    const cls = store.addClass({ name: className.trim(), subject, yearLevel })
    setCreatedClassId(cls.id)
    setStep(3)
  }

  function handleImportStudents() {
    if (!csvText.trim() || !createdClassId) { setStep(4); return }
    const rows = parseFullCSV(csvText)
    if (rows.length > 0) {
      store.importStudentsWithData(createdClassId, rows)
      setStudentCount(rows.length)
    }
    setStep(4)
  }

  function handleFinish() {
    if (school.trim()) store.updateSettings({ schoolName: school.trim() })
    if (styleGuide.trim()) store.updateSettings({ styleGuide: styleGuide.trim() })
    localStorage.setItem('teacher-os-onboarded', 'true')
    router.push('/')
  }

  function skip() {
    localStorage.setItem('teacher-os-onboarded', 'true')
    router.push('/')
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary w-8' : 'bg-border w-4'}`} />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">Welcome to Teacher OS</h1>
            <p className="text-text-secondary text-[15px] leading-relaxed max-w-md mx-auto mb-2">
              Your AI-powered operating system for teaching. Write reports in minutes, generate lesson plans, create rubrics, track behaviour, and communicate with parents — all in one place.
            </p>
            <p className="text-text-muted text-[13px] mb-8">Let's get you set up. This takes about 2 minutes.</p>
            <button onClick={() => setStep(1)} className="btn btn-primary px-8 py-2.5 text-[15px]">Get Started</button>
            <p className="mt-4"><button onClick={skip} className="text-[13px] text-text-muted hover:text-text-secondary">Skip setup, I'll explore on my own</button></p>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-1">About you</h2>
            <p className="text-text-secondary text-[14px] mb-6">This helps the AI personalise everything it writes.</p>
            <div className="card p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Your Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah Thompson" autoFocus />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">School Name</label>
                <input type="text" value={school} onChange={e => setSchool(e.target.value)} placeholder="e.g. Westside State School" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <button onClick={() => setStep(0)} className="btn btn-ghost text-text-muted">Back</button>
              <button onClick={() => setStep(2)} className="btn btn-primary">Continue</button>
            </div>
          </div>
        )}

        {/* Step 2: Create a Class */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-1">Create your first class</h2>
            <p className="text-text-secondary text-[14px] mb-6">You can add more classes later from the Dashboard.</p>
            <div className="card p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Class Name</label>
                <input type="text" value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. 9A English" autoFocus />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)}>
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Year Level</label>
                <select value={yearLevel} onChange={e => setYearLevel(Number(e.target.value))}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <button onClick={() => setStep(1)} className="btn btn-ghost text-text-muted">Back</button>
              <div className="flex gap-2">
                <button onClick={() => { setStep(4); }} className="btn btn-ghost text-text-muted">Skip</button>
                <button onClick={handleCreateClass} disabled={!className.trim() || !subject} className="btn btn-primary">Create Class</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Add Students */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-1">Add students to {className}</h2>
            <p className="text-text-secondary text-[14px] mb-6">Paste a CSV with student names (and optionally grades). You can also add students later.</p>
            <div className="card p-6">
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) f.text().then(setCsvText) }} />
              <button onClick={() => fileRef.current?.click()} className="btn btn-secondary btn-sm mb-3">Upload CSV File</button>
              <textarea
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder={`firstName,lastName,grade\nEmma,Wilson,B\nJack,Chen,A\nMia,Johnson,C`}
                rows={8}
                className="text-[13px] font-mono"
              />
              <p className="text-[11px] text-text-muted mt-2">Columns: firstName, lastName (required). Optional: grade, effort, strengths, areasForGrowth</p>
            </div>
            <div className="flex items-center justify-between mt-6">
              <button onClick={() => setStep(2)} className="btn btn-ghost text-text-muted">Back</button>
              <div className="flex gap-2">
                <button onClick={() => setStep(4)} className="btn btn-ghost text-text-muted">Skip</button>
                <button onClick={handleImportStudents} className="btn btn-primary">{csvText.trim() ? 'Import & Continue' : 'Continue'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Style Guide */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-1">Report writing style (optional)</h2>
            <p className="text-text-secondary text-[14px] mb-6">Paste your school's report writing guidelines. The AI will follow these rules when generating comments.</p>
            <div className="card p-6">
              <textarea
                value={styleGuide}
                onChange={e => setStyleGuide(e.target.value)}
                placeholder={`e.g.\n- Use formal language\n- Always end with a goal for next semester\n- Do not use the word "excellent"\n- Comments should be 3-5 sentences\n- Reference specific curriculum outcomes`}
                rows={8}
                className="text-[13px]"
              />
              <p className="text-[11px] text-text-muted mt-2">You can add more context later from the "My Context" page — school policies, past reports, curriculum documents.</p>
            </div>
            <div className="flex items-center justify-between mt-6">
              <button onClick={() => setStep(createdClassId ? 3 : 2)} className="btn btn-ghost text-text-muted">Back</button>
              <button onClick={() => setStep(5)} className="btn btn-primary">{styleGuide.trim() ? 'Continue' : 'Skip'}</button>
            </div>
          </div>
        )}

        {/* Step 5: Ready */}
        {step === 5 && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">You're all set!</h1>
            <p className="text-text-secondary text-[15px] leading-relaxed max-w-md mx-auto mb-2">
              {createdClassId
                ? `${className} is ready${studentCount > 0 ? ` with ${studentCount} students` : ''}. Head to the Dashboard to start writing reports, planning lessons, or exploring other tools.`
                : 'Head to the Dashboard to create your first class and start using Teacher OS.'}
            </p>

            <div className="card p-5 text-left mt-6 mb-6 max-w-sm mx-auto">
              <p className="font-semibold text-[14px] mb-3">What you can do now:</p>
              <div className="space-y-2.5 text-[13px] text-text-secondary">
                <div className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">1.</span>
                  <span><strong>Write Reports</strong> — open a class and click "Write Reports" to generate AI comments</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">2.</span>
                  <span><strong>Plan Lessons</strong> — open the Planner and click "Plan Day" on any date</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">3.</span>
                  <span><strong>Create a Rubric</strong> — go to Assessments and describe your next task</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">4.</span>
                  <span><strong>Draft an Email</strong> — open Emails, pick a template, and personalise it</span>
                </div>
              </div>
            </div>

            <button onClick={handleFinish} className="btn btn-primary px-8 py-2.5 text-[15px]">Go to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  )
}

function parseFullCSV(text: string): { firstName: string; lastName: string; grade?: string; effort?: string; strengths?: string; areasForGrowth?: string }[] {
  const rows = parseCSV(text)
  return rows.map(r => {
    const firstName = (r.firstname || r.first || r.givenname || r.given || '').trim()
    const lastName = (r.lastname || r.last || r.surname || r.family || '').trim()
    if (!firstName || !lastName) return null
    const grade = (r.grade || r.result || '').trim().toUpperCase()
    return {
      firstName, lastName,
      grade: ['A','B','C','D','E'].includes(grade) ? grade : undefined,
      effort: (r.effort || '').trim() || undefined,
      strengths: (r.strengths || '').trim() || undefined,
      areasForGrowth: (r.areasforgrowth || r.growth || '').trim() || undefined,
    }
  }).filter((r): r is NonNullable<typeof r> => r !== null)
}
