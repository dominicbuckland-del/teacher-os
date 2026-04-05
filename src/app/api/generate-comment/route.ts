import Anthropic from '@anthropic-ai/sdk'
import { buildCommentPrompt } from '@/lib/prompts'
import { createClient } from '@/lib/supabase/server'
import type { Student, Assessment, Settings } from '@/lib/types'

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response('ANTHROPIC_API_KEY not configured. Add it to your .env.local file.', { status: 500 })
  }

  const body = await request.json() as {
    student?: Student
    assessment?: Assessment
    subject?: string
    yearLevel?: number
    settings?: Settings
    customPrompt?: string
  }

  // Fetch user's context documents from Supabase
  let contextBlock = ''
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: docs } = await supabase
        .from('context_documents')
        .select('title, content, doc_type')
        .eq('user_id', user.id)
        .order('doc_type')

      if (docs && docs.length > 0) {
        // Build context block — prioritise style guides and past reports, truncate if too long
        const sorted = docs.sort((a, b) => {
          const priority: Record<string, number> = { style_guide: 0, past_reports: 1, policy: 2, curriculum: 3, class_info: 4, other: 5 }
          return (priority[a.doc_type] ?? 5) - (priority[b.doc_type] ?? 5)
        })

        let totalChars = 0
        const maxChars = 8000 // Keep context under ~2k tokens
        const parts: string[] = []

        for (const doc of sorted) {
          const remaining = maxChars - totalChars
          if (remaining <= 0) break
          const snippet = doc.content.slice(0, remaining)
          parts.push(`[${doc.title} (${doc.doc_type})]:\n${snippet}`)
          totalChars += snippet.length
        }

        if (parts.length > 0) {
          contextBlock = `\n\nTEACHER'S PERSONAL CONTEXT (use this to match their voice, style, and school expectations):\n${parts.join('\n\n')}\n`
        }
      }
    }
  } catch {
    // If Supabase fails (e.g. no auth), continue without context
  }

  // Build the prompt
  let prompt: string
  if (body.customPrompt) {
    prompt = body.customPrompt + contextBlock
  } else {
    prompt = buildCommentPrompt(
      body.student!,
      body.assessment!,
      body.subject || '',
      body.yearLevel || 7,
      body.settings || { schoolName: '', styleGuide: '', tone: 'balanced', commentLength: 'medium', pronouns: 'they' }
    ) + contextBlock
  }

  const maxTokens = body.customPrompt ? 1500 : 400
  const client = new Anthropic({ apiKey })

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta') {
            const delta = event.delta
            if ('text' in delta) {
              controller.enqueue(encoder.encode(delta.text))
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
