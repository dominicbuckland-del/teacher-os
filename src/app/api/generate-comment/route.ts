import Anthropic from '@anthropic-ai/sdk'
import { buildCommentPrompt } from '@/lib/prompts'
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

  // Support custom prompts for email personalisation, lesson planning, resource generation
  const prompt = body.customPrompt || buildCommentPrompt(
    body.student!,
    body.assessment!,
    body.subject || '',
    body.yearLevel || 7,
    body.settings || { schoolName: '', styleGuide: '', tone: 'balanced', commentLength: 'medium', pronouns: 'they' }
  )

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
