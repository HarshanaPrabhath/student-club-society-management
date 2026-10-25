import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import api from '../../api/axios'
import ToastProvider from '../../components/ToastProvider'
import certificatesReducer from './certificatesSlice'
import CertificatesPage from './CertificatesPage'

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

function renderPage(initialItems = []) {
  api.get.mockImplementation((url) => {
    if (url === '/certificates/me') {
      return Promise.resolve({ data: initialItems })
    }
    return Promise.resolve({ data: {} })
  })

  const store = configureStore({
    reducer: {
      certificates: certificatesReducer,
    },
    preloadedState: {
      certificates: {
        items: initialItems,
        status: 'succeeded',
        error: null,
      },
    },
  })

  return render(
    <Provider store={store}>
      <ToastProvider>
        <MemoryRouter>
          <CertificatesPage />
        </MemoryRouter>
      </ToastProvider>
    </Provider>,
  )
}

describe('CertificatesPage', () => {
  it('renders empty state when student has no certificates', async () => {
    renderPage([])
    expect(await screen.findByText(/no certificates earned yet/i)).toBeInTheDocument()
  })

  it('renders certificate cards with verification code and download button', async () => {
    renderPage([
      {
        id: 'cert-1',
        clubId: 'club-1',
        clubName: 'Robotics & AI Society',
        issuedAt: '2026-05-15T10:00:00Z',
        verificationCode: 'ROBO-2026-X99',
      },
    ])

    expect(await screen.findByText('Robotics & AI Society')).toBeInTheDocument()
    expect(screen.getByText('ROBO-2026-X99')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /verify/i })).toHaveAttribute(
      'href',
      '/verify-certificate/ROBO-2026-X99',
    )
  })
})
