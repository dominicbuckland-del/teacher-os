'use client'

import { useStore } from '@/lib/store'

export default function SettingsPage() {
  const { data, ready, updateSettings } = useStore()

  if (!ready) return null

  const s = data.settings

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Settings</h1>
      <p className="text-text-secondary text-[14px] mb-8">Configure how AI generates report comments.</p>

      <div className="space-y-8">
        <Section title="School">
          <Field label="School Name" hint="Used in report headers">
            <input
              type="text"
              value={s.schoolName}
              onChange={e => updateSettings({ schoolName: e.target.value })}
              placeholder="e.g. Westside State School"
            />
          </Field>
        </Section>

        <Section title="Comment Style">
          <Field label="Tone" hint="Sets the overall voice of generated comments">
            <select value={s.tone} onChange={e => updateSettings({ tone: e.target.value as typeof s.tone })}>
              <option value="formal">Formal — Professional academic language</option>
              <option value="balanced">Balanced — Professional but approachable</option>
              <option value="warm">Warm — Encouraging and celebratory</option>
            </select>
          </Field>

          <Field label="Comment Length" hint="Target length for generated comments">
            <select value={s.commentLength} onChange={e => updateSettings({ commentLength: e.target.value as typeof s.commentLength })}>
              <option value="short">Short — 2-3 sentences (40-60 words)</option>
              <option value="medium">Medium — 3-5 sentences (60-100 words)</option>
              <option value="long">Long — 5-7 sentences (100-150 words)</option>
            </select>
          </Field>

          <Field label="Pronouns" hint="How to refer to students in comments">
            <select value={s.pronouns} onChange={e => updateSettings({ pronouns: e.target.value as typeof s.pronouns })}>
              <option value="they">They/Them — Gender-neutral for all students</option>
              <option value="gendered">Gendered — Based on student gender field</option>
              <option value="name-only">Name Only — Avoid pronouns entirely</option>
            </select>
          </Field>
        </Section>

        <Section title="Style Guide">
          <Field label="Custom Instructions" hint="School-specific rules or phrases the AI should follow. E.g. 'Always end with a goal for next semester' or 'Do not use the word excellent'.">
            <textarea
              value={s.styleGuide}
              onChange={e => updateSettings({ styleGuide: e.target.value })}
              placeholder="Enter any school-specific comment writing guidelines..."
              rows={5}
            />
          </Field>
        </Section>

        <Section title="Data">
          <p className="text-[13px] text-text-secondary mb-3">
            All data is stored locally in your browser. Nothing is sent to a server except comment generation requests to Claude AI.
          </p>
          <button
            onClick={() => {
              if (confirm('This will permanently delete all classes, students, and comments. Are you sure?')) {
                localStorage.removeItem('teacher-os-data')
                window.location.reload()
              }
            }}
            className="btn btn-danger btn-sm"
          >
            Reset All Data
          </button>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h2 className="font-semibold text-[15px] mb-5">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-text mb-1">{label}</label>
      {hint && <p className="text-[12px] text-text-muted mb-2">{hint}</p>}
      {children}
    </div>
  )
}
