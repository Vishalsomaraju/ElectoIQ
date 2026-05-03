import { Bot, X } from 'lucide-react'

export function ChatDrawerHeader({ messages, onClear, onClose }) {
  return (
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
          <button onClick={onClear} aria-label="Clear chat history"
            className="px-2 py-1 text-xs text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70 rounded transition-colors">
            Clear
          </button>
        )}
        <button onClick={onClose} aria-label="Close ElectoBot chat"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
