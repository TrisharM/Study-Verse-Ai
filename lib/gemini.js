// lib/gemini.js
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`

export async function askGemini(messages, userContext = {}) {
  const systemPrompt = `You are Nova, an intelligent AI study companion inside StudyVerse.
Help students: plan study sessions, explain concepts, generate flashcards, summarize notes, give study tips.
Student: ${userContext.name || 'Student'} | Subjects: ${userContext.subjects?.join(', ') || 'Not set'}
Upcoming tasks: ${userContext.tasks?.map(t => t.title).join(', ') || 'None'}
Be concise, friendly, and actionable. Use **bold** for key points.`

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt + '\n\nBegin.' }] },
    { role: 'model', parts: [{ text: `Hey ${userContext.name || 'there'}! 👋 I'm **Nova**. What are you working on today?` }] },
    ...messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
  ]

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 1024 } }),
  })
  if (!res.ok) { const e = await res.json(); throw new Error(e?.error?.message || 'Gemini error') }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't respond."
}

export async function generateStudyPlan(subject, examDate, hoursPerDay, level) {
  const prompt = `Create a study plan for: ${subject}, exam: ${examDate}, ${hoursPerDay}h/day, level: ${level}.
Return ONLY valid JSON (no markdown):
{"title":"...","totalDays":N,"dailyPlans":[{"day":1,"focus":"...","tasks":["..."],"hours":N,"tips":"..."}],"keyTopics":["..."],"resources":["..."]}`

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 2048 } }),
  })
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  const clean = text.replace(/```json|```/g, '').trim()
  const match = clean.match(/\{[\s\S]*\}/)
  if (match) return JSON.parse(match[0])
  throw new Error('Could not parse study plan')
}

export async function generateFlashcards(topic, count = 10) {
  const prompt = `Generate ${count} flashcards for: "${topic}".
Return ONLY a valid JSON array (no markdown, no explanation):
[{"question":"...","answer":"..."}]`

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 2048 } }),
  })
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
  const clean = text.replace(/```json|```/g, '').trim()
  const match = clean.match(/\[[\s\S]*\]/)
  if (match) return JSON.parse(match[0])
  throw new Error('Could not parse flashcards')
}
