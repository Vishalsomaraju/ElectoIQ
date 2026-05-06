import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'
import { Card } from '../ui/Card'
import { QuizOptionsList } from './QuizOptionsList'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Maps question difficulty labels to Badge colour variants.
 * Defined outside the component so it is not recreated on every render.
 *
 * @type {Record<string, string>}
 */
const DIFFICULTY_BADGE_VARIANT = {
  Easy:   'success',
  Medium: 'warning',
  Hard:   'danger',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * QuizQuestion — renders a single question card with progress, answer options,
 * an expandable explanation panel, and navigation controls.
 *
 * @param {object} props
 * @param {object}           props.question        - The current question data object
 * @param {number}           props.currentIdx      - Zero-based index of the current question
 * @param {number}           props.totalQuestions  - Total number of questions in the quiz
 * @param {number|undefined} props.selectedAnswer  - Index of the user's selected option, or undefined
 * @param {boolean}          props.revealed        - Whether the correct answer is revealed
 * @param {(idx: number) => void} props.onAnswer   - Called when the user selects an option
 * @param {() => void}       props.onNext          - Called when the user advances to the next question
 * @param {() => void}       props.onGenerateAI    - Called when the user requests an AI-generated quiz
 */
export function QuizQuestion({
  question,
  currentIdx,
  totalQuestions,
  selectedAnswer,
  revealed,
  onAnswer,
  onNext,
  onGenerateAI,
}) {
  const isAnswered = selectedAnswer !== undefined
  const isLastQuestion = currentIdx >= totalQuestions - 1
  const nextButtonLabel = isLastQuestion ? 'See Results' : 'Next Question'

  // For the screen-reader live region — determine feedback text without a
  // nested ternary so the intent is immediately clear
  const isCorrectAnswer = revealed && isAnswered && question.correct === selectedAnswer
  const screenReaderFeedback = (() => {
    if (!revealed || !isAnswered) return ''
    return isCorrectAnswer
      ? 'Correct!'
      : `Incorrect — the right answer was ${question.options[question.correct]}`
  })()

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Progress bar and AI generation button ─────────────────────── */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-white/60 font-medium">
              Question {currentIdx + 1} of {totalQuestions}
            </span>
            <Badge variant={DIFFICULTY_BADGE_VARIANT[question.difficulty]}>
              {question.difficulty}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateAI}
            icon={<Brain size={14} className="text-blue-500" />}
          >
            Generate AI Quiz
          </Button>
        </div>
        <ProgressBar value={currentIdx + 1} max={totalQuestions} color="primary" />
      </div>

      {/* ── Question card ─────────────────────────────────────────────── */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={20} className="text-blue-400" />
          <Badge variant="primary">{question.category}</Badge>
        </div>
        <h3
          id="question-heading"
          className="font-display font-bold text-xl text-slate-900 dark:text-white leading-snug"
        >
          {question.question}
        </h3>
      </Card>

      {/* ── Answer options ────────────────────────────────────────────── */}
      <QuizOptionsList
        options={question.options}
        selectedAnswer={selectedAnswer}
        revealed={revealed}
        correct={question.correct}
        onAnswer={onAnswer}
        isAnswered={isAnswered}
      />

      {/* ── Screen reader live feedback ───────────────────────────────── */}
      <div role="status" aria-live="polite" className="sr-only">
        {screenReaderFeedback}
      </div>

      {/* ── Explanation panel (animated reveal) ──────────────────────── */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 mb-6 overflow-hidden"
          >
            <p className="text-xs uppercase text-blue-400 font-semibold tracking-wider mb-1.5">
              Explanation
            </p>
            <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed">
              {question.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation button ─────────────────────────────────────────── */}
      {isAnswered && (
        <div className="flex justify-end">
          <Button onClick={onNext} iconRight={<ChevronRight size={18} />}>
            {nextButtonLabel}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
