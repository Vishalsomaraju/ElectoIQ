import { useState, useCallback, useEffect } from 'react'
import { trackAnalyticsEvent, logAnalyticsEvent } from '../services/firebase'
import { generateQuiz } from '../services/gemini'
import { shuffle, calcScore, getGrade } from '../utils/helpers'
import { logger } from '../utils/logger'

export function useQuiz() {
  const [questions, setQuestions] = useState([])
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [revealed, setRevealed] = useState(false)
  const [phase, setPhase] = useState('quiz')

  const generateQuestions = useCallback(async () => {
    setGenerating(true); setGenError(null)
    try {
      setQuestions(await generateQuiz())
    } catch (err) {
      logger.warn('[Quiz] Generation failed, using fallback:', err)
      const { quizQuestions } = await import('../data/quizQuestions')
      setQuestions(shuffle(quizQuestions).slice(0, 10))
      setGenError('Using local questions — AI generation unavailable')
    } finally { setGenerating(false) }
  }, [])

  useEffect(() => { generateQuestions() }, [generateQuestions])

  const current = questions.at(currentIdx)
  const selectedAnswer = answers[currentIdx]
  const isAnswered = selectedAnswer !== undefined

  const handleAnswer = useCallback((idx) => {
    if (isAnswered) return
    setAnswers((prev) => ({ ...prev, [currentIdx]: idx }))
    setRevealed(true)
    trackAnalyticsEvent('quiz_answered', { question_index: currentIdx + 1, category: current?.category ?? 'unknown' })
  }, [current?.category, currentIdx, isAnswered])

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1); setRevealed(false)
    } else {
      const correct = Object.values(answers).filter((a, i) => a === questions[i]?.correct).length
      const score = calcScore(correct, questions.length)
      trackAnalyticsEvent('quiz_completed', { score })
      setPhase('results')
      logAnalyticsEvent('quiz_completed', { score, correct, total: questions.length })
    }
  }, [answers, currentIdx, questions])

  const handleRestart = useCallback(async () => {
    setCurrentIdx(0); setAnswers({}); setRevealed(false); setPhase('quiz')
    const { quizQuestions } = await import('../data/quizQuestions')
    setQuestions(shuffle(quizQuestions).slice(0, 10))
  }, [])

  const handleGenerateAI = useCallback(async () => {
    setCurrentIdx(0); setAnswers({}); setRevealed(false); setPhase('quiz'); setLoadingQuiz(true)
    try {
      const q = await generateQuiz()
      setQuestions(q)
      trackAnalyticsEvent('quiz_generated_ai', { question_count: q.length })
    } catch (_err) {
      const { quizQuestions } = await import('../data/quizQuestions')
      setQuestions(shuffle(quizQuestions).slice(0, 10))
    } finally { setLoadingQuiz(false) }
  }, [])

  const correctCount = Object.values(answers).filter((a, i) => a === questions[i]?.correct).length
  const score = calcScore(correctCount, questions.length)
  const grade = getGrade(score)

  return {
    current, selectedAnswer, generating, genError, loadingQuiz, phase,
    currentIdx, totalQuestions: questions.length, revealed,
    correctCount, score, grade,
    handleAnswer, handleNext, handleRestart, handleGenerateAI,
  }
}
