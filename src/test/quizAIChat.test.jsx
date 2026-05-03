import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuizAIChat } from '../components/quiz/QuizAIChat'
import { useGemini } from '../hooks/useGemini'

vi.mock('../hooks/useGemini', () => ({
  useGemini: vi.fn()
}))

vi.mock('../services/firebase', () => ({
  trackAnalyticsEvent: vi.fn()
}))

describe('QuizAIChat', () => {
  const defaultProps = {
    current: { question: 'Q1', options: ['A','B'], explanation: 'Expl' }
  }

  const mockSendMessage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useGemini.mockReturnValue({
      messages: [],
      streaming: false,
      error: null,
      sendMessage: mockSendMessage
    })
  })

  it('renders chat interface when open', () => {
    render(<QuizAIChat {...defaultProps} />)
    // Initially closed, open it
    const toggleBtn = screen.getByRole('button', { name: /Open AI assistant/i })
    fireEvent.click(toggleBtn)
    
    expect(screen.getByText('ElectoIQ AI')).toBeInTheDocument()
  })

  it('renders empty state, messages, and streaming cursor', () => {
    useGemini.mockReturnValue({
      messages: [
        { id: 'u1', role: 'user', content: 'What is NOTA?' },
        { id: 'a1', role: 'assistant', content: 'NOTA means None of the Above.', streaming: true },
      ],
      streaming: true,
      error: null,
      sendMessage: mockSendMessage
    })

    render(<QuizAIChat {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Open AI assistant/i }))

    expect(screen.queryByText(/Ask me anything/i)).not.toBeInTheDocument()
    expect(screen.getByText('What is NOTA?')).toBeInTheDocument()
    expect(screen.getByText('NOTA means None of the Above.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sending message/i })).toBeDisabled()
  })

  it('sends message on form submit', async () => {
    render(<QuizAIChat {...defaultProps} />)
    const toggleBtn = screen.getByRole('button', { name: /Open AI assistant/i })
    fireEvent.click(toggleBtn)

    const input = screen.getByPlaceholderText('Ask about elections…')
    // Get the send button (it's the last button in the component when open)
    const btns = screen.getAllByRole('button')
    const sendBtn = btns[btns.length - 2] // The last one is the toggle open/close button, second to last is send
    
    fireEvent.change(input, { target: { value: 'Why is A wrong?' } })
    fireEvent.click(sendBtn)

    expect(mockSendMessage).toHaveBeenCalledWith('Why is A wrong?', expect.any(Object))
  })

  it('sends message without question context when current is missing', () => {
    render(<QuizAIChat current={null} />)
    fireEvent.click(screen.getByRole('button', { name: /Open AI assistant/i }))
    fireEvent.change(screen.getByLabelText(/message to quiz ai assistant/i), {
      target: { value: 'Explain voting rights' }
    })
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))

    expect(mockSendMessage).toHaveBeenCalledWith('Explain voting rights', {
      currentPage: 'quiz',
      currentStage: null,
    })
  })

  it('closes the assistant panel', async () => {
    render(<QuizAIChat {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /Open AI assistant/i }))
    expect(screen.getByRole('dialog', { name: /quiz ai assistant/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /close quiz ai assistant panel/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /quiz ai assistant/i })).not.toBeInTheDocument()
    })
  })

  it('handles API error gracefully', async () => {
    useGemini.mockReturnValue({
      messages: [],
      streaming: false,
      error: 'Failed to get response',
      sendMessage: mockSendMessage
    })
    
    render(<QuizAIChat {...defaultProps} />)
    const toggleBtn = screen.getByRole('button', { name: /Open AI assistant/i })
    fireEvent.click(toggleBtn)

    expect(screen.getByText(/Failed to get response/i)).toBeInTheDocument()
  })
})
