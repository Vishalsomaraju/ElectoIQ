import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuiz } from '../hooks/useQuiz'
import * as geminiService from '../services/gemini'
import * as firebaseService from '../services/firebase'

vi.mock('../services/gemini', () => ({
  generateQuiz: vi.fn()
}))

vi.mock('../services/firebase', () => ({
  trackAnalyticsEvent: vi.fn(),
  logAnalyticsEvent: vi.fn(),
}))

describe('useQuiz hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    geminiService.generateQuiz.mockResolvedValue([
      { question: 'Q1', options: ['A','B','C','D'], correct: 0 },
      { question: 'Q2', options: ['A','B','C','D'], correct: 1 }
    ])
  })

  it('handleRestart resets state and uses local questions', async () => {
    const { result } = renderHook(() => useQuiz())

    // Wait for initial generation
    await vi.waitFor(() => {
      expect(result.current.totalQuestions).toBeGreaterThan(0)
    })

    // simulate moving to next question
    act(() => {
      result.current.handleAnswer(0)
    })
    act(() => {
      result.current.handleNext()
    })

    // now restart
    await act(async () => {
      await result.current.handleRestart()
    })

    expect(result.current.currentIdx).toBe(0)
    expect(result.current.revealed).toBe(false)
    expect(result.current.phase).toBe('quiz')
    // After restart, local questions are loaded, which has 10 questions
    expect(result.current.totalQuestions).toBe(10)
  })

  it('handleGenerateAI fetches new questions from AI', async () => {
    const { result } = renderHook(() => useQuiz())

    await vi.waitFor(() => {
      expect(result.current.totalQuestions).toBeGreaterThan(0)
    })

    geminiService.generateQuiz.mockResolvedValueOnce([
      { question: 'AI Q1', options: ['A','B','C','D'], correct: 2 }
    ])

    await act(async () => {
      await result.current.handleGenerateAI()
    })

    expect(result.current.totalQuestions).toBe(1)
    expect(firebaseService.trackAnalyticsEvent).toHaveBeenCalledWith('quiz_generated_ai', { question_count: 1 })
  })

  it('handleGenerateAI falls back to local on error', async () => {
    const { result } = renderHook(() => useQuiz())

    await vi.waitFor(() => {
      expect(result.current.totalQuestions).toBeGreaterThan(0)
    })

    geminiService.generateQuiz.mockRejectedValueOnce(new Error('AI fail'))

    await act(async () => {
      await result.current.handleGenerateAI()
    })

    expect(result.current.totalQuestions).toBe(10)
  })

  it('handleNext calculates score and logs analytics on finish', async () => {
    const { result } = renderHook(() => useQuiz())

    // Wait for initial generation (2 questions)
    await vi.waitFor(() => {
      expect(result.current.totalQuestions).toBe(2)
    })

    // Answer Q1 correctly
    act(() => {
      result.current.handleAnswer(0)
    })
    act(() => {
      result.current.handleNext() // Move to Q2
    })

    // Answer Q2 correctly
    act(() => {
      result.current.handleAnswer(1)
    })
    act(() => {
      result.current.handleNext() // Finish quiz
    })

    expect(result.current.phase).toBe('results')
    expect(firebaseService.logAnalyticsEvent).toHaveBeenCalledWith('quiz_completed', { score: 100, correct: 2, total: 2 })
    expect(firebaseService.trackAnalyticsEvent).toHaveBeenCalledWith('quiz_completed', { score: 100 })
  })
})
