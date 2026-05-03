import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'

vi.mock('framer-motion', () => ({
  motion: { 
    div: ({ children, ...p }) => { const { initial: _i, animate: _a, exit: _e, whileHover: _wh, whileTap: _wt, ...r } = p; return <div {...r}>{children}</div> },
    button: ({ children, ...p }) => { const { initial: _i, animate: _a, exit: _e, whileHover: _wh, whileTap: _wt, ...r } = p; return <button {...r}>{children}</button> }
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useInView: () => true,
}))
vi.mock('../context/AppContext', () => ({
  useAppContext: () => ({
    state: { chatOpen: false, suggestedQuestions: [], chatContext: null, currentPage: 'home' },
    dispatch: vi.fn(),
  })
}))

vi.mock('../services/firebase', () => ({
  trackAnalyticsEvent: vi.fn(),
}))

describe('Accessibility audits — WCAG AA', () => {
  it('FloatingChat button has no violations', async () => {
    const { FloatingChat } = await import('../components/shared/FloatingChat')
    const { container } = render(<FloatingChat />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  }, 15000)

  it('ProgressBar has no violations', async () => {
    const { ProgressBar } = await import('../components/ui/ProgressBar')
    const { container } = render(<ProgressBar value={60} max={100} label="Score" showPercent />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Badge has no violations', async () => {
    const { Badge } = await import('../components/ui/Badge')
    const { container } = render(<Badge variant="success">Passed</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Button has no violations', async () => {
    const { Button } = await import('../components/ui/Button')
    const { container } = render(<Button>Click me</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('SectionHeader has no violations', async () => {
    const { SectionHeader } = await import('../components/shared/SectionHeader')
    const { container } = render(
      <SectionHeader eyebrow="Category" title="Main heading" description="Some description" />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Spinner has no violations', async () => {
    const { Spinner } = await import('../components/ui/Spinner')
    const { container } = render(<Spinner />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
