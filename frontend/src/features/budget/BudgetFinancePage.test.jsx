import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ToastProvider from '../../components/ToastProvider'
import BudgetFinancePage from './BudgetFinancePage'

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
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
        <MemoryRouter initialEntries={['/budget?clubId=c1']}>
          <Routes>
            <Route path="/budget" element={ui} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </Provider>,
  )
}

describe('BudgetFinancePage', () => {
  it('restricts access for normal students with no officer clubs', async () => {
    const axios = (await import('../../api/axios')).default
    axios.get.mockImplementation((url) => {
      if (url === '/memberships/me') return Promise.resolve({ data: [] })
      return Promise.resolve({ data: {} })
    })

    renderWithProviders(<BudgetFinancePage />, {
      initialState: {
        auth: { user: { id: 's1', name: 'Student Sam', role: 'STUDENT' } },
      },
    })

    expect(await screen.findByText(/restricted to club treasurers & officers/i)).toBeInTheDocument()
  })

  it('restricts access for Super Admin', async () => {
    const axios = (await import('../../api/axios')).default
    axios.get.mockImplementation(() => Promise.resolve({ data: [] }))

    renderWithProviders(<BudgetFinancePage />, {
      initialState: {
        auth: { user: { id: 'sa-1', name: 'Super Admin', role: 'SUPER_ADMIN' } },
      },
    })

    expect(await screen.findByText(/restricted to club treasurers & officers/i)).toBeInTheDocument()
  })

  it('renders Budget & Finance dashboard with 4 metric cards and allocation donut for president', async () => {
    const axios = (await import('../../api/axios')).default
    axios.get.mockImplementation((url) => {
      if (url === '/memberships/me') {
        return Promise.resolve({
          data: [{ clubId: 'c1', clubName: 'Tech Innovators', position: 'PRESIDENT', status: 'APPROVED' }],
        })
      }
      if (url.includes('/expenses/ledger')) {
        return Promise.resolve({
          data: {
            totalIncome: 5000,
            totalExpenses: 3240,
            balance: 1760,
            expenses: [
              {
                id: 'e1',
                description: 'Studio Light Kit',
                amount: 850,
                category: 'Equipment',
                expenseDate: '2026-10-10',
                loggedByName: 'President Dave',
              },
            ],
            eventBudgets: [],
          },
        })
      }
      if (url.includes('/members/pending')) {
        return Promise.resolve({
          data: [
            { id: 'p1', userName: 'Bob Smith', joinedAt: '2026-10-15T00:00:00Z', position: 'MEMBER' },
          ],
        })
      }
      return Promise.resolve({ data: [] })
    })

    renderWithProviders(<BudgetFinancePage />, {
      initialState: {
        auth: { user: { id: 'dave-1', name: 'President Dave', role: 'STUDENT' } },
      },
    })

    expect(await screen.findByRole('heading', { level: 1, name: /budget & finance/i })).toBeInTheDocument()
    expect(await screen.findByText(/total allocated budget/i)).toBeInTheDocument()
    expect(await screen.findByText(/expense history/i)).toBeInTheDocument()
    expect(await screen.findByText('Studio Light Kit')).toBeInTheDocument()
    expect(await screen.findByText(/budget allocation/i)).toBeInTheDocument()
  })
})
