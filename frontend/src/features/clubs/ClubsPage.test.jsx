import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ToastProvider from '../../components/ToastProvider'
import clubsReducer from './clubsSlice'
import ClubsPage from './ClubsPage'

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

function renderWithProviders(ui, { initialState } = {}) {
  const store = configureStore({
    reducer: {
      clubs: clubsReducer,
      auth: (state = { user: null }) => state,
    },
    preloadedState: initialState,
  })
  return render(
    <Provider store={store}>
      <ToastProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </ToastProvider>
    </Provider>,
  )
}

describe('ClubsPage', () => {
  it('shows the empty state when there are no clubs', async () => {
    const axios = (await import('../../api/axios')).default
    axios.get.mockResolvedValueOnce({ data: [] })

    renderWithProviders(<ClubsPage />)

    expect(await screen.findByText(/no clubs available yet/i)).toBeInTheDocument()
  })

  it('renders club cards once the fetch resolves', async () => {
    const axios = (await import('../../api/axios')).default
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 'c1', name: 'Chess Club', category: 'Games', description: 'Play chess', logoB64: null },
      ],
    })

    renderWithProviders(<ClubsPage />)

    expect(await screen.findByText('Chess Club')).toBeInTheDocument()
    expect(screen.getByText('Games')).toBeInTheDocument()
  })

  it('does not show create-club button for normal students', async () => {
    const axios = (await import('../../api/axios')).default
    axios.get.mockResolvedValueOnce({ data: [] })
    renderWithProviders(<ClubsPage />, {
      initialState: { auth: { user: { role: 'STUDENT', name: 'Student' } } },
    })

    await screen.findByText(/no clubs available yet/i)
    expect(screen.queryByRole('button', { name: /create club/i })).not.toBeInTheDocument()
  })

  it('opens the create-club modal on button click for super admin', async () => {
    const axios = (await import('../../api/axios')).default
    axios.get.mockResolvedValueOnce({ data: [] })
    renderWithProviders(<ClubsPage />, {
      initialState: { auth: { user: { role: 'SUPER_ADMIN', name: 'Admin' } } },
    })
    const user = userEvent.setup()

    await screen.findByText(/no clubs yet/i)
    await user.click(screen.getByRole('button', { name: /create club/i }))

    expect(screen.getByRole('heading', { name: /create a club/i })).toBeInTheDocument()
  })
})
