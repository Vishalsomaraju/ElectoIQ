import { Loader2, Send } from 'lucide-react'

export function ChatInput({
  inputValue,
  streaming,
  suggestedQuestions,
  messagesCount,
  onInputChange,
  onSubmit,
  onSuggestionClick,
}) {
  return (
    <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shrink-0">
      {/* Suggested questions — only shown when chat is empty */}
      {suggestedQuestions?.length > 0 && messagesCount === 0 && (
        <div className="flex flex-wrap gap-2 mb-3" aria-label="Suggested questions">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSuggestionClick(q)}
              disabled={streaming}
              className="text-xs bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 text-left"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
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
  )
}
