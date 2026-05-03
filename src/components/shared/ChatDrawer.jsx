// src/components/shared/ChatDrawer.jsx
import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../../context/AppContext'
import { useGemini } from '../../hooks/useGemini'
import { logAnalyticsEvent } from '../../services/firebase'
import { ChatMessageList } from '../chat/ChatMessageList'
import { ChatInput } from '../chat/ChatInput'
import { ChatDrawerHeader } from '../chat/ChatDrawerHeader'

/**
 * Slide-in chat drawer for ElectoBot AI assistant.
 */
export function ChatDrawer() {
  const { state, dispatch } = useAppContext()
  const { messages, sendMessage, streaming, error, clearChat } = useGemini()
  const [inputValue, setInputValue] = useState('')
  const bottomRef = useRef(null)
  const drawerRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    return () => clearChat()
  }, [clearChat])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const text = inputValue.trim()
    if (!text || streaming) return
    setInputValue('')
    logAnalyticsEvent('electobot_message_sent', { page: state.currentPage })
    await sendMessage(text, {
      currentPage: state.currentPage,
      currentStage: state.chatContext?.stageName,
    })
  }, [inputValue, streaming, sendMessage, state.currentPage, state.chatContext?.stageName])

  const handleSuggestionClick = useCallback(async (suggestion) => {
    if (streaming) return
    logAnalyticsEvent('electobot_message_sent', { page: state.currentPage })
    await sendMessage(suggestion, {
      currentPage: state.currentPage,
      currentStage: state.chatContext?.stageName,
    })
  }, [streaming, sendMessage, state.currentPage, state.chatContext?.stageName])

  const closeDrawer = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHAT', payload: false })
  }, [dispatch])

  // ── Focus trap: cycle Tab/Shift+Tab within the drawer ──────────────────
  useEffect(() => {
    if (!state.chatOpen) return
    const drawer = drawerRef.current
    if (!drawer) return
    const focusableSelectors = [
      'button:not([disabled])', 'input:not([disabled])',
      'textarea:not([disabled])', 'a[href]', '[tabindex]:not([tabindex="-1"])',
    ].join(', ')
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return
      const focusable = [...drawer.querySelectorAll(focusableSelectors)]
      if (focusable.length === 0) return
      const first = focusable.at(0)
      const last = focusable.at(-1)
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    drawer.addEventListener('keydown', handleKeyDown)
    drawer.querySelector(focusableSelectors)?.focus()
    return () => drawer.removeEventListener('keydown', handleKeyDown)
  }, [state.chatOpen])

  // ── Escape key closes the drawer ────────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && state.chatOpen) closeDrawer()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [state.chatOpen, closeDrawer])

  return (
    <AnimatePresence>
      {state.chatOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-[99]"
          />
          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-[100dvh] w-full sm:w-[400px] bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-white/10 z-[100] flex flex-col shadow-2xl"
            role="dialog" aria-modal="true"
            aria-label="ElectoBot AI chat assistant"
            aria-describedby="chat-drawer-desc"
          >
            <p id="chat-drawer-desc" className="sr-only">
              Chat with ElectoBot about Indian elections. Press Escape to close.
            </p>
            <ChatDrawerHeader messages={messages} onClear={clearChat} onClose={closeDrawer} />

            {/* Context banner */}
            {state.chatContext?.stageName && (
              <div aria-live="polite" aria-atomic="true"
                className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-2 shrink-0">
                <p className="text-xs text-blue-400">
                  <span className="font-semibold">Discussing:</span>{' '}
                  {state.chatContext.stageName}
                </p>
              </div>
            )}

            <ChatMessageList messages={messages} error={error} bottomRef={bottomRef} />

            <ChatInput
              inputValue={inputValue}
              streaming={streaming}
              suggestedQuestions={state.suggestedQuestions}
              messagesCount={messages.length}
              onInputChange={(e) => setInputValue(e.target.value)}
              onSubmit={handleSubmit}
              onSuggestionClick={handleSuggestionClick}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
