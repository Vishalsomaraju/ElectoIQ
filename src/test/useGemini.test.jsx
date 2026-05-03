// src/test/useGemini.test.jsx
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGemini } from '../hooks/useGemini'
import * as geminiService from '../services/gemini'

// Mock the gemini service
vi.mock('../services/gemini', () => ({
  sendMessageStream: vi.fn(),
}))

vi.mock('../services/firebase', () => ({
  trackAnalyticsEvent: vi.fn(),
}))

describe('useGemini Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console warning in tests for expected errors
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useGemini())
    
    expect(result.current.messages).toEqual([])
    expect(result.current.streaming).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should not send message if empty or already streaming', async () => {
    const { result } = renderHook(() => useGemini())
    
    await act(async () => {
      await result.current.sendMessage('   ')
    })
    
    expect(geminiService.sendMessageStream).not.toHaveBeenCalled()
    expect(result.current.messages).toHaveLength(0)
  })

  it('should handle successful message streaming', async () => {
    // Mock the streaming function to immediately call the callback with chunks
    geminiService.sendMessageStream.mockImplementation(async (text, history, onChunk) => {
      onChunk('Hello', 'Hello')
      onChunk(' world', 'Hello world')
    })

    const { result } = renderHook(() => useGemini())

    await act(async () => {
      await result.current.sendMessage('Hi')
    })

    expect(geminiService.sendMessageStream).toHaveBeenCalledWith(
      'Hi',
      [],
      expect.any(Function)
    )

    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[0]).toMatchObject({ role: 'user', content: 'Hi' })
    expect(result.current.messages[1]).toMatchObject({ role: 'assistant', content: 'Hello world', streaming: false })
    expect(result.current.streaming).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should maintain conversation history', async () => {
    vi.useFakeTimers()
    geminiService.sendMessageStream.mockResolvedValue()

    const { result } = renderHook(() => useGemini())

    // First message
    await act(async () => {
      await result.current.sendMessage('Msg 1')
    })

    // Advance past the 500ms rate-limit cooldown
    vi.advanceTimersByTime(600)

    // Second message
    await act(async () => {
      await result.current.sendMessage('Msg 2')
    })

    vi.useRealTimers()

    // Check that the second call passed the history of the first turn
    expect(geminiService.sendMessageStream).toHaveBeenNthCalledWith(
      2,
      'Msg 2',
      [
        { role: 'user', parts: [{ text: 'Msg 1' }] },
        { role: 'model', parts: [{ text: '' }] } // Empty because mockResolvedValue doesn't call onChunk
      ],
      expect.any(Function)
    )
  })

  it('should handle errors properly', async () => {
    const errorMsg = 'API quota exceeded'
    geminiService.sendMessageStream.mockRejectedValue(new Error(errorMsg))

    const { result } = renderHook(() => useGemini())

    await act(async () => {
      await result.current.sendMessage('Hi')
    })

    expect(console['warn']).toHaveBeenCalled()
    expect(result.current.error).toBe(errorMsg)
    expect(result.current.streaming).toBe(false)
    // The assistant message should be removed on error
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toMatchObject({ role: 'user' })
  })

  it('should clear chat and history', async () => {
    geminiService.sendMessageStream.mockResolvedValue()

    const { result } = renderHook(() => useGemini())

    await act(async () => {
      await result.current.sendMessage('Hi')
      result.current.clearChat()
    })

    expect(result.current.messages).toEqual([])
    expect(result.current.error).toBeNull()
  })
})
