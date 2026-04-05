/**
 * Seeds the app with Term 2 2026 timetable data extracted from the teacher's PDF.
 *
 * Classes taught:
 *   CRA07C — Creative Arts Year 7C (Room P1)
 *   CRA08E — Creative Arts Year 8E (Room V108)
 *   FTM12A — Film & Television Year 12A (Room MG2)
 *   MAZ10A — Media Arts Year 10A (Room A4)
 *   FFP10N — Film & Photography Year 10N (Room M16)
 *   SPO10D — Sport Year 10D (Room M16)
 *
 * Weekly timetable (repeating):
 *   Mon: FFP10N(P1), CRA07C(P2), FTM12A(P3), MAZ10A(P4)
 *   Tue: CRA08E(P1), CRA07C(P2), FTM12A(P3), FFP10N(P4)
 *   Wed: FTM12A(P1), CRA08E(P2), MAZ10A(P3), Staff Meeting(P5)
 *   Thu: free(P1), MAZ10A(P2), CRA07C(P3), SPO10D(P4)
 *   Fri: CRA08E(P1), MAZ10A(P2 area), FFP10N(P3)
 *
 * Term 2: Monday 20 April – Friday 26 June 2026 (10 weeks)
 */

import { generateId } from './utils'

const SEED_FLAG = 'teacher-os-seeded-term2'
const STORE_KEY = 'teacher-os-data'
const PLANNER_KEY = 'teacher-os-planner'

interface ClassDef {
  code: string
  name: string
  subject: string
  yearLevel: number
  room: string
}

const classDefs: ClassDef[] = [
  { code: 'CRA07C', name: 'Creative Arts 7C', subject: 'The Arts', yearLevel: 7, room: 'P1' },
  { code: 'CRA08E', name: 'Creative Arts 8E', subject: 'The Arts', yearLevel: 8, room: 'V108' },
  { code: 'FTM12A', name: 'Film & Television 12A', subject: 'The Arts', yearLevel: 12, room: 'MG2' },
  { code: 'MAZ10A', name: 'Media Arts 10A', subject: 'The Arts', yearLevel: 10, room: 'A4' },
  { code: 'FFP10N', name: 'Film & Photography 10N', subject: 'The Arts', yearLevel: 10, room: 'M16' },
  { code: 'SPO10D', name: 'Sport 10D', subject: 'Health & Physical Education', yearLevel: 10, room: 'M16' },
]

// Timetable: day -> list of { code, period, time }
const periods: Record<string, string> = {
  P1: '8:50–10:00',
  P2: '10:30–11:40',
  P3: '11:40–12:50',
  P4: '1:30–2:40',
}

// dayOfWeek 0=Sun, 1=Mon, ..., 5=Fri
const timetable: { day: number; code: string; period: string }[] = [
  // Monday
  { day: 1, code: 'FFP10N', period: 'P1' },
  { day: 1, code: 'CRA07C', period: 'P2' },
  { day: 1, code: 'FTM12A', period: 'P3' },
  { day: 1, code: 'MAZ10A', period: 'P4' },
  // Tuesday
  { day: 2, code: 'CRA08E', period: 'P1' },
  { day: 2, code: 'CRA07C', period: 'P2' },
  { day: 2, code: 'FTM12A', period: 'P3' },
  { day: 2, code: 'FFP10N', period: 'P4' },
  // Wednesday
  { day: 3, code: 'FTM12A', period: 'P1' },
  { day: 3, code: 'CRA08E', period: 'P2' },
  { day: 3, code: 'MAZ10A', period: 'P3' },
  // Thursday
  { day: 4, code: 'MAZ10A', period: 'P2' },
  { day: 4, code: 'CRA07C', period: 'P3' },
  { day: 4, code: 'SPO10D', period: 'P4' },
  // Friday
  { day: 5, code: 'CRA08E', period: 'P1' },
  { day: 5, code: 'FFP10N', period: 'P3' },
]

// Important dates and events
const events: { date: string; note: string; classCode?: string }[] = [
  { date: '2026-04-23', note: 'Interim Reporting closes 9:00am' },
  { date: '2026-04-27', note: 'Reports sent to all parents 3:00pm' },
  { date: '2026-04-28', note: 'PT Interview bookings open 3:00pm' },
  { date: '2026-05-01', note: 'IA1 Samples uploaded' },
  { date: '2026-05-04', note: 'LABOUR DAY — No school' },
  { date: '2026-05-05', note: 'PT Interview bookings close 9:00am' },
  { date: '2026-05-06', note: 'Parent Teacher Interviews 3:00–7:00pm' },
  { date: '2026-05-25', note: 'Documentary Due', classCode: 'FTM12A' },
  { date: '2026-06-04', note: 'IA2 Provisional Marks Due' },
  { date: '2026-06-05', note: 'Provisional marks due for IA2 (all besides MUX)' },
  { date: '2026-06-15', note: 'Ukulele Performances', classCode: 'CRA07C' },
  { date: '2026-06-16', note: 'Ukulele Performances', classCode: 'CRA07C' },
  { date: '2026-06-17', note: 'Café Experience' },
  { date: '2026-06-18', note: 'IA2 Samples Due / Café Experience / Ukulele Performances' },
  { date: '2026-06-19', note: 'Media Folio Due (CRA08E)', classCode: 'CRA08E' },
  { date: '2026-06-19', note: 'IA2 Samples uploaded' },
]

const LABOUR_DAY = '2026-05-04'

export function seedTerm2() {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(SEED_FLAG)) return

  // --- 1. Create classes in the main store ---
  const classIds: Record<string, string> = {}
  const classes: any[] = []

  for (const def of classDefs) {
    const id = generateId()
    classIds[def.code] = id
    classes.push({
      id,
      name: def.name,
      subject: def.subject,
      yearLevel: def.yearLevel,
      createdAt: new Date().toISOString(),
    })
  }

  // Load existing store data or create fresh
  let storeData: any = { classes: [], students: [], assessments: [], comments: [], settings: {} }
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) storeData = JSON.parse(raw)
  } catch {}

  // Merge classes (don't duplicate)
  storeData.classes = [...(storeData.classes || []), ...classes]
  localStorage.setItem(STORE_KEY, JSON.stringify(storeData))

  // --- 2. Create Term 2 and lesson entries in the planner ---
  const termId = generateId()
  const term = {
    id: termId,
    name: 'Term 2 2026',
    startDate: '2026-04-20',
    endDate: '2026-06-26',
  }

  const lessons: any[] = []

  // Generate all teaching dates for the 10-week term
  const start = new Date('2026-04-20')
  const end = new Date('2026-06-26')
  const current = new Date(start)

  let weekNum = 1
  let lastMonday = new Date(start)

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0]
    const dayOfWeek = current.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

    // Track week number
    if (dayOfWeek === 1 && current > start) {
      weekNum++
      lastMonday = new Date(current)
    }

    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      current.setDate(current.getDate() + 1)
      continue
    }

    // Skip Labour Day
    if (dateStr === LABOUR_DAY) {
      // Add a "no school" entry for all classes that day
      for (const entry of timetable.filter(t => t.day === dayOfWeek)) {
        const classId = classIds[entry.code]
        if (classId) {
          lessons.push({
            id: generateId(),
            classId,
            date: dateStr,
            week: weekNum,
            topic: 'LABOUR DAY — No school',
            learningIntention: '',
            successCriteria: '',
            activities: '',
            resources: '',
            differentiation: '',
          })
        }
      }
      current.setDate(current.getDate() + 1)
      continue
    }

    // Create lesson entries for each class that meets today
    const todaySlots = timetable.filter(t => t.day === dayOfWeek)

    for (const slot of todaySlots) {
      const classId = classIds[slot.code]
      const classDef = classDefs.find(d => d.code === slot.code)!
      if (!classId) continue

      // Check for special events on this day for this class
      const dayEvents = events.filter(e =>
        e.date === dateStr && (!e.classCode || e.classCode === slot.code)
      )
      const eventNote = dayEvents.map(e => e.note).join(' | ')

      lessons.push({
        id: generateId(),
        classId,
        date: dateStr,
        week: weekNum,
        topic: eventNote || '',
        learningIntention: '',
        successCriteria: '',
        activities: '',
        resources: `${slot.period} (${periods[slot.period]}) — Room ${classDef.room}`,
        differentiation: '',
      })
    }

    current.setDate(current.getDate() + 1)
  }

  // Load existing planner data or create fresh
  let plannerData: any = { terms: [], lessons: [] }
  try {
    const raw = localStorage.getItem(PLANNER_KEY)
    if (raw) plannerData = JSON.parse(raw)
  } catch {}

  plannerData.terms = [...(plannerData.terms || []), term]
  plannerData.lessons = [...(plannerData.lessons || []), ...lessons]
  localStorage.setItem(PLANNER_KEY, JSON.stringify(plannerData))

  // --- 3. Mark as seeded ---
  localStorage.setItem(SEED_FLAG, 'true')
}
