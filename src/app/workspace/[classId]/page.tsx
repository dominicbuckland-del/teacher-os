'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { cn, fullName, gradeColor, statusColor, exportAsCSV } from '@/lib/utils'
import type { Student, Assessment, ReportComment } from '@/lib/types'

export default function WorkspacePage() {
  const { classId } = useParams<{ classId: string }>()
  const router = useRouter()
  const store = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [showExport, setShowExport] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const cls = store.data.classes.find(c => c.id === classId)
  const students = store.getStudentsForClass(classId)
  const selected = students.find(s => s.id === selectedId) || students[0] || null
  const selectedIndex = selected ? students.indexOf(selected) : -1

  // Auto-select first student
  useEffect(() => {
    if (students.length > 0 && !selectedId) {
      setSelectedId(students[0].id)
    }
  }, [students, selectedId])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        if (selectedIndex > 0) setSelectedId(students[selectedIndex - 1].id)
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        if (selectedIndex < students.length - 1) setSelectedId(students[selectedIndex + 1].id)
      }
      if (e.key === 'Escape') {
        router.push(`/classes/${classId}`)
      }
    }

    function handleGlobalKey(e: KeyboardEvent) {
      // Cmd+Enter = approve and next
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (selected) {
          const comment = store.getComment(selected.id, classId)
          const text = comment.editedText || comment.aiDraft || streamText
          if (text) {
            store.updateComment(selected.id, classId, { editedText: text, status: 'approved' })
            if (selectedIndex < students.length - 1) {
              setSelectedId(students[selectedIndex + 1].id)
            }
          }
        }
      }
      // Cmd+G = generate
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault()
        if (selected && !streaming) generateComment(selected)
      }
    }

    window.addEventListener('keydown', handleKey)
    window.addEventListener('keydown', handleGlobalKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('keydown', handleGlobalKey)
    }
  }, [selectedIndex, students, selected, streaming, classId, router, store, streamText])

  const generateComment = useCallback(async (student: Student) => {
    setStreaming(true)
    setStreamText('')

    const assessment = store.getAssessment(student.id, classId)
    store.updateComment(student.id, classId, { status: 'draft', aiDraft: '', editedText: '' })

    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          assessment,
          subject: cls?.subject || '',
          yearLevel: cls?.yearLevel || 7,
          settings: store.data.settings,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        setStreamText(`Error: ${err}`)
        setStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          full += chunk
          setStreamText(full)
        }
      }

      store.updateComment(student.id, classId, {
        aiDraft: full,
        editedText: full,
        status: 'draft',
      })
    } catch (err) {
      setStreamText('Error: Failed to connect. Check your API key in Settings.')
    }

    setStreaming(false)
  }, [store, classId, cls])

  if (!store.ready || !cls) return null

  const comments = store.data.comments.filter(c => c.classId === classId)
  const approved = comments.filter(c => c.status === 'approved').length
  const total = students.length
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0

  const comment = selected ? store.getComment(selected.id, classId) : null
  const assessment = selected ? store.getAssessment(selected.id, classId) : null
  const currentText = selected
    ? (streaming && selectedId === selected.id ? streamText : (comment?.editedText || comment?.aiDraft || ''))
    : ''

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top bar */}
      <header className="min-h-[48px] md:h-13 border-b border-border bg-surface flex flex-wrap md:flex-nowrap items-center px-3 md:px-4 gap-2 md:gap-4 shrink-0 py-2 md:py-0">
        <button onClick={() => router.push(`/classes/${classId}`)} className="btn btn-ghost btn-sm p-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <div className="flex-1 min-w-0">
          <span className="font-semibold text-[14px]">{cls.name}</span>
          <span className="text-text-muted text-[12px] md:text-[13px] ml-2 hidden sm:inline">{cls.subject} — Year {cls.yearLevel}</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-20 md:w-32 h-1.5 bg-border-light rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: pct === 100 ? '#10B981' : '#0D9488' }}
              />
            </div>
            <span className="text-[12px] md:text-[13px] text-text-secondary whitespace-nowrap">
              <strong>{approved}</strong>/{total}
            </span>
          </div>
          <button onClick={() => setShowExport(true)} className="btn btn-secondary btn-sm text-[12px]">
            Export
          </button>
        </div>
      </header>

      {/* Mobile student selector */}
      <div className="md:hidden border-b border-border bg-surface px-3 py-2">
        <select
          value={selected?.id || ''}
          onChange={e => setSelectedId(e.target.value)}
          className="w-full text-[13px] py-2 px-3"
        >
          {students.map(s => {
            const c = store.getComment(s.id, classId)
            const grade = store.getAssessment(s.id, classId).grade
            return (
              <option key={s.id} value={s.id}>
                {c.status === 'approved' ? '\u2713' : c.status === 'draft' ? '\u25CB' : '\u25CB'} {s.lastName}, {s.firstName}{grade ? ` (${grade})` : ''}
              </option>
            )
          })}
        </select>
      </div>

      {/* Main area */}
      <div className="flex-1 flex min-h-0">
        {/* Left panel — student list (desktop only) */}
        <div className="hidden md:block w-[260px] border-r border-border bg-surface overflow-y-auto shrink-0">
          <div className="p-3">
            <p className="text-[11px] text-text-muted uppercase tracking-wide font-medium px-2 mb-2">
              Students ({total})
            </p>
            {students.map((s, i) => {
              const c = store.getComment(s.id, classId)
              const active = selected?.id === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[13px] mb-0.5 transition-colors',
                    active ? 'bg-primary-light text-primary-hover' : 'hover:bg-border-light text-text'
                  )}
                >
                  <span className={cn('w-2 h-2 rounded-full shrink-0', statusColor(c.status))} />
                  <span className="truncate">{s.lastName}, {s.firstName}</span>
                  {store.getAssessment(s.id, classId).grade && (
                    <span className={cn('ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded', gradeColor(store.getAssessment(s.id, classId).grade))}>
                      {store.getAssessment(s.id, classId).grade}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right panel — student context + comment editor */}
        <div className="flex-1 overflow-y-auto">
          {selected && assessment && comment ? (
            <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 md:py-8">
              {/* Student context card */}
              <div className="card p-5 mb-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold">{fullName(selected)}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {assessment.grade && (
                        <span className={cn('badge text-[12px] font-medium', gradeColor(assessment.grade))}>
                          Grade {assessment.grade}
                        </span>
                      )}
                      {assessment.effort && (
                        <span className="badge bg-slate-100 text-slate-600 text-[12px]">
                          {assessment.effort}
                        </span>
                      )}
                      {selected.iep && <span className="badge bg-purple-100 text-purple-700 text-[12px]">IEP</span>}
                      {selected.eald && <span className="badge bg-sky-100 text-sky-700 text-[12px]">EAL/D</span>}
                      {assessment.attendancePct > 0 && (
                        <span className="badge bg-slate-100 text-slate-600 text-[12px]">
                          {assessment.attendancePct}% attendance
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { if (selectedIndex > 0) setSelectedId(students[selectedIndex - 1].id) }}
                      disabled={selectedIndex <= 0}
                      className="btn btn-ghost btn-sm p-1.5 disabled:opacity-30"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <span className="text-[12px] text-text-muted">{selectedIndex + 1}/{total}</span>
                    <button
                      onClick={() => { if (selectedIndex < students.length - 1) setSelectedId(students[selectedIndex + 1].id) }}
                      disabled={selectedIndex >= students.length - 1}
                      className="btn btn-ghost btn-sm p-1.5 disabled:opacity-30"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  </div>
                </div>

                {(assessment.strengths || assessment.areasForGrowth) && (
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border-light">
                    {assessment.strengths && (
                      <div>
                        <p className="text-[11px] text-text-muted uppercase tracking-wide font-medium mb-1">Strengths</p>
                        <p className="text-[13px] text-text-secondary leading-relaxed">{assessment.strengths}</p>
                      </div>
                    )}
                    {assessment.areasForGrowth && (
                      <div>
                        <p className="text-[11px] text-text-muted uppercase tracking-wide font-medium mb-1">Areas for Growth</p>
                        <p className="text-[13px] text-text-secondary leading-relaxed">{assessment.areasForGrowth}</p>
                      </div>
                    )}
                  </div>
                )}

                {!assessment.grade && (
                  <p className="text-[13px] text-amber-600 mt-3 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    No grade entered yet. Comments will be more accurate with assessment data.
                  </p>
                )}
              </div>

              {/* Comment editor */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[14px]">Report Comment</h3>
                  <div className="flex items-center gap-2">
                    {comment.status === 'approved' && (
                      <span className="badge bg-emerald-100 text-emerald-700 text-[12px]">Approved</span>
                    )}
                    {comment.status === 'draft' && (
                      <span className="badge bg-sky-100 text-sky-700 text-[12px]">Draft</span>
                    )}
                  </div>
                </div>

                {/* No comment yet */}
                {!currentText && !streaming && (
                  <div className="text-center py-8">
                    <p className="text-text-secondary text-[14px] mb-4">No comment yet for {selected.firstName}.</p>
                    <button
                      onClick={() => generateComment(selected)}
                      className="btn btn-primary"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                      Generate with AI
                    </button>
                    <p className="text-[12px] text-text-muted mt-2">or type a comment manually below</p>
                  </div>
                )}

                {/* Comment textarea */}
                <div className="relative">
                  <textarea
                    ref={editorRef}
                    value={currentText}
                    onChange={e => {
                      if (!streaming) {
                        store.updateComment(selected.id, classId, {
                          editedText: e.target.value,
                          status: e.target.value ? 'draft' : 'pending',
                        })
                      }
                    }}
                    readOnly={streaming}
                    placeholder="Start typing a comment, or click Generate with AI..."
                    rows={6}
                    className={cn(
                      'text-[14px] leading-relaxed',
                      streaming && 'streaming-cursor',
                      !currentText && !streaming && 'hidden'
                    )}
                  />
                  {currentText && (
                    <p className="text-[11px] text-text-muted mt-1.5 text-right">{currentText.split(/\s+/).filter(Boolean).length} words</p>
                  )}
                </div>

                {/* Actions */}
                {(currentText || streaming) && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => generateComment(selected)}
                        disabled={streaming}
                        className="btn btn-secondary btn-sm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                        Regenerate
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentText)
                        }}
                        className="btn btn-ghost btn-sm"
                      >
                        Copy
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const text = currentText
                        store.updateComment(selected.id, classId, {
                          editedText: text,
                          status: 'approved',
                        })
                        // Auto-advance
                        if (selectedIndex < students.length - 1) {
                          setSelectedId(students[selectedIndex + 1].id)
                        }
                      }}
                      disabled={streaming || !currentText}
                      className={cn(
                        'btn btn-sm',
                        comment.status === 'approved' ? 'btn-secondary' : 'btn-primary'
                      )}
                    >
                      {comment.status === 'approved' ? 'Approved' : 'Approve & Next'}
                      {comment.status !== 'approved' && <span className="kbd ml-1">⌘↵</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Keyboard hints (desktop only) */}
              <div className="hidden md:flex items-center justify-center gap-4 mt-6 text-[11px] text-text-muted">
                <span><span className="kbd">↑↓</span> Navigate students</span>
                <span><span className="kbd">⌘G</span> Generate</span>
                <span><span className="kbd">⌘↵</span> Approve & next</span>
                <span><span className="kbd">Esc</span> Exit</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted">
              Select a student to begin.
            </div>
          )}
        </div>
      </div>

      {/* Export modal */}
      {showExport && (
        <ExportModal
          classId={classId}
          className={cls.name}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}

function ExportModal({ classId, className: clsName, onClose }: { classId: string; className: string; onClose: () => void }) {
  const store = useStore()
  const students = store.getStudentsForClass(classId)
  const [copied, setCopied] = useState<string | null>(null)

  const approvedComments = students
    .map(s => {
      const comment = store.getComment(s.id, classId)
      const assessment = store.getAssessment(s.id, classId)
      return {
        student: s,
        comment,
        assessment,
        text: comment.editedText || comment.aiDraft || '',
      }
    })
    .filter(c => c.text)

  const allComments = students.map(s => {
    const comment = store.getComment(s.id, classId)
    const assessment = store.getAssessment(s.id, classId)
    return {
      student: s,
      comment,
      assessment,
      text: comment.editedText || comment.aiDraft || '',
    }
  })

  function copyAll() {
    const text = approvedComments
      .map(c => `${fullName(c.student)}\n${c.text}`)
      .join('\n\n---\n\n')
    navigator.clipboard.writeText(text)
    setCopied('all')
    setTimeout(() => setCopied(null), 2000)
  }

  function copyForAccelerus() {
    // Tab-separated: LastName, FirstName, Grade, Comment
    const lines = approvedComments.map(c =>
      `${c.student.lastName}\t${c.student.firstName}\t${c.assessment.grade}\t${c.text}`
    )
    navigator.clipboard.writeText(['Last Name\tFirst Name\tGrade\tComment', ...lines].join('\n'))
    setCopied('accelerus')
    setTimeout(() => setCopied(null), 2000)
  }

  function downloadCSV() {
    const csv = exportAsCSV(
      allComments.map(c => ({
        name: fullName(c.student),
        grade: c.assessment.grade,
        comment: c.text,
      }))
    )
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${clsName.replace(/\s+/g, '-')}-comments.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const approvedCount = store.data.comments.filter(c => c.classId === classId && c.status === 'approved').length
  const draftedCount = approvedComments.length

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1">Export Comments</h2>
          <p className="text-text-secondary text-[13px] mb-5">
            {approvedCount} approved, {draftedCount} with text, {students.length} total students.
          </p>

          <div className="space-y-2">
            <ExportButton
              label="Copy All Comments"
              description="Plain text with student names, separated by dividers"
              onClick={copyAll}
              active={copied === 'all'}
              disabled={draftedCount === 0}
            />
            <ExportButton
              label="Copy for Accelerus"
              description="Tab-separated format ready to paste into Accelerus"
              onClick={copyForAccelerus}
              active={copied === 'accelerus'}
              disabled={draftedCount === 0}
            />
            <ExportButton
              label="Download CSV"
              description="Spreadsheet file with student name, grade, and comment"
              onClick={downloadCSV}
              active={false}
              disabled={draftedCount === 0}
              icon="download"
            />
          </div>
        </div>
        <div className="flex items-center justify-end px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  )
}

function ExportButton({ label, description, onClick, active, disabled, icon }: {
  label: string; description: string; onClick: () => void; active: boolean; disabled: boolean; icon?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all',
        active ? 'border-primary bg-primary-light' : 'border-border hover:border-primary/30',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <p className="font-medium text-[14px]">{active ? 'Copied!' : label}</p>
      <p className="text-[12px] text-text-muted mt-0.5">{description}</p>
    </button>
  )
}
