import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import membershipsReducer from './membershipsSlice'
import MemberDirectoryPage from './MemberDirectoryPage'

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

function renderWithProviders(ui, { initialState } = {}) {
  const store = configureStore({
    reducer: {
      memberships: membershipsReducer,
      auth: (state = { user: null }) => state,
    },
    preloadedState: initialState,
  })
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clubs/club-1/members']}>
        <Routes>
          <Route path="/clubs/:clubId/members" element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('MemberDirectoryPage', () => {
  it('restricts access for normal students who are not club officers', async () => {
    const axios = (await import('../../api/axios')).default
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 'm1', userId: 'other-user', userName: 'Alice', clubName: 'Tech Club', position: 'PRESIDENT', status: 'APPROVED' },
        { id: 'm2', userId: 'student-1', userName: 'Normal Student', clubName: 'Tech Club', position: 'MEMBER', status: 'APPROVED' },
      ],
    })

    renderWithProviders(<MemberDirectoryPage />, {
      initialState: {
        auth: { user: { id: 'student-1', name: 'Normal Student', role: 'STUDENT' } },
      },
    })

    expect(await screen.findByText(/restricted to club officers/i)).toBeInTheDocument()
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  it('allows access for club president and displays member directory', async () => {
    const axios = (await import('../../api/axios')).default
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 'm1', userId: 'pres-1', userName: 'President Bob', clubName: 'Tech Club', position: 'PRESIDENT', status: 'APPROVED' },
        { id: 'm2', userId: 'student-1', userName: 'Charlie', clubName: 'Tech Club', position: 'MEMBER', status: 'APPROVED' },
      ],
    })

    renderWithProviders(<MemberDirectoryPage />, {
      initialState: {
        auth: { user: { id: 'pres-1', name: 'President Bob', role: 'STUDENT' } },
      },
    })

    expect(await screen.findByText(/member directory/i)).toBeInTheDocument()
    expect(await screen.findByText('President Bob')).toBeInTheDocument()
    expect(await screen.findByText('Charlie')).toBeInTheDocument()
  })
})
