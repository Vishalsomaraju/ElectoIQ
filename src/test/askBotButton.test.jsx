import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AskBotButton } from '../components/timeline/AskBotButton'

describe('AskBotButton', () => {
  it('renders and handles click', () => {
    const mockOnAskBot = vi.fn()
    const stage = { title: 'Test Stage' }
    render(<AskBotButton stage={stage} onAskBot={mockOnAskBot} />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(mockOnAskBot).toHaveBeenCalledWith(stage)
  })
})
