/**
 * @file gemini.js
 * @description Google Gemini AI service for the ElectoIQ platform.
 *
 * Provides conversational chat (streaming) and quiz generation backed by
 * the Gemini 2.5 Flash model. All user-facing text is sanitised before
 * being sent to the API to prevent prompt injection.
 *
 * SDK: @google/generative-ai ^0.24.1
 * Docs: https://ai.google.dev/docs
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from '../utils/logger'
import { sanitizeInput } from '../utils/helpers'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_KEY = import.meta.env.VITE_GEMINI_KEY

if (!API_KEY || API_KEY === 'UNCONFIGURED_KEY') {
  logger.warn(
    '%c[ElectoIQ] ⚠️ VITE_GEMINI_KEY is not set or is a placeholder. ' +
    'AI features will not work. Add your key to the .env file.',
    'color: orange; font-weight: bold'
  )
}

// `genAI` is null when no API key is present — all exported functions check
// for this and throw a descriptive error before making any network requests.
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

/**
 * Instructs the model to act as a neutral, educational guide on Indian
 * elections. Keeps the assistant from expressing political opinions.
 */
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

// ---------------------------------------------------------------------------
// Rate limiting (client-side guard — not a substitute for server-side limits)
// ---------------------------------------------------------------------------

/** Rolling time window for the client-side rate limiter. */
const RATE_LIMIT_WINDOW_MS = 60_000

/** Maximum number of requests allowed within the rolling window. */
const MAX_REQUESTS_PER_WINDOW = 15

/** Sliding-window request log (module-level so it persists across calls). */
const requestTimestamps = []

/**
 * Returns `true` if the caller has exceeded the allowed request rate.
 * Evicts expired timestamps before evaluating, then records the current one.
 *
 * @returns {boolean}
 */
function isRateLimited() {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  // Evict timestamps that have fallen outside the rolling window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
    requestTimestamps.shift()
  }

  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }

  requestTimestamps.push(now)
  return false
}

// ---------------------------------------------------------------------------
// Retry utility
// ---------------------------------------------------------------------------

/** Delay schedule for exponential back-off (in milliseconds). */
const RETRY_DELAYS_MS = [500, 1_000, 2_000]

/** Friendly message shown in the UI when the Gemini free-tier quota is used up. */
const QUOTA_EXCEEDED_MESSAGE =
  'AI quota reached for today. Please try again later, or check your Gemini API plan.'

/**
 * Runs `fn`, retrying with exponential back-off on transient server errors
 * (HTTP 500, 503). Throws immediately on 429 (quota exceeded) with a
 * user-friendly message, and on other non-retryable errors.
 *
 * @param {() => Promise<any>} fn - Async operation to retry
 * @param {number} [maxRetries=3] - Maximum number of additional attempts after the first
 * @param {number} [baseDelayMs=500] - Initial delay in ms (doubles on each retry)
 * @returns {Promise<any>}
 */
async function withRetry(fn, maxRetries = 3, baseDelayMs = 500) {
  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const httpStatus = err?.status

      // 429 = quota/rate limit — retrying won't help; surface a friendly message immediately
      if (httpStatus === 429) {
        throw new Error(QUOTA_EXCEEDED_MESSAGE)
      }

      const isTransientError = httpStatus === 500 || httpStatus === 503
      if (!isTransientError || attempt === maxRetries) throw err

      const delayMs = baseDelayMs * Math.pow(2, attempt)
      logger.warn(`[gemini] Attempt ${attempt + 1} failed (HTTP ${httpStatus}), retrying in ${delayMs}ms`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw lastError
}

// ---------------------------------------------------------------------------
// Quiz validation helpers
// ---------------------------------------------------------------------------

/**
 * Returns `true` if the candidate object has all required quiz question fields.
 * Filters out any malformed objects before they reach the UI.
 *
 * @param {unknown} question - Candidate question object from the AI response
 * @returns {boolean}
 */
function isValidQuizQuestion(question) {
  if (!question || typeof question !== 'object') return false
  return (
    typeof question.question === 'string' &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    typeof question.correct === 'number'
  )
}

/**
 * Parse and validate the raw JSON string returned by the model.
 * Throws descriptive errors rather than letting downstream code crash on
 * unexpected shapes.
 *
 * @param {string} rawText - Raw text from `model.generateContent()`
 * @returns {unknown[]} Parsed array of question objects
 */
function parseQuizResponse(rawText) {
  let parsed
  try {
    parsed = JSON.parse(rawText)
  } catch {
    throw new Error('AI returned invalid quiz format (not valid JSON)')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI returned non-array quiz response')
  }

  return parsed
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return a configured Gemini model instance, or `null` if the API key is
 * missing. All downstream functions call this and guard against `null`.
 *
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
 * Start a new multi-turn chat session with optional history pre-loaded.
 *
 * @param {Array} [history=[]] - Prior conversation turns
 * @returns {import('@google/generative-ai').ChatSession | null}
 */
export function startChatSession(history = []) {
  const model = getChatModel()
  if (!model) return null
  return model.startChat({ history })
}

/**
 * Send a single message and receive the full response (non-streaming).
 *
 * @param {string} message - User message (truncated to 1000 chars then sanitised)
 * @param {Array} [history=[]] - Prior conversation turns for multi-turn context
 * @returns {Promise<string>} Full response text from the model
 */
export async function sendMessage(message, history = []) {
  const model = getChatModel()
  if (!model) throw new Error('Gemini API key not configured')

  const safeMessage = sanitizeInput(message.slice(0, 1_000))
  const chat = model.startChat({ history })

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const result = await chat.sendMessage(safeMessage)
      return result.response.text()
    } catch (error) {
      if (attempt === RETRY_DELAYS_MS.length) throw error
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
    }
  }
}

/**
 * Send a message and stream the response chunk-by-chunk via `onChunk`.
 * Uses `withRetry` for resilience against transient server errors.
 *
 * @param {string} message - User message (sanitised before sending)
 * @param {Array} [history=[]] - Prior conversation turns
 * @param {(chunk: string, accumulated: string) => void} onChunk - Called for each streamed text chunk
 * @returns {Promise<string>} Full accumulated response text once streaming completes
 */
export async function sendMessageStream(message, history = [], onChunk) {
  if (isRateLimited()) throw new Error('Rate limit exceeded. Please wait a moment and try again.')

  const model = getChatModel()
  if (!model) throw new Error('Gemini API key not configured')

  const safeMessage = sanitizeInput(message)
  const chat = model.startChat({ history })

  return withRetry(async () => {
    const result = await chat.sendMessageStream(safeMessage)
    let accumulatedText = ''

    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      accumulatedText += chunkText
      if (onChunk) onChunk(chunkText, accumulatedText)
    }

    return accumulatedText
  })
}

/**
 * Generate a set of multiple-choice quiz questions using the Gemini API.
 * Falls back to throwing if the model is unavailable — the caller (`useQuiz`)
 * handles the fallback to local question data.
 *
 * @param {string} [topic='Indian elections and democratic process'] - Quiz topic
 * @param {number} [count=10] - Desired number of questions (clamped to 5–20)
 * @returns {Promise<object[]>} Array of validated quiz question objects
 */
export async function generateQuiz(
  topic = 'Indian elections and democratic process',
  count = 10
) {
  const model = getChatModel()
  if (!model) throw new Error('Gemini API key not configured')

  // Sanitize inputs to prevent prompt injection
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

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      })

      const rawText = result.response.text()
      const parsedQuestions = parseQuizResponse(rawText)

      return parsedQuestions
        .slice(0, safeCount)
        .filter(isValidQuizQuestion)
    } catch (error) {
      if (attempt === RETRY_DELAYS_MS.length) throw error
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
    }
  }
}
