import { CalendarCheck, ClipboardList, Download, Flag, GraduationCap, ShieldAlert, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import ChartCard from '../../components/charts/ChartCard'
import BarChartJS from '../../components/charts/chartjs/BarChartJS'
import DoughnutChartJS from '../../components/charts/chartjs/DoughnutChartJS'
import LineChartJS from '../../components/charts/chartjs/LineChartJS'
import { formatCompact, monthlyCounts } from '../../components/charts/chartUtils'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Skeleton from '../../components/ui/Skeleton'

const TONES = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
}

function countBy(items, getKey) {
  const counts = new Map()
  items.forEach((item) => {
    const key = getKey(item) || 'Uncategorised'
    counts.set(key, (counts.get(key) || 0) + 1)
  })
  return Array.from(counts, ([label, value]) => ({ label, value })).sort(
    (a, b) => b.value - a.value || a.label.localeCompare(b.label),
  )
}

function UniversityStatsPage() {
  const user = useSelector((state) => state.auth.user)
  const isAuthorized = user?.role === 'SUPER_ADMIN' || user?.role === 'FACULTY_ADVISOR'

  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)
  const [events, setEvents] = useState([])
  const [clubs, setClubs] = useState([])

  useEffect(() => {
    if (!isAuthorized) return
    api.get('/analytics/university').then((res) => setStats(res.data)).catch((e) => setError(e.response?.data?.message || 'Could not load analytics'))
    api.get('/events').then((res) => setEvents(res.data)).catch(() => {})
    api.get('/clubs').then((res) => setClubs(res.data)).catch(() => {})
  }, [isAuthorized])

  const liveEvents = useMemo(() => events.filter((e) => !e.cancelled), [events])
  const eventsByMonth = useMemo(() => monthlyCounts(liveEvents, (e) => e.eventDate, { before: 5, after: 2 }), [liveEvents])
  const clubsByCategory = useMemo(() => countBy(clubs, (c) => c.category), [clubs])
  const busiestClubs = useMemo(() => countBy(liveEvents, (e) => e.clubName).slice(0, 6), [liveEvents])

  // Chart.js Datasets
  const eventsTrendChartData = useMemo(() => {
    return {
      labels: eventsByMonth.map((m) => m.label),
      datasets: [
        {
          label: 'Events Scheduled',
          data: eventsByMonth.map((m) => m.value),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }
  }, [eventsByMonth])

  const categoryDoughnutData = useMemo(() => {
    const palette = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#64748b', '#f97316']
    return {
      labels: clubsByCategory.map((c) => c.label),
      datasets: [
        {
          data: clubsByCategory.map((c) => c.value),
          backgroundColor: palette.slice(0, clubsByCategory.length),
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6,
        },
      ],
    }
  }, [clubsByCategory])

  const activeClubsBarData = useMemo(() => {
    return {
      labels: busiestClubs.map((c) => c.label),
      datasets: [
        {
          label: 'Events Hosted',
          data: busiestClubs.map((c) => c.value),
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          hoverBackgroundColor: '#4f46e5',
          borderRadius: 6,
        },
      ],
    }
  }, [busiestClubs])

  const eventStatusDoughnutData = useMemo(() => {
    const approved = events.filter((e) => e.approvalStatus === 'APPROVED' && !e.cancelled).length
    const pending = events.filter((e) => e.approvalStatus === 'PENDING').length
    const cancelled = events.filter((e) => e.cancelled).length
    return {
      labels: ['Approved & Live', 'Pending Sign-off', 'Cancelled'],
      datasets: [
        {
          data: [approved, pending, cancelled],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4,
        },
      ],
    }
  }, [events])

  if (user && !isAuthorized) {
    return (
      <div className="mx-auto max-w-xl p-4 py-16 md:p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          Restricted Access
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          University budget and analytics are restricted to faculty advisors and university administrators.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#4f46e5]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="mx-auto max-w-6xl p-4 text-sm text-danger md:p-8">{error}</div>
  }

  if (!stats) {
    return (
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <Skeleton className="h-10 w-72" />
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="mt-6 h-72" />
      </div>
    )
  }

  const cards = [
    ['Approved clubs', stats.totalClubs, Flag, 'brand'],
    ['Students', stats.totalStudents, GraduationCap, 'info'],
    ['Published events', stats.totalEvents, CalendarCheck, 'success'],
    ['Payments collected', stats.totalPaymentsCollected, Wallet, 'success'],
    ['Pending club proposals', stats.pendingClubProposals, ClipboardList, 'warning'],
    ['Pending event approvals', stats.pendingEventApprovals, ClipboardList, 'warning'],
  ]

  async function handleDownload(format) {
    const res = await api.get(`/analytics/university/${format}`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(res.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `university-stats.${format}`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <PageHeader
        title="University-wide analytics"
        description="Real-time interactive intelligence: society activities, distribution and student engagement."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => handleDownload('csv')}>
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleDownload('pdf')}>
              <Download className="h-3.5 w-3.5" />
              PDF
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        {cards.map(([label, value, Icon, tone]) => (
          <Card key={label} interactive={false} className="flex items-center gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${TONES[tone]}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none text-ink dark:text-ink-dark">
                {Number.isFinite(Number(value)) ? formatCompact(Number(value)) : value}
              </p>
              <p className="mt-1 truncate text-xs text-ink-muted dark:text-ink-dark-muted">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart.js Interactive Visualizations */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Line Chart for Events per month */}
        <ChartCard
          title="Events per month"
          subtitle="Scheduled, non-cancelled events — past 5 months and next 2"
          className="lg:col-span-2"
          empty={liveEvents.length === 0 ? 'No events yet.' : null}
          table={{
            columns: ['Month', 'Events'],
            rows: eventsByMonth.map((m) => [m.fullLabel, m.value]),
          }}
        >
          <LineChartJS
            data={eventsTrendChartData}
            height={260}
            ariaLabel="Events per month trend"
          />
        </ChartCard>

        {/* Chart 2: Doughnut Chart for Clubs by category */}
        <ChartCard
          title="Clubs by category"
          subtitle="Approved society distribution"
          empty={clubsByCategory.length === 0 ? 'No clubs yet.' : null}
          table={{ columns: ['Category', 'Clubs'], rows: clubsByCategory.map((c) => [c.label, c.value]) }}
        >
          <DoughnutChartJS
            data={categoryDoughnutData}
            height={240}
            centerLabel={String(clubs.length)}
            centerSublabel="Societies"
            ariaLabel="Clubs by category doughnut"
          />
        </ChartCard>

        {/* Chart 3: Horizontal Bar Chart for Most active clubs */}
        <ChartCard
          title="Most active clubs"
          subtitle="Ranked by total events organized"
          className="lg:col-span-2"
          empty={busiestClubs.length === 0 ? 'No events yet.' : null}
          table={{ columns: ['Club', 'Events'], rows: busiestClubs.map((c) => [c.label, c.value]) }}
        >
          <BarChartJS
            data={activeClubsBarData}
            horizontal={true}
            height={260}
            ariaLabel="Most active clubs bar chart"
          />
        </ChartCard>

        {/* Chart 4: Doughnut Chart for Event proposal lifecycle */}
        <ChartCard
          title="Event proposal statuses"
          subtitle="Lifecycle of campus activities"
          empty={events.length === 0 ? 'No proposals registered.' : null}
          table={{
            columns: ['Status', 'Count'],
            rows: [
              ['Approved & Live', events.filter((e) => e.approvalStatus === 'APPROVED' && !e.cancelled).length],
              ['Pending Sign-off', events.filter((e) => e.approvalStatus === 'PENDING').length],
              ['Cancelled', events.filter((e) => e.cancelled).length],
            ],
          }}
        >
          <DoughnutChartJS
            data={eventStatusDoughnutData}
            height={240}
            centerLabel={String(events.length)}
            centerSublabel="Proposals"
            ariaLabel="Event proposal statuses"
          />
        </ChartCard>
      </div>
    </div>
  )
}

export default UniversityStatsPage
