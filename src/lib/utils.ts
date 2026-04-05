export function generateId(): string {
  return crypto.randomUUID()
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-emerald-100 text-emerald-800'
    case 'B': return 'bg-teal-100 text-teal-800'
    case 'C': return 'bg-amber-100 text-amber-800'
    case 'D': return 'bg-orange-100 text-orange-800'
    case 'E': return 'bg-red-100 text-red-800'
    default: return 'bg-slate-100 text-slate-500'
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'approved': return 'bg-emerald-500'
    case 'draft': return 'bg-sky-500'
    case 'pending': return 'bg-slate-300'
    default: return 'bg-slate-300'
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'approved': return 'Approved'
    case 'draft': return 'Draft'
    case 'pending': return 'Pending'
    default: return 'Pending'
  }
}

export function fullName(student: { firstName: string; lastName: string }): string {
  return `${student.firstName} ${student.lastName}`
}

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''))
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] || '' })
    return row
  })
}

export function exportAsCSV(rows: { name: string; grade: string; comment: string }[]): string {
  const header = 'Student Name,Grade,Comment'
  const lines = rows.map(r => `"${r.name}","${r.grade}","${r.comment.replace(/"/g, '""')}"`)
  return [header, ...lines].join('\n')
}
