import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Calendar } from 'lucide-react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import StatCard from './StatCard'

describe('StatCard', () => {
  it('renders label, value, trend, and trend label matching mockup 4', () => {
    render(
      <StatCard
        label="Active Events This Term"
        value="42 Scheduled"
        icon={Calendar}
        trend="↑ 12%"
        trendLabel="since last month"
        tone="indigo"
      />,
    )

    expect(screen.getByText('Active Events This Term')).toBeInTheDocument()
    expect(screen.getByText('42 Scheduled')).toBeInTheDocument()
    expect(screen.getByText('↑ 12%')).toBeInTheDocument()
    expect(screen.getByText('since last month')).toBeInTheDocument()
  })

  it('renders as a clickable link when "to" prop is passed', () => {
    render(
      <MemoryRouter>
        <StatCard
          label="My Clubs"
          value={3}
          to="/clubs"
        />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/clubs')
    expect(screen.getByText('My Clubs')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('handles click callback when passed', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <StatCard
        label="Pending Approvals"
        value={2}
        onClick={handleClick}
      />,
    )

    await user.click(screen.getByText('Pending Approvals'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
