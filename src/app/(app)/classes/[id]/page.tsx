'use client'

import { useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { cn, fullName, gradeColor, statusColor, statusLabel, parseCSV } from '@/lib/utils'
import type { Student, Assessment, Grade, Effort } from '@/lib/types'

const grades: Grade[] = ['A', 'B', 'C', 'D', 'E']
const efforts: Effort[] = ['Excellent', 'Very Good', 'Satisfactory', 'Needs Improvement']

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const store = useStore()
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showCSV, setShowCSV] = useState(false)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState({ current: 0, total: 0, studentName: '', done: false })
  const cancelRef = useRef(false)

  if (!store.ready) return <Loading />

  const cls = store.data.classes.find(c => c.id === id)
  if (!cls) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-10 text-center">
        <p className="text-text-secondary">Class not found.</p>
        <Link href="/" className="text-primary text-[14px] mt-2 inline-block">Back to Dashboard</Link>
      </div>
    )
  }

  const students = store.getStudentsForClass(id)
  const comments = store.data.comments.filter(c => c.classId === id)
  const approved = comments.filter(c => c.status === 'approved').length
  const drafted = comments.filter(c => c.status === 'draft').length
  const remaining = students.filter(s => {
    const c = store.getComment(s.id, id)
    return c.status !== 'approved' && c.status !== 'draft'
  })

  async function generateAll() {
    const toGenerate = students.filter(s => {
      const c = store.getComment(s.id, id)
      return c.status !== 'approved'
    })
    if (toGenerate.length === 0) return

    setGenerating(true)
    cancelRef.current = false
    setGenProgress({ current: 0, total: toGenerate.length, studentName: '', done: false })

    for (let i = 0; i < toGenerate.length; i++) {
      if (cancelRef.current) break
      const student = toGenerate[i]
      const assessment = store.getAssessment(student.id, id)
      setGenProgress({ current: i + 1, total: toGenerate.length, studentName: fullName(student), done: false })

      try {
        const res = await fetch('/api/generate-comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student,
            assessment,
            subject: cls!.subject,
            yearLevel: cls!.yearLevel,
            settings: store.data.settings,
          }),
        })

        if (!res.ok) continue

        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let full = ''
        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            full += decoder.decode(value)
          }
        }

        if (full && !cancelRef.current) {
          store.updateComment(student.id, id, {
            aiDraft: full,
            editedText: full,
            status: 'draft',
          })
        }
      } catch {
        // Skip failed generations, continue with next
      }
    }

    setGenProgress(p => ({ ...p, done: true }))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/" className="text-[13px] text-text-muted hover:text-text-secondary mb-2 inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{cls.name}</h1>
          <p className="text-text-secondary text-[14px] mt-0.5">{cls.subject} — Year {cls.yearLevel} — {students.length} student{students.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-ghost btn-sm text-text-muted">
            Delete Class
          </button>
          <Link
            href={students.length > 0 ? `/workspace/${id}` : '#'}
            className={cn('btn btn-primary', students.length === 0 && 'opacity-50 pointer-events-none')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Write Reports
          </Link>
        </div>
      </div>

      {/* Progress summary */}
      {students.length > 0 && (
        <div className="card p-4 mb-6 flex items-center gap-6">
          <Stat label="Students" value={students.length} />
          <Stat label="Grades Entered" value={students.filter(s => store.getAssessment(s.id, id).grade !== '').length} total={students.length} />
          <Stat label="Comments Drafted" value={drafted + approved} total={students.length} />
          <Stat label="Comments Approved" value={approved} total={students.length} color={approved === students.length && students.length > 0 ? '#10B981' : undefined} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setShowAddStudent(true)} className="btn btn-secondary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Student
        </button>
        <button onClick={() => setShowCSV(true)} className="btn btn-secondary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          Import CSV
        </button>
        {students.length > 0 && (
          <button
            onClick={generateAll}
            disabled={generating}
            className="btn btn-primary btn-sm ml-auto"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            Generate All Comments
            {remaining.length > 0 && remaining.length < students.length && (
              <span className="text-[11px] opacity-75">({remaining.length} remaining)</span>
            )}
          </button>
        )}
      </div>

      {/* Student table */}
      {students.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-text-secondary text-[14px] mb-1">No students yet.</p>
          <p className="text-text-muted text-[13px] mb-4">Upload a CSV with student names and grades, or add them manually.</p>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setShowCSV(true)} className="btn btn-primary btn-sm">Import CSV</button>
            <button onClick={() => setShowAddStudent(true)} className="btn btn-secondary btn-sm">Add Manually</button>
          </div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-[14px] min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-border-light/50">
                <th className="text-left p-3 pl-4 font-medium text-text-secondary text-[12px] uppercase tracking-wide">Student</th>
                <th className="text-left p-3 font-medium text-text-secondary text-[12px] uppercase tracking-wide w-20">Grade</th>
                <th className="text-left p-3 font-medium text-text-secondary text-[12px] uppercase tracking-wide w-36">Effort</th>
                <th className="text-center p-3 font-medium text-text-secondary text-[12px] uppercase tracking-wide w-16">Flags</th>
                <th className="text-center p-3 font-medium text-text-secondary text-[12px] uppercase tracking-wide w-20">Comment</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const assessment = store.getAssessment(student.id, id)
                const comment = store.getComment(student.id, id)
                const expanded = expandedStudent === student.id
                return (
                  <StudentRow
                    key={student.id}
                    student={student}
                    assessment={assessment}
                    commentStatus={comment.status}
                    expanded={expanded}
                    onToggle={() => setExpandedStudent(expanded ? null : student.id)}
                    onUpdateAssessment={(updates) => store.updateAssessment(student.id, id, updates)}
                    onUpdateStudent={(updates) => store.updateStudent(student.id, updates)}
                    onDelete={() => store.deleteStudent(student.id)}
                    classId={id}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <AddStudentModal
          onClose={() => setShowAddStudent(false)}
          onAdd={(input) => {
            store.addStudent({ classId: id, ...input })
            setShowAddStudent(false)
          }}
        />
      )}

      {/* CSV Import Modal */}
      {showCSV && (
        <CSVImportModal
          onClose={() => setShowCSV(false)}
          onImport={(rows) => {
            store.importStudentsWithData(id, rows)
            setShowCSV(false)
          }}
        />
      )}

      {/* Generate All Progress */}
      {generating && (
        <div className="modal-backdrop">
          <div className="modal max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-1">
                {genProgress.done ? 'Generation Complete' : 'Generating Comments...'}
              </h2>
              {!genProgress.done ? (
                <>
                  <p className="text-text-secondary text-[13px] mb-4">
                    Writing comment {genProgress.current} of {genProgress.total} — {genProgress.studentName}
                  </p>
                  <div className="h-2 bg-border-light rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${(genProgress.current / genProgress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-[12px] text-text-muted">
                    ~{Math.ceil((genProgress.total - genProgress.current) * 4 / 60)} min remaining
                  </p>
                </>
              ) : (
                <p className="text-text-secondary text-[13px] mb-4">
                  {genProgress.current} comments generated as drafts. Review and approve them in the workspace.
                </p>
              )}
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-border">
              {genProgress.done ? (
                <div className="flex gap-2">
                  <button onClick={() => setGenerating(false)} className="btn btn-secondary">Close</button>
                  <Link href={`/workspace/${id}`} className="btn btn-primary">Open Workspace</Link>
                </div>
              ) : (
                <button
                  onClick={() => { cancelRef.current = true; setGenerating(false) }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2">Delete {cls.name}?</h2>
              <p className="text-text-secondary text-[14px]">This will permanently delete the class, all students, assessments, and comments. This cannot be undone.</p>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">Cancel</button>
              <button
                onClick={() => { store.deleteClass(id); router.push('/') }}
                className="btn btn-danger"
              >
                Delete Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StudentRow({
  student, assessment, commentStatus, expanded, onToggle, onUpdateAssessment, onUpdateStudent, onDelete, classId,
}: {
  student: Student
  assessment: Assessment
  commentStatus: string
  expanded: boolean
  onToggle: () => void
  onUpdateAssessment: (updates: Partial<Assessment>) => void
  onUpdateStudent: (updates: Partial<Student>) => void
  onDelete: () => void
  classId: string
}) {
  return (
    <>
      <tr className={cn('border-b border-border-light hover:bg-border-light/30 transition-colors', expanded && 'bg-border-light/30')}>
        <td className="p-3 pl-4">
          <button onClick={onToggle} className="text-left w-full">
            <span className="font-medium">{student.lastName}, {student.firstName}</span>
          </button>
        </td>
        <td className="p-3">
          <select
            value={assessment.grade}
            onChange={e => onUpdateAssessment({ grade: e.target.value as Grade })}
            className={cn('text-[13px] py-1 px-2 rounded-md font-medium w-16', assessment.grade ? gradeColor(assessment.grade) : 'text-text-muted')}
            style={{ border: 'none', background: assessment.grade ? undefined : '#F1F5F9' }}
          >
            <option value="">--</option>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </td>
        <td className="p-3">
          <select
            value={assessment.effort}
            onChange={e => onUpdateAssessment({ effort: e.target.value as Effort })}
            className="text-[13px] py-1 px-2 w-full"
            style={{ border: '1px solid #E2E8F0' }}
          >
            <option value="">Select...</option>
            {efforts.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </td>
        <td className="p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            {student.iep && <span className="badge bg-purple-100 text-purple-700 text-[10px]">IEP</span>}
            {student.eald && <span className="badge bg-sky-100 text-sky-700 text-[10px]">EAL/D</span>}
          </div>
        </td>
        <td className="p-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', statusColor(commentStatus))} />
            <span className="text-[12px] text-text-muted">{statusLabel(commentStatus)}</span>
          </div>
        </td>
        <td className="p-3 pr-4">
          <button onClick={onToggle} className="btn btn-ghost btn-sm p-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '150ms' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="bg-border-light/20 border-b border-border-light">
            <div className="p-5 pl-8 pr-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">Strengths</label>
                  <textarea
                    value={assessment.strengths}
                    onChange={e => onUpdateAssessment({ strengths: e.target.value })}
                    placeholder="What does this student do well?"
                    rows={3}
                    className="text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">Areas for Growth</label>
                  <textarea
                    value={assessment.areasForGrowth}
                    onChange={e => onUpdateAssessment({ areasForGrowth: e.target.value })}
                    placeholder="Where should this student focus next?"
                    rows={3}
                    className="text-[13px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">Attendance %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={assessment.attendancePct || ''}
                    onChange={e => onUpdateAssessment({ attendancePct: Number(e.target.value) || 0 })}
                    placeholder="e.g. 92"
                    className="text-[13px]"
                  />
                </div>
                <div className="flex items-end gap-4 pb-1">
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="checkbox" checked={student.iep} onChange={e => onUpdateStudent({ iep: e.target.checked })} className="rounded" />
                    IEP
                  </label>
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="checkbox" checked={student.eald} onChange={e => onUpdateStudent({ eald: e.target.checked })} className="rounded" />
                    EAL/D
                  </label>
                </div>
                <div className="flex items-end justify-end">
                  <button onClick={onDelete} className="btn btn-danger btn-sm text-[12px]">Remove Student</button>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">Notes (private)</label>
                <textarea
                  value={assessment.notes}
                  onChange={e => onUpdateAssessment({ notes: e.target.value })}
                  placeholder="Any additional context for comment generation..."
                  rows={2}
                  className="text-[13px]"
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function AddStudentModal({ onClose, onAdd }: { onClose: () => void; onAdd: (input: { firstName: string; lastName: string }) => void }) {
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add Student</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">First Name</label>
              <input type="text" value={first} onChange={e => setFirst(e.target.value)} autoFocus placeholder="e.g. Emma" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Last Name</label>
              <input
                type="text"
                value={last}
                onChange={e => setLast(e.target.value)}
                placeholder="e.g. Wilson"
                onKeyDown={e => { if (e.key === 'Enter' && first.trim() && last.trim()) { onAdd({ firstName: first.trim(), lastName: last.trim() }) } }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={() => first.trim() && last.trim() && onAdd({ firstName: first.trim(), lastName: last.trim() })}
            disabled={!first.trim() || !last.trim()}
            className="btn btn-primary"
          >
            Add Student
          </button>
        </div>
      </div>
    </div>
  )
}

interface ImportRow {
  firstName: string
  lastName: string
  grade?: string
  effort?: string
  strengths?: string
  areasForGrowth?: string
  attendance?: number
  iep?: boolean
  eald?: boolean
  notes?: string
}

function CSVImportModal({ onClose, onImport }: { onClose: () => void; onImport: (rows: ImportRow[]) => void }) {
  const [text, setText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const parsed = text.trim() ? parseFullCSV(text) : []
  const hasGrades = parsed.some(r => r.grade)
  const hasStrengths = parsed.some(r => r.strengths)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Import Students from CSV</h2>
          <p className="text-text-secondary text-[13px] mb-2">
            Upload a CSV or paste data. Auto-detects columns for names, grades, and assessment data.
          </p>
          <div className="text-[12px] text-text-muted mb-4 bg-border-light/50 rounded-lg p-3">
            <p className="font-medium text-text-secondary mb-1">Supported columns:</p>
            <p><code className="bg-white px-1 rounded text-[11px]">firstName</code> <code className="bg-white px-1 rounded text-[11px]">lastName</code> (required) &middot; <code className="bg-white px-1 rounded text-[11px]">grade</code> (A-E) &middot; <code className="bg-white px-1 rounded text-[11px]">effort</code> &middot; <code className="bg-white px-1 rounded text-[11px]">strengths</code> &middot; <code className="bg-white px-1 rounded text-[11px]">areasForGrowth</code> &middot; <code className="bg-white px-1 rounded text-[11px]">attendance</code> &middot; <code className="bg-white px-1 rounded text-[11px]">iep</code> &middot; <code className="bg-white px-1 rounded text-[11px]">eald</code></p>
            <p className="mt-1">Column names are flexible — e.g. "First Name", "first_name", "given" all map to firstName.</p>
          </div>

          <div className="mb-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) file.text().then(setText)
              }}
            />
            <button onClick={() => fileRef.current?.click()} className="btn btn-secondary btn-sm">
              Upload CSV File
            </button>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`firstName,lastName,grade,effort,strengths,areasForGrowth\nEmma,Wilson,B,Very Good,Strong analytical writing,Develop paragraph structure\nJack,Chen,A,Excellent,Exceptional reasoning,Extend to real-world applications\nMia,Johnson,C,Satisfactory,Growing confidence,Focus on evidence in arguments`}
            rows={10}
            className="text-[13px] font-mono"
          />

          {parsed.length > 0 && (
            <div className="mt-3 p-3 bg-primary-light rounded-lg">
              <p className="text-[13px] text-primary-hover font-medium">
                {parsed.length} student{parsed.length !== 1 ? 's' : ''} detected
              </p>
              <p className="text-[12px] text-primary-hover/70 mt-0.5">
                {hasGrades ? `${parsed.filter(r => r.grade).length} with grades` : 'No grades detected'}
                {hasStrengths ? ` · ${parsed.filter(r => r.strengths).length} with strengths/growth data` : ''}
              </p>
              {parsed.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-left text-primary-hover/60">
                        <th className="pb-1 pr-2">Name</th>
                        <th className="pb-1 pr-2">Grade</th>
                        <th className="pb-1 pr-2">Effort</th>
                        <th className="pb-1">Strengths</th>
                      </tr>
                    </thead>
                    <tbody className="text-primary-hover/80">
                      {parsed.slice(0, 5).map((r, i) => (
                        <tr key={i}>
                          <td className="pr-2 py-0.5">{r.firstName} {r.lastName}</td>
                          <td className="pr-2 py-0.5">{r.grade || '-'}</td>
                          <td className="pr-2 py-0.5">{r.effort || '-'}</td>
                          <td className="py-0.5 truncate max-w-[200px]">{r.strengths || '-'}</td>
                        </tr>
                      ))}
                      {parsed.length > 5 && (
                        <tr><td colSpan={4} className="pt-1 text-primary-hover/50">...and {parsed.length - 5} more</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={() => parsed.length > 0 && onImport(parsed)}
            disabled={parsed.length === 0}
            className="btn btn-primary"
          >
            Import {parsed.length} Student{parsed.length !== 1 ? 's' : ''}
            {hasGrades && ' with Data'}
          </button>
        </div>
      </div>
    </div>
  )
}

function parseFullCSV(text: string): ImportRow[] {
  const rows = parseCSV(text)
  return rows
    .map(r => {
      const firstName = (r.firstname || r.first || r.givenname || r.given || r.firstnames || '').trim()
      const lastName = (r.lastname || r.last || r.surname || r.family || r.familyname || r.lastnames || '').trim()
      if (!firstName || !lastName) return null

      const grade = (r.grade || r.result || r.mark || r.level || '').trim().toUpperCase()
      const effort = (r.effort || r.effortgrade || r.effortlevel || r.behaviour || r.behavior || '').trim()
      const strengths = (r.strengths || r.strength || r.positives || r.positive || '').trim()
      const areasForGrowth = (r.areasforgrowth || r.growth || r.areasforimprovement || r.improvement || r.nextsteps || r.areas || '').trim()
      const attendanceRaw = (r.attendance || r.attendancepct || r.attendancepercent || '').trim()
      const attendance = attendanceRaw ? Number(attendanceRaw.replace('%', '')) || 0 : 0
      const iep = ['true', 'yes', 'y', '1'].includes((r.iep || r.individualplan || '').toLowerCase())
      const eald = ['true', 'yes', 'y', '1'].includes((r.eald || r.eal || r.esol || r.ell || '').toLowerCase())
      const notes = (r.notes || r.note || r.teachernotes || r.comments || '').trim()

      return {
        firstName,
        lastName,
        grade: ['A', 'B', 'C', 'D', 'E'].includes(grade) ? grade : undefined,
        effort: ['Excellent', 'Very Good', 'Satisfactory', 'Needs Improvement'].find(e => e.toLowerCase() === effort.toLowerCase()) || undefined,
        strengths: strengths || undefined,
        areasForGrowth: areasForGrowth || undefined,
        attendance: attendance || undefined,
        iep,
        eald,
        notes: notes || undefined,
      } as ImportRow
    })
    .filter((r): r is ImportRow => r !== null)
}

function Stat({ label, value, total, color }: { label: string; value: number; total?: number; color?: string }) {
  return (
    <div className="flex-1">
      <p className="text-[12px] text-text-muted mb-0.5">{label}</p>
      <p className="text-[18px] font-semibold" style={color ? { color } : undefined}>
        {value}{total !== undefined && <span className="text-[14px] text-text-muted font-normal">/{total}</span>}
      </p>
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
