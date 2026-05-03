import { cn } from '../../utils/helpers'

export function QuizOptionsList({ options, selectedAnswer, revealed, correct, onAnswer, isAnswered }) {
  return (
    <div role="radiogroup" aria-labelledby="question-heading" className="space-y-3 mb-6">
      {options.map((opt, i) => {
        const isSelected = selectedAnswer === i
        const isCorrect = correct === i
        let style =
          'border-slate-200 dark:border-white/15 text-slate-700 dark:text-white/80 hover:border-slate-300 dark:hover:border-white/30 hover:bg-slate-50 dark:hover:bg-white/5'
        if (revealed) {
          if (isCorrect)
            style = 'border-green-500/70 bg-green-500/15 text-green-600 dark:text-green-300'
          else if (isSelected)
            style = 'border-red-500/70 bg-red-500/15 text-red-600 dark:text-red-300'
          else
            style = 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40'
        }
        return (
          <button
            key={i}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onAnswer(i)}
            disabled={isAnswered}
            className={cn(
              'w-full text-left px-5 py-3.5 rounded-xl border transition-all duration-200 text-sm font-medium',
              style,
              !isAnswered && 'cursor-pointer active:scale-[0.99]',
            )}
          >
            <span className="inline-flex items-center gap-3">
              <span className="size-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </span>
          </button>
        )
      })}
    </div>
  )
}
