import { Bot } from 'lucide-react'

export function AskBotButton({ stage, onAskBot }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onAskBot(stage) }}
      className="w-full mt-2 py-2 px-4 rounded-xl bg-linear-to-rrom-[#FF9933]/10 to-india-green/10 border border-india-saffron/20 dark:border-white/10 hover:border-india-saffron/40 dark:hover:border-white/30 text-slate-800 dark:text-white/90 text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
    >
      <Bot size={16} className="text-india-saffron" />
      Ask ElectoBot about this stage
    </button>
  )
}
