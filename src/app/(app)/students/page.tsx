'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { cn, fullName, gradeColor } from '@/lib/utils'

export default function StudentsPage() {
  const store = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [generating, setGenerating] = useState(false)
  const [insights, setInsights] = useState('')

  if (!store.ready) return null

  const allStudents = store.data.students.sort((a, b) => a.lastName.localeCompare(b.lastName))
  const filtered = search
    ? allStudents.filter(s => fullName(s).toLowerCase().includes(search.toLowerCase()))
    : allStudents

  const selected = allStudents.find(s => s.id === selectedId)
  const selectedClass = selected ? store.data.classes.find(c => c.id === selected.classId) : null
  const assessment = selected ? store.getAssessment(selected.id, selected.classId) : null
  const comment = selected ? store.getComment(selected.id, selected.classId) : null
  const behaviour = selected ? store.getBehaviourForStudent(selected.id) : []
  const comms = selected ? store.getCommsForStudent(selected.id) : []
  const feedback = selected ? store.getFeedbackForStudent(selected.id) : []
  const positiveCount = behaviour.filter(b => b.type === 'positive').length
  const concernCount = behaviour.filter(b => b.type === 'concern').length

  async function generateInsights() {
    if (!selected || !selectedClass) return
    setGenerating(true)
    setInsights('')
    const context = `Student: ${fullName(selected)}, Year ${selectedClass.yearLevel} ${selectedClass.subject}
Grade: ${assessment?.grade || 'N/A'}, Effort: ${assessment?.effort || 'N/A'}, Attendance: ${assessment?.attendancePct || 'N/A'}%
Strengths: ${assessment?.strengths || 'None recorded'}
Areas for Growth: ${assessment?.areasForGrowth || 'None recorded'}
IEP: ${selected.iep ? 'Yes' : 'No'}, EAL/D: ${selected.eald ? 'Yes' : 'No'}
Positive behaviour incidents: ${positiveCount}, Concerns: ${concernCount}
${behaviour.slice(0, 10).map(b => `${b.date} ${b.type}: ${b.category} - ${b.description}`).join('\n')}
Parent communications: ${comms.length}
${comms.slice(0, 5).map(c => `${c.date} ${c.commType}: ${c.subject}`).join('\n')}
Feedback entries: ${feedback.length}`

    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPrompt: `You are an experienced Australian school counsellor and data analyst. Analyse this student's data and provide actionable insights for their teacher.

${context}

Provide:
1. OVERALL ASSESSMENT (2-3 sentences summarising the student's current position)
2. PATTERNS (any trends in behaviour, attendance, or academic performance)
3. STRENGTHS TO LEVERAGE (specific things going well that can be built on)
4. AREAS OF CONCERN (if any — be specific and constructive)
5. RECOMMENDED ACTIONS (3-5 concrete, actionable next steps for the teacher)

Be specific, reference the data, and be constructive. If there isn't enough data, say so and suggest what data to collect.`
        }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          full += decoder.decode(value)
          setInsights(full)
        }
      }
    } catch {}
    setGenerating(false)
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Student list */}
      <div className={cn('md:w-[280px] border-b md:border-b-0 md:border-r border-border bg-surface shrink-0 flex flex-col overflow-hidden', selectedId && 'hidden md:flex')}>
        <div className="p-3 border-b border-border-light">
          <h1 className="text-lg font-semibold mb-2">Students</h1>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="text-[13px] py-1.5" />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-[13px] text-text-muted p-3 text-center">{allStudents.length === 0 ? 'No students yet. Add them via class pages.' : 'No matches.'}</p>
          ) : filtered.map(s => {
            const cls = store.data.classes.find(c => c.id === s.classId)
            const a = store.getAssessment(s.id, s.classId)
            return (
              <button key={s.id} onClick={() => { setSelectedId(s.id); setInsights('') }}
                className={cn('w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[13px] mb-px transition-colors',
                  selectedId === s.id ? 'bg-primary-light text-primary-hover' : 'hover:bg-border-light text-text')}>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{s.lastName}, {s.firstName}</p>
                  <p className="text-[11px] opacity-60 truncate">{cls?.name || ''}</p>
                </div>
                {a.grade && <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded shrink-0', gradeColor(a.grade))}>{a.grade}</span>}
                {(s.iep || s.eald) && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Student detail */}
      <div className={cn('flex-1 overflow-y-auto', !selectedId && 'hidden md:block')}>
        {selected && selectedClass ? (
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 md:py-8">
            <button onClick={() => setSelectedId(null)} className="md:hidden text-[13px] text-primary mb-3 flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
              All Students
            </button>

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{fullName(selected)}</h2>
                <p className="text-text-secondary text-[13px] mt-0.5">{selectedClass.name} — {selectedClass.subject}, Year {selectedClass.yearLevel}</p>
              </div>
              <button onClick={generateInsights} disabled={generating} className="btn btn-primary btn-sm">
                {generating ? 'Analysing...' : 'AI Insights'}
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <StatCard label="Grade" value={assessment?.grade || '—'} color={assessment?.grade ? undefined : '#94A3B8'} />
              <StatCard label="Effort" value={assessment?.effort?.split(' ')[0] || '—'} />
              <StatCard label="Attendance" value={assessment?.attendancePct ? `${assessment.attendancePct}%` : '—'} />
              <StatCard label="Positive" value={String(positiveCount)} color="#10B981" />
              <StatCard label="Concerns" value={String(concernCount)} color={concernCount > 0 ? '#EF4444' : undefined} />
            </div>

            {/* Flags */}
            {(selected.iep || selected.eald) && (
              <div className="flex gap-2 mb-6">
                {selected.iep && <span className="badge bg-purple-100 text-purple-700">IEP</span>}
                {selected.eald && <span className="badge bg-sky-100 text-sky-700">EAL/D</span>}
              </div>
            )}

            {/* AI Insights */}
            {insights && (
              <div className="card p-5 mb-6 border-primary/20 bg-primary-light/20">
                <h3 className="font-semibold text-[14px] mb-2">AI Insights</h3>
                <pre className={cn('text-[13px] whitespace-pre-wrap font-sans leading-relaxed', generating && 'streaming-cursor')}>{insights}</pre>
              </div>
            )}

            {/* Assessment */}
            {(assessment?.strengths || assessment?.areasForGrowth) && (
              <div className="card p-5 mb-4">
                <h3 className="font-semibold text-[14px] mb-3">Assessment Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                  {assessment.strengths && <div><p className="text-text-muted text-[11px] uppercase tracking-wide font-medium mb-1">Strengths</p><p className="text-text-secondary">{assessment.strengths}</p></div>}
                  {assessment.areasForGrowth && <div><p className="text-text-muted text-[11px] uppercase tracking-wide font-medium mb-1">Areas for Growth</p><p className="text-text-secondary">{assessment.areasForGrowth}</p></div>}
                </div>
              </div>
            )}

            {/* Report Comment */}
            {comment?.editedText && (
              <div className="card p-5 mb-4">
                <h3 className="font-semibold text-[14px] mb-2">Report Comment</h3>
                <p className="text-[13px] text-text-secondary leading-relaxed">{comment.editedText}</p>
                <span className={cn('badge mt-2', comment.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700')}>{comment.status}</span>
              </div>
            )}

            {/* Recent Behaviour */}
            {behaviour.length > 0 && (
              <div className="card p-5 mb-4">
                <h3 className="font-semibold text-[14px] mb-3">Behaviour Log ({behaviour.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {behaviour.slice(0, 10).map(b => (
                    <div key={b.id} className="flex items-start gap-2 text-[13px]">
                      <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', b.type === 'positive' ? 'bg-emerald-500' : 'bg-red-500')} />
                      <div>
                        <span className="text-text-muted text-[11px]">{b.date}</span>
                        <span className="mx-1 text-text-muted">·</span>
                        <span className="font-medium">{b.category}</span>
                        {b.description && <p className="text-text-secondary">{b.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parent Comms */}
            {comms.length > 0 && (
              <div className="card p-5 mb-4">
                <h3 className="font-semibold text-[14px] mb-3">Parent Communications ({comms.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {comms.slice(0, 10).map(c => (
                    <div key={c.id} className="text-[13px]">
                      <span className="text-text-muted text-[11px]">{c.date}</span>
                      <span className="mx-1 text-text-muted">·</span>
                      <span className="badge bg-slate-100 text-slate-600 text-[10px] mr-1">{c.commType}</span>
                      <span className="font-medium">{c.subject}</span>
                      {c.notes && <p className="text-text-secondary mt-0.5">{c.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback History */}
            {feedback.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-[14px] mb-3">Feedback History ({feedback.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {feedback.slice(0, 5).map(f => (
                    <div key={f.id} className="text-[13px]">
                      <span className="text-text-muted text-[11px]">{f.date}</span>
                      <span className="mx-1 text-text-muted">·</span>
                      <span className="font-medium">{f.taskName}</span>
                      <p className="text-text-secondary mt-0.5 line-clamp-2">{f.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted text-[14px]">Select a student to view their profile.</div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="card p-3 text-center">
      <p className="text-[11px] text-text-muted">{label}</p>
      <p className="text-[18px] font-semibold mt-0.5" style={color ? { color } : undefined}>{value}</p>
    </div>
  )
}
