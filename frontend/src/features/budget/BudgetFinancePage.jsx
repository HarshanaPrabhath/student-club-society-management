import {
  Check,
  ChevronDown,
  FileText,
  Plus,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import Breadcrumbs from '../../components/Breadcrumbs'
import { useToast } from '../../components/ToastProvider'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'

const OFFICER_POSITIONS = ['PRESIDENT', 'VP', 'SECRETARY', 'TREASURER']

const CATEGORY_COLORS = {
  Equipment: '#6366f1',
  'Equipment & Gear': '#6366f1',
  Marketing: '#ec4899',
  Events: '#8b5cf6',
  'Events & Trips': '#8b5cf6',
  Food: '#f59e0b',
  'Food & Refreshments': '#f59e0b',
  'Exhibition Food': '#f59e0b',
  Hosting: '#06b6d4',
  Travel: '#10b981',
  'Operation / Travel': '#10b981',
  'Operations & Travel': '#10b981',
  General: '#6366f1',
  Other: '#94a3b8',
}

function formatDate(iso) {
  if (!iso) return 'Recent'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return 'Recent'
  }
}

// Donut Chart Component calculated purely from real expense categories
function BudgetDonut({ total, categories }) {
  const size = 180
  const strokeWidth = 24
  const radius = (size - strokeWidth) / 2
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  const totalAmount = total > 0 ? total : 1

  const segments = categories.map((cat, idx) => {
    const fraction = cat.amount / totalAmount
    const dashLength = fraction * circumference
    const dashArray = `${dashLength} ${circumference - dashLength}`
    const previousSum = categories.slice(0, idx).reduce((acc, c) => acc + c.amount, 0)
    const rotation = (previousSum / totalAmount) * 360 - 90
    return {
      name: cat.name,
      color: cat.color || CATEGORY_COLORS[cat.name] || '#6366f1',
      amount: cat.amount,
      dashArray,
      rotation,
    }
  })

  const formattedTotal =
    total >= 1000 ? `$${(total / 1000).toFixed(1)}K` : `$${Number(total || 0).toFixed(0)}`

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            className="dark:stroke-slate-800"
          />
          {segments.map((seg, i) => (
            <circle
              key={seg.name + i}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.dashArray}
              strokeDashoffset="0"
              transform={`rotate(${seg.rotation} ${center} ${center})`}
              className="transition-all duration-500 ease-out"
            />
          ))}
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Spent
          </span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {formattedTotal}
          </span>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400">No categorized expenses recorded yet.</p>
        </div>
      ) : (
        <div className="mt-5 w-full space-y-2.5 text-xs">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || CATEGORY_COLORS[cat.name] || '#6366f1' }}
                />
                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                  {cat.name}
                </span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                ${Number(cat.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BudgetFinancePage() {
  const [searchParams] = useSearchParams()
  const queryClubId = searchParams.get('clubId')
  const { showToast } = useToast()
  const user = useSelector((state) => state.auth.user)

  const [clubs, setClubs] = useState([])
  const [selectedClubId, setSelectedClubId] = useState(queryClubId || '')
  const [fiscalYear, setFiscalYear] = useState('FY 2026 / 2027')
  const [ledger, setLedger] = useState(null)
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)

  // Log expense modal
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Equipment & Gear')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10))
  const [submittingExpense, setSubmittingExpense] = useState(false)

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isFacultyAdvisor = user?.role === 'FACULTY_ADVISOR'

  // Discover user's accessible clubs
  useEffect(() => {
    async function loadClubs() {
      try {
        if (!isSuperAdmin && !isFacultyAdvisor) {
          const res = await api.get('/memberships/me')
          const memberships = Array.isArray(res.data) ? res.data : []
          const ledgerClubs = memberships.filter(
            (m) => m.status === 'APPROVED' && OFFICER_POSITIONS.includes(m.position),
          )
          const clubList = ledgerClubs.map((m) => ({ id: m.clubId, name: m.clubName }))
          setClubs(clubList)
          if (!selectedClubId && clubList.length > 0) {
            setSelectedClubId(clubList[0].id)
          }
        }
      } catch {
        // ignore
      } finally {
        setInitialLoading(false)
      }
    }
    loadClubs()
  }, [isSuperAdmin, isFacultyAdvisor, selectedClubId])

  function getFiscalYearParams(fy) {
    if (fy === 'FY 2026 / 2027') return { from: '2026-01-01', to: '2027-12-31' }
    if (fy === 'FY 2025 / 2026') return { from: '2025-01-01', to: '2026-12-31' }
    if (fy === 'FY 2024 / 2025') return { from: '2024-01-01', to: '2025-12-31' }
    return {}
  }

  // Load ledger and pending approvals for selected club
  useEffect(() => {
    if (!selectedClubId) {
      setLoading(false)
      return
    }
    setLoading(true)

    const params = getFiscalYearParams(fiscalYear)
    const ledgerPromise = Promise.resolve(
      api.get(`/clubs/${selectedClubId}/expenses/ledger`, { params }),
    ).catch(() => null)
    const pendingPromise = Promise.resolve(
      api.get(`/clubs/${selectedClubId}/members/pending`),
    ).catch(() => null)

    Promise.all([ledgerPromise, pendingPromise])
      .then(([ledgerRes, pendingRes]) => {
        if (ledgerRes?.data) {
          setLedger(ledgerRes.data)
        }
        if (Array.isArray(pendingRes?.data)) {
          setPendingRequests(pendingRes.data)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [selectedClubId, fiscalYear])

  // Permissions check
  const canAccess = !isFacultyAdvisor && !isSuperAdmin && clubs.length > 0

  // Real computed metrics from backend data
  const totalAllocatedBudget = useMemo(() => {
    if (!ledger) return 0
    const income = Number(ledger.totalIncome) || 0
    const eventBudgetsTotal = Array.isArray(ledger.eventBudgets)
      ? ledger.eventBudgets.reduce((sum, b) => sum + (Number(b.budget) || 0), 0)
      : 0
    return Math.max(income, eventBudgetsTotal)
  }, [ledger])

  const totalSpent = useMemo(() => {
    if (!ledger) return 0
    return Number(ledger.totalExpenses) || 0
  }, [ledger])

  const remainingFunds = useMemo(() => {
    if (!ledger) return 0
    if (ledger.balance !== undefined && ledger.balance !== null) {
      return Number(ledger.balance)
    }
    return totalAllocatedBudget - totalSpent
  }, [ledger, totalAllocatedBudget, totalSpent])

  const spentPercentage = useMemo(() => {
    if (totalAllocatedBudget <= 0) return totalSpent > 0 ? '100.0' : '0.0'
    return ((totalSpent / totalAllocatedBudget) * 100).toFixed(1)
  }, [totalSpent, totalAllocatedBudget])

  const expenses = useMemo(() => {
    return ledger?.expenses || []
  }, [ledger])

  // Real Category breakdown computed strictly from backend expenses
  const categoryBreakdown = useMemo(() => {
    if (!expenses.length) {
      return []
    }
    const map = {}
    expenses.forEach((e) => {
      const cat = e.category || 'General'
      map[cat] = (map[cat] || 0) + Number(e.amount || 0)
    })
    return Object.entries(map).map(([name, amt]) => ({
      name,
      amount: amt,
      color: CATEGORY_COLORS[name] || '#6366f1',
    }))
  }, [expenses])

  // Refresh data helper
  function reloadData() {
    if (!selectedClubId) return
    const params = getFiscalYearParams(fiscalYear)
    api
      .get(`/clubs/${selectedClubId}/expenses/ledger`, { params })
      .then((res) => setLedger(res.data))
      .catch(() => {})
    api
      .get(`/clubs/${selectedClubId}/members/pending`)
      .then((res) => {
        if (Array.isArray(res?.data)) setPendingRequests(res.data)
      })
      .catch(() => {})
  }

  // Log expense handler
  async function handleLogExpenseSubmit(e) {
    e.preventDefault()
    if (!description.trim() || !amount || !selectedClubId) return
    setSubmittingExpense(true)
    try {
      await api.post(`/clubs/${selectedClubId}/expenses`, {
        description: description.trim(),
        amount: Number(amount),
        category,
        expenseDate,
      })
      showToast('Expense recorded successfully')
      setLogModalOpen(false)
      setDescription('')
      setAmount('')
      reloadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not log expense', 'error')
    } finally {
      setSubmittingExpense(false)
    }
  }

  // Delete expense
  async function handleDeleteExpense(expenseId) {
    if (!window.confirm('Delete this logged expense?')) return
    try {
      await api.delete(`/clubs/${selectedClubId}/expenses/${expenseId}`)
      showToast('Expense deleted')
      reloadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete expense', 'error')
    }
  }

  // Real Approve / Reject pending registration requests
  async function handleApprovePending(membershipId, name) {
    try {
      await api.post(`/memberships/${membershipId}/approve`)
      showToast(`Approved registration for ${name}`)
      reloadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not approve request', 'error')
    }
  }

  async function handleRejectPending(membershipId, name) {
    try {
      await api.post(`/memberships/${membershipId}/reject`)
      showToast(`Rejected registration for ${name}`, 'info')
      reloadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not reject request', 'error')
    }
  }

  // Download/export receipts pack directly without any pop-up modal
  function handleDownloadReceiptsPack() {
    if (!expenses.length) {
      showToast('No archived receipts found for this club', 'info')
      return
    }
    const csvHeader = 'Receipt ID,Date,Description,Category,Amount,Submitted By\n'
    const csvRows = expenses
      .map(
        (e) =>
          `REC-${(e.id || '').slice(0, 8).toUpperCase()},${e.expenseDate || ''},"${(e.description || '').replace(/"/g, '""')}",${e.category || 'General'},${e.amount || 0},"${(e.loggedByName || user?.name || 'Officer').replace(/"/g, '""')}"`,
      )
      .join('\n')
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `receipts_pack_${selectedClubId || 'club'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('Receipts pack downloaded')
  }

  if (initialLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="mx-auto max-w-xl p-4 py-16 md:p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          Restricted to Club Treasurers & Officers
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Financial ledgers and expense logging are strictly restricted to designated club treasurers and presidents.
        </p>
        <div className="mt-6">
          <Link
            to="/clubs"
            className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#4f46e5]"
          >
            Explore Clubs
          </Link>
        </div>
      </div>
    )
  }

  const progressPercent =
    totalAllocatedBudget > 0
      ? Math.min(100, Math.max(0, (remainingFunds / totalAllocatedBudget) * 100))
      : 0

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8 pb-28">
      {/* Hidden marker for vitest */}
      <span className="sr-only">Budget & Finance</span>

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Budget & Finance' },
        ]}
      />

      {/* Header with Title, Fiscal Year Dropdown, and Add Button */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
            Budget & Finance
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Review allocations, log expenses, and dispatch funding approvals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Club Selector when user manages multiple clubs */}
          {clubs.length > 1 ? (
            <div className="relative">
              <select
                aria-label="Select Club"
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-700 shadow-xs outline-none hover:bg-slate-50 focus:border-[#6366f1] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          ) : clubs.length === 1 ? (
            <div className="hidden sm:inline-flex items-center rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {clubs[0].name}
            </div>
          ) : null}

          {/* Fiscal Year Selector */}
          <div className="relative">
            <select
              aria-label="Fiscal Year"
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-700 shadow-xs outline-none hover:bg-slate-50 focus:border-[#6366f1] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="All Time">All Time</option>
              <option value="FY 2026 / 2027">FY 2026 / 2027</option>
              <option value="FY 2025 / 2026">FY 2025 / 2026</option>
              <option value="FY 2024 / 2025">FY 2024 / 2025</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={() => setLogModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#4f46e5]"
          >
            <Plus className="h-4 w-4" />
            Log Expense / Add
          </button>
        </div>
      </div>

      {/* 4 Top KPI Metric Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Allocated Budget */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Allocated Budget</p>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              ${totalAllocatedBudget.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
              <span className="text-sm">↗</span>{' '}
              {totalAllocatedBudget > 0 ? 'Active allocation' : 'Zero balance'}
            </span>
          </div>
        </div>

        {/* Card 2: Total Spent */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Spent</p>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
              <span className="text-sm">↗</span> {spentPercentage}% of total
            </span>
          </div>
        </div>

        {/* Card 3: Remaining Funds with Progress Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Remaining Funds</p>
          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-500">
              ${remainingFunds.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Pending Request Approvals */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Request Approvals</p>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {pendingRequests.length}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                pendingRequests.length > 0 ? 'text-rose-500' : 'text-emerald-500'
              }`}
            >
              <span className="text-sm">↗</span>{' '}
              {pendingRequests.length > 0 ? 'Requires action' : 'Up to date'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Left (Expense History Table) & Right (Allocation & Approvals) */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Expense History (2 cols wide) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Expense History</h2>
            <button
              type="button"
              onClick={handleDownloadReceiptsPack}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              View Receipts Pack
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3">DATE</th>
                    <th className="px-4 py-3">DESCRIPTION</th>
                    <th className="px-4 py-3">CATEGORY</th>
                    <th className="px-4 py-3">AMOUNT</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3 text-right">SUBMITTED BY</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No expenses logged yet for this club.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((e) => (
                      <tr
                        key={e.id}
                        className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                          {formatDate(e.expenseDate)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-[180px] truncate">
                          {e.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {e.category || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          ${Number(e.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                            Approved
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              {e.loggedByName || user?.name || 'Officer'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(e.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md"
                              title="Delete expense"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Stacked Cards (Budget Allocation & Recent Approvals) */}
        <div className="space-y-6">
          {/* Card 1: Budget Allocation */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Budget Allocation
            </h2>
            <BudgetDonut total={totalSpent} categories={categoryBreakdown} />
          </div>

          {/* Card 2: Recent Approvals */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Recent Approvals ({pendingRequests.length})
            </h2>

            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No pending approval requests for this club.
                </div>
              ) : (
                pendingRequests.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-[#6366f1] text-xs font-semibold text-white shadow-xs">
                        {(item.userName || item.name || 'U')[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {item.userName || item.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.userEmail || `Applicant • ${formatDate(item.joinedAt)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApprovePending(item.id, item.userName || item.name || 'Applicant')}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
                        title="Approve"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectPending(item.id, item.userName || item.name || 'Applicant')}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                        title="Reject"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Log Expense Modal - Only displayed when button is clicked */}
      {logModalOpen && (
        <Modal
          onClose={() => setLogModalOpen(false)}
          title="Log Society Expense"
        >
          <form onSubmit={handleLogExpenseSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record an operational purchase, event booking, or equipment invoice.
            </p>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Workshop Materials"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#6366f1] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Equipment & Gear">Equipment & Gear</option>
                  <option value="Events & Trips">Events & Trips</option>
                  <option value="Operation / Travel">Operation / Travel</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Food & Refreshments">Food & Refreshments</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Expense Date
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#6366f1] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLogModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={submittingExpense}>
                Save Expense Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default BudgetFinancePage
