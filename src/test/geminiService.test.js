import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted so these are available inside vi.mock factory
const {
  mockSendMessage,
  mockSendMessageStream,
  mockStartChat,
  mockGenerateContent,
  mockGetGenerativeModel
} = vi.hoisted(() => {
  const mockSendMessage = vi.fn()
  const mockSendMessageStream = vi.fn()
  const mockStartChat = vi.fn().mockReturnValue({
    sendMessage: mockSendMessage,
    sendMessageStream: mockSendMessageStream,
  })
  const mockGenerateContent = vi.fn()
  const mockGetGenerativeModel = vi.fn().mockReturnValue({
    startChat: mockStartChat,
    generateContent: mockGenerateContent,
  })
  return {
    mockSendMessage,
    mockSendMessageStream,
    mockStartChat,
    mockGenerateContent,
    mockGetGenerativeModel
  }
})

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    constructor(key) {
      this.key = key
    }
    getGenerativeModel = mockGetGenerativeModel
  }
}))

// Mock logger
const mockWarn = vi.fn()
vi.mock('../utils/logger', () => ({
  logger: {
    warn: (...args) => mockWarn(...args),
  }
}))

// Mock helpers
vi.mock('../utils/helpers', () => ({
  sanitizeInput: vi.fn((input) => input)
}))

describe('gemini service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('logs a warning when API_KEY is missing or unconfigured', async () => {
    vi.stubEnv('VITE_GEMINI_KEY', 'UNCONFIGURED_KEY')
    await import('../services/gemini')
    expect(mockWarn).toHaveBeenCalledWith(
      expect.stringContaining('VITE_GEMINI_KEY is not set'),
      expect.any(String)
    )
  })

  describe('with valid API key', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_GEMINI_KEY', 'valid-key')
    })

    it('getChatModel returns model', async () => {
      const { getChatModel } = await import('../services/gemini')
      const model = getChatModel()
      expect(model).toBeDefined()
      expect(model.startChat).toBeDefined()
    })

    it('startChatSession returns chat object', async () => {
      const { startChatSession } = await import('../services/gemini')
      const chat = startChatSession([])
      expect(mockStartChat).toHaveBeenCalledWith({ history: [] })
      expect(chat).toBeDefined()
    })

    it('sendMessage sends a message successfully', async () => {
      mockSendMessage.mockResolvedValueOnce({
        response: { text: () => 'Response text' }
      })
      const { sendMessage } = await import('../services/gemini')
      const response = await sendMessage('Hello', [])
      expect(response).toBe('Response text')
    })

    it('sendMessage retries on failure', async () => {
      mockSendMessage
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockResolvedValueOnce({
          response: { text: () => 'Success!' }
        })
      
      const { sendMessage } = await import('../services/gemini')
      
      const promise = sendMessage('Hello', [])
      
      // Advance timers to trigger retry
      await vi.advanceTimersByTimeAsync(500)
      
      const response = await promise
      expect(response).toBe('Success!')
    })

    it('sendMessage throws after max retries', async () => {
      mockSendMessage.mockRejectedValue(new Error('Persistent failure'))
      const { sendMessage } = await import('../services/gemini')
      
      let caughtError
      const promise = sendMessage('Hello', []).catch(e => caughtError = e)
      
      await vi.runAllTimersAsync()
      await promise
      
      expect(caughtError).toBeDefined()
      expect(caughtError.message).toBe('Persistent failure')
    })

    it('sendMessageStream yields chunks and returns full text', async () => {
      const mockChunks = [
        { text: () => 'Chunk 1 ' },
        { text: () => 'Chunk 2' },
      ]
      
      mockSendMessageStream.mockResolvedValueOnce({
        stream: (async function* () {
          for (const chunk of mockChunks) {
            yield chunk;
          }
        })()
      })

      const { sendMessageStream } = await import('../services/gemini')
      const onChunk = vi.fn()
      const result = await sendMessageStream('Stream this', [], onChunk)
      
      expect(result).toBe('Chunk 1 Chunk 2')
      expect(onChunk).toHaveBeenCalledWith('Chunk 1 ', 'Chunk 1 ')
      expect(onChunk).toHaveBeenCalledWith('Chunk 2', 'Chunk 1 Chunk 2')
    })

    it('sendMessageStream implements rate limiting', async () => {
      const { sendMessageStream } = await import('../services/gemini')
      
      mockSendMessageStream.mockResolvedValue({
        stream: (async function* () { yield { text: () => 'OK' } })()
      })

      // Try 16 requests (limit is 15)
      for (let i = 0; i < 15; i++) {
        await sendMessageStream('Hi', [])
      }
      
      // 16th should fail
      await expect(sendMessageStream('Hi', [])).rejects.toThrow('Rate limit exceeded')
    })

    it('sendMessageStream retries on retryable errors (503)', async () => {
      const err503 = new Error('Unavailable')
      err503.status = 503

      mockSendMessageStream
        .mockRejectedValueOnce(err503)
        .mockResolvedValueOnce({
          stream: (async function* () { yield { text: () => 'Recovered' } })()
        })

      const { sendMessageStream } = await import('../services/gemini')
      
      const promise = sendMessageStream('Hi', [])
      await vi.advanceTimersByTimeAsync(500) // first retry
      
      const result = await promise
      expect(result).toBe('Recovered')
    })

    it('generateQuiz generates successfully', async () => {
      const mockJson = JSON.stringify([
        {
          category: 'History',
          difficulty: 'Easy',
          question: 'Q1?',
          options: ['A', 'B', 'C', 'D'],
          correct: 0,
          explanation: 'Exp'
        }
      ])
      
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => mockJson }
      })

      const { generateQuiz } = await import('../services/gemini')
      const result = await generateQuiz('Topic', 1)
      
      expect(result).toHaveLength(1)
      expect(result[0].question).toBe('Q1?')
    })

    it('generateQuiz handles invalid JSON by throwing', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Not JSON' }
      })

      const { generateQuiz } = await import('../services/gemini')
      
      let caughtError
      const promise = generateQuiz('Topic', 1).catch(e => caughtError = e)
      
      await vi.runAllTimersAsync()
      await promise
      
      expect(caughtError).toBeDefined()
      expect(caughtError.message).toBe('AI returned invalid quiz format (not valid JSON)')
    })

    it('generateQuiz validates array response', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify({ notAnArray: true }) }
      })

      const { generateQuiz } = await import('../services/gemini')
      
      let caughtError
      const promise = generateQuiz('Topic', 1).catch(e => caughtError = e)
      
      await vi.runAllTimersAsync()
      await promise
      
      expect(caughtError).toBeDefined()
      expect(caughtError.message).toBe('AI returned non-array quiz response')
    })
  })
})
