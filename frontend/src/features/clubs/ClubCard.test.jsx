import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ToastProvider from '../../components/ToastProvider'
import ClubCard from './ClubCard'

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

function renderCard(props) {
  return render(
    <ToastProvider>
      <MemoryRouter>
        <ClubCard {...props} />
      </MemoryRouter>
    </ToastProvider>,
  )
}

describe('ClubCard', () => {
  const sampleClub = {
    id: 'club-1',
    name: 'Robotics & AI Society',
    description: 'Autonomous exploration, machine learning & design.',
    category: 'TECH',
    memberCount: 124,
    joinPolicy: 'OPEN',
    membershipFee: 0,
    logoB64: null,
  }

  it('renders club title, description, member count and category badge matching mockup', () => {
    renderCard({
      club: sampleClub,
      user: { id: 'u1', role: 'STUDENT' },
      membership: null,
    })

    expect(screen.getByText('Robotics & AI Society')).toBeInTheDocument()
    expect(screen.getByText('Autonomous exploration, machine learning & design.')).toBeInTheDocument()
    expect(screen.getByText('124 Members')).toBeInTheDocument()
    expect(screen.getByText('TECH')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /join club/i })).toBeInTheDocument()
  })

  it('allows normal student to join club on button click', async () => {
    const axios = (await import('../../api/axios')).default
    axios.post.mockResolvedValueOnce({ data: { status: 'APPROVED' } })

    const user = userEvent.setup()
    renderCard({
      club: sampleClub,
      user: { id: 'u1', role: 'STUDENT' },
      membership: null,
    })

    const joinBtn = screen.getByRole('button', { name: /join club/i })
    await user.click(joinBtn)

    expect(axios.post).toHaveBeenCalledWith('/clubs/club-1/join')
    expect(await screen.findByText('Joined')).toBeInTheDocument()
  })

  it('displays Joined state when user is already an approved member', () => {
    renderCard({
      club: sampleClub,
      user: { id: 'u1', role: 'STUDENT' },
      membership: { status: 'APPROVED' },
    })

    expect(screen.getByText('Joined')).toBeInTheDocument()
  })

  it('displays Requested state when membership is pending approval', () => {
    renderCard({
      club: sampleClub,
      user: { id: 'u1', role: 'STUDENT' },
      membership: { status: 'PENDING' },
    })

    expect(screen.getByText('Requested')).toBeInTheDocument()
  })
})
