// src/hooks/useGemini.ts
import { useState, useRef, useCallback } from 'react'
import { logger } from '../utils/logger'
import { sendMessageStream } from '../services/gemini'
import { trackAnalyticsEvent } from '../services/firebase'
import { sanitizeInput } from '../utils/helpers'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

export interface UseGeminiResult {
  messages: Message[]
  streaming: boolean
  error: string | null
  sendMessage: (text: string, context?: Record<string, string>) => Promise<void>
  clearChat: () => void
}

/**
 * Hook for conversational Gemini AI interaction with streaming support.
 */
export function useGemini(): UseGeminiResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const historyRef = useRef<{ role: string; content: string }[]>([])
  const lastSendRef = useRef<number>(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const COOLDOWN_MS = 500

  const sendMessage = useCallback(async (userText: string, context: Record<string, string> = {}) => {
    const trimmed = userText?.trim()
    if (!trimmed || streaming) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    // Rate limiting — minimum 500ms between sends to prevent API abuse
    const now = Date.now()
    if (now - lastSendRef.current < COOLDOWN_MS) return
    lastSendRef.current = now

    setError(null)

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }
    const assistantMsg: Message = {
      id: `assistant-${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      streaming: true,
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setStreaming(true)

    try {
      // Build Gemini-compatible history from previous turns
      const geminiHistory = historyRef.current.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

      // Build context-aware prompt prefix — sanitize context values to prevent prompt injection
      const safeStage = context.currentStage ? sanitizeInput(String(context.currentStage)).slice(0, 80) : ''
      const safePage = context.currentPage ? sanitizeInput(String(context.currentPage)).slice(0, 40) : ''
      const contextPrefix = safeStage
        ? `[User is viewing: ${safeStage}] `
        : safePage
        ? `[User is on the ${safePage} page] `
        : ''

      const fullMessage = contextPrefix + sanitizeInput(trimmed)

      let fullText = ''
      await sendMessageStream(fullMessage, geminiHistory, (_chunk: string, accumulated: string) => {
        fullText = accumulated
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsg.id ? { ...m, content: accumulated } : m
          )
        )
      })

      trackAnalyticsEvent('gemini_message_sent', {
        page: context.currentPage ?? 'unknown',
        has_stage_context: Boolean(context.currentStage),
      })

      // Update persistent history with the actual user text (no prefix)
      historyRef.current = [
        ...historyRef.current,
        { role: 'user', content: trimmed },
        { role: 'assistant', content: fullText },
      ]

      // Mark streaming done
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsg.id ? { ...m, streaming: false } : m
        )
      )
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message.replace(/key=[^&\s]*/g, 'key=REDACTED')
          : 'Failed to get a response. Please try again.'
      logger.warn('[useGemini] Error:', msg)
      trackAnalyticsEvent('gemini_message_failed', {
        page: context.currentPage ?? 'unknown',
      })
      setError(msg)
      // Remove the empty assistant bubble on error
      setMessages(prev => prev.filter(m => m.id !== assistantMsg.id))
    } finally {
      setStreaming(false)
    }
  }, [streaming])

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
