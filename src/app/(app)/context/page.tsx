'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ContextDoc {
  id: string
  title: string
  content: string
  doc_type: string
  word_count: number
  created_at: string
}

const docTypes = [
  { value: 'style_guide', label: 'Report Style Guide', description: 'School-specific report writing rules and expectations' },
  { value: 'curriculum', label: 'Curriculum / Program', description: 'Unit plans, scope and sequence, curriculum documents' },
  { value: 'policy', label: 'School Policy', description: 'Assessment policy, behaviour policy, communication guidelines' },
  { value: 'past_reports', label: 'Past Reports / Examples', description: 'Sample comments you\'ve written before that reflect your voice' },
  { value: 'class_info', label: 'Class Information', description: 'Class profiles, student notes, cohort context' },
  { value: 'other', label: 'Other', description: 'Any other context that helps the AI understand your needs' },
]

export default function ContextPage() {
  const [docs, setDocs] = useState<ContextDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => { loadDocs() }, [])

  async function loadDocs() {
    setLoading(true)
    const { data } = await supabase.from('context_documents').select('*').order('created_at', { ascending: false })
    setDocs(data || [])
    setLoading(false)
  }

  async function addDoc(title: string, content: string, docType: string) {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length
    const { error } = await supabase.from('context_documents').insert({
      title,
      content,
      doc_type: docType,
      word_count: wordCount,
    })
    if (!error) {
      setShowAdd(false)
      loadDocs()
    }
  }

  async function deleteDoc(id: string) {
    await supabase.from('context_documents').delete().eq('id', id)
    setDocs(d => d.filter(doc => doc.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const totalWords = docs.reduce((sum, d) => sum + d.word_count, 0)
  const typeLabel = (t: string) => docTypes.find(d => d.value === t)?.label || t

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Context</h1>
          <p className="text-text-secondary text-[14px] mt-1 max-w-lg">
            Upload documents and paste text to teach the AI your voice, your school's style, and your curriculum. Everything you add here is fed into every AI generation across Teacher OS.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Context
        </button>
      </div>

      {/* Stats */}
      {docs.length > 0 && (
        <div className="card p-4 mb-6 flex items-center gap-6 mt-6">
          <div>
            <p className="text-[12px] text-text-muted">Documents</p>
            <p className="text-[18px] font-semibold">{docs.length}</p>
          </div>
          <div>
            <p className="text-[12px] text-text-muted">Total Words</p>
            <p className="text-[18px] font-semibold">{totalWords.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[12px] text-text-muted">AI Context</p>
            <p className="text-[14px] font-medium text-primary">Active</p>
          </div>
        </div>
      )}

      {/* How it works */}
      {docs.length === 0 && !loading && (
        <div className="card p-6 mb-6 mt-6">
          <h3 className="font-semibold text-[15px] mb-3">How it works</h3>
          <div className="space-y-3 text-[13px] text-text-secondary">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0 text-[12px] font-bold">1</span>
              <p><strong>Upload your context</strong> — paste in your school's report writing style guide, past report comments you've written, curriculum documents, assessment policies, or any other context.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0 text-[12px] font-bold">2</span>
              <p><strong>AI learns your voice</strong> — every document you add is included as context when the AI generates comments, emails, lesson plans, and resources.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0 text-[12px] font-bold">3</span>
              <p><strong>Output matches your style</strong> — the more context you provide, the more the AI sounds like you and follows your school's specific expectations.</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary mt-5">Add Your First Document</button>
        </div>
      )}

      {/* Document list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="card overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-border-light/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    doc.doc_type === 'style_guide' ? 'bg-purple-500' :
                    doc.doc_type === 'curriculum' ? 'bg-blue-500' :
                    doc.doc_type === 'policy' ? 'bg-amber-500' :
                    doc.doc_type === 'past_reports' ? 'bg-emerald-500' :
                    doc.doc_type === 'class_info' ? 'bg-pink-500' : 'bg-slate-400'
                  )} />
                  <div className="min-w-0">
                    <p className="font-medium text-[14px] truncate">{doc.title}</p>
                    <p className="text-[12px] text-text-muted">{typeLabel(doc.doc_type)} — {doc.word_count.toLocaleString()} words</p>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"
                  style={{ transform: expandedId === doc.id ? 'rotate(180deg)' : 'rotate(0)', transition: '150ms' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedId === doc.id && (
                <div className="px-4 pb-4 border-t border-border-light">
                  <pre className="text-[13px] whitespace-pre-wrap font-sans leading-relaxed text-text-secondary mt-3 max-h-64 overflow-y-auto">{doc.content}</pre>
                  <div className="flex justify-end mt-3">
                    <button onClick={() => deleteDoc(doc.id)} className="btn btn-danger btn-sm text-[12px]">Remove</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Context Modal */}
      {showAdd && <AddContextModal onClose={() => setShowAdd(false)} onAdd={addDoc} />}
    </div>
  )
}

function AddContextModal({ onClose, onAdd }: { onClose: () => void; onAdd: (title: string, content: string, docType: string) => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [docType, setDocType] = useState('other')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(file: File) {
    setTitle(title || file.name.replace(/\.[^.]+$/, ''))
    try {
      const text = await file.text()
      // Strip HTML tags if it's an HTML file
      const clean = file.name.endsWith('.html') || file.name.endsWith('.htm')
        ? text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        : text
      setContent(clean)
    } catch {
      setContent('[Could not read file. Please paste the content manually.]')
    }
  }

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    await onAdd(title.trim(), content.trim(), docType)
    setSaving(false)
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal max-w-xl" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add Context Document</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Document Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)}>
                {docTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label} — {t.description}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. School Report Writing Guide 2026" autoFocus />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium text-text-secondary">Content</label>
                <div className="flex items-center gap-2">
                  {wordCount > 0 && <span className="text-[11px] text-text-muted">{wordCount.toLocaleString()} words</span>}
                  <input ref={fileRef} type="file" accept=".txt,.md,.html,.htm,.csv,.doc,.docx" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
                  <button onClick={() => fileRef.current?.click()} className="btn btn-ghost btn-sm text-[12px]">
                    Upload File
                  </button>
                </div>
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Paste the content here — school policies, past report comments, curriculum documents, style guides, or any other context that helps the AI understand how you work..."
                rows={12}
                className="text-[13px]"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim() || !content.trim() || saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save Context'}
          </button>
        </div>
      </div>
    </div>
  )
}
