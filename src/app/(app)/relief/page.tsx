'use client'

import { useState, useEffect, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { cn, fullName } from '@/lib/utils'
import type { Class, Student } from '@/lib/types'

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

interface PlannerData {
  terms: { id: string; name: string; startDate: string; endDate: string }[]
  lessons: LessonPlan[]
}

interface LessonCard {
  lesson: LessonPlan
  cls: Class
  students: Student[]
  iepStudents: Student[]
  ealdStudents: Student[]
  studentsWithNotes: Student[]
  period: string
  room: string
}

const PLANNER_KEY = 'teacher-os-planner'

function loadPlanner(): PlannerData {
  if (typeof window === 'undefined') return { terms: [], lessons: [] }
  try {
    const raw = localStorage.getItem(PLANNER_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { terms: [], lessons: [] }
}

function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ReliefPage() {
  const store = useStore()
  const [planner, setPlanner] = useState<PlannerData>({ terms: [], lessons: [] })
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [generating, setGenerating] = useState(false)
  const [generatedNotes, setGeneratedNotes] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setPlanner(loadPlanner())
  }, [])

  // Lessons for the selected date, grouped by class
  const dayLessons = useMemo(() => {
    return planner.lessons.filter(l => l.date === selectedDate)
  }, [planner.lessons, selectedDate])

  const classMap = useMemo(() => {
    return Object.fromEntries(store.data.classes.map(c => [c.id, c]))
  }, [store.data.classes])

  // Build enriched data for each lesson
  const lessonCards: LessonCard[] = useMemo(() => {
    const cards: LessonCard[] = []
    for (const lesson of dayLessons) {
      const cls = classMap[lesson.classId]
      if (!cls) continue
      const students = store.getStudentsForClass(cls.id)
      const iepStudents = students.filter(s => s.iep)
      const ealdStudents = students.filter(s => s.eald)
      const studentsWithNotes = students.filter(s => s.notes && s.notes.trim())

      // Parse period and room from resources
      const periodMatch = (lesson.resources || '').match(/^(P\d|HG)/)
      const period = periodMatch ? periodMatch[1] : ''
      const roomMatch = (lesson.resources || '').match(/Room\s+(\S+)/)
      const room = roomMatch ? roomMatch[1] : ''

      cards.push({ lesson, cls, students, iepStudents, ealdStudents, studentsWithNotes, period, room })
    }
    return cards
  }, [dayLessons, classMap, store])

  async function generateNotes() {
    if (lessonCards.length === 0) return
    setGenerating(true)
    setGeneratedNotes('')

    const classBlocks = lessonCards.map(card => {
      const { lesson, cls, students, iepStudents, ealdStudents, studentsWithNotes, period, room } = card
      let block = `CLASS: ${cls.name} (${cls.subject}, Year ${cls.yearLevel})\n`
      if (period) block += `PERIOD: ${period}\n`
      if (room) block += `ROOM: ${room}\n`
      block += `STUDENT COUNT: ${students.length}\n`
      if (lesson.topic) block += `TOPIC: ${lesson.topic}\n`
      if (lesson.learningIntention) block += `LEARNING INTENTION: ${lesson.learningIntention}\n`
      if (lesson.activities) block += `ACTIVITIES: ${lesson.activities}\n`
      if (lesson.differentiation) block += `DIFFERENTIATION: ${lesson.differentiation}\n`

      if (iepStudents.length > 0) {
        block += `\nSTUDENTS WITH IEP (Individual Education Plan):\n`
        iepStudents.forEach(s => {
          block += `  - ${fullName(s)}${s.notes ? ': ' + s.notes : ''}\n`
        })
      }
      if (ealdStudents.length > 0) {
        block += `\nEAL/D STUDENTS (English as Additional Language/Dialect):\n`
        ealdStudents.forEach(s => {
          block += `  - ${fullName(s)}${s.notes ? ': ' + s.notes : ''}\n`
        })
      }
      if (studentsWithNotes.length > 0) {
        const notesOnly = studentsWithNotes.filter(s => !s.iep && !s.eald)
        if (notesOnly.length > 0) {
          block += `\nSTUDENT NOTES:\n`
          notesOnly.forEach(s => {
            block += `  - ${fullName(s)}: ${s.notes}\n`
          })
        }
      }
      return block
    })

    const prompt = `You are helping prepare comprehensive relief teacher notes for a day's teaching. Write clear, practical, printable notes that a relief (substitute) teacher can follow with confidence.

DATE: ${formatDate(selectedDate)}

${classBlocks.join('\n---\n\n')}

Write the relief teacher notes in this structure:
1. A brief welcome header with the date
2. For each class period in order:
   - Class name, period, room, and student count
   - What to teach: topic, learning intention, and step-by-step activity instructions
   - Any students requiring support (IEP, EAL/D) with brief guidance on accommodations
   - Any other student notes the relief teacher should know
3. General tips (e.g. where to find resources, behaviour management approach)

Be specific and actionable. Use plain language. Format with clear headings and bullet points. Do not invent information that was not provided — only use what is given above.`

    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customPrompt: prompt }),
      })

      if (!res.ok) {
        setGeneratedNotes('Error: Could not generate notes. Check your API key in .env.local.')
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
          setGeneratedNotes(full)
        }
      }
    } catch {
      setGeneratedNotes('Error: Failed to connect to the API.')
    }
    setGenerating(false)
  }

  function copyNotes() {
    navigator.clipboard.writeText(generatedNotes)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function printNotes() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Relief Teacher Notes — ${formatDate(selectedDate)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 32px; color: #1a1a1a; font-size: 14px; line-height: 1.7; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  h2 { font-size: 16px; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  h3 { font-size: 14px; margin-top: 16px; }
  ul { padding-left: 20px; }
  li { margin-bottom: 4px; }
  pre { white-space: pre-wrap; font-family: inherit; }
  @media print { body { padding: 20px; } }
</style></head><body>
<pre>${generatedNotes.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body></html>`)
    printWindow.document.close()
    printWindow.print()
  }

  if (!store.ready) return null

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Relief Teacher Notes</h1>
        <p className="text-[13px] text-text-muted mt-1">
          Generate comprehensive notes for a relief teacher covering your classes.
        </p>
      </div>

      {/* Date selector */}
      <div className="card p-4 mb-6">
        <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Date</label>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value)
              setGeneratedNotes('')
            }}
            className="max-w-[200px]"
          />
          <span className="text-[14px] text-text-secondary">
            {formatDate(selectedDate)}
          </span>
        </div>
      </div>

      {/* Lessons overview */}
      {lessonCards.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-text-muted text-[14px]">No lessons found for this date.</p>
          <p className="text-text-muted text-[12px] mt-1">
            Lessons are loaded from the Planner. Make sure you have timetabled classes for this day.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {lessonCards.map(({ lesson, cls, students, iepStudents, ealdStudents, studentsWithNotes, period, room }) => (
              <div key={lesson.id} className="card p-4">
                {/* Class header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-[15px] font-semibold">{cls.name}</h3>
                    <p className="text-[12px] text-text-muted">
                      {cls.subject} — Year {cls.yearLevel}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {period && (
                      <span className="text-[13px] font-medium text-text-secondary">{period}</span>
                    )}
                    {room && (
                      <p className="text-[11px] text-text-muted">Room {room}</p>
                    )}
                  </div>
                </div>

                {/* Lesson details */}
                {lesson.topic && (
                  <div className="mb-2">
                    <p className="text-[12px] font-medium text-text-secondary">Topic</p>
                    <p className="text-[13px]">{lesson.topic}</p>
                  </div>
                )}
                {lesson.learningIntention && (
                  <div className="mb-2">
                    <p className="text-[12px] font-medium text-text-secondary">Learning Intention</p>
                    <p className="text-[13px]">{lesson.learningIntention}</p>
                  </div>
                )}
                {lesson.activities && (
                  <div className="mb-2">
                    <p className="text-[12px] font-medium text-text-secondary">Activities</p>
                    <p className="text-[13px] whitespace-pre-wrap">{lesson.activities}</p>
                  </div>
                )}

                {/* Student info */}
                <div className="mt-3 pt-3 border-t border-border-light">
                  <p className="text-[12px] text-text-muted mb-2">
                    {students.length} student{students.length !== 1 ? 's' : ''}
                  </p>

                  {iepStudents.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1.5">
                        {iepStudents.map(s => (
                          <span key={s.id} className="badge bg-amber-100 text-amber-800">
                            IEP: {fullName(s)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {ealdStudents.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1.5">
                        {ealdStudents.map(s => (
                          <span key={s.id} className="badge bg-sky-100 text-sky-800">
                            EAL/D: {fullName(s)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {studentsWithNotes.length > 0 && (
                    <div className="space-y-1">
                      {studentsWithNotes.map(s => (
                        <p key={s.id} className="text-[12px] text-text-secondary">
                          <span className="font-medium">{fullName(s)}:</span> {s.notes}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Generate button */}
          <button
            onClick={generateNotes}
            disabled={generating}
            className="btn btn-primary w-full mb-6"
          >
            {generating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Notes...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Generate Full Notes
              </>
            )}
          </button>
        </>
      )}

      {/* Generated notes output */}
      {generatedNotes && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold">Relief Teacher Notes</h3>
            <div className="flex items-center gap-2">
              <button onClick={copyNotes} className="btn btn-secondary btn-sm">
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={printNotes} className="btn btn-secondary btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print
              </button>
            </div>
          </div>
          <pre className={cn(
            'text-[14px] whitespace-pre-wrap font-sans leading-relaxed text-text-secondary',
            generating && 'streaming-cursor'
          )}>{generatedNotes}</pre>
        </div>
      )}
    </div>
  )
}
