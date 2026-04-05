'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { cn, fullName } from '@/lib/utils'
import type { ParentComm } from '@/lib/types'

const commTypes: ParentComm['commType'][] = ['email', 'phone', 'meeting', 'note']
const commTypeLabels: Record<string, { label: string; color: string }> = {
  email: { label: 'Email', color: 'bg-blue-100 text-blue-700' },
  phone: { label: 'Phone', color: 'bg-amber-100 text-amber-700' },
  meeting: { label: 'Meeting', color: 'bg-purple-100 text-purple-700' },
  note: { label: 'Note', color: 'bg-slate-100 text-slate-600' },
}

export default function CommsPage() {
  const store = useStore()
  const [classFilter, setClassFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!store.ready) return null

  const allComms = (store.data.parentComms || []).sort((a, b) => b.date.localeCompare(a.date))
  const filtered = allComms.filter(c => {
    if (classFilter) {
      const student = store.data.students.find(s => s.id === c.studentId)
      if (!student || student.classId !== classFilter) return false
    }
    if (typeFilter && c.commType !== typeFilter) return false
    return true
  })

  const pendingFollowUps = allComms.filter(c => c.followUpDate && !c.followUpDone && c.followUpDate <= new Date().toISOString().split('T')[0])

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Parent Communications</h1>
          <p className="text-text-secondary text-[14px] mt-1">Log every parent interaction. Searchable, exportable, compliance-ready.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Log Interaction
        </button>
      </div>

      {/* Follow-up reminders */}
      {pendingFollowUps.length > 0 && (
        <div className="card p-4 mb-6 border-amber-200 bg-amber-50">
          <p className="font-semibold text-[14px] text-amber-800 mb-2">Follow-ups due ({pendingFollowUps.length})</p>
          {pendingFollowUps.map(c => {
            const student = store.data.students.find(s => s.id === c.studentId)
            return (
              <div key={c.id} className="flex items-center justify-between py-1.5 text-[13px]">
                <span className="text-amber-900">{student ? fullName(student) : 'Unknown'} — {c.subject}</span>
                <button onClick={() => store.updateParentComm(c.id, { followUpDone: true })} className="btn btn-ghost btn-sm text-[11px] text-amber-700">Mark Done</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="text-[13px] py-1.5 px-3 w-auto">
          <option value="">All Classes</option>
          {store.data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="text-[13px] py-1.5 px-3 w-auto">
          <option value="">All Types</option>
          {commTypes.map(t => <option key={t} value={t}>{commTypeLabels[t].label}</option>)}
        </select>
        <span className="text-[12px] text-text-muted ml-auto">{filtered.length} interaction{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Comms list */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-text-secondary text-[14px] mb-3">{allComms.length === 0 ? 'No parent communications logged yet.' : 'No communications match your filters.'}</p>
          {allComms.length === 0 && <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm">Log First Interaction</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const student = store.data.students.find(s => s.id === c.studentId)
            const cls = student ? store.data.classes.find(cl => cl.id === student.classId) : null
            const expanded = expandedId === c.id
            return (
              <div key={c.id} className="card overflow-hidden">
                <button onClick={() => setExpandedId(expanded ? null : c.id)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-border-light/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn('badge text-[10px]', commTypeLabels[c.commType]?.color)}>{commTypeLabels[c.commType]?.label}</span>
                      <span className="text-[11px] text-text-muted">{c.date}</span>
                      {c.followUpDate && !c.followUpDone && <span className="badge bg-amber-100 text-amber-700 text-[10px]">Follow-up</span>}
                    </div>
                    <p className="font-medium text-[14px]">{student ? fullName(student) : 'Unknown'}</p>
                    <p className="text-[13px] text-text-secondary truncate">{c.subject}</p>
                  </div>
                  <span className="text-[11px] text-text-muted shrink-0">{cls?.name || ''}</span>
                </button>
                {expanded && (
                  <div className="px-4 pb-4 border-t border-border-light">
                    {c.notes && <p className="text-[13px] text-text-secondary mt-3 whitespace-pre-wrap">{c.notes}</p>}
                    {c.followUpDate && (
                      <p className="text-[12px] text-text-muted mt-2">
                        Follow-up: {c.followUpDate} {c.followUpDone ? '(done)' : '(pending)'}
                      </p>
                    )}
                    <div className="flex justify-end gap-2 mt-3">
                      {c.followUpDate && !c.followUpDone && (
                        <button onClick={() => store.updateParentComm(c.id, { followUpDone: true })} className="btn btn-secondary btn-sm text-[12px]">Mark Follow-up Done</button>
                      )}
                      <button onClick={() => store.deleteParentComm(c.id)} className="btn btn-danger btn-sm text-[12px]">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Communication Modal */}
      {showAdd && <AddCommModal store={store} onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function AddCommModal({ store, onClose }: { store: ReturnType<typeof useStore>; onClose: () => void }) {
  const [classId, setClassId] = useState(store.data.classes[0]?.id || '')
  const [studentId, setStudentId] = useState('')
  const [commType, setCommType] = useState<ParentComm['commType']>('email')
  const [subject, setSubject] = useState('')
  const [notes, setNotes] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')

  const students = classId ? store.getStudentsForClass(classId) : []

  function handleSubmit() {
    if (!studentId || !subject.trim()) return
    store.addParentComm({
      studentId,
      date: new Date().toISOString().split('T')[0],
      commType,
      subject: subject.trim(),
      notes: notes.trim(),
      followUpDate,
      followUpDone: false,
    })
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Log Parent Interaction</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Class</label>
                <select value={classId} onChange={e => { setClassId(e.target.value); setStudentId('') }}>{store.data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Student</label>
                <select value={studentId} onChange={e => setStudentId(e.target.value)}>
                  <option value="">Select...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{fullName(s)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Type</label>
              <div className="flex gap-1">{commTypes.map(t => (
                <button key={t} onClick={() => setCommType(t)} className={cn('btn btn-sm flex-1', commType === t ? 'btn-primary' : 'btn-secondary')}>{commTypeLabels[t].label}</button>
              ))}</div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Progress update, Behaviour concern" autoFocus />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Key discussion points, outcomes, actions..." rows={4} className="text-[13px]" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Follow-up Date (optional)</label>
              <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={!studentId || !subject.trim()} className="btn btn-primary">Log Interaction</button>
        </div>
      </div>
    </div>
  )
}
