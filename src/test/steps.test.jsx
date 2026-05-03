import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Step3VerifyList } from '../components/voter-journey/steps/Step3VerifyList'
import { Step4VoterID } from '../components/voter-journey/steps/Step4VoterID'
import { Step5PollingDay } from '../components/voter-journey/steps/Step5PollingDay'
import { Step6Complete } from '../components/voter-journey/steps/Step6Complete'

describe('Voter Journey Steps', () => {
  it('renders Step3VerifyList', () => {
    render(<Step3VerifyList />)
    expect(screen.getByText(/verify that your name is on the Electoral Roll/i)).toBeInTheDocument()
  })

  it('renders Step4VoterID', () => {
    render(<Step4VoterID />)
    expect(screen.getByText(/Approved alternate IDs/i)).toBeInTheDocument()
  })

  it('renders Step5PollingDay', () => {
    render(<Step5PollingDay />)
    expect(screen.getByText(/VVPAT/i)).toBeInTheDocument()
  })

  it('renders Step6Complete', () => {
    render(<Step6Complete />)
    expect(screen.getByText(/You're an Informed Voter/i)).toBeInTheDocument()
  })
})
