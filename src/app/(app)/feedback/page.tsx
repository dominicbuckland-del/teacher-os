'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { cn, fullName } from '@/lib/utils'

export default function FeedbackPage() {
  const store = useStore()
  const [classId, setClassId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [taskName, setTaskName] = useState('')
  const [studentWork, setStudentWork] = useState('')
  const [criteria, setCriteria] = useState('')
  const [generating, setGenerating] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [saved, setSaved] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  if (!store.ready) return null

  const classes = store.data.classes
  const students = classId ? store.getStudentsForClass(classId) : []
  const selectedStudent = students.find(s => s.id === studentId)
  const studentFeedback = studentId ? store.getFeedbackForStudent(studentId) : []

  async function generateFeedback() {
    if (!studentWork.trim()) return
    setGenerating(true)
    setFeedbackText('')
    setSaved(false)

    const student = students.find(s => s.id === studentId)
    const cls = classes.find(c => c.id === classId)

    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPrompt: `You are an experienced Australian teacher providing detailed, constructive feedback on student work.

STUDENT: ${student ? fullName(student) : 'Student'}
CLASS: ${cls?.name || ''} (${cls?.subject || ''}, Year ${cls?.yearLevel || ''})
TASK: ${taskName || 'Assessment task'}
${criteria ? `MARKING CRITERIA:\n${criteria}` : ''}
${student?.iep ? 'Note: This student has an IEP — frame feedback constructively and acknowledge individual progress.' : ''}
${student?.eald ? 'Note: This student is an EAL/D learner — acknowledge language development where relevant.' : ''}

STUDENT'S WORK:
"""
${studentWork.slice(0, 4000)}
"""

Provide detailed feedback in this structure:
1. STRENGTHS (2-3 specific things done well — reference exact parts of the work)
2. AREAS FOR IMPROVEMENT (2-3 specific, actionable suggestions with examples of how to improve)
3. NEXT STEPS (1-2 concrete actions the student should take)

Be specific — reference exact phrases, sections, or elements from the work. Be encouraging but honest. Use Australian English.`,
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
          setFeedbackText(full)
        }
      }
    } catch {}
    setGenerating(false)
  }

  function saveFeedback() {
    if (!studentId || !feedbackText) return
    store.addFeedbackEntry({
      studentId,
      classId,
      date: new Date().toISOString().split('T')[0],
      taskName: taskName || 'Untitled',
      studentWork: studentWork.slice(0, 2000),
      feedback: feedbackText,
    })
    setSaved(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Student Feedback</h1>
      <p className="text-text-secondary text-[14px] mb-6">Paste student work and get AI-generated targeted feedback aligned to your criteria.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-[14px] mb-3">Setup</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">Class</label>
                  <select value={classId} onChange={e => { setClassId(e.target.value); setStudentId('') }}>
                    <option value="">Select...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">Student</label>
                  <select value={studentId} onChange={e => setStudentId(e.target.value)}>
                    <option value="">Select...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{fullName(s)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">Task Name</label>
                <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="e.g. Persuasive Essay Draft 1" className="text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">Marking Criteria (optional)</label>
                <textarea value={criteria} onChange={e => setCriteria(e.target.value)} placeholder="Paste rubric criteria or key assessment points..." rows={3} className="text-[13px]" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[14px]">Student Work</h3>
              {studentWork && <span className="text-[11px] text-text-muted">{studentWork.split(/\s+/).filter(Boolean).length} words</span>}
            </div>
            <textarea
              value={studentWork}
              onChange={e => setStudentWork(e.target.value)}
              placeholder="Paste the student's work here — essay, response, report, etc."
              rows={12}
              className="text-[13px]"
            />
            <button
              onClick={generateFeedback}
              disabled={generating || !studentWork.trim()}
              className="btn btn-primary w-full mt-3"
            >
              {generating ? (
                <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating Feedback...</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> Generate Feedback</>
              )}
            </button>
          </div>

          {/* History toggle */}
          {studentId && studentFeedback.length > 0 && (
            <button onClick={() => setShowHistory(!showHistory)} className="text-[13px] text-primary font-medium">
              {showHistory ? 'Hide' : 'Show'} Feedback History ({studentFeedback.length})
            </button>
          )}
          {showHistory && studentFeedback.map(f => (
            <div key={f.id} className="card p-4">
              <p className="text-[11px] text-text-muted">{f.date} — {f.taskName}</p>
              <p className="text-[13px] text-text-secondary mt-1 whitespace-pre-wrap line-clamp-4">{f.feedback}</p>
            </div>
          ))}
        </div>

        {/* Right: Output */}
        <div>
          {feedbackText ? (
            <div className="card p-5 sticky top-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[14px]">Generated Feedback</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigator.clipboard.writeText(feedbackText)} className="btn btn-ghost btn-sm text-[12px]">Copy</button>
                  {!saved && feedbackText && !generating && studentId && (
                    <button onClick={saveFeedback} className="btn btn-primary btn-sm text-[12px]">Save</button>
                  )}
                  {saved && <span className="text-[12px] text-emerald-600 font-medium">Saved</span>}
                </div>
              </div>
              <pre className={cn('text-[13px] whitespace-pre-wrap font-sans leading-relaxed text-text-secondary', generating && 'streaming-cursor')}>
                {feedbackText}
              </pre>
            </div>
          ) : (
            <div className="card p-10 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary-light flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <p className="text-text-secondary text-[14px] mb-1">Paste student work on the left</p>
              <p className="text-text-muted text-[13px]">AI will generate targeted, criteria-aligned feedback</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
