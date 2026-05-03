import { Bot, User } from 'lucide-react'

export function ChatMessageList({ messages, error, bottomRef }) {
  return (
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
  )
}
