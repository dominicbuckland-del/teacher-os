'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { cn, gradeColor } from '@/lib/utils'

export default function Dashboard() {
  const store = useStore()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  // Redirect to onboarding if first time
  useEffect(() => {
    if (store.ready && !localStorage.getItem('teacher-os-onboarded')) {
      router.push('/onboarding')
    }
  }, [store.ready, router])

  if (!store.ready) return <Loading />

  const { data, addClass } = store
  const classes = data.classes
  const totalStudents = data.students.length
  const totalComments = data.comments.length
  const approvedComments = data.comments.filter(c => c.status === 'approved').length
  const behaviourCount = (data.behaviourIncidents || []).length
  const commsCount = (data.parentComms || []).length

  // Getting started checklist
  const checks = [
    { done: classes.length > 0, label: 'Create a class', link: '/onboarding', linkLabel: 'Add class' },
    { done: totalStudents > 0, label: 'Add students to a class', link: classes[0] ? `/classes/${classes[0].id}` : '/onboarding', linkLabel: 'Add students' },
    { done: approvedComments > 0, label: 'Write your first report comment', link: classes[0] ? `/workspace/${classes[0].id}` : '/', linkLabel: 'Write reports' },
    { done: data.settings.styleGuide !== '', label: 'Add your style guide or context', link: '/context', linkLabel: 'Add context' },
  ]
  const checksDone = checks.filter(c => c.done).length
  const allDone = checksDone === checks.length

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-text-secondary text-[14px] mt-0.5">
            {totalStudents > 0
              ? `${classes.length} class${classes.length !== 1 ? 'es' : ''}, ${totalStudents} students`
              : 'Welcome to Teacher OS'
            }
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Class
        </button>
      </div>

      {/* Getting started (show until all done) */}
      {!allDone && (
        <div className="card p-5 mb-6 border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[15px]">Getting Started</h2>
            <span className="text-[12px] text-text-muted">{checksDone}/{checks.length} complete</span>
          </div>
          <div className="space-y-2">
            {checks.map((check, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]',
                  check.done ? 'bg-emerald-100 text-emerald-600' : 'bg-border-light text-text-muted'
                )}>
                  {check.done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </span>
                <span className={cn('text-[13px] flex-1', check.done ? 'text-text-muted line-through' : 'text-text')}>{check.label}</span>
                {!check.done && (
                  <Link href={check.link} className="text-[12px] text-primary font-medium hover:text-primary-hover">{check.linkLabel}</Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      {classes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <QuickAction href="/rubrics" label="Create Rubric" icon="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          <QuickAction href="/behaviour" label="Log Behaviour" icon="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          <QuickAction href="/emails" label="Draft Email" icon="M2 4h20v16H2zM22 7l-10 7L2 7" />
          <QuickAction href="/relief" label="Relief Notes" icon="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6v4H9z" />
        </div>
      )}

      {/* Classes */}
      {classes.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-light flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-[16px] mb-1">No classes yet</h3>
          <p className="text-text-secondary text-[14px] mb-5 max-w-sm mx-auto">Create your first class to start writing report comments, planning lessons, and tracking students.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">Create Your First Class</button>
        </div>
      ) : (
        <div>
          <h2 className="font-semibold text-[15px] mb-3">Your Classes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {classes.map(cls => <ClassCard key={cls.id} cls={cls} />)}
          </div>
        </div>
      )}

      {showModal && (
        <NewClassModal
          onClose={() => setShowModal(false)}
          onCreate={(input) => { addClass(input); setShowModal(false) }}
        />
      )}
    </div>
  )
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="card p-3 text-center hover:border-primary/30 hover:shadow-sm transition-all group">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1.5 group-hover:stroke-primary transition-colors">
        <path d={icon} />
      </svg>
      <p className="text-[12px] font-medium text-text-secondary group-hover:text-primary transition-colors">{label}</p>
    </Link>
  )
}

function ClassCard({ cls }: { cls: { id: string; name: string; subject: string; yearLevel: number } }) {
  const { data } = useStore()
  const students = data.students.filter(s => s.classId === cls.id)
  const comments = data.comments.filter(c => c.classId === cls.id)
  const approved = comments.filter(c => c.status === 'approved').length
  const total = students.length
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0

  return (
    <Link href={`/classes/${cls.id}`} className="card p-4 hover:border-primary/30 hover:shadow-sm transition-all group block">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-[14px] group-hover:text-primary transition-colors">{cls.name}</h3>
          <p className="text-text-secondary text-[12px] mt-0.5">{cls.subject} — Year {cls.yearLevel}</p>
        </div>
        <p className="text-[12px] text-text-muted">{total} student{total !== 1 ? 's' : ''}</p>
      </div>
      {total > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
            <span>Reports</span>
            <span>{approved}/{total}</span>
          </div>
          <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: pct === 100 ? '#10B981' : pct > 0 ? '#0D9488' : '#E2E8F0' }} />
          </div>
        </div>
      )}
    </Link>
  )
}

function NewClassModal({ onClose, onCreate }: { onClose: () => void; onCreate: (input: { name: string; subject: string; yearLevel: number }) => void }) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [yearLevel, setYearLevel] = useState(7)
  const subjects = ['English', 'Mathematics', 'Science', 'Humanities', 'Health & Physical Education', 'The Arts', 'Technologies', 'Languages', 'Other']

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">New Class</h2>
          <p className="text-text-secondary text-[13px] mb-5">Add a class to start managing students and writing reports.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Class Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 9A English" autoFocus />
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
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={() => name.trim() && subject && onCreate({ name: name.trim(), subject, yearLevel })} disabled={!name.trim() || !subject} className="btn btn-primary">Create Class</button>
        </div>
      </div>
    </div>
  )
}

function Loading() {
  return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
}
