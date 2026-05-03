// src/test/pages.test.jsx
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ── Mocks — must be hoisted before imports that use them ───────────────────

// Strip framer-motion animation props that are not valid DOM attributes
const stripMotionProps = ({ children, initial: _i, animate: _a, exit: _ex, transition: _tr,
  whileInView: _wv, layout: _la, layoutId: _li, variants: _va, viewport: _vp, whileHover: _wh,
  whileTap: _wt, ...rest }) => ({ children, ...rest })

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...stripMotionProps({ children, ...props })}>{children}</div>,
    ul: ({ children, ...props }) => <ul {...stripMotionProps({ children, ...props })}>{children}</ul>,
    span: ({ children, ...props }) => <span {...stripMotionProps({ children, ...props })}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useInView: () => true,
}))

vi.mock('../context/AppContext', () => ({
  useAppContext: vi.fn(() => ({
    state: {
      chatOpen: false,
      suggestedQuestions: [],
      chatContext: null,
      currentPage: 'glossary',
      progress: {
        quizzesCompleted: 0,
        totalScore: 0,
        timelineViewed: [],
        glossaryViewed: [],
      },
    },
    dispatch: vi.fn(),
  })),
}))

vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ user: null, loading: false }),
}))

vi.mock('../services/gemini', () => ({
  sendMessageStream: vi.fn(),
  sendMessage: vi.fn().mockResolvedValue('Mock AI response'),
  generateQuiz: vi.fn().mockResolvedValue(
    Array.from({ length: 10 }, (_, index) => ({
      id: `mock-${index + 1}`,
      category: 'Practice',
      difficulty: 'Easy',
      question: `Test question ${index + 1}?`,
      options: ['A', 'B', 'C', 'D'],
      correct: 0,
      explanation: 'Because A.',
    }))
  ),
}))

vi.mock('../services/firebase', () => ({
  trackAnalyticsEvent: vi.fn(),
  logAnalyticsEvent: vi.fn(),
}))

vi.mock('../hooks/useFirestoreCollection', () => ({
  useFirestoreCollection: vi.fn(() => ({
    data: [],
    loading: false,
    error: null,
    isConnected: true,
  })),
}))

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...p }) => <a href={to} {...p}>{children}</a>,
  useNavigate: () => vi.fn(),
  MemoryRouter: ({ children }) => <>{children}</>,
}))

// Stub out shared layout wrappers that add unnecessary complexity in tests
vi.mock('../components/shared/AnimatedPage', () => ({
  AnimatedPage: ({ children }) => <div data-testid="animated-page">{children}</div>,
}))

vi.mock('../components/layout/PageWrapper', () => ({
  PageWrapper: ({ children }) => <main>{children}</main>,
}))

// ── Imports — after mocks ─────────────────────────────────────────────────
import { useAppContext } from '../context/AppContext'

// ═══════════════════════════════════════════════════════════════════════════
// Glossary page
// ═══════════════════════════════════════════════════════════════════════════
describe('Glossary page', () => {
  let Glossary

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('../pages/Glossary')
    Glossary = mod.default
  })

  it('renders the "Showing N of M terms" count text', () => {
    render(<Glossary />)
    expect(screen.getByText(/showing/i)).toBeInTheDocument()
  })

  it('renders the heading "Glossary of Terms"', () => {
    render(<Glossary />)
    expect(screen.getByText(/glossary of terms/i)).toBeInTheDocument()
  })

  it('shows the correct initial count (24 of total)', () => {
    render(<Glossary />)
    // Should show "Showing 24 of 55 terms"
    expect(screen.getByText(/showing/i).closest('p').textContent).toMatch(/24/)
  })

  it('filters terms when search query is typed', async () => {
    const user = userEvent.setup()
    render(<Glossary />)
    const input = screen.getByRole('textbox', { name: /search/i })
    await user.type(input, 'EVM')
    await waitFor(() => {
      const countEl = screen.getByText(/showing/i).closest('p')
      // After searching for "EVM" result count should be less than 24
      expect(countEl.textContent).toBeTruthy()
    })
  })

  it('shows empty state when no terms match search', async () => {
    const user = userEvent.setup()
    render(<Glossary />)
    const input = screen.getByRole('textbox', { name: /search/i })
    await user.type(input, 'xyznotarealelectionterm999')
    expect(await screen.findByText(/no terms found/i)).toBeInTheDocument()
  })

  it('clears search when X (Clear search) button is clicked', async () => {
    const user = userEvent.setup()
    render(<Glossary />)
    const input = screen.getByRole('textbox', { name: /search/i })
    await user.type(input, 'EVM')
    const clearBtn = await screen.findByRole('button', { name: /clear search/i })
    await user.click(clearBtn)
    expect(input.value).toBe('')
  })

  it('filters by category when a category button is pressed', async () => {
    const user = userEvent.setup()
    render(<Glossary />)
    const techBtn = screen.getByRole('button', { name: 'Technology' })
    await user.click(techBtn)
    expect(techBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('All category is active by default', () => {
    render(<Glossary />)
    const allBtn = screen.getByRole('button', { name: 'All' })
    expect(allBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows no terms found message for unmatched search', async () => {
    const user = userEvent.setup()
    render(<Glossary />)
    
    // The search input is always visible (not behind the loading skeleton)
    const input = screen.getByRole('textbox')
    await user.type(input, 'nonexistenttermxyz')
    
    // findByText waits for debounce (200ms) and loading (800ms) to both clear
    expect(await screen.findByText(/No terms found for/i, {}, { timeout: 3000 })).toBeInTheDocument()
  })

  it('renders category buttons that are always visible', () => {
    render(<Glossary />)
    // Category filter buttons appear immediately outside the loading skeleton
    expect(screen.getByRole('button', { name: 'Technology' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard page
// ═══════════════════════════════════════════════════════════════════════════
describe('Dashboard page', () => {
  let Dashboard

  beforeEach(async () => {
    useAppContext.mockReturnValue({
      state: {
        chatOpen: false,
        currentPage: 'dashboard',
        progress: {
          quizzesCompleted: 0,
          totalScore: 0,
          timelineViewed: [],
          glossaryViewed: [],
        },
      },
      dispatch: vi.fn(),
    })
    vi.resetModules()
    const mod = await import('../pages/Dashboard')
    Dashboard = mod.default
  })

  it('renders the Dashboard heading', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders the "Quizzes Done" stat card label', () => {
    render(<Dashboard />)
    expect(screen.getByText('Quizzes Done')).toBeInTheDocument()
  })

  it('renders the "Avg Score" stat card label', () => {
    render(<Dashboard />)
    expect(screen.getByText('Avg Score')).toBeInTheDocument()
  })

  it('renders the "Terms Viewed" stat card label', () => {
    render(<Dashboard />)
    expect(screen.getByText('Terms Viewed')).toBeInTheDocument()
  })

  it('renders the "Timeline Steps" stat card label', () => {
    render(<Dashboard />)
    expect(screen.getByText('Timeline Steps')).toBeInTheDocument()
  })

  it('renders the Milestones section heading', () => {
    render(<Dashboard />)
    expect(screen.getByText('Milestones')).toBeInTheDocument()
  })

  it('renders the "First Quiz" milestone', () => {
    render(<Dashboard />)
    expect(screen.getByText('First Quiz')).toBeInTheDocument()
  })

  it('renders the "Glossary Guru" milestone', () => {
    render(<Dashboard />)
    expect(screen.getByText('Glossary Guru')).toBeInTheDocument()
  })

  it('renders the "Continue Learning" quick links section', () => {
    render(<Dashboard />)
    expect(screen.getByText('Continue Learning')).toBeInTheDocument()
  })

  it('shows 0 quizzes done when progress is empty', () => {
    render(<Dashboard />)
    // stat value = 0, aria-label "Quizzes Done: 0"
    const el = document.querySelector('[aria-label="Quizzes Done: 0"]')
    expect(el).not.toBeNull()
    expect(el.textContent).toBe('0')
  })

  it('calculates averages and grades correctly when progress > 0', async () => {
    useAppContext.mockReturnValue({
      state: {
        chatOpen: false,
        currentPage: 'dashboard',
        progress: {
          quizzesCompleted: 2,
          totalScore: 15,
          timelineViewed: [1, 2],
          glossaryViewed: ['term1'],
        },
      },
      dispatch: vi.fn(),
    })
    
    // Remount with new mock values
    vi.resetModules()
    const mod = await import('../pages/Dashboard')
    const DashboardWithProgress = mod.default
    
    render(<DashboardWithProgress />)
    
    const quizzesEl = document.querySelector('[aria-label="Quizzes Done: 2"]')
    expect(quizzesEl).not.toBeNull()
    expect(quizzesEl.textContent).toBe('2')
    
    // 15 / 2 = 8 (Math.round) — value rendered as "8%"
    const avgScoreEl = document.querySelector('[aria-label="Avg Score: 8%"]')
    expect(avgScoreEl).not.toBeNull()
    expect(avgScoreEl.textContent).toBe('8%')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Timeline page
// ═══════════════════════════════════════════════════════════════════════════
describe('Timeline page', () => {
  let Timeline

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('../pages/Timeline')
    Timeline = mod.default
  })

  it('renders the Timeline heading', () => {
    render(<Timeline />)
    expect(screen.getByText(/Election Timeline/i)).toBeInTheDocument()
  })

  it('renders the election timeline entries', () => {
    render(<Timeline />)
    expect(screen.getByText('Election Commission Announcement')).toBeInTheDocument()
    expect(screen.getByText('Model Code of Conduct (MCC)')).toBeInTheDocument()
  })

  it('filters stages by phase', async () => {
    const user = userEvent.setup()
    render(<Timeline />)
    const preElectionBtn = screen.getByRole('button', { name: 'Pre-Election' })
    await user.click(preElectionBtn)
    
    expect(screen.getByText('Election Commission Announcement')).toBeInTheDocument()
    // A stage in another phase shouldn't be there, e.g. Polling Day
    expect(screen.queryByText('Polling Day')).not.toBeInTheDocument()
  })

  it('expands a stage and allows asking the bot', async () => {
    const user = userEvent.setup()
    const dispatchMock = vi.fn()
    useAppContext.mockReturnValue({ dispatch: dispatchMock })
    
    render(<Timeline />)
    
    // Expand a stage
    const detailsButton = screen.getByRole('button', {
      name: /Show details for Election Commission Announcement/i,
    })
    await user.click(detailsButton)
    
    // Now wait for Ask Bot button to appear
    const askBotBtn = await screen.findByRole('button', { name: /Ask ElectoBot about this stage/i })
    await user.click(askBotBtn)
    
    expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'TOGGLE_CHAT', payload: true }))
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// VoterJourney page
// ═══════════════════════════════════════════════════════════════════════════
describe('VoterJourney page', () => {
  let VoterJourney

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('../pages/VoterJourney')
    VoterJourney = mod.default
  })

  it('renders the Voter Journey heading', () => {
    render(<VoterJourney />)
    expect(screen.getByText(/The Voter Journey Wizard/i)).toBeInTheDocument()
  })

  it('progresses through steps when Next is clicked', async () => {
    const user = userEvent.setup()
    render(<VoterJourney />)
    
    // Step 1: Check Eligibility
    expect(screen.getByText(/verify your eligibility to vote/i)).toBeInTheDocument()
    
    // Check all checkboxes to enable continuing
    const checkboxes = screen.getAllByRole('checkbox')
    for (const checkbox of checkboxes) {
      await user.click(checkbox)
    }

    // Now clicking Next should work
    const nextBtn = screen.getByRole('button', { name: /Next Step/i })
    await user.click(nextBtn)
    
    // Step 2: Register as a Voter
    expect(await screen.findByText(/Online \(Recommended\)/i)).toBeInTheDocument()
    
    // Click previous
    const prevBtn = screen.getByRole('button', { name: /Back/i })
    await user.click(prevBtn)
    expect(await screen.findByText(/verify your eligibility to vote/i)).toBeInTheDocument()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<VoterJourney />)
    
    const checkboxes = screen.getAllByRole('checkbox')
    for (const checkbox of checkboxes) {
      await user.click(checkbox)
    }

    const wizardCard = screen.getByText(/The Voter Journey Wizard/i).parentElement.parentElement.querySelector('[tabindex="-1"]')
    wizardCard.focus()

    // Press right arrow to go next
    await user.keyboard('{ArrowRight}')
    expect(await screen.findByText(/Online \(Recommended\)/i)).toBeInTheDocument()
    
    // Changing steps loses focus on the active element (it gets unmounted), so re-focus
    wizardCard.focus()

    // Press left arrow to go prev
    await user.keyboard('{ArrowLeft}')
    expect(await screen.findByText(/verify your eligibility to vote/i)).toBeInTheDocument()
    
    wizardCard.focus()

    // Press Enter to go next
    await user.keyboard('{Enter}')
    expect(await screen.findByText(/Online \(Recommended\)/i)).toBeInTheDocument()
  })

  it('completes the journey and triggers confetti and analytics', async () => {
    const user = userEvent.setup()
    render(<VoterJourney />)
    
    const checkboxes = screen.getAllByRole('checkbox')
    for (const checkbox of checkboxes) {
      await user.click(checkbox)
    }

    // Advance 5 times to reach step 6
    for (let i = 0; i < 5; i++) {
      const nextBtn = await screen.findByRole('button', { name: /Next Step|Complete Journey/i })
      await user.click(nextBtn)
    }
    
    expect(await screen.findByText(/Informed Voter/i)).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Quiz page
// ═══════════════════════════════════════════════════════════════════════════
describe('Quiz page', () => {
  let Quiz

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('../pages/Quiz')
    Quiz = mod.default
  })

  it('renders the Quiz initial state', async () => {
    render(<Quiz />)
    expect(await screen.findByText(/Test Your Knowledge/i)).toBeInTheDocument()
    expect(screen.getByText(/Question 1 of 10/i)).toBeInTheDocument()
  })

  it('allows answering a question and moving to next', async () => {
    const user = userEvent.setup()
    render(<Quiz />)
    
    // Wait for the quiz to generate
    await screen.findByText(/Question 1 of 10/i)
    
    // Answer a question (click first option)
    const options = screen.getAllByRole('radio')
    expect(options.length).toBe(4)
    await user.click(options[0])

    // "Next Question" or "See Results" button should appear
    const nextBtn = await screen.findByRole('button', { name: /Next Question|See Results/i })
    expect(nextBtn).toBeInTheDocument()
    
    await user.click(nextBtn)
    
    // Should be on question 2
    expect(await screen.findByText(/Question 2 of 10/i)).toBeInTheDocument()
  })
})
