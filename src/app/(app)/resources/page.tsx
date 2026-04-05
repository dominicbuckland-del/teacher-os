'use client'

import { useState, useRef } from 'react'
import { cn, generateId } from '@/lib/utils'

interface Resource {
  id: string
  name: string
  type: string
  content: string
  outputs: ResourceOutput[]
  createdAt: string
}

interface ResourceOutput {
  id: string
  type: string
  content: string
  createdAt: string
}

const outputTypes = [
  { id: 'comprehension', label: 'Comprehension Questions', description: 'Generate reading comprehension questions at multiple levels (literal, inferential, evaluative)', icon: '?' },
  { id: 'vocabulary', label: 'Vocabulary List', description: 'Extract key vocabulary with definitions, synonyms, and example sentences', icon: 'A' },
  { id: 'discussion', label: 'Discussion Prompts', description: 'Create open-ended discussion questions for class or group work', icon: 'D' },
  { id: 'scaffold', label: 'Scaffolded Activity', description: 'Break the content into a step-by-step guided learning activity', icon: 'S' },
  { id: 'quiz', label: 'Quiz / Test', description: 'Generate multiple choice and short answer quiz questions', icon: 'Q' },
  { id: 'summary', label: 'Summary Notes', description: 'Create concise student-friendly summary notes of the content', icon: 'N' },
  { id: 'differentiated-simplified', label: 'Simplified Version', description: 'Rewrite the content at a lower reading level for EAL/D or struggling readers', icon: 'E' },
  { id: 'differentiated-extended', label: 'Extension Activity', description: 'Create a challenging extension task for advanced learners', icon: 'X' },
]

const STORAGE_KEY = 'teacher-os-resources'

function loadResources(): Resource[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveResources(resources: Resource[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resources))
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(() => loadResources())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [generatingType, setGeneratingType] = useState<string | null>(null)
  const [streamText, setStreamText] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [pasteContent, setPasteContent] = useState('')
  const [pasteName, setPasteName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const selected = resources.find(r => r.id === selectedId)

  function persist(updater: (r: Resource[]) => Resource[]) {
    setResources(prev => {
      const next = updater(prev)
      saveResources(next)
      return next
    })
  }

  function addResource(name: string, content: string, type: string) {
    const r: Resource = { id: generateId(), name, type, content, outputs: [], createdAt: new Date().toISOString() }
    persist(rs => [r, ...rs])
    setSelectedId(r.id)
    setShowUpload(false)
    setPasteContent('')
    setPasteName('')
  }

  function deleteResource(id: string) {
    persist(rs => rs.filter(r => r.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  async function generateOutput(resource: Resource, outputType: string) {
    setGeneratingType(outputType)
    setStreamText('')

    const typeConfig = outputTypes.find(t => t.id === outputType)!

    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPrompt: `You are an experienced Australian teacher creating teaching resources. Given the following source content, generate a ${typeConfig.label.toLowerCase()}.

SOURCE CONTENT:
"""
${resource.content.slice(0, 6000)}
"""

TASK: ${typeConfig.description}

REQUIREMENTS:
- Align to the Australian Curriculum v9 where relevant
- Make the output practical and ready to use in a classroom
- Use clear formatting with numbered items or bullet points
- Appropriate for the content level of the source material
- Include a variety of difficulty levels where applicable

Generate the ${typeConfig.label.toLowerCase()} now. Output ONLY the teaching resource, formatted for direct classroom use.`,
        }),
      })

      if (!res.ok) {
        setGeneratingType(null)
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
        }
      }

      // Save output
      const output: ResourceOutput = {
        id: generateId(),
        type: outputType,
        content: full,
        createdAt: new Date().toISOString(),
      }
      persist(rs => rs.map(r =>
        r.id === resource.id ? { ...r, outputs: [...r.outputs, output] } : r
      ))
    } catch {}

    setGeneratingType(null)
    setStreamText('')
  }

  async function handleFileUpload(file: File) {
    const name = file.name
    let content = ''

    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      content = await file.text()
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      content = await file.text()
    } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      const raw = await file.text()
      content = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    } else {
      // For other types, try reading as text
      try {
        content = await file.text()
      } catch {
        content = `[Could not extract text from ${file.name}. Please paste the content manually.]`
      }
    }

    addResource(name.replace(/\.[^.]+$/, ''), content, file.type || 'text/plain')
  }

  return (
    <div className="h-full flex">
      {/* Left panel — resource list */}
      <div className="w-[280px] border-r border-border bg-surface overflow-y-auto shrink-0 flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold mb-3">Resources</h1>
          <button onClick={() => setShowUpload(true)} className="btn btn-primary btn-sm w-full">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            Upload or Paste Content
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {resources.length === 0 ? (
            <p className="text-[13px] text-text-muted p-3 text-center">No resources yet. Upload a file or paste content to get started.</p>
          ) : (
            resources.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-colors',
                  selectedId === r.id ? 'bg-primary-light text-primary-hover' : 'hover:bg-border-light text-text'
                )}
              >
                <p className="font-medium text-[13px] truncate">{r.name}</p>
                <p className="text-[11px] mt-0.5 opacity-60">{r.outputs.length} output{r.outputs.length !== 1 ? 's' : ''} generated</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <div className="max-w-3xl mx-auto px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selected.name}</h2>
                <p className="text-[13px] text-text-muted">{selected.content.split(/\s+/).length} words</p>
              </div>
              <button onClick={() => deleteResource(selected.id)} className="btn btn-ghost btn-sm text-red-500">Delete</button>
            </div>

            {/* Source content preview */}
            <details className="card mb-6">
              <summary className="p-4 cursor-pointer text-[14px] font-medium text-text-secondary hover:text-text">
                Source Content (click to expand)
              </summary>
              <div className="px-4 pb-4">
                <pre className="text-[13px] whitespace-pre-wrap font-sans leading-relaxed text-text-secondary max-h-64 overflow-y-auto">
                  {selected.content}
                </pre>
              </div>
            </details>

            {/* Generate outputs */}
            <div className="mb-6">
              <h3 className="font-semibold text-[15px] mb-3">Generate Teaching Resources</h3>
              <div className="grid grid-cols-2 gap-2">
                {outputTypes.map(type => {
                  const existing = selected.outputs.find(o => o.type === type.id)
                  const isGenerating = generatingType === type.id
                  return (
                    <button
                      key={type.id}
                      onClick={() => !isGenerating && generateOutput(selected, type.id)}
                      disabled={isGenerating}
                      className={cn(
                        'text-left p-3 rounded-lg border transition-all',
                        existing ? 'border-primary/30 bg-primary-light/30' : 'border-border hover:border-primary/30',
                        isGenerating && 'opacity-60'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-6 h-6 rounded text-[11px] font-bold flex items-center justify-center',
                          existing ? 'bg-primary text-white' : 'bg-border-light text-text-muted'
                        )}>{type.icon}</span>
                        <span className="font-medium text-[13px]">{type.label}</span>
                        {isGenerating && <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin ml-auto" />}
                        {existing && !isGenerating && <span className="text-[10px] text-primary ml-auto">Generated</span>}
                      </div>
                      <p className="text-[11px] text-text-muted mt-1">{type.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Streaming output */}
            {generatingType && streamText && (
              <div className="card p-5 mb-6 border-primary/30">
                <h3 className="font-semibold text-[14px] mb-2">
                  Generating: {outputTypes.find(t => t.id === generatingType)?.label}
                </h3>
                <pre className="text-[14px] whitespace-pre-wrap font-sans leading-relaxed streaming-cursor">{streamText}</pre>
              </div>
            )}

            {/* Existing outputs */}
            {selected.outputs.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-[15px]">Generated Resources</h3>
                {[...selected.outputs].reverse().map(output => (
                  <div key={output.id} className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-[14px]">{outputTypes.find(t => t.id === output.type)?.label || output.type}</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(output.content)}
                          className="btn btn-ghost btn-sm text-[12px]"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => generateOutput(selected, output.type)}
                          className="btn btn-ghost btn-sm text-[12px]"
                        >
                          Regenerate
                        </button>
                      </div>
                    </div>
                    <pre className="text-[13px] whitespace-pre-wrap font-sans leading-relaxed text-text-secondary">{output.content}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-light flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h3 className="font-semibold text-[16px] mb-1">Upload a resource</h3>
              <p className="text-text-secondary text-[14px] max-w-sm">
                Upload a file or paste text content, then generate comprehension questions, vocabulary lists, scaffolds, quizzes, and more.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-backdrop" onClick={() => setShowUpload(false)}>
          <div className="modal max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Add Resource</h2>

              <div className="mb-4">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.md,.html,.htm,.csv"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                />
                <button onClick={() => fileRef.current?.click()} className="btn btn-secondary w-full py-6 border-dashed border-2">
                  <div className="text-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="text-[14px] font-medium">Upload File</p>
                    <p className="text-[12px] text-text-muted">.txt, .md, .html, .csv</p>
                  </div>
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="bg-surface px-3 text-[12px] text-text-muted">or paste content</span></div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Resource Name</label>
                  <input type="text" value={pasteName} onChange={e => setPasteName(e.target.value)} placeholder="e.g. Romeo and Juliet Act 1 Scene 1" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Content</label>
                  <textarea
                    value={pasteContent}
                    onChange={e => setPasteContent(e.target.value)}
                    placeholder="Paste the text content here... (from OneNote, Word, a textbook, etc.)"
                    rows={8}
                    className="text-[13px]"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <button onClick={() => setShowUpload(false)} className="btn btn-secondary">Cancel</button>
              <button
                onClick={() => pasteName.trim() && pasteContent.trim() && addResource(pasteName.trim(), pasteContent.trim(), 'text/plain')}
                disabled={!pasteName.trim() || !pasteContent.trim()}
                className="btn btn-primary"
              >
                Add Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
