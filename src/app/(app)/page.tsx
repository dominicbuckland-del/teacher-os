'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { gradeColor } from '@/lib/utils'

export default function Dashboard() {
  const { data, ready, addClass } = useStore()
  const [showModal, setShowModal] = useState(false)

  if (!ready) return <Loading />

  const classes = data.classes

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your Classes</h1>
          <p className="text-text-secondary text-[14px] mt-1">
            {classes.length === 0
              ? 'Add a class to start writing report comments.'
              : `${classes.length} class${classes.length === 1 ? '' : 'es'} — select one to manage students and write reports.`
            }
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Class
        </button>
      </div>

      {classes.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {classes.map(cls => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      )}

      {showModal && (
        <NewClassModal
          onClose={() => setShowModal(false)}
          onCreate={(input) => {
            addClass(input)
            setShowModal(false)
          }}
        />
      )}
    </div>
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
    <Link href={`/classes/${cls.id}`} className="card p-5 hover:border-primary/30 hover:shadow-md transition-all group block">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-[15px] group-hover:text-primary transition-colors">{cls.name}</h3>
          <p className="text-text-secondary text-[13px] mt-0.5">{cls.subject} — Year {cls.yearLevel}</p>
        </div>
        <div className="text-right">
          <p className="text-[13px] text-text-muted">{total} student{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {total > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] text-text-muted mb-1.5">
            <span>Report progress</span>
            <span>{approved}/{total} approved</span>
          </div>
          <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? '#10B981' : pct > 0 ? '#0D9488' : '#E2E8F0',
              }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="card p-12 text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-light flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
      <h3 className="font-semibold text-[16px] mb-1">No classes yet</h3>
      <p className="text-text-secondary text-[14px] mb-5 max-w-sm mx-auto">
        Create your first class, add students, and start generating report comments with AI.
      </p>
      <button onClick={onAdd} className="btn btn-primary">
        Create Your First Class
      </button>
    </div>
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
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. 9A English"
                autoFocus
              />
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
                {Array.from({ length: 12 }, (_, i) => i + 1).map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={() => name.trim() && subject && onCreate({ name: name.trim(), subject, yearLevel })}
            disabled={!name.trim() || !subject}
            className="btn btn-primary"
          >
            Create Class
          </button>
        </div>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
