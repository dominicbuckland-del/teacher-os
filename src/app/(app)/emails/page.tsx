'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface EmailTemplate {
  id: string
  name: string
  category: string
  subject: string
  body: string
  isDefault: boolean
}

const STORAGE_KEY = 'teacher-os-email-templates'

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'positive-feedback',
    name: 'Positive Feedback',
    category: 'positive',
    subject: 'Great work from {studentName} in {className}',
    body: `Dear {parentName},

I wanted to reach out to share some positive news about {studentName}'s progress in {className}.

{studentName} has been demonstrating {specificAchievement}. {additionalDetail}

It's wonderful to see this level of {quality} and I wanted to make sure you were aware of how well {studentName} is doing.

Please don't hesitate to reach out if you have any questions.

Kind regards,
{teacherName}`,
    isDefault: true,
  },
  {
    id: 'non-submission',
    name: 'Non-Submission of Work',
    category: 'academic',
    subject: 'Outstanding work — {studentName} — {className}',
    body: `Dear {parentName},

I am writing to let you know that {studentName} has not yet submitted their {assignmentName} for {className}, which was due on {dueDate}.

This assessment task is an important part of {studentName}'s learning and contributes to their overall grade. I would appreciate your support in encouraging {studentName} to complete and submit this work as soon as possible.

{studentName} is welcome to attend {catchUpSession} for additional support if needed.

If there are any circumstances I should be aware of, please don't hesitate to contact me.

Kind regards,
{teacherName}`,
    isDefault: true,
  },
  {
    id: 'detention',
    name: 'Detention Notice',
    category: 'behaviour',
    subject: 'Detention Notice — {studentName} — {date}',
    body: `Dear {parentName},

I am writing to inform you that {studentName} has been issued a {detentionType} detention to be served on {detentionDate} at {detentionTime} in {detentionLocation}.

This detention has been issued due to {reason}.

We believe that consistent expectations help students succeed, and this is an opportunity for {studentName} to reflect on their choices and how they can improve going forward.

If you have any questions or concerns, please feel free to contact me.

Kind regards,
{teacherName}`,
    isDefault: true,
  },
  {
    id: 'behaviour-concern',
    name: 'Behaviour Concern',
    category: 'behaviour',
    subject: 'Behaviour update — {studentName} — {className}',
    body: `Dear {parentName},

I wanted to touch base with you regarding {studentName}'s behaviour in {className} recently.

I have noticed that {studentName} has been {behaviourDescription}. While I understand that {acknowledgement}, it is important that {studentName} {expectation}.

I have spoken with {studentName} about this and {actionTaken}. I believe that with support from both home and school, {studentName} can {positiveOutcome}.

I would appreciate the opportunity to discuss this further. Would you be available for a {meetingType}?

Kind regards,
{teacherName}`,
    isDefault: true,
  },
  {
    id: 'parent-meeting',
    name: 'Parent Meeting Request',
    category: 'admin',
    subject: 'Meeting request — {studentName}',
    body: `Dear {parentName},

I would like to request a meeting to discuss {studentName}'s {meetingTopic} in {className}.

{briefContext}

Would any of the following times suit you?
- {option1}
- {option2}
- {option3}

The meeting can be held {meetingFormat}. Please let me know your preference and I will confirm the details.

Kind regards,
{teacherName}`,
    isDefault: true,
  },
  {
    id: 'progress-update',
    name: 'Progress Update',
    category: 'academic',
    subject: 'Progress update — {studentName} — {className}',
    body: `Dear {parentName},

I wanted to provide you with a brief update on {studentName}'s progress in {className} this term.

{studentName} is currently {performanceLevel}. {specificDetail}

Areas of strength include {strengths}. Moving forward, {studentName} would benefit from focusing on {areasForGrowth}.

{additionalNote}

Please don't hesitate to reach out if you would like to discuss {studentName}'s progress in more detail.

Kind regards,
{teacherName}`,
    isDefault: true,
  },
  {
    id: 'absence-followup',
    name: 'Absence Follow-Up',
    category: 'admin',
    subject: 'Checking in — {studentName} — {className}',
    body: `Dear {parentName},

I noticed that {studentName} has been absent from {className} on {absentDates}. I hope everything is okay.

During this time, we covered {topicsCovered}. I have {catchUpPlan} to help {studentName} catch up on any missed work.

If there is anything I can do to support {studentName}'s return, please let me know.

Kind regards,
{teacherName}`,
    isDefault: true,
  },
  {
    id: 'excursion-info',
    name: 'Excursion / Event Info',
    category: 'admin',
    subject: '{eventName} — {className} — {eventDate}',
    body: `Dear {parentName},

I am writing to inform you about an upcoming {eventType} for {className}.

Event: {eventName}
Date: {eventDate}
Time: {eventTime}
Location: {eventLocation}
Cost: {eventCost}

{eventDescription}

Students will need to {requirements}.

Please complete and return the attached permission form by {permissionDeadline}. If you have any questions or concerns, please do not hesitate to contact me.

Kind regards,
{teacherName}`,
    isDefault: true,
  },
  {
    id: 'welcome-email',
    name: 'Welcome / Start of Term',
    category: 'positive',
    subject: 'Welcome to {className} — Term {termNumber}',
    body: `Dear Parents and Carers,

Welcome to Term {termNumber}! I am looking forward to working with your child in {className} this term.

This term, we will be focusing on {termTopics}. Key dates to be aware of include:
- {keyDate1}
- {keyDate2}
- {keyDate3}

Students will need {materials} for this class.

{additionalInfo}

The best way to contact me is via email at {teacherEmail}. I aim to respond within {responseTime}.

I look forward to a productive term.

Kind regards,
{teacherName}`,
    isDefault: true,
  },
  {
    id: 'report-followup',
    name: 'Report Card Follow-Up',
    category: 'academic',
    subject: 'Following up on {studentName}\'s report — {className}',
    body: `Dear {parentName},

Now that semester reports have been issued, I wanted to follow up regarding {studentName}'s results in {className}.

{studentName} received a grade of {grade} this semester. {gradeContext}

{specificFeedback}

If you would like to discuss {studentName}'s report or set some goals for next semester, I am happy to arrange a meeting.

Kind regards,
{teacherName}`,
    isDefault: true,
  },
  {
    id: 'late-work',
    name: 'Late Work Warning',
    category: 'academic',
    subject: 'Late work notice — {studentName} — {className}',
    body: `Dear {parentName},

I am writing to let you know that {studentName} has submitted their {assignmentName} for {className} after the due date of {dueDate}.

In accordance with our school's assessment policy, {latePolicy}.

To avoid this in future, I would encourage {studentName} to {suggestion}. If {studentName} is finding it difficult to manage their workload, I am happy to discuss strategies that might help.

Kind regards,
{teacherName}`,
    isDefault: true,
  },
  {
    id: 'medical-concern',
    name: 'Wellbeing / Medical Concern',
    category: 'behaviour',
    subject: 'Wellbeing check-in — {studentName}',
    body: `Dear {parentName},

I wanted to reach out as I have noticed that {studentName} has {observation} recently in {className}.

While I don't want to cause unnecessary concern, I felt it was important to let you know so we can work together to support {studentName}.

{schoolSupport}

Please don't hesitate to reach out if there is anything the school should be aware of, or if you would like to discuss this further.

Kind regards,
{teacherName}`,
    isDefault: true,
  },
]

const categories = [
  { id: 'all', label: 'All Templates' },
  { id: 'positive', label: 'Positive' },
  { id: 'academic', label: 'Academic' },
  { id: 'behaviour', label: 'Behaviour' },
  { id: 'admin', label: 'Admin' },
]

function loadTemplates(): EmailTemplate[] {
  if (typeof window === 'undefined') return defaultTemplates
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return defaultTemplates
}

function saveTemplates(templates: EmailTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

export default function EmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates)
  const [selectedId, setSelectedId] = useState<string>(defaultTemplates[0].id)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editing, setEditing] = useState(false)
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody] = useState('')
  const [personalising, setPersonalising] = useState(false)
  const [personalisedResult, setPersonalisedResult] = useState('')
  const [studentContext, setStudentContext] = useState('')
  const [copied, setCopied] = useState(false)
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const store = useStore()

  useEffect(() => {
    setTemplates(loadTemplates())
  }, [])

  const selected = templates.find(t => t.id === selectedId) || templates[0]
  const filtered = categoryFilter === 'all' ? templates : templates.filter(t => t.category === categoryFilter)

  function startEdit() {
    setEditSubject(selected.subject)
    setEditBody(selected.body)
    setEditing(true)
  }

  function saveEdit() {
    const updated = templates.map(t =>
      t.id === selectedId ? { ...t, subject: editSubject, body: editBody } : t
    )
    setTemplates(updated)
    saveTemplates(updated)
    setEditing(false)
  }

  function resetToDefault() {
    const original = defaultTemplates.find(t => t.id === selectedId)
    if (original) {
      const updated = templates.map(t => t.id === selectedId ? { ...original } : t)
      setTemplates(updated)
      saveTemplates(updated)
      setEditSubject(original.subject)
      setEditBody(original.body)
    }
  }

  function deleteTemplate(id: string) {
    const updated = templates.filter(t => t.id !== id)
    setTemplates(updated)
    saveTemplates(updated)
    if (selectedId === id && updated.length > 0) setSelectedId(updated[0].id)
  }

  function addTemplate(name: string, category: string) {
    const newTemplate: EmailTemplate = {
      id: `custom-${Date.now()}`,
      name,
      category,
      subject: 'Subject line here',
      body: 'Email body here...\n\nKind regards,\n{teacherName}',
      isDefault: false,
    }
    const updated = [...templates, newTemplate]
    setTemplates(updated)
    saveTemplates(updated)
    setSelectedId(newTemplate.id)
    setShowNewTemplate(false)
    startEdit()
  }

  async function personalise() {
    if (!studentContext.trim()) return
    setPersonalising(true)
    setPersonalisedResult('')
    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: { firstName: 'Student', lastName: '', gender: 'unspecified', iep: false, eald: false, notes: '' },
          assessment: { grade: '', effort: '', strengths: '', areasForGrowth: '', attendancePct: 0, notes: '' },
          subject: '',
          yearLevel: 0,
          settings: { ...store.data.settings, commentLength: 'long' },
          customPrompt: `You are a teacher writing a personalised email. Take this email template and fill in the placeholders with appropriate content based on the context provided. Replace ALL {placeholder} variables with natural, specific language. Output ONLY the completed email — no explanations.

TEMPLATE:
Subject: ${selected.subject}

${selected.body}

CONTEXT PROVIDED BY TEACHER:
${studentContext}

TEACHER NAME: ${store.data.settings.schoolName ? `Teacher at ${store.data.settings.schoolName}` : 'the teacher'}

Write the personalised email now. Include the subject line at the top as "Subject: ..." followed by a blank line, then the body.`,
        }),
      })
      if (!res.ok) {
        setPersonalisedResult('Error: Could not generate. Check your API key.')
        setPersonalising(false)
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
          setPersonalisedResult(full)
        }
      }
    } catch {
      setPersonalisedResult('Error: Failed to connect.')
    }
    setPersonalising(false)
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Left panel — template list */}
      <div className={cn('md:w-[280px] border-b md:border-b-0 md:border-r border-border bg-surface overflow-y-auto shrink-0 flex flex-col', selectedId && 'hidden md:flex')}>
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold mb-3">Email Templates</h1>
          <div className="flex flex-wrap gap-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={cn(
                  'text-[12px] px-2 py-1 rounded-md font-medium',
                  categoryFilter === cat.id ? 'bg-primary text-white' : 'bg-border-light text-text-secondary hover:bg-border'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={() => { setSelectedId(t.id); setEditing(false); setPersonalisedResult('') }}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-colors',
                selectedId === t.id ? 'bg-primary-light text-primary-hover' : 'hover:bg-border-light text-text'
              )}
            >
              <p className="font-medium text-[13px] truncate">{t.name}</p>
              <p className="text-[11px] mt-0.5 opacity-60 capitalize">{t.category}</p>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-border">
          <button onClick={() => setShowNewTemplate(true)} className="btn btn-secondary btn-sm w-full">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Template
          </button>
        </div>
      </div>

      {/* Right panel — template detail */}
      <div className={cn('flex-1 overflow-y-auto', !selectedId && 'hidden md:block')}>
        {selected && (
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 md:py-8">
            {/* Mobile back button */}
            <button onClick={() => setSelectedId(defaultTemplates[0]?.id)} className="md:hidden text-[13px] text-primary mb-3 flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
              All Templates
            </button>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selected.name}</h2>
                <p className="text-[13px] text-text-muted capitalize">{selected.category} template</p>
              </div>
              <div className="flex items-center gap-2">
                {!editing && (
                  <button onClick={startEdit} className="btn btn-secondary btn-sm">Edit Template</button>
                )}
                {!selected.isDefault && (
                  <button onClick={() => deleteTemplate(selected.id)} className="btn btn-ghost btn-sm text-red-500">Delete</button>
                )}
              </div>
            </div>

            {/* Template view / edit */}
            <div className="card p-5 mb-6">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-medium text-text-secondary mb-1">Subject Line</label>
                    <input type="text" value={editSubject} onChange={e => setEditSubject(e.target.value)} className="text-[14px]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-text-secondary mb-1">Email Body</label>
                    <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={16} className="text-[14px] font-mono leading-relaxed" />
                  </div>
                  <p className="text-[11px] text-text-muted">
                    Use {'{placeholders}'} like {'{studentName}'}, {'{parentName}'}, {'{className}'}, {'{teacherName}'} — the AI will fill these when personalising.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={saveEdit} className="btn btn-primary btn-sm">Save Changes</button>
                    <button onClick={() => setEditing(false)} className="btn btn-secondary btn-sm">Cancel</button>
                    {selected.isDefault && (
                      <button onClick={resetToDefault} className="btn btn-ghost btn-sm text-text-muted ml-auto">Reset to Default</button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[12px] text-text-muted uppercase tracking-wide font-medium mb-1">Subject</p>
                  <p className="text-[14px] mb-4 text-text-secondary">{selected.subject}</p>
                  <p className="text-[12px] text-text-muted uppercase tracking-wide font-medium mb-1">Body</p>
                  <pre className="text-[14px] whitespace-pre-wrap font-sans leading-relaxed text-text-secondary">{selected.body}</pre>
                </div>
              )}
            </div>

            {/* AI Personalisation */}
            {!editing && (
              <div className="card p-5">
                <h3 className="font-semibold text-[14px] mb-1">Personalise with AI</h3>
                <p className="text-[12px] text-text-muted mb-3">
                  Describe the situation and the AI will fill in the template with specific details.
                </p>
                <textarea
                  value={studentContext}
                  onChange={e => setStudentContext(e.target.value)}
                  placeholder="e.g. Student: Emma Wilson, Year 9 English. She submitted an outstanding persuasive essay on climate change. Parent: Mrs Wilson. I'm Mr Thompson."
                  rows={3}
                  className="text-[13px] mb-3"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={personalise}
                    disabled={personalising || !studentContext.trim()}
                    className="btn btn-primary btn-sm"
                  >
                    {personalising ? (
                      <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                    ) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> Personalise</>
                    )}
                  </button>
                  {!personalising && personalisedResult && (
                    <button
                      onClick={() => copyToClipboard(personalisedResult)}
                      className="btn btn-secondary btn-sm"
                    >
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  )}
                </div>

                {personalisedResult && (
                  <div className="mt-4 p-4 bg-border-light/50 rounded-lg border border-border">
                    <pre className={cn(
                      'text-[14px] whitespace-pre-wrap font-sans leading-relaxed',
                      personalising && 'streaming-cursor'
                    )}>{personalisedResult}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Template Modal */}
      {showNewTemplate && (
        <NewTemplateModal onClose={() => setShowNewTemplate(false)} onAdd={addTemplate} />
      )}
    </div>
  )
}

function NewTemplateModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string, category: string) => void }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('admin')
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">New Email Template</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Template Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus placeholder="e.g. Science Lab Safety" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="positive">Positive</option>
                <option value="academic">Academic</option>
                <option value="behaviour">Behaviour</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={() => name.trim() && onAdd(name.trim(), category)} disabled={!name.trim()} className="btn btn-primary">Create</button>
        </div>
      </div>
    </div>
  )
}
