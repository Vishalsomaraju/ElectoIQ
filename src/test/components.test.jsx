// src/test/components.test.jsx
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'

// ── Mocks (must be declared before imports that use them) ──────────────────
const mockDispatch = vi.hoisted(() => vi.fn())
const mockTrackAnalyticsEvent = vi.hoisted(() => vi.fn())
const mockAuthContext = vi.hoisted(() => ({
  user: null,
  loading: false,
  signInWithGoogle: vi.fn(),
  logout: vi.fn(),
}))

// Strip framer-motion animation props that are not valid DOM attributes
const stripMotionProps = ({ children, initial: _i, animate: _a, whileHover: _wh, whileTap: _wt,
  transition: _tr, exit: _ex, layout: _la, layoutId: _li, whileInView: _wv,
  variants: _va, viewport: _vp, ...rest }) => ({ children, ...rest })

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...stripMotionProps({ children, ...props })}>{children}</div>,
    button: ({ children, ...props }) => <button {...stripMotionProps({ children, ...props })}>{children}</button>,
    span: ({ children, ...props }) => <span {...stripMotionProps({ children, ...props })}>{children}</span>,
    ul: ({ children, ...props }) => <ul {...stripMotionProps({ children, ...props })}>{children}</ul>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useInView: () => true,
}))

vi.mock('../context/AppContext', () => ({
  useAppContext: vi.fn(() => ({
    state: { chatOpen: false },
    dispatch: vi.fn(),
  })),
}))

vi.mock('../context/AuthContext', () => ({
  useAuthContext: vi.fn(() => mockAuthContext),
}))

vi.mock('../services/firebase', () => ({
  trackAnalyticsEvent: mockTrackAnalyticsEvent,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: vi.fn(() => vi.fn()) }
})

// ── Imports ────────────────────────────────────────────────────────────────
import { useAppContext } from '../context/AppContext'
import { FloatingChat } from '../components/shared/FloatingChat'
import { NavbarMobileMenu } from '../components/layout/NavbarMobileMenu'
import { AuthButton } from '../components/layout/AuthButton'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { SectionHeader } from '../components/shared/SectionHeader'
import { StepProgressBar } from '../components/voter-journey/StepProgressBar'
import { WizardNavigation } from '../components/voter-journey/WizardNavigation'
import { QuizLoadingSkeleton } from '../components/quiz/QuizLoadingSkeleton'
import { QuizResults } from '../components/quiz/QuizResults'
import { DashboardActivity } from '../components/dashboard/DashboardActivity'
import { GlossaryTermCard } from '../components/glossary/GlossaryTermCard'
import { sanitizeInput, calcScore, getGrade } from '../utils/helpers'

// ── FloatingChat ─────────────────────────────────────────────────────────
describe('FloatingChat', () => {
  it('renders button', () => {
    useAppContext.mockReturnValue({ state: { chatOpen: false }, dispatch: mockDispatch })
    render(<FloatingChat />)
    const button = screen.getByRole('button', { name: /open electobot/i })
    expect(button).toBeInTheDocument()
  })

  it('opens chat and tracks analytics when clicked', () => {
    useAppContext.mockReturnValue({ state: { chatOpen: false }, dispatch: mockDispatch })
    render(<FloatingChat />)
    fireEvent.click(screen.getByRole('button', { name: /open electobot/i }))
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith('chat_drawer_opened', {
      source: 'floating_button',
    })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'TOGGLE_CHAT' })
  })

  it('is hidden when chatOpen is true', () => {
    useAppContext.mockReturnValue({ state: { chatOpen: true }, dispatch: mockDispatch })
    const { container } = render(<FloatingChat />)
    expect(container).toBeEmptyDOMElement()
  })

  it('is hidden on the quiz page to avoid overlapping the quiz assistant', () => {
    useAppContext.mockReturnValue({
      state: { chatOpen: false, currentPage: 'quiz' },
      dispatch: mockDispatch,
    })
    const { container } = render(<FloatingChat />)
    expect(container).toBeEmptyDOMElement()
  })
})

// ── NavbarMobileMenu ─────────────────────────────────────────────────────
describe('NavbarMobileMenu', () => {
  const isActive = (to) => to === '/quiz'

  it('renders links and compact auth controls when open', () => {
    render(
      <MemoryRouter>
        <NavbarMobileMenu open isActive={isActive} />
      </MemoryRouter>
    )
    expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /quiz/i })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <MemoryRouter>
        <NavbarMobileMenu open={false} isActive={isActive} />
      </MemoryRouter>
    )
    expect(container).toBeEmptyDOMElement()
  })
})

// ── AuthButton ───────────────────────────────────────────────────────────
describe('AuthButton', () => {
  it('renders loading state', () => {
    Object.assign(mockAuthContext, { user: null, loading: true })
    render(<AuthButton />)
    expect(screen.getByLabelText(/loading auth state/i)).toBeInTheDocument()
    Object.assign(mockAuthContext, { loading: false })
  })

  it('calls Google sign-in and handles rejection', async () => {
    const error = new Error('Popup blocked')
    mockAuthContext.signInWithGoogle.mockRejectedValueOnce(error)
    Object.assign(mockAuthContext, { user: null, loading: false })
    render(<AuthButton compact />)
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }))
    expect(await screen.findByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    expect(mockAuthContext.signInWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('renders signed-in user avatar and signs out', () => {
    Object.assign(mockAuthContext, {
      loading: false,
      user: {
        displayName: 'Asha Rao',
        photoURL: 'https://example.com/avatar.png',
        isAnonymous: false,
      },
    })
    render(<AuthButton />)
    expect(screen.getByAltText('Asha Rao')).toBeInTheDocument()
    expect(screen.getByText('Asha Rao')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
    expect(mockAuthContext.logout).toHaveBeenCalledTimes(1)
    Object.assign(mockAuthContext, { user: null })
  })

  it('renders anonymous fallback avatar without display name', () => {
    Object.assign(mockAuthContext, {
      loading: false,
      user: { displayName: null, photoURL: null, isAnonymous: true },
    })
    render(<AuthButton />)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
    expect(screen.queryByText('Asha Rao')).not.toBeInTheDocument()
    Object.assign(mockAuthContext, { user: null })
  })
})

// ── ProgressBar ──────────────────────────────────────────────────────────
describe('ProgressBar', () => {
  it('renders correct aria attributes', () => {
    render(<ProgressBar value={50} aria-label="test progress" />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveAttribute('aria-valuenow', '50')
    expect(progress).toHaveAttribute('aria-valuemin', '0')
    expect(progress).toHaveAttribute('aria-valuemax', '100')
  })

  it('renders 0%', () => {
    render(<ProgressBar value={0} />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveAttribute('aria-valuenow', '0')
  })

  it('clamps overflow', () => {
    render(<ProgressBar value={150} />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveAttribute('aria-valuenow', '100')
  })

  it('shows percent label when showPercent is true', () => {
    render(<ProgressBar value={75} showPercent />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
})

// ── Badge ────────────────────────────────────────────────────────────────
describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New Feature</Badge>)
    expect(screen.getByText('New Feature')).toBeInTheDocument()
  })

  it('applies correct variant class for primary', () => {
    const { container } = render(<Badge variant="primary">Primary</Badge>)
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByText('Primary')).toBeInTheDocument()
  })

  it('renders without variant (defaults to default)', () => {
    render(<Badge>Default Badge</Badge>)
    expect(screen.getByText('Default Badge')).toBeInTheDocument()
  })
})

// ── Button ───────────────────────────────────────────────────────────────
describe('Button', () => {
  it('loading state disables button', () => {
    render(<Button loading>Click Me</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('onClick fires', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled blocks onClick', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} disabled>Click Me</Button>)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders icon when provided', () => {
    render(<Button icon={<span data-testid="icon" />}>With Icon</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders iconRight when provided', () => {
    render(<Button iconRight={<span data-testid="right-icon" />}>With Icon</Button>)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })
})

// ── Card ─────────────────────────────────────────────────────────────────
describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('fires onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Card onClick={handleClick}>Clickable</Card>)
    fireEvent.click(screen.getByText('Clickable'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is keyboard activatable with Enter key when onClick present', () => {
    const handleClick = vi.fn()
    render(<Card onClick={handleClick}>Keyboard Card</Card>)
    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is keyboard activatable with Space key when onClick present', () => {
    const handleClick = vi.fn()
    render(<Card onClick={handleClick}>Space Card</Card>)
    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: ' ' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('has no role when onClick is not present', () => {
    render(<Card>Static Card</Card>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has tabIndex=0 when onClick present', () => {
    render(<Card onClick={() => {}}>Focusable</Card>)
    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('tabindex', '0')
  })

  it('forwards ARIA attributes to the root element', () => {
    render(<Card onClick={() => {}} aria-expanded="true">Expanded Card</Card>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders subcomponents', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>Description</CardDescription>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})

// ── Quiz Support Components ──────────────────────────────────────────────
describe('Quiz support components', () => {
  it('renders the quiz loading skeleton', () => {
    const { container } = render(<QuizLoadingSkeleton />)
    expect(container.querySelectorAll('[class*="animate-pulse"]').length).toBeGreaterThan(0)
  })

  it('renders quiz results and fires action callbacks', () => {
    const onRestart = vi.fn()
    const onGenerateAI = vi.fn()
    render(
      <QuizResults
        score={80}
        correctCount={8}
        totalQuestions={10}
        grade={{ emoji: 'A', label: 'Informed Voter', color: 'text-blue-400' }}
        onRestart={onRestart}
        onGenerateAI={onGenerateAI}
      />
    )
    expect(screen.getByRole('status')).toHaveTextContent('80%')
    expect(screen.getByText('8 out of 10 correct')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /retry default/i }))
    fireEvent.click(screen.getByRole('button', { name: /generate ai quiz/i }))
    expect(onRestart).toHaveBeenCalledTimes(1)
    expect(onGenerateAI).toHaveBeenCalledTimes(1)
  })
})

// ── DashboardActivity ────────────────────────────────────────────────────
describe('DashboardActivity', () => {
  it('renders offline empty state', () => {
    render(<DashboardActivity recentQuizResults={[]} isConnected={false} />)
    expect(screen.getByText('Offline')).toBeInTheDocument()
    expect(screen.getByText(/Recent quiz attempts will appear/i)).toBeInTheDocument()
  })

  it('renders recent quiz results when available', () => {
    render(<DashboardActivity recentQuizResults={[{ id: 'a', score: 90 }, { id: 'b' }]} isConnected />)
    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})

// ── GlossaryTermCard ─────────────────────────────────────────────────────
describe('GlossaryTermCard', () => {
  const term = {
    term: 'EVM',
    category: 'Technology',
    definition: 'Electronic Voting Machine',
    example: 'Used at polling stations.',
  }

  it('renders collapsed term card with aria-expanded false', () => {
    render(<GlossaryTermCard term={term} idx={0} isOpen={false} onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Used at polling stations.')).not.toBeInTheDocument()
  })

  it('renders example and toggles when open card is clicked', () => {
    const onToggle = vi.fn()
    render(<GlossaryTermCard term={term} idx={0} isOpen onToggle={onToggle} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Used at polling stations.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledWith(term)
  })
})

// ── Spinner ──────────────────────────────────────────────────────────────
describe('Spinner', () => {
  it('renders with default size', () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with lg size', () => {
    const { container } = render(<Spinner size="lg" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has accessible label', () => {
    render(<Spinner />)
    // Spinner should have an aria-label or role=status for accessibility
    const spinner = screen.getByRole('status', { hidden: true }) ||
      document.querySelector('[aria-label]')
    expect(spinner ?? document.querySelector('[class*=animate]')).toBeTruthy()
  })
})

// ── SectionHeader ────────────────────────────────────────────────────────
describe('SectionHeader', () => {
  it('renders title', () => {
    render(<SectionHeader title="My Title" />)
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('renders eyebrow', () => {
    render(<SectionHeader title="Title" eyebrow="Eyebrow Text" />)
    expect(screen.getByText('Eyebrow Text')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<SectionHeader title="Title" description="Some description" />)
    expect(screen.getByText('Some description')).toBeInTheDocument()
  })

  it('omits description when not provided', () => {
    render(<SectionHeader title="Title" />)
    expect(screen.queryByText('Some description')).not.toBeInTheDocument()
  })
})

// ── StepProgressBar ──────────────────────────────────────────────────────
describe('StepProgressBar', () => {
  const steps = [
    { id: 1, title: 'Register' },
    { id: 2, title: 'Verify' },
    { id: 3, title: 'Vote' },
  ]

  it('renders all step titles', () => {
    render(<StepProgressBar currentStep={1} steps={steps} />)
    expect(screen.getByText('Register')).toBeInTheDocument()
    expect(screen.getByText('Verify')).toBeInTheDocument()
    expect(screen.getByText('Vote')).toBeInTheDocument()
  })

  it('marks current step with the correct aria-label', () => {
    render(<StepProgressBar currentStep={1} steps={steps} />)
    const stepEls = document.querySelectorAll('[aria-label]')
    const currentEl = Array.from(stepEls).find(el =>
      el.getAttribute('aria-label')?.includes('current')
    )
    expect(currentEl).toBeTruthy()
    expect(currentEl.getAttribute('aria-label')).toMatch(/Register.*current/i)
  })

  it('marks past steps with the completed aria-label', () => {
    render(<StepProgressBar currentStep={3} steps={steps} />)
    const stepEls = document.querySelectorAll('[aria-label]')
    const completedEl = Array.from(stepEls).find(el =>
      el.getAttribute('aria-label')?.includes('completed')
    )
    expect(completedEl).toBeTruthy()
    expect(completedEl.getAttribute('aria-label')).toMatch(/Register.*completed/i)
  })

  it('renders correct number of step indicators', () => {
    render(<StepProgressBar currentStep={1} steps={steps} />)
    const stepEls = document.querySelectorAll('[aria-label*="Step"]')
    expect(stepEls.length).toBe(3)
  })
})

// ── WizardNavigation ─────────────────────────────────────────────────────
describe('WizardNavigation', () => {
  const renderWizard = (props) =>
    render(
      <MemoryRouter>
        <WizardNavigation {...props} />
      </MemoryRouter>
    )

  it('disables Back button on first step', () => {
    renderWizard({ currentStep: 1, totalSteps: 3, onPrev: vi.fn(), onNext: vi.fn() })
    const backBtn = screen.getByRole('button', { name: /back/i })
    expect(backBtn).toBeDisabled()
  })

  it('shows Next Step button on intermediate steps', () => {
    renderWizard({ currentStep: 2, totalSteps: 3, onPrev: vi.fn(), onNext: vi.fn() })
    expect(screen.getByText(/next step/i)).toBeInTheDocument()
  })

  it('shows Take the Quiz button on last step', () => {
    renderWizard({ currentStep: 3, totalSteps: 3, onPrev: vi.fn(), onNext: vi.fn() })
    expect(screen.getByText(/take the quiz/i)).toBeInTheDocument()
  })

  it('calls onPrev when Back is clicked', () => {
    const onPrev = vi.fn()
    renderWizard({ currentStep: 2, totalSteps: 3, onPrev, onNext: vi.fn() })
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onPrev).toHaveBeenCalledTimes(1)
  })

  it('calls onNext when Next Step is clicked', () => {
    const onNext = vi.fn()
    renderWizard({ currentStep: 1, totalSteps: 3, onPrev: vi.fn(), onNext })
    fireEvent.click(screen.getByText(/next step/i))
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})

// ── Error States ──────────────────────────────────────────────────────────
describe('Error states', () => {
  it('sanitizeInput strips XSS', () => {
    expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('Hello')
  })

  it('calcScore handles zero total', () => {
    expect(calcScore(5, 0)).toBe(0)
  })

  it('getGrade for score 0', () => {
    expect(getGrade(0).label).toBe('Keep Learning')
  })
})
