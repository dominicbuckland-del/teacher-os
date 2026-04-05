'use client'

import { useState, useEffect } from 'react'
import { cn, generateId } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RubricCriterion {
  name: string
  A: string
  B: string
  C: string
  D: string
  E: string
}

interface Rubric {
  id: string
  taskName: string
  description: string
  subject: string
  yearLevel: number
  assessmentType: string
  criteria: RubricCriterion[]
  createdAt: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'teacher-os-rubrics'

const subjects = [
  'English',
  'Mathematics',
  'Science',
  'Humanities',
  'Health & Physical Education',
  'The Arts',
  'Technologies',
  'Languages',
]

const assessmentTypes = [
  { value: 'exam', label: 'Exam' },
  { value: 'essay', label: 'Essay' },
  { value: 'project', label: 'Project' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'practical', label: 'Practical' },
  { value: 'portfolio', label: 'Portfolio' },
]

const grades: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E']

const gradeHeaderColors: Record<string, string> = {
  A: 'bg-emerald-600 text-white',
  B: 'bg-teal-600 text-white',
  C: 'bg-amber-500 text-white',
  D: 'bg-orange-500 text-white',
  E: 'bg-red-500 text-white',
}

const gradeCellColors: Record<string, string> = {
  A: 'bg-emerald-50',
  B: 'bg-teal-50',
  C: 'bg-amber-50',
  D: 'bg-orange-50',
  E: 'bg-red-50',
}

/* ------------------------------------------------------------------ */
/*  Persistence                                                        */
/* ------------------------------------------------------------------ */

function loadRubrics(): Rubric[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveRubrics(rubrics: Rubric[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rubrics))
}

/* ------------------------------------------------------------------ */
/*  Parser: raw AI text -> RubricCriterion[]                           */
/* ------------------------------------------------------------------ */

function parseRubricResponse(text: string): RubricCriterion[] {
  const criteria: RubricCriterion[] = []
  const blocks = text.split(/CRITERION:\s*/i).filter(Boolean)

  for (const block of blocks) {
    const lines = block.trim().split('\n').filter(l => l.trim())
    if (lines.length === 0) continue

    const name = lines[0].replace(/^\s*[-:]\s*/, '').trim()
    const criterion: RubricCriterion = { name, A: '', B: '', C: '', D: '', E: '' }

    for (const line of lines.slice(1)) {
      const match = line.match(/^([A-E]):\s*(.+)/i)
      if (match) {
        const grade = match[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E'
        criterion[grade] = match[2].trim()
      }
    }

    if (criterion.name && (criterion.A || criterion.B || criterion.C)) {
      criteria.push(criterion)
    }
  }

  return criteria
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function RubricsPage() {
  const [rubrics, setRubrics] = useState<Rubric[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [taskName, setTaskName] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState(subjects[0])
  const [yearLevel, setYearLevel] = useState(7)
  const [assessmentType, setAssessmentType] = useState('exam')

  // Generation state
  const [generating, setGenerating] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [previewCriteria, setPreviewCriteria] = useState<RubricCriterion[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setRubrics(loadRubrics())
  }, [])

  const selected = rubrics.find(r => r.id === selectedId) || null

  function persist(updater: (prev: Rubric[]) => Rubric[]) {
    setRubrics(prev => {
      const next = updater(prev)
      saveRubrics(next)
      return next
    })
  }

  function resetForm() {
    setTaskName('')
    setDescription('')
    setSubject(subjects[0])
    setYearLevel(7)
    setAssessmentType('exam')
    setStreamText('')
    setPreviewCriteria([])
    setError('')
    setShowForm(false)
  }

  function deleteRubric(id: string) {
    persist(rs => rs.filter(r => r.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  /* ------ Generate rubric via AI ------ */

  async function handleGenerate() {
    if (!taskName.trim()) return
    setGenerating(true)
    setStreamText('')
    setPreviewCriteria([])
    setError('')

    const prompt = `You are an expert Australian curriculum-aligned assessment designer. Generate a detailed A-E rubric for the following assessment task.

TASK NAME: ${taskName.trim()}
TASK DESCRIPTION: ${description.trim() || 'Not provided'}
SUBJECT: ${subject}
YEAR LEVEL: ${yearLevel}
ASSESSMENT TYPE: ${assessmentType}

REQUIREMENTS:
- Align all criteria and descriptors to the Australian Curriculum v9 achievement standards for ${subject} Year ${yearLevel}
- Generate 4-6 criteria that are specific to this task
- Each grade descriptor must be detailed, specific and observable (2-3 sentences)
- A = Excellent / Well above standard, B = High / Above standard, C = Satisfactory / At standard, D = Below standard, E = Well below standard
- Descriptors should show clear progression from E to A
- Use professional, clear language appropriate for sharing with students and parents

FORMAT YOUR RESPONSE EXACTLY LIKE THIS (do not add any other text):

CRITERION: [criterion name]
A: [descriptor]
B: [descriptor]
C: [descriptor]
D: [descriptor]
E: [descriptor]

CRITERION: [criterion name]
A: [descriptor]
B: [descriptor]
C: [descriptor]
D: [descriptor]
E: [descriptor]

Generate the rubric now.`

    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customPrompt: prompt }),
      })

      if (!res.ok) {
        setError('Failed to generate rubric. Check your API key in Settings.')
        setGenerating(false)
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
          setStreamText(full)

          // Live-parse as it streams
          const parsed = parseRubricResponse(full)
          if (parsed.length > 0) setPreviewCriteria(parsed)
        }
      }

      // Final parse
      const finalCriteria = parseRubricResponse(full)
      setPreviewCriteria(finalCriteria)

      if (finalCriteria.length === 0) {
        setError('Could not parse the AI response into a rubric. Try generating again.')
      }
    } catch {
      setError('Connection error. Please try again.')
    }

    setGenerating(false)
  }

  /* ------ Save generated rubric ------ */

  function saveGeneratedRubric() {
    if (previewCriteria.length === 0) return
    const rubric: Rubric = {
      id: generateId(),
      taskName: taskName.trim(),
      description: description.trim(),
      subject,
      yearLevel,
      assessmentType,
      criteria: previewCriteria,
      createdAt: new Date().toISOString(),
    }
    persist(rs => [rubric, ...rs])
    setSelectedId(rubric.id)
    resetForm()
  }

  /* ------ Copy rubric as text ------ */

  function copyRubricToClipboard(rubric: Rubric) {
    const header = `${rubric.taskName} — ${rubric.subject} Year ${rubric.yearLevel} (${assessmentTypes.find(t => t.value === rubric.assessmentType)?.label || rubric.assessmentType})\n\n`
    const body = rubric.criteria.map(c =>
      `CRITERION: ${c.name}\nA: ${c.A}\nB: ${c.B}\nC: ${c.C}\nD: ${c.D}\nE: ${c.E}`
    ).join('\n\n')
    navigator.clipboard.writeText(header + body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ------ Render ------ */

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Rubric Generator</h1>
          <p className="text-[13px] text-text-muted mt-0.5">
            AI-powered A-E rubrics aligned to Australian Curriculum v9
          </p>
        </div>
        {!showForm && !selectedId && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Rubric
          </button>
        )}
        {selectedId && (
          <button onClick={() => setSelectedId(null)} className="btn btn-secondary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to List
          </button>
        )}
        {showForm && !generating && previewCriteria.length === 0 && (
          <button onClick={resetForm} className="btn btn-ghost btn-sm">Cancel</button>
        )}
      </div>

      {/* ============================================================ */}
      {/*  NEW RUBRIC FORM                                              */}
      {/* ============================================================ */}
      {showForm && !selectedId && (
        <div className="space-y-6">
          {/* Form fields */}
          {!generating && previewCriteria.length === 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-[15px] mb-4">Assessment Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
                    Task Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={taskName}
                    onChange={e => setTaskName(e.target.value)}
                    placeholder="e.g. Persuasive Essay on Climate Action"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
                    Task Brief / Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the task requirements, expected outcomes, and any specific focus areas..."
                    rows={3}
                    className="text-[13px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Subject</label>
                    <select value={subject} onChange={e => setSubject(e.target.value)}>
                      {subjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
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

                  <div>
                    <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Assessment Type</label>
                    <select value={assessmentType} onChange={e => setAssessmentType(e.target.value)}>
                      {assessmentTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={!taskName.trim()}
                  className="btn btn-primary"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Generate Rubric
                </button>
                <button onClick={resetForm} className="btn btn-secondary">Cancel</button>
              </div>

              {error && (
                <p className="mt-3 text-[13px] text-red-500">{error}</p>
              )}
            </div>
          )}

          {/* Streaming / generating state */}
          {generating && previewCriteria.length === 0 && streamText.length === 0 && (
            <div className="card p-8 flex items-center justify-center">
              <div className="text-center">
                <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-[14px] font-medium">Generating rubric...</p>
                <p className="text-[12px] text-text-muted mt-1">
                  {taskName} - {subject} Year {yearLevel}
                </p>
              </div>
            </div>
          )}

          {/* Raw stream preview (shown while generating, before full parse) */}
          {generating && streamText && previewCriteria.length === 0 && (
            <div className="card p-5">
              <pre className="text-[13px] whitespace-pre-wrap font-sans leading-relaxed streaming-cursor">
                {streamText}
              </pre>
            </div>
          )}

          {/* Parsed rubric preview */}
          {previewCriteria.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[16px]">{taskName}</h2>
                  <p className="text-[13px] text-text-muted">
                    {subject} - Year {yearLevel} - {assessmentTypes.find(t => t.value === assessmentType)?.label}
                    {generating && <span className="ml-2 streaming-cursor" />}
                  </p>
                </div>
                {!generating && (
                  <div className="flex items-center gap-2">
                    <button onClick={handleGenerate} className="btn btn-secondary btn-sm">
                      Regenerate
                    </button>
                    <button onClick={saveGeneratedRubric} className="btn btn-primary btn-sm">
                      Save Rubric
                    </button>
                  </div>
                )}
              </div>

              <RubricTable criteria={previewCriteria} />

              {!generating && (
                <div className="flex items-center gap-2">
                  <button onClick={saveGeneratedRubric} className="btn btn-primary">
                    Save Rubric
                  </button>
                  <button onClick={resetForm} className="btn btn-secondary">
                    Discard
                  </button>
                </div>
              )}

              {error && (
                <p className="text-[13px] text-red-500">{error}</p>
              )}
            </>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/*  SELECTED RUBRIC VIEW                                         */}
      {/* ============================================================ */}
      {selected && !showForm && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-[18px]">{selected.taskName}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="badge">{selected.subject}</span>
                <span className="badge">Year {selected.yearLevel}</span>
                <span className="badge">
                  {assessmentTypes.find(t => t.value === selected.assessmentType)?.label || selected.assessmentType}
                </span>
                <span className="text-[12px] text-text-muted">
                  {new Date(selected.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {selected.description && (
                <p className="text-[13px] text-text-secondary mt-3 leading-relaxed">
                  {selected.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => copyRubricToClipboard(selected)}
                className="btn btn-secondary btn-sm"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => { deleteRubric(selected.id); }}
                className="btn btn-ghost btn-sm text-red-500"
              >
                Delete
              </button>
            </div>
          </div>

          <RubricTable criteria={selected.criteria} />
        </div>
      )}

      {/* ============================================================ */}
      {/*  RUBRIC LIST (default view)                                   */}
      {/* ============================================================ */}
      {!showForm && !selectedId && (
        <>
          {rubrics.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-light flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                </svg>
              </div>
              <h3 className="font-semibold text-[16px] mb-1">No rubrics yet</h3>
              <p className="text-text-secondary text-[14px] max-w-sm mx-auto mb-5">
                Generate AI-powered A-E rubrics aligned to the Australian Curriculum. Just describe your assessment task and the AI handles the rest.
              </p>
              <button onClick={() => setShowForm(true)} className="btn btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create Your First Rubric
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {rubrics.map(rubric => (
                <button
                  key={rubric.id}
                  onClick={() => setSelectedId(rubric.id)}
                  className="card p-4 w-full text-left hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-[14px] truncate">{rubric.taskName}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="badge">{rubric.subject}</span>
                        <span className="badge">Year {rubric.yearLevel}</span>
                        <span className="badge">
                          {assessmentTypes.find(t => t.value === rubric.assessmentType)?.label || rubric.assessmentType}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] text-text-muted">
                        {new Date(rubric.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {rubric.criteria.length} criteria
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              <div className="pt-4">
                <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Rubric
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Rubric Table component                                             */
/* ------------------------------------------------------------------ */

function RubricTable({ criteria }: { criteria: RubricCriterion[] }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 bg-slate-100 font-semibold text-text-secondary rounded-tl-lg border-b border-r border-border min-w-[140px]">
                Criterion
              </th>
              {grades.map(g => (
                <th
                  key={g}
                  className={cn(
                    'p-3 font-semibold text-center border-b border-r border-border last:border-r-0 last:rounded-tr-lg min-w-[140px]',
                    gradeHeaderColors[g]
                  )}
                >
                  {g}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="p-3 font-medium text-[13px] text-text border-b border-r border-border align-top">
                  {c.name}
                </td>
                {grades.map(g => (
                  <td
                    key={g}
                    className={cn(
                      'p-3 text-[12px] leading-relaxed text-text-secondary border-b border-r border-border last:border-r-0 align-top',
                      gradeCellColors[g]
                    )}
                  >
                    {c[g]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {criteria.map((c, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="p-3 bg-slate-100 border-b border-border">
              <p className="font-semibold text-[13px]">{c.name}</p>
            </div>
            <div className="divide-y divide-border">
              {grades.map(g => (
                <div key={g} className={cn('flex gap-3 p-3', gradeCellColors[g])}>
                  <span className={cn(
                    'shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-bold',
                    gradeHeaderColors[g]
                  )}>
                    {g}
                  </span>
                  <p className="text-[12px] leading-relaxed text-text-secondary">{c[g]}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
