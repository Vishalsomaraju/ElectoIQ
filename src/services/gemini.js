// ─── Google Service: Gemini AI (Generative Language API) ─────────────────────
// Purpose: Conversational AI assistant for Indian election education
// SDK: @google/generative-ai ^0.24.1
// Docs: https://ai.google.dev/docs
import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from '../utils/logger'
import { sanitizeInput } from '../utils/helpers'

const API_KEY = import.meta.env.VITE_GEMINI_KEY

if (!API_KEY || API_KEY === 'UNCONFIGURED_KEY') {
  logger.warn(
    '%c[ElectoIQ] ⚠️ VITE_GEMINI_KEY is not set or is a placeholder. ' +
    'AI features will not work. Add your key to .env file.',
    'color: orange; font-weight: bold'
  )
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

const SYSTEM_PROMPT = `You are ElectoIQ Assistant, an expert guide on Indian elections and the democratic process. 
Your role is to educate Indian voters about:
- The election process (from Model Code of Conduct to result declaration)
- Voter rights and responsibilities
- How to verify voter ID and find polling booths
- Understanding EVM (Electronic Voting Machines)
- Key election terminology (ECI, MCC, NOTA, affidavit, etc.)
- Historic Indian elections and statistics

Keep answers concise, factual, and encouraging for first-time voters.
Always respond in a friendly, accessible tone.
If asked about political parties or candidates, remain strictly neutral.`

/**
 * Get a streaming chat model instance
 * @returns {import('@google/generative-ai').GenerativeModel | null}
 */
export function getChatModel() {
  if (!genAI) return null
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  })
}

/**
 * Start a new chat session
 * @param {Array} history - prior message history
 */
export function startChatSession(history = []) {
  const model = getChatModel()
  if (!model) return null
  return model.startChat({ history })
}

/**
 * Send a single message and get full response (non-streaming)
 * @param {string} message
 * @param {Array} history
 */
export async function sendMessage(message, history = []) {
  const model = getChatModel()
  if (!model) throw new Error('Gemini API key not configured')

  const safeMessage = sanitizeInput(message.slice(0, 1000))
  const chat = model.startChat({ history })
  
  const delays = [500, 1000, 2000]
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const result = await chat.sendMessage(safeMessage)
      return result.response.text()
    } catch (error) {
      if (attempt === delays.length) throw error
      await new Promise(res => setTimeout(res, delays[attempt]))
    }
  }
}

/**
 * Retry an async function with exponential backoff.
 * @param {Function} fn - Async function to retry
 * @param {number} [maxRetries=3] - Maximum number of retry attempts
 * @param {number} [baseDelay=500] - Base delay in ms (doubles each attempt)
 * @returns {Promise<unknown>}
 */
async function withRetry(fn, maxRetries = 3, baseDelay = 500) {
  let lastErr
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      const isRetryable = err?.status === 429 || err?.status === 503 || err?.status === 500
      if (!isRetryable || attempt === maxRetries) throw err
      const delay = baseDelay * Math.pow(2, attempt)
      logger.warn(`[gemini] Attempt ${attempt + 1} failed, retrying in ${delay}ms`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastErr
}

const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 15;
const requestTimestamps = [];

function isRateLimited() {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  requestTimestamps.push(now);
  return false;
}

/**
 * Send a message and stream the response
 * @param {string} message
 * @param {Array} history
 * @param {function} onChunk - callback for each text chunk
 */
export async function sendMessageStream(message, history = [], onChunk) {
  if (isRateLimited()) throw new Error('Rate limit exceeded. Please try again later.')
  const model = getChatModel()
  if (!model) throw new Error('Gemini API key not configured')
  const safeMessage = sanitizeInput(message)
  const chat = model.startChat({ history })

  return withRetry(async () => {
    const result = await chat.sendMessageStream(safeMessage)
    let fullText = ''
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      fullText += chunkText
      if (onChunk) onChunk(chunkText, fullText)
    }
    return fullText
  })
}

export async function generateQuiz(topic = "Indian elections and democratic process", count = 10) {
  const model = getChatModel()
  if (!model) throw new Error('Gemini API key not configured')

  // Sanitize and clamp inputs to prevent prompt injection
  const safeTopic = sanitizeInput(String(topic)).slice(0, 150) || 'Indian elections and democratic process'
  const safeCount = Math.min(Math.max(Number(count) || 10, 5), 20)

  const prompt = `Generate exactly ${safeCount} multiple choice questions about ${safeTopic}.
Return ONLY a raw JSON array of objects. Do not include markdown formatting or backticks.
Each object must have exactly this structure:
{
  "category": "String",
  "difficulty": "Easy" | "Medium" | "Hard",
  "question": "String",
  "options": ["String", "String", "String", "String"],
  "correct": Number (0-3),
  "explanation": "String"
}`

  const delays = [500, 1000, 2000]
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      })
      const text = result.response.text()
      let parsed
      try {
        parsed = JSON.parse(text)
      } catch {
        throw new Error('AI returned invalid quiz format')
      }
      if (!Array.isArray(parsed)) throw new Error('AI returned non-array quiz response')
      // Validate and cap results
      return parsed.slice(0, safeCount).filter(q =>
        q && typeof q.question === 'string' &&
        Array.isArray(q.options) && q.options.length === 4 &&
        typeof q.correct === 'number'
      )
    } catch (error) {
      if (attempt === delays.length) throw error
      await new Promise(res => setTimeout(res, delays[attempt]))
    }
  }
}
