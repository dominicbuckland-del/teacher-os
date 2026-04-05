'use client'

import { useState, useEffect, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { cn, generateId } from '@/lib/utils'

// --- Types ---
interface Term { id: string; name: string; startDate: string; endDate: string }
interface LessonPlan { id: string; classId: string; date: string; week: number; topic: string; learningIntention: string; successCriteria: string; activities: string; resources: string; differentiation: string }
interface PlannerData { terms: Term[]; lessons: LessonPlan[] }

const STORAGE_KEY = 'teacher-os-planner'

// --- Period schedule ---
const periodSlots = [
  { id: 'HG', label: 'Homegroup', time: '8:40 – 8:50', start: '0840', end: '0850' },
  { id: 'P1', label: 'Period 1', time: '8:50 – 10:00', start: '0850', end: '1000' },
  { id: 'BR1', label: 'First Break', time: '10:00 – 10:30', start: '1000', end: '1030', isBreak: true },
  { id: 'P2', label: 'Period 2', time: '10:30 – 11:40', start: '1030', end: '1140' },
  { id: 'P3', label: 'Period 3', time: '11:40 – 12:50', start: '1140', end: '1250' },
  { id: 'BR2', label: 'Second Break', time: '12:50 – 1:30', start: '1250', end: '1330', isBreak: true },
  { id: 'P4', label: 'Period 4', time: '1:30 – 2:40', start: '1330', end: '1440' },
  { id: 'P5', label: 'Period 5', time: '2:40 – 3:50', start: '1440', end: '1550' },
]

// --- Class colours (iOS-inspired) ---
const classColorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {}
const palette = [
  { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', dot: '#3B82F6' },
  { bg: '#F5F3FF', border: '#8B5CF6', text: '#5B21B6', dot: '#8B5CF6' },
  { bg: '#FFF7ED', border: '#F97316', text: '#9A3412', dot: '#F97316' },
  { bg: '#F0FDFA', border: '#14B8A6', text: '#115E59', dot: '#14B8A6' },
  { bg: '#FDF2F8', border: '#EC4899', text: '#9D174D', dot: '#EC4899' },
  { bg: '#F0FDF4', border: '#22C55E', text: '#166534', dot: '#22C55E' },
  { bg: '#FEF3C7', border: '#EAB308', text: '#854D0E', dot: '#EAB308' },
  { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', dot: '#EF4444' },
]

function getClassColor(classId: string, index: number) {
  if (!classColorMap[classId]) {
    classColorMap[classId] = palette[index % palette.length]
  }
  return classColorMap[classId]
}

// --- Helpers ---
function load(): PlannerData {
  if (typeof window === 'undefined') return { terms: [], lessons: [] }
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r) } catch {}
  return { terms: [], lessons: [] }
}
function save(data: PlannerData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

function toDateStr(d: Date): string { return d.toISOString().split('T')[0] }
function isToday(dateStr: string): boolean { return dateStr === toDateStr(new Date()) }
function isWeekend(d: Date): boolean { return d.getDay() === 0 || d.getDay() === 6 }

function monthDays(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) { days.push(new Date(d)); d.setDate(d.getDate() + 1) }
  return days
}

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function shortDay(d: Date): string {
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
}

// --- ICS Export ---
function generateICS(lessons: LessonPlan[], classes: { id: string; name: string }[]): string {
  const classMap = Object.fromEntries(classes.map(c => [c.id, c.name]))
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Teacher OS//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Teacher OS Timetable']

  for (const lesson of lessons) {
    if (!lesson.date || lesson.topic === 'LABOUR DAY — No school') continue
    const className = classMap[lesson.classId] || 'Lesson'
    const periodMatch = (lesson.resources || '').match(/^(P\d)\s*\((\d{1,2}):(\d{2})[–-](\d{1,2}):(\d{2})\)/)
    if (!periodMatch) continue

    const [, period, sh, sm, eh, em] = periodMatch
    const dateClean = lesson.date.replace(/-/g, '')
    const startH = sh.padStart(2, '0')
    const endH = eh.padStart(2, '0')
    const room = (lesson.resources || '').match(/Room\s+(\S+)/)?.[1] || ''

    const summary = `${className}${lesson.topic ? ' — ' + lesson.topic : ''}`
    const desc = [lesson.learningIntention, lesson.activities].filter(Boolean).join('\\n\\n')

    lines.push('BEGIN:VEVENT')
    lines.push(`DTSTART;TZID=Australia/Brisbane:${dateClean}T${startH}${sm}00`)
    lines.push(`DTEND;TZID=Australia/Brisbane:${dateClean}T${endH}${em}00`)
    lines.push(`SUMMARY:${summary.replace(/\n/g, ' ')}`)
    if (room) lines.push(`LOCATION:Room ${room}`)
    if (desc) lines.push(`DESCRIPTION:${desc.slice(0, 200)}`)
    lines.push(`UID:${lesson.id}@teacher-os`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

// --- Component ---
export default function PlannerPage() {
  const store = useStore()
  const [data, setData] = useState<PlannerData>({ terms: [], lessons: [] })
  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(new Date()))
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [showAddTerm, setShowAddTerm] = useState(false)
  const [editingSlot, setEditingSlot] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [showExport, setShowExport] = useState(false)

  useEffect(() => {
    const loaded = load()
    setData(loaded)
    // If there are terms, default to the first term's start month
    if (loaded.terms.length > 0) {
      const d = new Date(loaded.terms[0].startDate)
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
      setSelectedDate(loaded.terms[0].startDate)
    }
  }, [])

  function persist(updater: (d: PlannerData) => PlannerData) {
    setData(prev => { const next = updater(prev); save(next); return next })
  }

  function setLesson(date: string, classId: string, updates: Partial<LessonPlan>) {
    persist(d => {
      const idx = d.lessons.findIndex(l => l.date === date && l.classId === classId)
      if (idx >= 0) {
        const u = [...d.lessons]; u[idx] = { ...u[idx], ...updates }; return { ...d, lessons: u }
      }
      return { ...d, lessons: [...d.lessons, { id: generateId(), classId, date, week: 0, topic: '', learningIntention: '', successCriteria: '', activities: '', resources: '', differentiation: '', ...updates }] }
    })
  }

  // --- Month grid data ---
  const days = monthDays(viewYear, viewMonth)
  const firstDayOffset = (days[0].getDay() + 6) % 7 // Mon=0
  const gridCells: (Date | null)[] = Array(firstDayOffset).fill(null).concat(days)
  while (gridCells.length % 7 !== 0) gridCells.push(null)

  // Lessons indexed by date
  const lessonsByDate = useMemo(() => {
    const map: Record<string, LessonPlan[]> = {}
    for (const l of data.lessons) { (map[l.date] ||= []).push(l) }
    return map
  }, [data.lessons])

  // Selected day's lessons, sorted by period
  const selectedLessons = lessonsByDate[selectedDate] || []
  const classes = store.data.classes
  const classMap = Object.fromEntries(classes.map((c, i) => [c.id, { ...c, color: getClassColor(c.id, i) }]))

  // Build the day schedule (all periods with what's on)
  const daySchedule = periodSlots.map(slot => {
    const lesson = selectedLessons.find(l => (l.resources || '').startsWith(slot.id))
    const cls = lesson ? classMap[lesson.classId] : null
    const isStaffMeeting = slot.id === 'P5' && new Date(selectedDate + 'T00:00:00').getDay() === 3
    return { slot, lesson, cls, isStaffMeeting }
  })

  // Term info for selected date
  const activeTerm = data.terms.find(t => selectedDate >= t.startDate && selectedDate <= t.endDate)
  const isLabourDay = selectedDate === '2026-05-04'
  const selectedDateObj = new Date(selectedDate + 'T00:00:00')
  const isWeekendDay = isWeekend(selectedDateObj)

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }
  function goToToday() {
    const now = new Date()
    setViewYear(now.getFullYear()); setViewMonth(now.getMonth()); setSelectedDate(toDateStr(now))
  }

  async function generateDayPlan() {
    const dayLessons = selectedLessons.filter(l => {
      const cls = classMap[l.classId]
      return cls && !l.topic?.includes('LABOUR DAY')
    })
    if (dayLessons.length === 0) return

    setGenerating(true)
    for (const lesson of dayLessons) {
      const cls = classMap[lesson.classId]
      if (!cls) continue
      try {
        const res = await fetch('/api/generate-comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customPrompt: `You are an experienced Australian teacher. Write a brief lesson plan for this single lesson.

CLASS: ${cls.name} (${cls.subject}, Year ${cls.yearLevel})
DATE: ${dayLabel(selectedDateObj)}
PERIOD: ${lesson.resources || ''}

Provide in this exact format (one line each):
TOPIC: [3-8 word topic]
LI: Students will [learning intention]
ACTIVITIES: [2-3 sentence activity description]

Output ONLY these 3 lines, nothing else.`,
          }),
        })
        if (!res.ok) continue
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        let full = ''
        if (reader) { let done = false; while (!done) { const r = await reader.read(); done = r.done; if (r.value) full += decoder.decode(r.value) } }

        const topic = full.match(/TOPIC:\s*(.+)/i)?.[1]?.trim() || ''
        const li = full.match(/LI:\s*(.+)/i)?.[1]?.trim() || ''
        const activities = full.match(/ACTIVITIES:\s*([\s\S]*?)$/i)?.[1]?.trim() || ''
        if (topic) setLesson(selectedDate, lesson.classId, { topic, learningIntention: li, activities })
      } catch {}
    }
    setGenerating(false)
  }

  function downloadICS() {
    const ics = generateICS(data.lessons, classes)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'teacher-os-timetable.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  function addTerm(name: string, start: string, end: string) {
    persist(d => ({ ...d, terms: [...d.terms, { id: generateId(), name, startDate: start, endDate: end }] }))
    setShowAddTerm(false)
    const d = new Date(start)
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); setSelectedDate(start)
  }

  if (!store.ready) return null

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* ─── Top bar ─── */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border-light shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <h1 className="text-[17px] font-semibold tracking-tight min-w-[180px] text-center">{formatMonthYear(viewYear, viewMonth)}</h1>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="text-[13px] font-medium text-primary hover:text-primary-hover px-2 py-1 rounded-md hover:bg-primary-light transition-colors">Today</button>
          <button onClick={() => setShowAddTerm(true)} className="btn btn-ghost btn-sm text-[13px]">Add Term</button>
          <button onClick={() => setShowExport(true)} className="btn btn-secondary btn-sm text-[13px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* ─── Left: Month calendar ─── */}
        <div className="w-[340px] border-r border-border-light p-5 shrink-0 overflow-y-auto">
          {/* Week day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-[11px] font-medium text-text-muted py-1">{d}</div>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-7">
            {gridCells.map((date, i) => {
              if (!date) return <div key={i} className="h-12" />
              const dateStr = toDateStr(date)
              const isSelected = dateStr === selectedDate
              const today = isToday(dateStr)
              const hasLessons = (lessonsByDate[dateStr] || []).length > 0
              const weekend = isWeekend(date)
              const inTerm = data.terms.some(t => dateStr >= t.startDate && dateStr <= t.endDate)

              // Unique class colors for dots
              const dayClassIds = [...new Set((lessonsByDate[dateStr] || []).map(l => l.classId))]
              const dots = dayClassIds.slice(0, 4).map(cid => classMap[cid]?.color?.dot || '#94A3B8')

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    'h-12 flex flex-col items-center justify-center rounded-xl transition-all relative',
                    isSelected && !today && 'bg-slate-900 text-white',
                    today && isSelected && 'bg-red-500 text-white',
                    today && !isSelected && 'text-red-500',
                    !isSelected && !today && 'hover:bg-slate-50',
                    weekend && !isSelected && 'text-text-muted/50',
                    !inTerm && !isSelected && !today && 'text-text-muted/30',
                  )}
                >
                  <span className={cn('text-[15px] font-medium leading-none', today && !isSelected && 'font-bold')}>
                    {date.getDate()}
                  </span>
                  {hasLessons && (
                    <div className="flex gap-[2px] mt-[3px]">
                      {dots.map((color, di) => (
                        <span key={di} className="w-[4px] h-[4px] rounded-full" style={{ background: isSelected ? (today ? 'white' : 'white') : color }} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Term indicators */}
          {data.terms.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-light">
              {data.terms.map(t => (
                <div key={t.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[13px] font-medium">{t.name}</span>
                  </div>
                  <span className="text-[11px] text-text-muted">
                    {new Date(t.startDate + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – {new Date(t.endDate + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Class legend */}
          {classes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-light">
              <p className="text-[11px] text-text-muted uppercase tracking-wide font-medium mb-2">Classes</p>
              {classes.map((c, i) => {
                const color = getClassColor(c.id, i)
                return (
                  <div key={c.id} className="flex items-center gap-2 py-1">
                    <span className="w-2.5 h-2.5 rounded" style={{ background: color.dot }} />
                    <span className="text-[12px] text-text-secondary">{c.name}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── Right: Day schedule ─── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-6">
            {/* Day header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[20px] font-semibold tracking-tight">{dayLabel(selectedDateObj)}</h2>
                {activeTerm && (
                  <p className="text-[13px] text-text-muted mt-0.5">{activeTerm.name}</p>
                )}
              </div>
              {!isWeekendDay && !isLabourDay && selectedLessons.length > 0 && (
                <button onClick={generateDayPlan} disabled={generating} className="btn btn-primary btn-sm">
                  {generating ? (
                    <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Planning...</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> Plan Day</>
                  )}
                </button>
              )}
            </div>

            {/* Schedule */}
            {isWeekendDay ? (
              <div className="text-center py-16 text-text-muted text-[14px]">No lessons on weekends.</div>
            ) : isLabourDay ? (
              <div className="text-center py-16">
                <p className="text-[16px] font-medium text-red-600">Labour Day</p>
                <p className="text-[13px] text-text-muted mt-1">Public holiday — no school</p>
              </div>
            ) : (
              <div className="space-y-1">
                {daySchedule.map(({ slot, lesson, cls, isStaffMeeting }) => {
                  const isEditing = editingSlot === `${selectedDate}-${slot.id}`
                  const color = cls?.color

                  if (slot.isBreak) {
                    return (
                      <div key={slot.id} className="flex items-center gap-3 py-2 px-1">
                        <span className="text-[11px] text-text-muted w-[90px] text-right shrink-0">{slot.time}</span>
                        <div className="flex-1 border-t border-dashed border-border" />
                        <span className="text-[11px] text-text-muted">{slot.label}</span>
                      </div>
                    )
                  }

                  if (isStaffMeeting) {
                    return (
                      <div key={slot.id} className="flex items-start gap-3 py-1.5 px-1">
                        <span className="text-[11px] text-text-muted w-[90px] text-right shrink-0 pt-2.5">{slot.time}</span>
                        <div className="flex-1 rounded-xl bg-amber-50 border border-amber-200 p-3">
                          <p className="text-[13px] font-medium text-amber-800">Staff Meeting</p>
                          <p className="text-[11px] text-amber-600">{slot.label}</p>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={slot.id} className="flex items-start gap-3 py-1.5 px-1">
                      <span className="text-[11px] text-text-muted w-[90px] text-right shrink-0 pt-2.5">{slot.time}</span>
                      {cls && lesson ? (
                        <div
                          className="flex-1 rounded-xl p-3 cursor-pointer transition-all hover:shadow-sm"
                          style={{ background: color?.bg, borderLeft: `3px solid ${color?.border}` }}
                          onClick={() => setEditingSlot(isEditing ? null : `${selectedDate}-${slot.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-[14px] font-semibold" style={{ color: color?.text }}>{cls.name}</p>
                            <span className="text-[11px] font-medium" style={{ color: color?.text, opacity: 0.6 }}>
                              {(lesson.resources || '').match(/Room\s+\S+/)?.[0] || ''}
                            </span>
                          </div>
                          {lesson.topic && !lesson.topic.includes('LABOUR DAY') && (
                            <p className="text-[13px] mt-1" style={{ color: color?.text }}>{lesson.topic}</p>
                          )}
                          {lesson.learningIntention && (
                            <p className="text-[12px] mt-1 opacity-70" style={{ color: color?.text }}>{lesson.learningIntention}</p>
                          )}
                          {lesson.activities && !isEditing && (
                            <p className="text-[11px] mt-1 opacity-50 line-clamp-2" style={{ color: color?.text }}>{lesson.activities}</p>
                          )}

                          {/* Inline edit */}
                          {isEditing && (
                            <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: color?.border + '30' }} onClick={e => e.stopPropagation()}>
                              <input
                                type="text" value={lesson.topic || ''} onChange={e => setLesson(selectedDate, lesson.classId, { topic: e.target.value })}
                                placeholder="Topic" className="text-[12px] py-1.5 px-2 bg-white/80 rounded-lg" autoFocus
                              />
                              <input
                                type="text" value={lesson.learningIntention || ''} onChange={e => setLesson(selectedDate, lesson.classId, { learningIntention: e.target.value })}
                                placeholder="Learning intention" className="text-[12px] py-1.5 px-2 bg-white/80 rounded-lg"
                              />
                              <textarea
                                value={lesson.activities || ''} onChange={e => setLesson(selectedDate, lesson.classId, { activities: e.target.value })}
                                placeholder="Activities" className="text-[12px] py-1.5 px-2 bg-white/80 rounded-lg" rows={2}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 rounded-xl border border-dashed border-border p-3">
                          <p className="text-[12px] text-text-muted">{slot.label} — Free</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Add Term Modal ─── */}
      {showAddTerm && <AddTermModal onClose={() => setShowAddTerm(false)} onAdd={addTerm} />}

      {/* ─── Export Modal ─── */}
      {showExport && (
        <div className="modal-backdrop" onClick={() => setShowExport(false)}>
          <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-1">Export Calendar</h2>
              <p className="text-text-secondary text-[13px] mb-5">Download your timetable as an .ics file to import into any calendar app.</p>
              <div className="space-y-2">
                <button onClick={() => { downloadICS(); setShowExport(false) }} className="w-full text-left p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    </div>
                    <div>
                      <p className="font-medium text-[14px]">Download .ICS File</p>
                      <p className="text-[12px] text-text-muted">Works with Apple Calendar, Google Calendar, Outlook, and any app that supports iCalendar</p>
                    </div>
                  </div>
                </button>
                <div className="p-4 rounded-xl bg-border-light/50">
                  <p className="font-medium text-[13px] mb-2">How to import:</p>
                  <div className="space-y-1.5 text-[12px] text-text-secondary">
                    <p><strong>Apple Calendar:</strong> Double-click the .ics file, or File &gt; Import</p>
                    <p><strong>Google Calendar:</strong> Settings &gt; Import &amp; Export &gt; Import</p>
                    <p><strong>Outlook:</strong> File &gt; Open &amp; Export &gt; Import/Export</p>
                    <p><strong>Microsoft 365:</strong> Calendar &gt; Add calendar &gt; Upload from file</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-border">
              <button onClick={() => setShowExport(false)} className="btn btn-secondary">Close</button>
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

  const quickFill = (n: number) => {
    const y = new Date().getFullYear()
    const t: Record<number, { s: string; e: string }> = {
      1: { s: `${y}-01-27`, e: `${y}-04-04` }, 2: { s: `${y}-04-22`, e: `${y}-06-27` },
      3: { s: `${y}-07-14`, e: `${y}-09-19` }, 4: { s: `${y}-10-07`, e: `${y}-12-12` },
    }
    if (t[n]) { setName(`Term ${n} ${y}`); setStart(t[n].s); setEnd(t[n].e) }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add Term</h2>
          <div className="flex items-center gap-1 mb-4">
            <span className="text-[12px] text-text-muted mr-1">Quick fill:</span>
            {[1, 2, 3, 4].map(n => <button key={n} onClick={() => quickFill(n)} className="btn btn-ghost btn-sm text-[12px]">Term {n}</button>)}
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
