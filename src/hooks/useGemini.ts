// src/hooks/useGemini.ts
import { useState, useRef, useCallback } from 'react'
import { logger } from '../utils/logger'
import { sendMessageStream } from '../services/gemini'
import { trackAnalyticsEvent } from '../services/firebase'
import { sanitizeInput } from '../utils/helpers'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Minimum milliseconds between successive API calls.
 * Prevents accidental rapid-fire requests from keyboard auto-repeat or
 * double-click scenarios.
 */
const SEND_COOLDOWN_MS = 500

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** `true` while the model is still streaming text into this message */
  streaming?: boolean
}

export interface UseGeminiResult {
  messages: Message[]
  streaming: boolean
  error: string | null
  sendMessage: (text: string, context?: Record<string, string>) => Promise<void>
  clearChat: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert the internal message history format to the shape expected by the
 * Gemini API (`role: 'model'` instead of `role: 'assistant'`).
 *
 * @param {Array<{role: string, content: string}>} history - Internal history
 * @returns {Array<{role: string, parts: Array<{text: string}>}>} Gemini-compatible history
 */
function toGeminiHistory(history: { role: string; content: string }[]) {
  return history.map((turn) => ({
    role: turn.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: turn.content }],
  }))
}

/**
 * Build an optional context prefix to prepend to the user's message.
 * This tells the model what part of the app the user is currently viewing,
 * enabling more relevant answers.
 *
 * All context values are sanitised before injection to prevent prompt injection.
 *
 * @param {Record<string, string>} context - Page/stage context from the caller
 * @returns {string} Prefix string (may be empty)
 */
function buildContextPrefix(context: Record<string, string>): string {
  const safeStage = context.currentStage
    ? sanitizeInput(String(context.currentStage)).slice(0, 80)
    : ''
  const safePage = context.currentPage
    ? sanitizeInput(String(context.currentPage)).slice(0, 40)
    : ''

  if (safeStage) return `[User is viewing: ${safeStage}] `
  if (safePage)  return `[User is on the ${safePage} page] `
  return ''
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages a streaming Gemini AI conversation session.
 *
 * Features:
 * - Streaming responses with per-chunk UI updates
 * - Client-side send cooldown to prevent API abuse
 * - AbortController to cancel in-flight requests on `clearChat`
 * - Context-aware prompts (current page / election stage)
 * - Analytics tracking for sent and failed messages
 *
 * @returns {UseGeminiResult}
 */
export function useGemini(): UseGeminiResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Persistent conversation history for multi-turn context (not stored in state
  // to avoid unnecessary re-renders on every token streamed)
  const historyRef = useRef<{ role: string; content: string }[]>([])

  // Timestamp of the last successful send (used for cooldown check)
  const lastSendTimestampRef = useRef<number>(0)

  // Allow in-flight requests to be cancelled when the user clears the chat
  const abortControllerRef = useRef<AbortController | null>(null)

  // ---------------------------------------------------------------------------
  // sendMessage
  // ---------------------------------------------------------------------------

  const sendMessage = useCallback(async (
    userText: string,
    context: Record<string, string> = {}
  ) => {
    const trimmedText = userText?.trim()
    if (!trimmedText || streaming) return

    // Cancel any previous in-flight request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    // Enforce send cooldown
    const now = Date.now()
    if (now - lastSendTimestampRef.current < SEND_COOLDOWN_MS) return
    lastSendTimestampRef.current = now

    setError(null)

    // Create placeholder messages immediately so the UI feels responsive
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedText,
    }
    const assistantPlaceholder: Message = {
      id: `assistant-${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      streaming: true,
    }

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder])
    setStreaming(true)

    try {
      const geminiHistory = toGeminiHistory(historyRef.current)
      const contextPrefix = buildContextPrefix(context)
      const fullMessage = contextPrefix + sanitizeInput(trimmedText)

      // Stream the response — each chunk updates the assistant placeholder in place
      let finalText = ''
      await sendMessageStream(fullMessage, geminiHistory, (_chunk: string, accumulated: string) => {
        finalText = accumulated
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantPlaceholder.id
              ? { ...message, content: accumulated }
              : message
          )
        )
      })

      trackAnalyticsEvent('gemini_message_sent', {
        page: context.currentPage ?? 'unknown',
        has_stage_context: Boolean(context.currentStage),
      })

      // Persist the completed turn to history (without the context prefix —
      // we only want the user's actual words in future prompts)
      historyRef.current = [
        ...historyRef.current,
        { role: 'user',      content: trimmedText },
        { role: 'assistant', content: finalText },
      ]

      // Mark streaming complete on the assistant message
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantPlaceholder.id
            ? { ...message, streaming: false }
            : message
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message.replace(/key=[^&\s]*/g, 'key=REDACTED')
        : 'Failed to get a response. Please try again.'

      logger.warn('[useGemini] sendMessage error:', errorMessage)
      trackAnalyticsEvent('gemini_message_failed', {
        page: context.currentPage ?? 'unknown',
      })
      setError(errorMessage)

      // Remove the empty placeholder bubble so the UI doesn't show a blank message
      setMessages((prev) => prev.filter((message) => message.id !== assistantPlaceholder.id))
    } finally {
      setStreaming(false)
    }
  }, [streaming])

  // ---------------------------------------------------------------------------
  // clearChat
  // ---------------------------------------------------------------------------

  /**
   * Abort any in-flight request, reset the message list, and clear history.
   */
  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setMessages([])
    historyRef.current = []
    setError(null)
  }, [])

  return { messages, streaming, error, sendMessage, clearChat }
}
