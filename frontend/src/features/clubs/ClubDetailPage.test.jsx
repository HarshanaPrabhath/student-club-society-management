import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ToastProvider from '../../components/ToastProvider'
import ClubDetailPage from './ClubDetailPage'

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

function renderDetailPage(clubId, user) {
  const store = configureStore({
    reducer: {
      auth: () => ({ user }),
      clubs: () => ({ items: [], status: 'succeeded' }),
    },
  })

  return render(
    <Provider store={store}>
      <ToastProvider>
        <MemoryRouter initialEntries={[`/clubs/${clubId}`]}>
          <Routes>
            <Route path="/clubs/:clubId" element={<ClubDetailPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </Provider>,
  )
}

describe('ClubDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const sampleClub = {
    id: 'club-fa-1',
    name: 'Robotics & AI Society',
    description: 'Autonomous exploration and machine learning.',
    category: 'TECH',
    status: 'APPROVED',
    joinPolicy: 'OPEN',
    membershipFee: 0,
    memberCount: 25,
  }

  it('renders successfully for Faculty Advisor with Faculty Oversight badge and does not call members/pending', async () => {
    const api = (await import('../../api/axios')).default
    api.get.mockImplementation((url) => {
      if (url === '/clubs/club-fa-1') return Promise.resolve({ data: sampleClub })
      if (url === '/clubs/club-fa-1/members') return Promise.resolve({ data: [] })
      if (url === '/clubs/club-fa-1/announcements') return Promise.resolve({ data: [] })
      if (url === '/events') return Promise.resolve({ data: [] })
      if (url === '/analytics/clubs/club-fa-1') return Promise.resolve({ data: null })
      return Promise.resolve({ data: [] })
    })

    const advisorUser = {
      id: 'adv-99',
      name: 'Dr. Faculty Advisor',
      email: 'advisor@university.edu',
      role: 'FACULTY_ADVISOR',
    }

    renderDetailPage('club-fa-1', advisorUser)

    // Assert club header and Faculty Oversight badge (renders Shield without ReferenceError)
    expect(await screen.findByRole('heading', { name: 'Robotics & AI Society' })).toBeInTheDocument()
    expect(screen.getByText('Faculty Oversight')).toBeInTheDocument()

    // Assert Faculty Advisor can watch members via Members tab
    expect(screen.getByRole('tab', { name: /^members/i })).toBeInTheDocument()

    // Assert members/pending was NEVER called for faculty advisor (preventing 403 Forbidden)
    expect(api.get).not.toHaveBeenCalledWith('/clubs/club-fa-1/members/pending')
  })

  it('renders successfully for Super Admin with System Administrator badge and can create events', async () => {
    const api = (await import('../../api/axios')).default
    api.get.mockImplementation((url) => {
      if (url === '/clubs/club-sa-1') return Promise.resolve({ data: sampleClub })
      if (url === '/clubs/club-sa-1/members') return Promise.resolve({ data: [] })
      if (url === '/clubs/club-sa-1/announcements') return Promise.resolve({ data: [] })
      if (url === '/events') return Promise.resolve({ data: [] })
      if (url === '/analytics/clubs/club-sa-1') return Promise.resolve({ data: null })
      if (url === '/clubs/club-sa-1/members/pending') return Promise.resolve({ data: [] })
      return Promise.resolve({ data: [] })
    })

    const adminUser = {
      id: 'admin-1',
      name: 'Super Admin',
      email: 'admin@university.edu',
      role: 'SUPER_ADMIN',
    }

    renderDetailPage('club-sa-1', adminUser)

    expect(await screen.findByRole('heading', { name: 'Robotics & AI Society' })).toBeInTheDocument()
    // Verify System Administrator badge is displayed
    expect(screen.getByText('System Administrator')).toBeInTheDocument()

    // Verify Super Admin can watch members via Members tab
    expect(screen.getByRole('tab', { name: /^members/i })).toBeInTheDocument()

    // Verify Super Admin cannot join or see Join Club button
    expect(screen.queryByRole('button', { name: /join club/i })).not.toBeInTheDocument()
  })
})
