import type { Student, Assessment, Settings } from './types'

export function buildCommentPrompt(
  student: Student,
  assessment: Assessment,
  subject: string,
  yearLevel: number,
  settings: Settings
): string {
  const name = student.firstName
  const lengthGuide = {
    short: '2-3 sentences (40-60 words)',
    medium: '3-5 sentences (60-100 words)',
    long: '5-7 sentences (100-150 words)',
  }[settings.commentLength]

  const toneGuide = {
    formal: 'Professional and formal. Use standard academic language.',
    warm: 'Warm and encouraging while remaining professional. Celebrate effort and growth.',
    balanced: 'Professional but approachable. Direct and constructive.',
  }[settings.tone]

  const pronounGuide = {
    they: `Use they/them pronouns for ${name}.`,
    gendered: student.gender === 'male' ? `Use he/him pronouns for ${name}.` :
              student.gender === 'female' ? `Use she/her pronouns for ${name}.` :
              `Use they/them pronouns for ${name}.`,
    'name-only': `Avoid pronouns entirely. Use "${name}" or rephrase sentences to avoid needing pronouns.`,
  }[settings.pronouns]

  let context = ''
  if (student.iep) context += `\n- This student has an Individual Education Plan (IEP). Acknowledge their progress relative to their individual goals without explicitly mentioning the IEP.`
  if (student.eald) context += `\n- This student is an English as an Additional Language/Dialect (EAL/D) learner. Acknowledge their language development progress where relevant.`
  if (student.notes) context += `\n- Teacher notes: ${student.notes}`
  if (assessment.notes) context += `\n- Assessment notes: ${assessment.notes}`

  return `You are an experienced Australian teacher writing a semester report comment for a student.

STUDENT: ${name} (Year ${yearLevel} ${subject})
GRADE: ${assessment.grade || 'Not yet assessed'}
EFFORT: ${assessment.effort || 'Not yet assessed'}
STRENGTHS: ${assessment.strengths || 'Not specified'}
AREAS FOR GROWTH: ${assessment.areasForGrowth || 'Not specified'}
ATTENDANCE: ${assessment.attendancePct ? `${assessment.attendancePct}%` : 'Not recorded'}
${context}

REQUIREMENTS:
- Length: ${lengthGuide}
- Tone: ${toneGuide}
- ${pronounGuide}
- Write in present tense for ongoing skills, past tense for specific achievements
- Reference the subject area naturally
- Be specific about strengths — don't use vague praise like "doing well"
- Frame areas for growth constructively as "next steps" or opportunities
- Do NOT mention the grade letter (A, B, C, etc.) directly
- Do NOT start with "${name} has..." — vary your opening
- Do NOT use phrases like "I am pleased" or "It has been a pleasure"
${settings.styleGuide ? `\nSCHOOL STYLE GUIDE:\n${settings.styleGuide}` : ''}

Write the report comment now. Output ONLY the comment text, nothing else.`
}
