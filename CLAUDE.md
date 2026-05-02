@AGENTS.md

# Teacher OS

AI-powered operating system for teachers. First module: Report Comment Writer with streaming Claude generation.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 (custom CSS variables for theming)
- Supabase Auth + PostgreSQL (project: `xqgqrjpnhyireaxvopwm`, ap-southeast-2)
- Anthropic Claude SDK (`claude-sonnet-4-6`, streaming via `client.messages.stream()`)
- localStorage (primary data store for classes/students/comments)
- PWA (installable on iOS, Android, desktop)

## Architecture

```
src/
  app/
    api/generate-comment/   # POST -- Claude streaming endpoint
    auth/callback/          # Supabase OAuth callback
    (app)/                  # Protected routes (sidebar layout)
      page.tsx              # Dashboard
      classes/[id]/         # Class detail
      workspace/[classId]/  # Full-screen comment generation (hero feature)
      context/              # My Context (RAG documents)
      planner/              # Lesson planner
      rubrics/              # AI rubric generator
      settings/             # Tone, length, pronouns, style guide
      students/ behaviour/ comms/ emails/ feedback/ relief/ resources/ onboarding/
    login/ signup/
  components/
    sidebar.tsx             # Responsive navigation
  lib/
    store.tsx               # React Context + localStorage persistence
    types.ts                # Domain interfaces
    prompts.ts              # buildCommentPrompt() for Claude
    curriculum.ts           # Australian Curriculum v9 achievement standards
    utils.ts                # generateId, cn, gradeColor, CSV parsing
    seed-term2.ts           # Demo data seeder
    supabase/               # client.ts, server.ts, middleware.ts
  middleware.ts             # Auth guard + session refresh
```

## Data Storage Strategy

- **localStorage** (`teacher-os-data`): Classes, students, assessments, comments, behaviour, feedback, parent comms
- **Supabase** (`context_documents` table): RAG context documents (style guides, past reports, policies) -- persists across devices
- **localStorage** (`teacher-os-planner`): Term timetable and lesson plans

## Key Conventions

- **API**: Single endpoint `/api/generate-comment` handles both comments and rubrics (via `customPrompt` flag)
- **Auth**: Supabase Auth (email/password), middleware protects `/(app)/*` routes
- **Store pattern**: React Context (`useStore()` hook) wrapping localStorage, `persist()` on every update
- **Component naming**: PascalCase, inline SVG icons (no icon library)
- **Styling**: Tailwind utility classes, custom CSS vars in globals.css
- **No external form/state libraries**: Pure React useState + Context

## AI Integration

`/api/generate-comment` route:
1. Accepts student data, assessment, subject, yearLevel, settings
2. Fetches user's `context_documents` from Supabase (truncated to ~2000 tokens)
3. Prioritises by type: style_guide > past_reports > policy > curriculum > class_info > other
4. Builds prompt via `buildCommentPrompt()` with Australian Curriculum v9 standards
5. Streams Claude response (max 400 tokens for comments, 1500 for custom/rubrics)
6. Returns ReadableStream to client

## Australian Curriculum v9

`lib/curriculum.ts` contains achievement standards for 8 subjects x 12 year levels:
English, Mathematics, Science, Humanities, Health & PE, The Arts, Technologies, Languages

Fuzzy matching on subject names (e.g. "maths" -> "Mathematics").

## Comment Workflow

1. `pending` -- no draft yet
2. `draft` -- AI-generated or manually written
3. `approved` -- finalised, ready for export

## Keyboard Shortcuts (workspace)

- Up/Down or k/j: Navigate students
- Cmd+G: Generate comment
- Cmd+Enter: Approve and move to next
- Esc: Exit to class view

## Export Formats

- Plain text (student name + comment, divided by ---)
- Accelerus (tab-separated: LastName, FirstName, Grade, Comment)
- CSV download

## Grade Colours

A: emerald, B: teal, C: amber, D: orange, E: red

## Modules

- Report Comment Writer (built, hero feature)
- Lesson Planner (built, basic)
- Rubric Generator (built, uses same AI endpoint)
- Behaviour tracking, Parent Comms, Feedback (built, basic)
- Smart Markbook, Attendance Intelligence (planned)

## Deploy

```bash
~/.local/bin/vercel deploy --yes --prod --token $VERCEL_TOKEN --scope dominicbuckland-dels-projects
```

Live: teacher-os-three.vercel.app
