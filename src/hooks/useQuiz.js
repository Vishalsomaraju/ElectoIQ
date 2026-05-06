// src/hooks/useQuiz.js
import { useState, useCallback, useEffect } from 'react'
import { trackAnalyticsEvent, logAnalyticsEvent } from '../services/firebase'
import { generateQuiz } from '../services/gemini'
import { shuffle, calcScore, getGrade } from '../utils/helpers'
import { logger } from '../utils/logger'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Reset all per-session quiz state in a single operation.
 * Extracted so that both `handleRestart` and `handleGenerateAI` share the
 * same reset sequence and cannot accidentally diverge.
 *
 * @param {Function} setCurrentIdx
 * @param {Function} setAnswers
 * @param {Function} setRevealed
 * @param {Function} setPhase
 */
function resetSession(setCurrentIdx, setAnswers, setRevealed, setPhase) {
  setCurrentIdx(0)
  setAnswers({})
  setRevealed(false)
  setPhase('quiz')
}

/**
 * Count how many stored answers match the correct answer for each question.
 *
 * @param {Record<number, number>} answers - Map of questionIndex → selectedOption
 * @param {Array<{correct: number}>} questions
 * @returns {number} Number of correct answers
 */
function countCorrectAnswers(answers, questions) {
  return Object.values(answers).filter(
    (selectedOption, questionIndex) => selectedOption === questions[questionIndex]?.correct
  ).length
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Core state machine for the Election Quiz feature.
 *
 * Manages question generation (AI + local fallback), answer tracking,
 * scoring, and phase transitions (quiz → results).
 *
 * @returns {{
 *   current: object | undefined,
 *   selectedAnswer: number | undefined,
 *   generating: boolean,
 *   genError: string | null,
 *   loadingQuiz: boolean,
 *   phase: 'quiz' | 'results',
 *   currentIdx: number,
 *   totalQuestions: number,
 *   revealed: boolean,
 *   correctCount: number,
 *   score: number,
 *   grade: {label: string, color: string, emoji: string},
 *   handleAnswer: (optionIndex: number) => void,
 *   handleNext: () => void,
 *   handleRestart: () => Promise<void>,
 *   handleGenerateAI: () => Promise<void>,
 * }}
 */
export function useQuiz() {
  // `generating`  — initial AI fetch on mount (shows a full-page generating view)
  // `loadingQuiz` — subsequent AI regeneration triggered by the user mid-quiz
  const [questions, setQuestions] = useState([])
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [revealed, setRevealed] = useState(false)
  const [phase, setPhase] = useState('quiz')

  // ---------------------------------------------------------------------------
  // Initial question generation (AI with local fallback)
  // ---------------------------------------------------------------------------

  const generateQuestions = useCallback(async () => {
    setGenerating(true)
    setGenError(null)

    try {
      const aiQuestions = await generateQuiz()
      setQuestions(aiQuestions)
    } catch (err) {
      logger.warn('[Quiz] AI generation failed — using local fallback:', err)
      const { quizQuestions } = await import('../data/quizQuestions')
      setQuestions(shuffle(quizQuestions).slice(0, 10))
      setGenError('Using local questions — AI generation unavailable')
    } finally {
      setGenerating(false)
    }
  }, [])

  // Run once on mount
  useEffect(() => { generateQuestions() }, [generateQuestions])

  // ---------------------------------------------------------------------------
  // Derived state (computed from questions + answers)
  // ---------------------------------------------------------------------------

  const current = questions.at(currentIdx)
  const selectedAnswer = answers[currentIdx]
  const isAnswered = selectedAnswer !== undefined

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  /** Record the user's answer and reveal the explanation. */
  const handleAnswer = useCallback((optionIndex) => {
    if (isAnswered) return // Guard against double-submission

    setAnswers((prev) => ({ ...prev, [currentIdx]: optionIndex }))
    setRevealed(true)
    trackAnalyticsEvent('quiz_answered', {
      question_index: currentIdx + 1,
      category: current?.category ?? 'unknown',
    })
  }, [current?.category, currentIdx, isAnswered])

  /** Advance to the next question, or finalise the quiz if all done. */
  const handleNext = useCallback(() => {
    const isLastQuestion = currentIdx >= questions.length - 1

    if (!isLastQuestion) {
      setCurrentIdx((prev) => prev + 1)
      setRevealed(false)
      return
    }

    // Final question answered — compute score and transition to results phase
    const correctCount = countCorrectAnswers(answers, questions)
    const score = calcScore(correctCount, questions.length)

    trackAnalyticsEvent('quiz_completed', { score })
    logAnalyticsEvent('quiz_completed', {
      score,
      correct: correctCount,
      total: questions.length,
    })
    setPhase('results')
  }, [answers, currentIdx, questions])

  /** Restart with a fresh shuffle of the local question bank. */
  const handleRestart = useCallback(async () => {
    resetSession(setCurrentIdx, setAnswers, setRevealed, setPhase)
    const { quizQuestions } = await import('../data/quizQuestions')
    setQuestions(shuffle(quizQuestions).slice(0, 10))
  }, [])

  /** Regenerate questions from AI, resetting all session state first. */
  const handleGenerateAI = useCallback(async () => {
    resetSession(setCurrentIdx, setAnswers, setRevealed, setPhase)
    setLoadingQuiz(true)

    try {
      const aiQuestions = await generateQuiz()
      setQuestions(aiQuestions)
      trackAnalyticsEvent('quiz_generated_ai', { question_count: aiQuestions.length })
    } catch (_err) {
      // Silent fallback — the user just gets local questions without an error toast
      const { quizQuestions } = await import('../data/quizQuestions')
      setQuestions(shuffle(quizQuestions).slice(0, 10))
    } finally {
      setLoadingQuiz(false)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Scoring (derived at render time so it always reflects current answers)
  // ---------------------------------------------------------------------------

  const correctCount = countCorrectAnswers(answers, questions)
  const score = calcScore(correctCount, questions.length)
  const grade = getGrade(score)

  return {
    // Current question state
    current,
    selectedAnswer,
    revealed,
    currentIdx,
    totalQuestions: questions.length,
    phase,

    // Loading / error state
    generating,
    genError,
    loadingQuiz,

    // Results
    correctCount,
    score,
    grade,

    // Handlers
    handleAnswer,
    handleNext,
    handleRestart,
    handleGenerateAI,
  }
}
