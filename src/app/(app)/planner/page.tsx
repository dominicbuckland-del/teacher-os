'use client'

import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import { cn, generateId } from '@/lib/utils'

interface Term {
  id: string
  name: string
  startDate: string
  endDate: string
}

interface LessonPlan {
  id: string
  classId: string
  date: string
  week: number
  topic: string
  learningIntention: string
  successCriteria: string
  activities: string
  resources: string
  differentiation: string
}

const STORAGE_KEY = 'teacher-os-planner'

interface PlannerData {
  terms: Term[]
  lessons: LessonPlan[]
}

function load(): PlannerData {
  if (typeof window === 'undefined') return { terms: [], lessons: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { terms: [], lessons: [] }
}

function save(data: PlannerData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function getWeeksBetween(start: string, end: string): { week: number; startDate: string; endDate: string; days: string[] }[] {
  const s = new Date(start)
  const e = new Date(end)
  const weeks: { week: number; startDate: string; endDate: string; days: string[] }[] = []
  let current = new Date(s)
  // Align to Monday
  const day = current.getDay()
  if (day !== 1) current.setDate(current.getDate() - (day === 0 ? 6 : day - 1))

  let weekNum = 1
  while (current <= e) {
    const weekStart = new Date(current)
    const weekEnd = new Date(current)
    weekEnd.setDate(weekEnd.getDate() + 4) // Friday
    const days: string[] = []
    for (let d = 0; d < 5; d++) {
      const dayDate = new Date(weekStart)
      dayDate.setDate(dayDate.getDate() + d)
      days.push(dayDate.toISOString().split('T')[0])
    }
    weeks.push({
      week: weekNum,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      days,
    })
    weekNum++
    current.setDate(current.getDate() + 7)
  }
  return weeks
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function dayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-AU', { weekday: 'short' })
}

export default function PlannerPage() {
  const store = useStore()
  const [data, setData] = useState<PlannerData>({ terms: [], lessons: [] })
  const [showAddTerm, setShowAddTerm] = useState(false)
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genWeek, setGenWeek] = useState<number | null>(null)
  const [showImport, setShowImport] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loaded = load()
    setData(loaded)
    if (loaded.terms.length > 0) setSelectedTermId(loaded.terms[0].id)
  }, [])

  useEffect(() => {
    if (store.ready && store.data.classes.length > 0 && !selectedClassId) {
      setSelectedClassId(store.data.classes[0].id)
    }
  }, [store.ready, store.data.classes, selectedClassId])

  function persist(updater: (d: PlannerData) => PlannerData) {
    setData(prev => {
      const next = updater(prev)
      save(next)
      return next
    })
  }

  function addTerm(name: string, start: string, end: string) {
    persist(d => ({ ...d, terms: [...d.terms, { id: generateId(), name, startDate: start, endDate: end }] }))
    setShowAddTerm(false)
  }

  function deleteTerm(id: string) {
    persist(d => ({
      terms: d.terms.filter(t => t.id !== id),
      lessons: d.lessons,
    }))
    if (selectedTermId === id) setSelectedTermId(data.terms.find(t => t.id !== id)?.id || null)
  }

  function setLesson(date: string, classId: string, updates: Partial<LessonPlan>) {
    persist(d => {
      const idx = d.lessons.findIndex(l => l.date === date && l.classId === classId)
      if (idx >= 0) {
        const updated = [...d.lessons]
        updated[idx] = { ...updated[idx], ...updates }
        return { ...d, lessons: updated }
      }
      return {
        ...d,
        lessons: [...d.lessons, {
          id: generateId(), classId, date, week: 0, topic: '', learningIntention: '',
          successCriteria: '', activities: '', resources: '', differentiation: '', ...updates,
        }],
      }
    })
  }

  function getLesson(date: string, classId: string): LessonPlan | undefined {
    return data.lessons.find(l => l.date === date && l.classId === classId)
  }

  async function generateWeekPlan(weekDays: string[], weekNum: number) {
    if (!selectedClassId) return
    const cls = store.data.classes.find(c => c.id === selectedClassId)
    if (!cls) return

    setGenerating(true)
    setGenWeek(weekNum)

    const existingLessons = weekDays.map(d => getLesson(d, selectedClassId!)).filter(Boolean)
    const existingTopics = existingLessons.map(l => l!.topic).filter(Boolean).join(', ')

    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPrompt: `You are an experienced Australian teacher planning lessons for Week ${weekNum} of the term.

CLASS: ${cls.name} (${cls.subject}, Year ${cls.yearLevel})
WEEK: ${weekNum} (${weekDays.map(d => `${dayName(d)} ${formatDate(d)}`).join(', ')})
${existingTopics ? `EXISTING TOPICS THIS WEEK: ${existingTopics}` : ''}

Generate a lesson plan outline for each of the 5 teaching days this week. Align to the Australian Curriculum v9 for Year ${cls.yearLevel} ${cls.subject}.

For each day, provide:
- Topic (brief, 3-8 words)
- Learning Intention ("Students will..." — one sentence)
- Success Criteria (2-3 bullet points, starting with "I can...")
- Activities (brief description, 2-3 sentences)

Format your response as exactly 5 blocks, one per day, in this exact format:
DAY: Monday
TOPIC: [topic]
LI: [learning intention]
SC: [success criteria, separated by | ]
ACTIVITIES: [activities]

DAY: Tuesday
...and so on for all 5 days.

Make the week flow logically — build skills progressively across the days. Output ONLY the lesson plans, no other text.`,
        }),
      })

      if (!res.ok) { setGenerating(false); setGenWeek(null); return }

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

      // Parse the response
      const dayBlocks = full.split(/DAY:\s*/i).filter(b => b.trim())
      dayBlocks.forEach((block, i) => {
        if (i >= weekDays.length) return
        const topic = block.match(/TOPIC:\s*(.+)/i)?.[1]?.trim() || ''
        const li = block.match(/LI:\s*(.+)/i)?.[1]?.trim() || ''
        const sc = block.match(/SC:\s*(.+)/i)?.[1]?.trim().replace(/\|/g, '\n') || ''
        const activities = block.match(/ACTIVITIES:\s*([\s\S]*?)(?=DAY:|$)/i)?.[1]?.trim() || ''

        setLesson(weekDays[i], selectedClassId!, {
          week: weekNum,
          topic,
          learningIntention: li,
          successCriteria: sc,
          activities,
        })
      })
    } catch {}

    setGenerating(false)
    setGenWeek(null)
  }

  function importICS(text: string) {
    // Parse ICS events into terms
    const events: { name: string; start: string; end: string }[] = []
    const eventBlocks = text.split('BEGIN:VEVENT').slice(1)
    for (const block of eventBlocks) {
      const summary = block.match(/SUMMARY:(.+)/)?.[1]?.trim() || ''
      const dtstart = block.match(/DTSTART[^:]*:(\d{8})/)?.[1] || ''
      const dtend = block.match(/DTEND[^:]*:(\d{8})/)?.[1] || ''
      if (summary && dtstart) {
        const start = `${dtstart.slice(0, 4)}-${dtstart.slice(4, 6)}-${dtstart.slice(6, 8)}`
        const end = dtend ? `${dtend.slice(0, 4)}-${dtend.slice(4, 6)}-${dtend.slice(6, 8)}` : start
        events.push({ name: summary, start, end })
      }
    }
    if (events.length > 0) {
      persist(d => ({
        ...d,
        terms: [...d.terms, ...events.map(e => ({ id: generateId(), name: e.name, startDate: e.start, endDate: e.end }))],
      }))
    }
    setShowImport(false)
  }

  if (!store.ready) return null

  const selectedTerm = data.terms.find(t => t.id === selectedTermId)
  const weeks = selectedTerm ? getWeeksBetween(selectedTerm.startDate, selectedTerm.endDate) : []
  const classes = store.data.classes

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-8 py-6 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Calendar & Lesson Planner</h1>
            <p className="text-text-secondary text-[14px] mt-0.5">Set up your terms, then generate AI-powered lesson plans aligned to the curriculum.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImport(true)} className="btn btn-secondary btn-sm">
              Import Calendar
            </button>
            <button onClick={() => setShowAddTerm(true)} className="btn btn-primary btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Term
            </button>
          </div>
        </div>

        {/* Term tabs + class selector */}
        {data.terms.length > 0 && (
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              {data.terms.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTermId(t.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-[13px] font-medium',
                    selectedTermId === t.id ? 'bg-primary text-white' : 'bg-border-light text-text-secondary hover:bg-border'
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
            {selectedTerm && (
              <button onClick={() => deleteTerm(selectedTerm.id)} className="btn btn-ghost btn-sm text-[12px] text-text-muted">
                Remove Term
              </button>
            )}
            <div className="ml-auto">
              <select
                value={selectedClassId || ''}
                onChange={e => setSelectedClassId(e.target.value)}
                className="text-[13px] py-1.5 px-3"
              >
                <option value="">Select class...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Week view */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {data.terms.length === 0 ? (
          <div className="card p-10 text-center">
            <h3 className="font-semibold text-[16px] mb-1">No terms set up</h3>
            <p className="text-text-secondary text-[14px] mb-4">Add your term dates to start planning lessons, or import your school calendar.</p>
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setShowAddTerm(true)} className="btn btn-primary btn-sm">Add Term</button>
              <button onClick={() => setShowImport(true)} className="btn btn-secondary btn-sm">Import Calendar</button>
            </div>
          </div>
        ) : !selectedClassId ? (
          <div className="card p-10 text-center">
            <p className="text-text-secondary text-[14px]">Select a class from the dropdown above to view and plan lessons.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {weeks.map(week => (
              <div key={week.week} className="card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-border-light/30 border-b border-border-light">
                  <div>
                    <span className="font-semibold text-[14px]">Week {week.week}</span>
                    <span className="text-text-muted text-[13px] ml-2">{formatDate(week.startDate)} — {formatDate(week.endDate)}</span>
                  </div>
                  <button
                    onClick={() => generateWeekPlan(week.days, week.week)}
                    disabled={generating}
                    className="btn btn-primary btn-sm"
                  >
                    {generating && genWeek === week.week ? (
                      <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                    ) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> Generate Week</>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-5 divide-x divide-border-light">
                  {week.days.map(date => {
                    const lesson = getLesson(date, selectedClassId!)
                    const isEditing = editingLesson === `${date}-${selectedClassId}`
                    return (
                      <div
                        key={date}
                        className={cn('p-3 min-h-[120px] cursor-pointer hover:bg-border-light/20 transition-colors', isEditing && 'bg-border-light/20')}
                        onClick={() => !isEditing && setEditingLesson(`${date}-${selectedClassId}`)}
                      >
                        <p className="text-[11px] text-text-muted font-medium mb-1">{dayName(date)} {formatDate(date)}</p>
                        {isEditing ? (
                          <div className="space-y-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              value={lesson?.topic || ''}
                              onChange={e => setLesson(date, selectedClassId!, { topic: e.target.value })}
                              placeholder="Topic"
                              className="text-[12px] py-1 px-2"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={lesson?.learningIntention || ''}
                              onChange={e => setLesson(date, selectedClassId!, { learningIntention: e.target.value })}
                              placeholder="Learning intention"
                              className="text-[12px] py-1 px-2"
                            />
                            <textarea
                              value={lesson?.activities || ''}
                              onChange={e => setLesson(date, selectedClassId!, { activities: e.target.value })}
                              placeholder="Activities"
                              className="text-[12px] py-1 px-2"
                              rows={2}
                            />
                            <button onClick={() => setEditingLesson(null)} className="btn btn-ghost btn-sm text-[11px] w-full">Done</button>
                          </div>
                        ) : lesson?.topic ? (
                          <div>
                            <p className="text-[13px] font-medium text-text">{lesson.topic}</p>
                            {lesson.learningIntention && (
                              <p className="text-[11px] text-text-secondary mt-1">{lesson.learningIntention}</p>
                            )}
                            {lesson.activities && (
                              <p className="text-[11px] text-text-muted mt-1 line-clamp-2">{lesson.activities}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-text-muted italic">Click to add</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Term Modal */}
      {showAddTerm && (
        <AddTermModal onClose={() => setShowAddTerm(false)} onAdd={addTerm} />
      )}

      {/* Import Calendar Modal */}
      {showImport && (
        <div className="modal-backdrop" onClick={() => setShowImport(false)}>
          <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-1">Import Calendar</h2>
              <p className="text-text-secondary text-[13px] mb-4">
                Upload an ICS file from your school calendar (Outlook, Google Calendar, etc.) to import term dates automatically.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".ics,.ical"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) file.text().then(importICS)
                }}
              />
              <button onClick={() => fileRef.current?.click()} className="btn btn-primary w-full">
                Upload .ICS File
              </button>
              <p className="text-[11px] text-text-muted mt-3 text-center">Export from Outlook: File &gt; Save Calendar &gt; Save as .ics</p>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-border">
              <button onClick={() => setShowImport(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AddTermModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string, start: string, end: string) => void }) {
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const quickFill = (termNum: number) => {
    const year = new Date().getFullYear()
    const terms: Record<number, { start: string; end: string }> = {
      1: { start: `${year}-01-27`, end: `${year}-04-04` },
      2: { start: `${year}-04-22`, end: `${year}-06-27` },
      3: { start: `${year}-07-14`, end: `${year}-09-19` },
      4: { start: `${year}-10-07`, end: `${year}-12-12` },
    }
    const t = terms[termNum]
    if (t) {
      setName(`Term ${termNum} ${year}`)
      setStart(t.start)
      setEnd(t.end)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add Term</h2>
          <div className="flex items-center gap-1 mb-4">
            <span className="text-[12px] text-text-muted mr-1">Quick fill:</span>
            {[1, 2, 3, 4].map(n => (
              <button key={n} onClick={() => quickFill(n)} className="btn btn-ghost btn-sm text-[12px]">Term {n}</button>
            ))}
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Term Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Term 1 2026" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Start Date</label>
                <input type="date" value={start} onChange={e => setStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">End Date</label>
                <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={() => name && start && end && onAdd(name, start, end)} disabled={!name || !start || !end} className="btn btn-primary">Add Term</button>
        </div>
      </div>
    </div>
  )
}
