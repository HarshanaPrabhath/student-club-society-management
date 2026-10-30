import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ToastProvider from '../../components/ToastProvider'
import ClubSettingsPage from './ClubSettingsPage'

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}))

function renderWithProviders(ui, { initialState } = {}) {
  const store = configureStore({
    reducer: {
      auth: (state = { user: null }) => state,
    },
    preloadedState: initialState,
  })
  return render(
    <Provider store={store}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/clubs/c1/settings']}>
          <Routes>
            <Route path="/clubs/:clubId/settings" element={ui} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </Provider>,
  )
}

describe('ClubSettingsPage', () => {
  it('renders Club Settings page with parameters form and platform live preview', async () => {
    const axios = (await import('../../api/axios')).default
    axios.get.mockImplementation((url) => {
      if (url.includes('/clubs/c1')) {
        return Promise.resolve({
          data: {
            id: 'c1',
            name: 'Photography Club',
            category: 'Arts & Culture',
            description: 'Capturing campus moments through lens and creativity since 2018.',
            logoB64: null,
          },
        })
      }
      return Promise.resolve({ data: [] })
    })

    renderWithProviders(<ClubSettingsPage />, {
      initialState: {
        auth: { user: { id: 'dave-1', name: 'Dave', role: 'STUDENT' } },
      },
    })

    expect(await screen.findByRole('heading', { level: 1, name: /club settings/i })).toBeInTheDocument()
    expect(await screen.findByText(/club profile parameters/i)).toBeInTheDocument()
    expect(await screen.findByText(/platform live preview/i)).toBeInTheDocument()
    expect(await screen.findByText(/save profile configuration/i)).toBeInTheDocument()
  })

  it('renders Send Announcement section when Announcements & Alerts tab is clicked', async () => {
    const axios = (await import('../../api/axios')).default
    axios.get.mockImplementation((url) => {
      if (url.includes('/announcements')) {
        return Promise.resolve({
          data: [
            {
              id: 'a1',
              authorName: 'Sarah Jenkins',
              content: 'Welcome everyone to the new semester!',
              createdAt: new Date().toISOString(),
            },
          ],
        })
      }
      if (url.includes('/clubs/c1')) {
        return Promise.resolve({
          data: {
            id: 'c1',
            name: 'Photography Club',
            category: 'Arts & Culture',
          },
        })
      }
      return Promise.resolve({ data: [] })
    })

    const { userEvent } = await import('@testing-library/user-event')
    const userEv = userEvent.setup()

    renderWithProviders(<ClubSettingsPage />, {
      initialState: {
        auth: { user: { id: 'dave-1', name: 'Dave', role: 'STUDENT' } },
      },
    })

    const announcementsTab = await screen.findByRole('button', { name: /announcements & alerts/i })
    await userEv.click(announcementsTab)

    expect(await screen.findByRole('heading', { level: 2, name: /send club announcement/i })).toBeInTheDocument()
    expect(await screen.findByPlaceholderText(/type your announcement message here/i)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /broadcast announcement/i })).toBeInTheDocument()
    expect(await screen.findByText(/welcome everyone to the new semester!/i)).toBeInTheDocument()
  })
})
