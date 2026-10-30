import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ToastProvider from '../../components/ToastProvider'
import AllClubsOverviewPage from './AllClubsOverviewPage'

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

function renderPage(user) {
  const store = configureStore({
    reducer: {
      auth: () => ({ user }),
    },
  })

  return render(
    <Provider store={store}>
      <ToastProvider>
        <MemoryRouter>
          <AllClubsOverviewPage />
        </MemoryRouter>
      </ToastProvider>
    </Provider>,
  )
}

describe('AllClubsOverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const sampleClubs = [
    {
      id: 'c1',
      name: 'Creative Arts Society',
      description: 'Painting, sculpture, and more.',
      category: 'Cultural',
      status: 'APPROVED',
      memberCount: 45,
    },
    {
      id: 'c2',
      name: 'Tech Innovators',
      description: 'Building cool things with code.',
      category: 'Tech',
      status: 'APPROVED',
      memberCount: 92,
    },
    {
      id: 'c3',
      name: 'Campus Chess League',
      description: 'Strategy, tournaments and blitz sessions.',
      category: 'Academic',
      status: 'PENDING',
      memberCount: 15,
    },
  ]

  it('renders modern oversight header, stat cards, and club cards in grid layout', async () => {
    const api = (await import('../../api/axios')).default
    api.get.mockResolvedValueOnce({ data: sampleClubs })

    const user = { id: 'u-fa', name: 'Dr. Advisor', role: 'FACULTY_ADVISOR' }
    renderPage(user)

    expect(await screen.findByText('All Clubs & Societies')).toBeInTheDocument()
    expect(screen.getByText('Faculty Oversight & Society Governance')).toBeInTheDocument()
    expect(screen.getByText('Total Registered Societies')).toBeInTheDocument()

    // Assert club titles are rendered
    expect(screen.getByText('Creative Arts Society')).toBeInTheDocument()
    expect(screen.getByText('Tech Innovators')).toBeInTheDocument()
    expect(screen.getByText('Campus Chess League')).toBeInTheDocument()

    // Assert Manage & Oversee action button for Faculty Advisor
    const overseeButtons = screen.getAllByRole('button', { name: /manage & oversee/i })
    expect(overseeButtons.length).toBe(3)
  })

  it('filters clubs dynamically when typing in search input', async () => {
    const userEventSetup = userEvent.setup()
    const api = (await import('../../api/axios')).default
    api.get.mockResolvedValueOnce({ data: sampleClubs })

    const user = { id: 'u-fa', name: 'Dr. Advisor', role: 'FACULTY_ADVISOR' }
    renderPage(user)

    expect(await screen.findByText('Tech Innovators')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/search clubs by name/i)
    await userEventSetup.type(searchInput, 'Chess')

    expect(screen.getByText('Campus Chess League')).toBeInTheDocument()
    expect(screen.queryByText('Tech Innovators')).not.toBeInTheDocument()
    expect(screen.queryByText('Creative Arts Society')).not.toBeInTheDocument()
  })

  it('filters clubs by status chip when clicked', async () => {
    const userEventSetup = userEvent.setup()
    const api = (await import('../../api/axios')).default
    api.get.mockResolvedValueOnce({ data: sampleClubs })

    const user = { id: 'u-fa', name: 'Dr. Advisor', role: 'FACULTY_ADVISOR' }
    renderPage(user)

    expect(await screen.findByText('Campus Chess League')).toBeInTheDocument()

    const pendingChip = screen.getByRole('button', { name: 'Pending' })
    await userEventSetup.click(pendingChip)

    expect(screen.getByText('Campus Chess League')).toBeInTheDocument()
    expect(screen.queryByText('Tech Innovators')).not.toBeInTheDocument()
    expect(screen.queryByText('Creative Arts Society')).not.toBeInTheDocument()
  })
})
