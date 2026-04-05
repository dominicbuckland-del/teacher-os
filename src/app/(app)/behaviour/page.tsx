'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { cn, fullName } from '@/lib/utils'
import type { BehaviourIncident, Student } from '@/lib/types'

const positiveCategories = ['Outstanding Work', 'Excellent Effort', 'Leadership', 'Helping Others', 'Improvement', 'Participation']
const concernCategories = ['Disruption', 'Off Task', 'Late', 'Unprepared', 'Disrespectful', 'Phone Use', 'Safety']

export default function BehaviourPage() {
  const store = useStore()
  const classes = store.data.classes
  const incidents = store.data.behaviourIncidents || []

  // Quick-log form state
  const [classId, setClassId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [type, setType] = useState<'positive' | 'concern'>('positive')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'major'>('minor')

  // Filter state
  const [filterClass, setFilterClass] = useState('')
  const [filterType, setFilterType] = useState<'' | 'positive' | 'concern'>('')

  // Pattern detection
  const [detecting, setDetecting] = useState(false)
  const [patternResult, setPatternResult] = useState('')

  const students: Student[] = classId ? store.getStudentsForClass(classId) : []
  const categories = type === 'positive' ? positiveCategories : concernCategories

  // Reset dependent fields when class changes
  function handleClassChange(id: string) {
    setClassId(id)
    setStudentId('')
  }

  // Reset category when type changes
  function handleTypeChange(newType: 'positive' | 'concern') {
    setType(newType)
    setCategory('')
    if (newType === 'positive') setSeverity('minor')
  }

  function handleLog() {
    if (!classId || !studentId || !category) return
    const now = new Date()
    store.addBehaviourIncident({
      studentId,
      classId,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      type,
      category,
      description,
      actionTaken: '',
      severity: type === 'concern' ? severity : 'minor',
    })
    // Reset form but keep class and type
    setStudentId('')
    setCategory('')
    setDescription('')
    setSeverity('minor')
  }

  // Filtered and sorted incidents for the list
  const filteredIncidents = incidents
    .filter(i => !filterClass || i.classId === filterClass)
    .filter(i => !filterType || i.type === filterType)
    .slice(0, 50)

  function getStudentName(incident: BehaviourIncident): string {
    const allStudents = store.data.students || []
    const student = allStudents.find(s => s.id === incident.studentId)
    return student ? fullName(student) : 'Unknown Student'
  }

  function getClassName(cId: string): string {
    const cls = classes.find(c => c.id === cId)
    return cls ? cls.name : ''
  }

  function formatDate(date: string): string {
    try {
      return new Date(date + 'T00:00:00').toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    } catch {
      return date
    }
  }

  async function detectPatterns() {
    if (incidents.length === 0) return
    setDetecting(true)
    setPatternResult('')

    const recent = incidents.slice(0, 30)
    const allStudents = store.data.students || []
    const summary = recent.map(i => {
      const student = allStudents.find(s => s.id === i.studentId)
      const cls = classes.find(c => c.id === i.classId)
      return `- ${i.date} ${i.time} | ${student ? fullName(student) : 'Unknown'} | ${cls?.name || ''} | ${i.type} | ${i.category} | ${i.severity} | ${i.description || '(no description)'}`
    }).join('\n')

    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPrompt: `You are an experienced Australian school teacher analysing recent behaviour data. Review the following ${recent.length} behaviour incidents and identify patterns, trends, and recommend actions.

BEHAVIOUR INCIDENTS (most recent first):
${summary}

ANALYSIS REQUIRED:
1. Identify any students who appear multiple times and note patterns in their behaviour
2. Identify common times, classes, or categories that appear frequently
3. Note any escalating patterns of concern
4. Highlight positive trends and students who should be recognised
5. Recommend 3-5 specific, actionable steps the teacher should take

Be concise, practical, and specific. Use the student names from the data. Format with clear headings.`,
        }),
      })

      if (!res.ok) {
        setPatternResult('Error: Could not generate analysis. Check your API key.')
        setDetecting(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          full += decoder.decode(value)
          setPatternResult(full)
        }
      }
    } catch {
      setPatternResult('Error: Failed to connect.')
    }
    setDetecting(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <h1 className="text-xl font-semibold mb-1">Behaviour & Attendance</h1>
      <p className="text-[13px] text-text-muted mb-6">Log incidents, track patterns, and stay on top of student behaviour.</p>

      {/* Quick-log form */}
      <div className="card p-5 mb-8">
        <h2 className="font-semibold text-[15px] mb-4">Quick Log</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Class select */}
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">Class</label>
            <select value={classId} onChange={e => handleClassChange(e.target.value)}>
              <option value="">Select class...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} — Yr {c.yearLevel}</option>
              ))}
            </select>
          </div>

          {/* Student select */}
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">Student</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)} disabled={!classId}>
              <option value="">Select student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{fullName(s)}{s.iep ? ' (IEP)' : ''}{s.eald ? ' (EAL/D)' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Type toggle */}
        <div className="mb-3">
          <label className="block text-[12px] font-medium text-text-secondary mb-1">Type</label>
          <div className="flex gap-1">
            <button
              onClick={() => handleTypeChange('positive')}
              className={cn(
                'btn btn-sm flex-1',
                type === 'positive'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'btn-secondary'
              )}
            >
              Positive
            </button>
            <button
              onClick={() => handleTypeChange('concern')}
              className={cn(
                'btn btn-sm flex-1',
                type === 'concern'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'btn-secondary'
              )}
            >
              Concern
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Category */}
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category...</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Severity (only for concerns) */}
          {type === 'concern' && (
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1">Severity</label>
              <select value={severity} onChange={e => setSeverity(e.target.value as 'minor' | 'moderate' | 'major')}>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="major">Major</option>
              </select>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-[12px] font-medium text-text-secondary mb-1">Brief Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Helped a classmate with their work during group activity"
            onKeyDown={e => { if (e.key === 'Enter') handleLog() }}
          />
        </div>

        <button
          onClick={handleLog}
          disabled={!classId || !studentId || !category}
          className="btn btn-primary"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Log Incident
        </button>
      </div>

      {/* Filters and pattern detection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="!w-auto text-[13px]"
          >
            <option value="">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as '' | 'positive' | 'concern')}
            className="!w-auto text-[13px]"
          >
            <option value="">All Types</option>
            <option value="positive">Positive</option>
            <option value="concern">Concerns</option>
          </select>
        </div>

        <button
          onClick={detectPatterns}
          disabled={detecting || incidents.length === 0}
          className="btn btn-secondary btn-sm"
        >
          {detecting ? (
            <><span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Analysing...</>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> Detect Patterns</>
          )}
        </button>
      </div>

      {/* Pattern analysis result */}
      {patternResult && (
        <div className="card p-5 mb-6 border-primary/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[14px]">Pattern Analysis</h3>
            <button onClick={() => setPatternResult('')} className="btn btn-ghost btn-sm text-[12px]">Dismiss</button>
          </div>
          <pre className={cn(
            'text-[13px] whitespace-pre-wrap font-sans leading-relaxed text-text-secondary',
            detecting && 'streaming-cursor'
          )}>{patternResult}</pre>
        </div>
      )}

      {/* Recent incidents */}
      <h2 className="font-semibold text-[15px] mb-3">
        Recent Incidents
        {filteredIncidents.length > 0 && (
          <span className="text-text-muted font-normal text-[13px] ml-2">({filteredIncidents.length})</span>
        )}
      </h2>

      {filteredIncidents.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-text-muted text-[14px]">No incidents logged yet. Use the form above to start tracking behaviour.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredIncidents.map(incident => (
            <div key={incident.id} className="card px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-[14px]">{getStudentName(incident)}</span>
                    <span className={cn(
                      'badge',
                      incident.type === 'positive'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    )}>
                      {incident.type === 'positive' ? 'Positive' : 'Concern'}
                    </span>
                    <span className="badge bg-slate-100 text-slate-600">{incident.category}</span>
                    {incident.type === 'concern' && incident.severity !== 'minor' && (
                      <span className={cn(
                        'badge',
                        incident.severity === 'major' ? 'bg-red-200 text-red-800' : 'bg-amber-100 text-amber-700'
                      )}>
                        {incident.severity}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 text-[12px] text-text-muted">
                    <span>{formatDate(incident.date)} at {incident.time}</span>
                    {getClassName(incident.classId) && <span>{getClassName(incident.classId)}</span>}
                  </div>
                  {incident.description && (
                    <p className="text-[13px] text-text-secondary mt-1">{incident.description}</p>
                  )}
                </div>
                <button
                  onClick={() => store.deleteBehaviourIncident(incident.id)}
                  className="btn btn-ghost btn-sm text-text-muted hover:text-red-500 shrink-0"
                  title="Delete incident"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
