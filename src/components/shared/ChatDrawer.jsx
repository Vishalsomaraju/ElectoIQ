// src/components/shared/ChatDrawer.jsx
import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User, Loader2 } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { useGemini } from '../../hooks/useGemini'
import { logAnalyticsEvent } from '../../services/firebase'

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
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return
      const focusable = [...drawer.querySelectorAll(focusableSelectors)]
      if (focusable.length === 0) return
      const first = focusable.at(0)
      const last = focusable.at(-1)
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    drawer.addEventListener('keydown', handleKeyDown)
    // Move focus inside drawer when it opens
    const firstFocusable = drawer.querySelector(focusableSelectors)
    firstFocusable?.focus()

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-[99]"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-[100dvh] w-full sm:w-[400px] bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-white/10 z-[100] flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="ElectoBot AI chat assistant"
            aria-describedby="chat-drawer-desc"
          >
            {/* Hidden description for screen readers */}
            <p id="chat-drawer-desc" className="sr-only">
              Chat with ElectoBot about Indian elections. Press Escape to close.
            </p>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9933] to-[#138808] flex items-center justify-center text-white shadow-md">
                  <Bot size={20} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">ElectoBot</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
                    <p className="text-xs text-slate-500 dark:text-white/50">Your AI Election Guide</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    aria-label="Clear chat history"
                    className="px-2 py-1 text-xs text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70 rounded transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={closeDrawer}
                  aria-label="Close ElectoBot chat"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Context banner */}
            {state.chatContext?.stageName && (
              <div
                aria-live="polite"
                aria-atomic="true"
                className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-2 shrink-0"
              >
                <p className="text-xs text-blue-400">
                  <span className="font-semibold">Discussing:</span>{' '}
                  {state.chatContext.stageName}
                </p>
              </div>
            )}

            {/* Message list */}
            <div
              role="log"
              aria-label="Chat conversation"
              aria-live="polite"
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-white/40 space-y-3">
                  <Bot size={48} className="text-slate-200 dark:text-white/10" aria-hidden="true" />
                  <p className="text-sm">Ask me anything about Indian elections, voter registration, EVMs, or the ECI!</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    aria-hidden="true"
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70'
                        : 'bg-gradient-to-br from-[#FF9933] to-[#138808] text-white shadow-sm'
                    }`}
                  >
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-2xl max-w-[82%] text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white/90 rounded-tl-sm border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    {msg.content || (msg.streaming && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                      </span>
                    ))}
                    {msg.streaming && msg.content && (
                      <span className="inline-block w-1.5 h-4 bg-current opacity-60 animate-pulse ml-0.5 align-middle rounded-sm" />
                    )}
                  </div>
                </div>
              ))}

              {error && (
                <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl text-center">
                  ElectoBot hit a snag. Please try again 🔄
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shrink-0">
              {/* Suggested questions — only shown when chat is empty */}
              {state.suggestedQuestions?.length > 0 && messages.length === 0 && (
                <div className="flex flex-wrap gap-2 mb-3" aria-label="Suggested questions">
                  {state.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(q)}
                      disabled={streaming}
                      className="text-xs bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  disabled={streaming}
                  maxLength={1000}
                  placeholder="Ask about elections…"
                  aria-label="Message to ElectoBot"
                  className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full pl-4 pr-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all"
                />
                <button
                  type="submit"
                  disabled={streaming || !inputValue.trim()}
                  aria-label={streaming ? 'Sending message' : 'Send message'}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {streaming
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Send size={16} className="translate-x-0.5" />
                  }
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
