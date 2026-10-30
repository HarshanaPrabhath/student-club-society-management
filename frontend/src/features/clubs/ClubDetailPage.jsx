import {
  AlertTriangle,
  Archive,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
  Settings,
  Shield,
  SlidersHorizontal,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useToast } from '../../components/ToastProvider'
import ChartCard from '../../components/charts/ChartCard'
import BarChartJS from '../../components/charts/chartjs/BarChartJS'
import { monthlyCounts } from '../../components/charts/chartUtils'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import AdvisorRequestModal from '../advisor/AdvisorRequestModal'
import CreateEventModal from '../events/CreateEventModal'
import EventCard from '../events/EventCard'
import { joinClub } from './clubsSlice'
import AnnouncementComments from './AnnouncementComments'
import ClubResources from './ClubResources'
import CreateClubModal from './CreateClubModal'
import LogExpenseModal from './LogExpenseModal'

const OFFICER_POSITIONS = ['PRESIDENT', 'VP', 'SECRETARY', 'TREASURER']
const LEDGER_POSITIONS = ['PRESIDENT', 'TREASURER']
const RECORDS_POSITIONS = ['PRESIDENT', 'SECRETARY']
const ALL_POSITIONS = ['PRESIDENT', 'VP', 'SECRETARY', 'TREASURER', 'MEMBER']
const POSITION_TONE = { PRESIDENT: 'brand', VP: 'info', SECRETARY: 'warning', TREASURER: 'success', MEMBER: 'neutral' }

const POSITION_LABEL = {
  PRESIDENT: 'President',
  VP: 'Vice President',
  SECRETARY: 'Secretary',
  TREASURER: 'Treasurer',
  MEMBER: 'Member',
}

const inputClass =
  'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition-fast focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-border-dark dark:bg-surface-dark dark:text-ink-dark dark:focus:ring-brand-500/20'

async function downloadBlob(path, filename) {
  const res = await api.get(path, { responseType: 'blob' })
  const url = window.URL.createObjectURL(res.data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

function MemberAvatar({ name, className = 'h-9 w-9' }) {
  return (
    <span
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-[#6366f1] dark:bg-indigo-500/15 dark:text-indigo-300 ring-2 ring-white dark:ring-[#181b24]`}
    >
      {name?.[0]?.toUpperCase() || 'U'}
    </span>
  )
}

function SectionCard({ title, action, children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24] ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

function Donut({ value, total }) {
  const r = 42
  const c = 2 * Math.PI * r
  const pct = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="12" className="stroke-slate-100 dark:stroke-slate-800" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${pct * c} ${c}`}
          className="stroke-[#6366f1]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900 dark:text-white">{Math.round(pct * 100)}%</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">of income spent</span>
      </div>
    </div>
  )
}

function getCategoryGradient(category = '') {
  const cat = (category || '').toLowerCase()
  if (cat.includes('tech') || cat.includes('code') || cat.includes('ai') || cat.includes('cyber')) {
    return 'from-blue-600 via-indigo-600 to-cyan-500'
  }
  if (cat.includes('art') || cat.includes('cultur') || cat.includes('photo') || cat.includes('design')) {
    return 'from-purple-600 via-fuchsia-600 to-pink-500'
  }
  if (cat.includes('sport') || cat.includes('hik') || cat.includes('adventur')) {
    return 'from-emerald-600 via-teal-600 to-lime-500'
  }
  if (cat.includes('academ') || cat.includes('debat') || cat.includes('sci')) {
    return 'from-amber-600 via-orange-600 to-yellow-500'
  }
  return 'from-[#6366f1] via-[#7c5cfc] to-[#4f46e5]'
}

function formatEventTime(startIso, endIso) {
  if (!startIso) return 'TBA'
  try {
    const start = new Date(startIso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    if (!endIso) return start
    const end = new Date(endIso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    return `${start} - ${end}`
  } catch {
    return 'TBA'
  }
}

function ClubDetailPage() {
  const { clubId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const { showToast } = useToast()

  const [club, setClub] = useState(null)
  const [members, setMembers] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState(null)
  const [ledger, setLedger] = useState(null)
  const [reports, setReports] = useState([])
  const [joinStatus, setJoinStatus] = useState(null)
  const [myPendingStatus, setMyPendingStatus] = useState(false)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showLogExpense, setShowLogExpense] = useState(false)
  const [showEditClub, setShowEditClub] = useState(false)
  const [tab, setTab] = useState('about')
  const [announcementDraft, setAnnouncementDraft] = useState('')
  const [postingAnnouncement, setPostingAnnouncement] = useState(false)
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [showAdvisorRequestModal, setShowAdvisorRequestModal] = useState(false)
  const adminMenuRef = useRef(null)
  const adminMenuButtonRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target) &&
        adminMenuButtonRef.current &&
        !adminMenuButtonRef.current.contains(event.target)
      ) {
        setShowAdminMenu(false)
      }
    }
    if (showAdminMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAdminMenu])

  useEffect(() => {
    api.get(`/clubs/${clubId}`).then((res) => setClub(res.data)).catch(() => {})
    api.get(`/clubs/${clubId}/members`).then((res) => setMembers(res.data)).catch(() => {})
    api.get(`/clubs/${clubId}/announcements`).then((res) => setAnnouncements(res.data)).catch(() => {})
    api.get('/events', { params: { clubId } }).then((res) => setEvents(res.data)).catch(() => {})
    api.get(`/analytics/clubs/${clubId}`).then((res) => setStats(res.data)).catch(() => {})
  }, [clubId])

  const myMembership = members.find((m) => m.userId === user?.id)
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const isFacultyAdvisor = user?.role === 'FACULTY_ADVISOR'
  const canDeleteClub = isSuperAdmin
  const isPresident = myMembership?.position === 'PRESIDENT' || isSuperAdmin
  const isOfficer = OFFICER_POSITIONS.includes(myMembership?.position) || isSuperAdmin
  const canManageLedger =
    !isSuperAdmin && !isFacultyAdvisor && LEDGER_POSITIONS.includes(myMembership?.position)
  const canManageRecords = RECORDS_POSITIONS.includes(myMembership?.position) || isSuperAdmin
  const canJoinClub = user?.role === 'STUDENT'

  // Only club presidents and super admins have permission to list pending member requests
  useEffect(() => {
    if (!clubId) return
    if (isPresident || canDeleteClub) {
      api
        .get(`/clubs/${clubId}/members/pending`)
        .then((res) => setPendingRequests(Array.isArray(res.data) ? res.data : []))
        .catch(() => {})
    } else {
      setPendingRequests([])
    }
  }, [clubId, isPresident, canDeleteClub])

  // Normal students check their own pending status via /memberships/me
  useEffect(() => {
    if (!clubId || !user?.id || user?.role !== 'STUDENT' || myMembership) return
    api
      .get('/memberships/me')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : []
        const hasPending = list.some((m) => m.clubId === clubId && m.status === 'PENDING')
        setMyPendingStatus(hasPending)
      })
      .catch(() => {})
  }, [clubId, user?.id, user?.role, myMembership])

  const effectiveMembershipStatus =
    joinStatus === 'LEFT'
      ? null
      : joinStatus || (myMembership ? 'APPROVED' : (myPendingStatus || pendingRequests.some((p) => p.userId === user?.id)) ? 'PENDING' : null)

  async function handleAdvisorReviewEvent(e, eventId, approve) {
    let reason
    if (!approve) {
      reason = window.prompt('Reason for rejecting (optional):')
      if (reason === null) return
    }
    try {
      await api.post(`/events/${eventId}/${approve ? 'approve' : 'reject'}`, approve ? undefined : { reason })
      showToast(approve ? 'Event proposal approved 🎉' : 'Event proposal rejected')
      api.get('/events', { params: { clubId } }).then((res) => setEvents(res.data)).catch(() => {})
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to review event', 'error')
    }
  }

  useEffect(() => {
    if (!canManageLedger) return
    api.get(`/clubs/${clubId}/expenses/ledger`).then((res) => setLedger(res.data)).catch(() => {})
  }, [clubId, canManageLedger])

  useEffect(() => {
    if (!isPresident) return
    api.get(`/clubs/${clubId}/comment-reports`).then((res) => setReports(res.data)).catch(() => {})
  }, [clubId, isPresident])

  async function handleResolveReport(reportId, action) {
    if (action === 'DELETE_COMMENT' && !window.confirm('Remove this comment for everyone?')) return
    try {
      await api.post(`/clubs/${clubId}/comment-reports/${reportId}/resolve`, { action })
      setReports((prev) => prev.filter((r) => r.id !== reportId))
      showToast(action === 'DELETE_COMMENT' ? 'Comment removed' : 'Report dismissed')
    } catch (e) {
      showToast(e.response?.data?.message || 'Something went wrong', 'error')
    }
  }

  async function handleClaimPresidency() {
    if (!window.confirm('Take over as President? This only works once the current President has been marked as graduated.')) return
    try {
      await api.post(`/clubs/${clubId}/claim-presidency`)
      const res = await api.get(`/clubs/${clubId}/members`)
      setMembers(res.data)
      showToast('You are now the President')
    } catch (e) {
      showToast(e.response?.data?.message || 'Something went wrong', 'error')
    }
  }

  async function handleJoin() {
    if (!canJoinClub) return
    const fee = Number(club?.membershipFee) || 0
    if (fee > 0) {
      if (!window.confirm(`This club charges a membership fee of $${fee}. Pay it and join?`)) return
      try {
        await api.post('/payments', { type: 'MEMBERSHIP', referenceId: clubId, amount: fee })
      } catch (e) {
        if (e.response?.status !== 409) {
          showToast(e.response?.data?.message || 'Payment failed', 'error')
          return
        }
      }
    }
    const result = await dispatch(joinClub(clubId))
    if (joinClub.fulfilled.match(result)) {
      setJoinStatus(result.payload.status)
      showToast(result.payload.status === 'APPROVED' ? 'Joined club 🎉' : 'Join request sent — awaiting approval')
      const res = await api.get(`/clubs/${clubId}/members`)
      setMembers(res.data)
    } else {
      showToast(result.payload, 'error')
    }
  }

  async function handleLeave() {
    if (!window.confirm(`Leave ${club?.name || 'this club'}? You will be removed from the active member list.`)) return
    try {
      await api.delete(`/clubs/${clubId}/join`)
      setJoinStatus('LEFT')
      const res = await api.get(`/clubs/${clubId}/members`)
      setMembers(res.data)
      showToast('You left the club')
    } catch (e) {
      showToast(e.response?.data?.message || 'Something went wrong', 'error')
    }
  }

  async function handleArchiveClub() {
    if (!window.confirm('Archive this club? It is hidden from browsing, upcoming events are cancelled and members are notified.')) return
    try {
      const { data } = await api.post(`/clubs/${clubId}/archive`)
      setClub(data)
      showToast('Club archived')
    } catch (e) {
      showToast(e.response?.data?.message || 'Something went wrong', 'error')
    }
  }

  async function handleDeleteClub() {
    if (!window.confirm('Delete this club permanently? This action cannot be undone.')) return
    try {
      await api.delete(`/clubs/${clubId}`)
      showToast('Club deleted')
      navigate('/clubs')
    } catch (e) {
      showToast(e.response?.data?.message || 'Something went wrong', 'error')
    }
  }

  async function handleRemoveMember(membershipId, name, isPresidentTarget = false) {
    const confirmMsg = isPresidentTarget
      ? `Remove President ${name} from the club? This will vacate the presidency.`
      : `Remove ${name} from the club?`
    if (!window.confirm(confirmMsg)) return
    try {
      await api.delete(`/memberships/${membershipId}`)
      const res = await api.get(`/clubs/${clubId}/members`)
      setMembers(res.data)
      showToast(isPresidentTarget ? 'President removed' : 'Member removed')
    } catch (e) {
      showToast(e.response?.data?.message || 'Something went wrong', 'error')
    }
  }

  async function handleAssignPosition(membershipId, position) {
    try {
      await api.put(`/memberships/${membershipId}/position`, { position })
      const res = await api.get(`/clubs/${clubId}/members`)
      setMembers(res.data)
      showToast('Position updated')
    } catch (e) {
      showToast(e.response?.data?.message || 'Something went wrong', 'error')
    }
  }

  async function handlePostAnnouncement(e) {
    e.preventDefault()
    if (!announcementDraft.trim()) return
    setPostingAnnouncement(true)
    try {
      const { data } = await api.post(`/clubs/${clubId}/announcements`, { content: announcementDraft.trim() })
      setAnnouncements((prev) => [data, ...prev])
      setAnnouncementDraft('')
      showToast('Announcement posted')
    } catch (e2) {
      showToast(e2.response?.data?.message || 'Something went wrong', 'error')
    } finally {
      setPostingAnnouncement(false)
    }
  }

  async function handleDeleteAnnouncement(announcementId) {
    try {
      await api.delete(`/clubs/${clubId}/announcements/${announcementId}`)
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId))
      showToast('Announcement deleted')
    } catch (e) {
      showToast(e.response?.data?.message || 'Something went wrong', 'error')
    }
  }

  async function handleDeleteExpense(expenseId) {
    try {
      await api.delete(`/clubs/${clubId}/expenses/${expenseId}`)
      setLedger((prev) => {
        const removed = prev.expenses.find((e) => e.id === expenseId)
        return {
          ...prev,
          totalExpenses: (Number(prev.totalExpenses) - Number(removed.amount)).toString(),
          balance: (Number(prev.balance) + Number(removed.amount)).toString(),
          expenses: prev.expenses.filter((e) => e.id !== expenseId),
        }
      })
      showToast('Expense deleted')
    } catch (e) {
      showToast(e.response?.data?.message || 'Something went wrong', 'error')
    }
  }

  async function handleImportMembers(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const text = await file.text()
    const emails = text
      .split(/\r?\n|,/)
      .map((line) => line.trim())
      .filter(Boolean)
    if (emails.length === 0) return
    try {
      const { data } = await api.post(`/clubs/${clubId}/members/import`, { emails })
      const res = await api.get(`/clubs/${clubId}/members`)
      setMembers(res.data)
      showToast(
        `Imported ${data.imported} member(s)` +
          (data.skipped.length > 0 ? `, skipped ${data.skipped.length}` : ''),
      )
    } catch (e2) {
      showToast(e2.response?.data?.message || 'Something went wrong', 'error')
    }
  }

  async function reviewRequest(membershipId, approve) {
    try {
      await api.post(`/memberships/${membershipId}/${approve ? 'approve' : 'reject'}`)
      setPendingRequests((prev) => prev.filter((m) => m.id !== membershipId))
      showToast(approve ? 'Join request approved' : 'Join request rejected')
      if (approve) {
        const res = await api.get(`/clubs/${clubId}/members`)
        setMembers(res.data)
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Something went wrong', 'error')
    }
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      showToast('Club link copied to clipboard!')
    } else {
      showToast('Link copied!')
    }
  }

  // Derive club officers
  const officers = useMemo(() => {
    return members
      .filter((m) => OFFICER_POSITIONS.includes(m.position))
      .sort((a, b) => OFFICER_POSITIONS.indexOf(a.position) - OFFICER_POSITIONS.indexOf(b.position))
  }, [members])

  // Derive upcoming events
  const startOfToday = new Date(new Date().toDateString())
  const futureEvents = events
    .filter((e) => new Date(e.eventDate) >= startOfToday && !e.cancelled)
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))

  const totalIncome = Number(ledger?.totalIncome) || 0
  const totalExpenses = Number(ledger?.totalExpenses) || 0
  const spendingByMonth = monthlyCounts(ledger?.expenses || [], (e) => `${e.expenseDate}T12:00:00`, {
    before: 5,
    getValue: (e) => Number(e.amount) || 0,
  })

  const spendingChartData = useMemo(() => {
    return {
      labels: spendingByMonth.map((m) => m.label),
      datasets: [
        {
          label: 'Total Expenses ($)',
          data: spendingByMonth.map((m) => m.value),
          backgroundColor: '#6366f1',
          hoverBackgroundColor: '#4f46e5',
          borderRadius: 6,
        },
      ],
    }
  }, [spendingByMonth])

  const eventEngagementChartData = useMemo(() => {
    if (!stats?.events || stats.events.length === 0) return null
    const recentEvents = stats.events.slice(-5)
    return {
      labels: recentEvents.map((e) => (e.title.length > 15 ? e.title.slice(0, 13) + '...' : e.title)),
      datasets: [
        {
          label: 'RSVP / Going',
          data: recentEvents.map((e) => e.going),
          backgroundColor: '#6366f1',
          borderRadius: 4,
        },
        {
          label: 'Attended',
          data: recentEvents.map((e) => e.attended),
          backgroundColor: '#10b981',
          borderRadius: 4,
        },
        {
          label: 'No-Shows',
          data: recentEvents.map((e) => e.noShows),
          backgroundColor: '#f59e0b',
          borderRadius: 4,
        },
      ],
    }
  }, [stats?.events])

  // Dynamic real tags from club attributes
  const realClubTags = useMemo(() => {
    if (!club) return []
    const tags = [club.category]
    if (club.joinPolicy === 'APPROVAL_REQUIRED') tags.push('Application Required')
    else tags.push('Open Membership')

    if (Number(club.membershipFee) > 0) tags.push(`Paid ($${club.membershipFee})`)
    else tags.push('Free Membership')

    if (club.certificateThreshold) tags.push(`Certificate (${club.certificateThreshold} events)`)
    if (club.status === 'APPROVED') tags.push('Verified Society')
    return tags
  }, [club])

  // Dynamic next meeting / event schedule from real events
  const nextEvent = futureEvents[0]

  const canViewMembers = isOfficer || isSuperAdmin || isFacultyAdvisor
  const activeTab = (tab === 'budget' && !canManageLedger) || (tab === 'members' && !canViewMembers) ? 'about' : tab

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'events', label: `Events (${events.length})` },
    ...(canViewMembers ? [{ id: 'members', label: `Members (${members.length})` }] : []),
    { id: 'gallery', label: 'Gallery' },
    ...(canManageLedger && ledger ? [{ id: 'budget', label: 'Budget' }] : []),
  ]

  if (!club) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-8 space-y-4">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    )
  }

  const gradient = getCategoryGradient(club.category)

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 space-y-6">
      {/* Breadcrumb Top */}
      <div className="flex items-center gap-2 text-xs md:text-sm">
        <Link to="/" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 font-medium">
          Home
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <Link
          to={isFacultyAdvisor ? '/advisor/clubs' : '/clubs'}
          className="text-slate-400 hover:text-slate-600 dark:text-slate-500 font-medium"
        >
          Clubs
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="font-semibold text-slate-900 dark:text-white truncate">{club.name}</span>
      </div>

      {/* Main Club Hero Card */}
      <div className="relative z-20 rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
        {/* Cover Photo / Gradient */}
        <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden rounded-t-2xl bg-slate-100 dark:bg-slate-800">
          {club.logoB64 && club.logoB64.startsWith('data:image') ? (
            <img src={club.logoB64} alt={club.name} className="h-full w-full object-cover" />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-r ${gradient} p-6 text-white`}>
              <span className="text-4xl sm:text-6xl font-black tracking-widest opacity-25 uppercase select-none">
                {club.name}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Bottom Banner Content */}
        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Icon + Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-700 dark:bg-[#12151e]">
              <span className="text-2xl font-black text-[#6366f1] tracking-tight">
                {club.name
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{club.name}</h1>
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
                  {club.category || 'General'}
                </span>
              </div>
              <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                {club.description || 'Student club and society.'}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Club Admin Pill (for student officers) */}
            {isOfficer && !isSuperAdmin && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#6366f1] dark:bg-indigo-950/40 dark:text-indigo-300">
                Club Admin
              </span>
            )}

            {/* Role Oversight Badges or Student Join/Leave Actions */}
            {isFacultyAdvisor ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200/80 bg-purple-50 px-3.5 py-2 text-xs md:text-sm font-semibold text-purple-700 shadow-xs dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                  <Shield className="h-4 w-4" />
                  <span>Faculty Oversight</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAdvisorRequestModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs md:text-sm font-semibold text-amber-700 shadow-xs transition-all hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Report to Admin</span>
                </button>
              </div>
            ) : isSuperAdmin ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50 px-3.5 py-2 text-xs md:text-sm font-semibold text-[#6366f1] shadow-xs dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                <Shield className="h-4 w-4" />
                <span>System Administrator</span>
              </span>
            ) : effectiveMembershipStatus === 'APPROVED' ? (
              <button
                type="button"
                onClick={isPresident ? undefined : handleLeave}
                title={isPresident ? 'Club President' : 'Click to leave club'}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6366f1] px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#4f46e5]"
              >
                <span>Joined</span>
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            ) : effectiveMembershipStatus === 'PENDING' ? (
              <button
                type="button"
                disabled
                className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs md:text-sm font-semibold text-amber-800 opacity-90 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              >
                Requested
              </button>
            ) : canJoinClub && !club.archived ? (
              <button
                type="button"
                onClick={handleJoin}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6366f1] px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#4f46e5]"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Join Club</span>
              </button>
            ) : null}

            {/* Share Link */}
            <button
              type="button"
              onClick={handleShare}
              title="Share club link"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4" />
            </button>

            {/* Admin Management Dropdown Button */}
            {(isOfficer || user?.role === 'SUPER_ADMIN') && (
              <div className="relative">
                <button
                  ref={adminMenuButtonRef}
                  type="button"
                  aria-expanded={showAdminMenu}
                  aria-haspopup="true"
                  onClick={() => setShowAdminMenu((o) => !o)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs md:text-sm font-semibold transition-all duration-200 shadow-xs ${
                    showAdminMenu
                      ? 'border-[#6366f1] bg-indigo-50 text-[#6366f1] ring-2 ring-[#6366f1]/20 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#181b24] dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4 text-[#6366f1]" />
                  <span>Manage</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      showAdminMenu ? 'rotate-180 text-[#6366f1]' : 'text-slate-400'
                    }`}
                  />
                </button>

                {showAdminMenu && (
                  <div
                    ref={adminMenuRef}
                    className="absolute right-0 z-50 mt-2 w-72 sm:w-80 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl shadow-slate-900/10 backdrop-blur-md transition-all dark:border-slate-800 dark:bg-[#181b24] dark:shadow-black/40"
                  >
                    {/* Menu Header */}
                    <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Club Management
                        </span>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-[#6366f1] dark:bg-indigo-950/60 dark:text-indigo-300">
                          {isSuperAdmin ? 'Super Admin' : isPresident ? 'President' : 'Officer'}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {club.name}
                      </p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {/* Edit Club */}
                      {isPresident && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdminMenu(false)
                            setShowEditClub(true)
                          }}
                          className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 group"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#6366f1] dark:bg-indigo-950/50 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                            <Pencil className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              Edit Club Details
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              Name, description, fees & join policy
                            </p>
                          </div>
                        </button>
                      )}

                      {/* Club Settings */}
                      {isPresident && (
                        <Link
                          to={`/clubs/${clubId}/settings`}
                          onClick={() => setShowAdminMenu(false)}
                          className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 group"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 group-hover:scale-105 transition-transform">
                            <Settings className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              Club Settings & Preferences
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              Full parameters, meeting times & alerts
                            </p>
                          </div>
                        </Link>
                      )}

                      {/* Manage Members Directory */}
                      {canViewMembers && (
                        <Link
                          to={`/clubs/${clubId}/members`}
                          onClick={() => setShowAdminMenu(false)}
                          className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 group"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              Member Directory
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              View roster, positions & join requests
                            </p>
                          </div>
                        </Link>
                      )}

                      {/* Create Event */}
                      {(isOfficer || isSuperAdmin) && !club.archived && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdminMenu(false)
                            setShowCreateEvent(true)
                          }}
                          className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 group"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 group-hover:scale-105 transition-transform">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              Create New Event
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              Schedule meetings, workshops & meetups
                            </p>
                          </div>
                        </button>
                      )}

                      {/* Log Expense */}
                      {canManageLedger && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdminMenu(false)
                            setShowLogExpense(true)
                          }}
                          className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 group"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 group-hover:scale-105 transition-transform">
                            <Wallet className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              Record Expense
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              Log club budget transactions & receipts
                            </p>
                          </div>
                        </button>
                      )}

                      {/* Claim Presidency */}
                      {isOfficer && !isPresident && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdminMenu(false)
                            handleClaimPresidency()
                          }}
                          className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30 group"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 group-hover:scale-105 transition-transform">
                            <UserPlus className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                              Claim Presidency
                            </p>
                            <p className="text-[11px] text-indigo-500/80 dark:text-indigo-400/80 truncate">
                              Assume club leadership if vacant
                            </p>
                          </div>
                        </button>
                      )}

                      {/* Archive / Unarchive Club */}
                      {isPresident && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdminMenu(false)
                            handleArchiveClub()
                          }}
                          className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all hover:bg-amber-50 dark:hover:bg-amber-950/30 group"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 group-hover:scale-105 transition-transform">
                            <Archive className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                              {club.archived ? 'Reactivate Society' : 'Archive Society'}
                            </p>
                            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 truncate">
                              {club.archived ? 'Allow new events and members' : 'Freeze registrations and scheduling'}
                            </p>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Danger Zone: Delete Club */}
                    {canDeleteClub && (
                      <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdminMenu(false)
                            handleDeleteClub()
                          }}
                          className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/30 dark:text-rose-400 group"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300 group-hover:scale-105 transition-transform">
                            <Trash2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                              Delete Society
                            </p>
                            <p className="text-[11px] text-rose-400/90 dark:text-rose-500 truncate">
                              Permanently remove club and data
                            </p>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {club.archived && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-400">
          This club is archived — it no longer accepts new members or event scheduling.
        </p>
      )}

      {/* Tabs Navigation Bar */}
      <div role="tablist" className="flex gap-2 overflow-x-auto border-b border-slate-200/80 dark:border-slate-800/80">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === t.id
                ? 'border-[#6366f1] text-[#6366f1] dark:border-[#818cf8] dark:text-[#818cf8]'
                : 'border-transparent text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ABOUT */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (68%) */}
          <div className="space-y-6 lg:col-span-8">
            {/* Card 1: About Our Club */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">About Our Club</h2>
              <p className="mt-3 text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                {club.description || 'No description provided for this club.'}
              </p>
            </div>

            {/* Card 2: Club Officers */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Club Officers</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {officers.length > 0 ? (
                  officers.map((officer) => (
                    <div
                      key={officer.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/60 dark:bg-slate-900/40"
                    >
                      <MemberAvatar name={officer.userName} className="h-10 w-10 ring-1 ring-slate-200 dark:ring-slate-700" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {officer.userName}
                        </p>
                        <p className="truncate text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          {POSITION_LABEL[officer.position] || officer.position}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 col-span-3">No officers appointed yet.</p>
                )}
              </div>
            </div>

            {/* Card 3: Tags & Core Details */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Club Details &amp; Tags</h2>
              <div className="mt-3.5 flex flex-wrap gap-2">
                {realClubTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800/80 dark:text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Announcements Feed in About Tab */}
            <SectionCard title="Club Announcements">
              {isOfficer && (
                <form onSubmit={handlePostAnnouncement} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={announcementDraft}
                    onChange={(e) => setAnnouncementDraft(e.target.value)}
                    placeholder="Post an update to the club feed..."
                    className={`${inputClass} flex-1`}
                  />
                  <Button type="submit" disabled={postingAnnouncement || !announcementDraft.trim()}>
                    Post
                  </Button>
                </form>
              )}
              {announcements.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500">No announcements posted yet.</p>
              )}
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-900/40"
                  >
                    <MemberAvatar name={a.authorName} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{a.authorName}</p>
                      <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">{a.content}</p>
                      <AnnouncementComments clubId={clubId} announcementId={a.id} isPresident={isPresident} />
                    </div>
                    {(a.authorId === user?.id || isPresident) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(a.id)}
                        className="shrink-0 text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Event Engagement & Turnout Analytics with Chart.js */}
            {eventEngagementChartData && (
              <SectionCard title="Event Turnout & Attendance Analytics">
                <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                  Attendance vs RSVP breakdown across recent society sessions
                </p>
                <BarChartJS
                  data={eventEngagementChartData}
                  height={220}
                  ariaLabel="Event turnout and attendance chart"
                />
              </SectionCard>
            )}

            {/* Reported comments for president */}
            {isPresident && reports.length > 0 && (
              <SectionCard title={`Reported Comments (${reports.length})`}>
                <div className="space-y-3">
                  {reports.map((r) => (
                    <div key={r.id} className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-900/40">
                      <p className="text-xs text-slate-800 dark:text-slate-200">
                        <span className="font-semibold">{r.commentAuthorName}:</span> {r.commentContent}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Reported by {r.reporterName}: {r.reason}
                      </p>
                      <div className="mt-2.5 flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleResolveReport(r.id, 'DISMISS')}>
                          Dismiss
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleResolveReport(r.id, 'DELETE_COMMENT')}>
                          Remove Comment
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* Right Column (32%) */}
          <aside className="space-y-5 lg:col-span-4">
            {/* Card 1: Meeting & Schedule */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Meeting Schedule</h2>
              {nextEvent ? (
                <div className="mt-3.5 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-[#6366f1] shrink-0" />
                    <span>
                      {new Date(nextEvent.eventDate).toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      — {formatEventTime(nextEvent.eventDate, nextEvent.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-[#6366f1] shrink-0" />
                    <span>
                      {nextEvent.venueName
                        ? `${nextEvent.venueName}${nextEvent.venueBuilding ? `, ${nextEvent.venueBuilding}` : ''}`
                        : nextEvent.location || 'Campus venue'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Next session: <span className="font-medium text-slate-700 dark:text-slate-300">{nextEvent.title}</span>
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                  No upcoming meeting or session scheduled yet.
                </p>
              )}
            </div>

            {/* Card 2: Upcoming Events */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Events</h2>
                {events.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTab('events')}
                    className="text-xs font-semibold text-[#6366f1] hover:underline dark:text-[#818cf8]"
                  >
                    View All
                  </button>
                )}
              </div>

              {futureEvents.length > 0 ? (
                <div className="mt-3.5 space-y-3">
                  {futureEvents.slice(0, 3).map((e) => {
                    const evtDate = new Date(e.eventDate)
                    const month = evtDate.toLocaleDateString('en-US', { month: 'short' })
                    const day = evtDate.getDate()
                    return (
                      <Link
                        key={e.id}
                        to={`/events/${e.id}`}
                        className="flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300">
                          <span className="text-[10px] font-bold uppercase">{month}</span>
                          <span className="text-xs font-black">{day}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{e.title}</p>
                          <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                            {e.location || e.venueName || 'Campus'}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">No upcoming events scheduled.</p>
              )}
            </div>

            {/* Card 3: Quick Stats */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Quick Stats</h2>
              <dl className="mt-3.5 divide-y divide-slate-100 text-xs dark:divide-slate-800">
                <div className="flex items-center justify-between py-2">
                  <dt className="text-slate-500 dark:text-slate-400">Total Members</dt>
                  <dd className="font-bold text-slate-900 dark:text-white">{members.length}</dd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <dt className="text-slate-500 dark:text-slate-400">Total Events</dt>
                  <dd className="font-bold text-slate-900 dark:text-white">{events.length}</dd>
                </div>
                {stats?.totalRsvps != null && (
                  <div className="flex items-center justify-between py-2">
                    <dt className="text-slate-500 dark:text-slate-400">Total RSVPs</dt>
                    <dd className="font-bold text-slate-900 dark:text-white">{stats.totalRsvps}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <dt className="text-slate-500 dark:text-slate-400">Membership Fee</dt>
                  <dd className="font-bold text-slate-900 dark:text-white">
                    {Number(club.membershipFee) > 0 ? `$${club.membershipFee}` : 'Free'}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <dt className="text-slate-500 dark:text-slate-400">Certificate Requirement</dt>
                  <dd className="font-bold text-slate-900 dark:text-white">
                    {club.certificateThreshold ? `${club.certificateThreshold} events` : '3 events'}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <dt className="text-slate-500 dark:text-slate-400">Created</dt>
                  <dd className="font-bold text-slate-900 dark:text-white">
                    {club.createdAt
                      ? new Date(club.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      )}

      {/* TAB 2: EVENTS */}
      {activeTab === 'events' && (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Club Events ({events.length})</h2>
            {isOfficer && (
              <Button size="sm" onClick={() => setShowCreateEvent(true)}>
                <Plus className="h-3.5 w-3.5" />
                Create event
              </Button>
            )}
          </div>
          {events.length === 0 && (
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">No events found for this club.</p>
          )}
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard
                key={e.id}
                event={{
                  ...e,
                  clubName: e.clubName || club?.name,
                  clubCategory: e.clubCategory || club?.category,
                }}
                isFacultyAdvisor={isFacultyAdvisor}
                isSuperAdmin={isSuperAdmin}
                onAdvisorReview={handleAdvisorReviewEvent}
              />
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: MEMBERS */}
      {canViewMembers && activeTab === 'members' && (
        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Users className="h-4 w-4 text-[#6366f1]" />
              Members ({members.length})
            </h2>
            <div className="flex items-center gap-2">
              <Button as={Link} to={`/clubs/${clubId}/members`} variant="secondary" size="sm">
                View directory
              </Button>
              {canManageRecords && (
                <label className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-[#181b24] dark:text-slate-300">
                  Import CSV
                  <input type="file" accept=".csv,text/csv" onChange={handleImportMembers} className="hidden" />
                </label>
              )}
              {canManageRecords && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => downloadBlob(`/clubs/${clubId}/members/csv`, 'members.csv')}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && isOfficer && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                Pending Join Requests ({pendingRequests.length})
              </h3>
              <div className="mt-3 space-y-2">
                {pendingRequests.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-xs dark:bg-[#181b24]"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-slate-900 dark:text-white">
                      <MemberAvatar name={m.userName} className="h-8 w-8" />
                      {m.userName}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="success" size="sm" onClick={() => reviewRequest(m.id, true)}>
                        Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => reviewRequest(m.id, false)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Grid */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <Card key={m.id} interactive={false} className="flex items-center gap-3">
                <MemberAvatar name={m.userName} className="h-10 w-10" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{m.userName}</span>
                  {isPresident ? (
                    <div className="relative inline-flex items-center mt-1">
                      <select
                        value={m.position}
                        onChange={(e) => handleAssignPosition(m.id, e.target.value)}
                        className={`appearance-none rounded-full pl-2.5 pr-6 py-0.5 text-xs font-semibold outline-none border transition-all cursor-pointer shadow-2xs ${
                          m.position === 'PRESIDENT'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                            : m.position === 'VP' || m.position === 'SECRETARY' || m.position === 'TREASURER'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {ALL_POSITIONS.map((p) => (
                          <option key={p} value={p}>
                            {POSITION_LABEL[p] || p}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60 text-slate-500 dark:text-slate-400" />
                    </div>
                  ) : (
                    <Badge tone={POSITION_TONE[m.position] || 'neutral'} className="mt-0.5">
                      {POSITION_LABEL[m.position] || m.position}
                    </Badge>
                  )}
                </span>
                {(isSuperAdmin || (isPresident && m.position !== 'PRESIDENT')) && (
                  <button
                    type="button"
                    title={m.position === 'PRESIDENT' ? 'Remove President from club' : 'Remove from club'}
                    aria-label={`Remove ${m.userName}`}
                    onClick={() => handleRemoveMember(m.id, m.userName, m.position === 'PRESIDENT')}
                    className="rounded-md p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: GALLERY / RESOURCES */}
      {activeTab === 'gallery' && (
        <section className="mt-6">
          <ClubResources clubId={clubId} isOfficer={isOfficer} isPresident={isPresident} />
        </section>
      )}

      {/* TAB 5: BUDGET */}
      {activeTab === 'budget' && canManageLedger && ledger && (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Budget Ledger</h2>
            <Button size="sm" onClick={() => setShowLogExpense(true)}>
              <Plus className="h-3.5 w-3.5" />
              Log expense
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="grid grid-cols-3 gap-3">
                <Card interactive={false}>
                  <p className="text-xs text-slate-400">Total income</p>
                  <p className="mt-1 text-xl font-bold text-emerald-600">${ledger.totalIncome}</p>
                </Card>
                <Card interactive={false}>
                  <p className="text-xs text-slate-400">Total expenses</p>
                  <p className="mt-1 text-xl font-bold text-red-600">${ledger.totalExpenses}</p>
                </Card>
                <Card interactive={false}>
                  <p className="text-xs text-slate-400">Balance</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">${ledger.balance}</p>
                </Card>
              </div>

              {ledger.expenses.length > 0 && spendingChartData && (
                <ChartCard
                  title="Spending by month"
                  subtitle="Logged expenses, past 6 months"
                  table={{
                    columns: ['Month', 'Spent'],
                    rows: spendingByMonth.map((m) => [m.fullLabel, `$${m.value.toLocaleString()}`]),
                  }}
                >
                  <BarChartJS
                    data={spendingChartData}
                    height={220}
                    ariaLabel="Spending by month bar chart"
                  />
                </ChartCard>
              )}

              <SectionCard title="Expenses">
                {ledger.expenses.length === 0 && (
                  <p className="text-xs text-slate-400">No expenses logged yet.</p>
                )}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ledger.expenses.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{e.description}</p>
                        <p className="text-xs text-slate-400">
                          {e.expenseDate} — logged by {e.loggedByName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-red-600">-${e.amount}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(e.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Spending" className="flex flex-col items-center self-start">
              <Donut value={totalExpenses} total={totalIncome} />
              <dl className="mt-4 w-full space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#6366f1]" />
                    Spent
                  </dt>
                  <dd className="font-medium text-slate-900 dark:text-white">${ledger.totalExpenses}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                    Remaining
                  </dt>
                  <dd className="font-medium text-slate-900 dark:text-white">${ledger.balance}</dd>
                </div>
              </dl>
            </SectionCard>
          </div>
        </section>
      )}

      {/* Modals */}
      {showCreateEvent && (
        <CreateEventModal
          clubId={clubId}
          onClose={() => setShowCreateEvent(false)}
          onCreated={(created) => setEvents((prev) => [...prev, created])}
        />
      )}

      {showLogExpense && (
        <LogExpenseModal
          clubId={clubId}
          onClose={() => setShowLogExpense(false)}
          onLogged={(expense) =>
            setLedger((prev) => ({
              ...prev,
              totalExpenses: (Number(prev.totalExpenses) + Number(expense.amount)).toString(),
              balance: (Number(prev.balance) - Number(expense.amount)).toString(),
              expenses: [expense, ...prev.expenses],
            }))
          }
        />
      )}

      {showEditClub && (
        <CreateClubModal
          club={club}
          onClose={() => setShowEditClub(false)}
          onCreated={(updated) => setClub(updated)}
        />
      )}

      {showAdvisorRequestModal && (
        <AdvisorRequestModal
          isOpen={showAdvisorRequestModal}
          onClose={() => setShowAdvisorRequestModal(false)}
          clubs={club ? [club] : []}
          preselectedClubId={clubId}
          onCreated={() => {}}
        />
      )}
    </div>
  )
}

export default ClubDetailPage
