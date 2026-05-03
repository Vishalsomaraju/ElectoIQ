import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
