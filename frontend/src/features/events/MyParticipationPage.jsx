import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ExternalLink,
  QrCode,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'

const METHOD_LABEL = { QR: 'QR check-in', MANUAL: 'Marked by an officer' }

function formatEventBadgeDate(iso) {
  if (!iso) return { month: 'TBA', day: '--' }
  try {
    const d = new Date(iso)
    return {
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      day: d.getDate(),
    }
  } catch {
    return { month: 'TBA', day: '--' }
  }
}

/** A student's own attendance history across every club, newest event first. */
function MyParticipationPage() {
  const [records, setRecords] = useState(null)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedClub, setSelectedClub] = useState('ALL')

  useEffect(() => {
    api
      .get('/attendance/me')
      .then((res) => setRecords(res.data))
      .catch((e) => setError(e.response?.data?.message || 'Could not load your participation history'))
  }, [])

  const perClub = useMemo(() => {
    const counts = new Map()
    for (const r of records || []) counts.set(r.clubName, (counts.get(r.clubName) || 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [records])

  const qrCount = useMemo(() => {
    return (records || []).filter((r) => r.method === 'QR').length
  }, [records])

  const manualCount = useMemo(() => {
    return (records || []).filter((r) => r.method === 'MANUAL').length
  }, [records])

  const filteredRecords = useMemo(() => {
    if (!records) return []
    return records.filter((r) => {
      if (selectedClub !== 'ALL' && r.clubName !== selectedClub) return false
      const q = search.trim().toLowerCase()
      if (q) {
        const matchTitle = r.eventTitle?.toLowerCase().includes(q)
        const matchClub = r.clubName?.toLowerCase().includes(q)
        if (!matchTitle && !matchClub) return false
      }
      return true
    })
  }, [records, selectedClub, search])

  if (error) {
    return (
      <div role="alert" className="mx-auto max-w-4xl p-4 text-sm text-red-600 dark:text-red-400 md:p-8">
        {error}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 space-y-6">
      {/* Breadcrumb Top */}
      <div className="flex items-center gap-2 text-xs md:text-sm">
        <Link to="/" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 font-medium">
          Home
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="font-semibold text-slate-900 dark:text-white">Activity Log</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Participation &amp; Activity Log
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Every event you have been checked in to, across all your campus clubs and societies.
          </p>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#4f46e5] hover:shadow-md self-start md:self-center"
        >
          <span>Explore Upcoming Events</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Top Stat Cards (when records exist) */}
      {records && records.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#6366f1] dark:bg-indigo-950/40 dark:text-indigo-400">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Attended</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{records.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Societies</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{perClub.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">QR Check-ins</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{qrCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Officer Verified</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{manualCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Badges Section */}
      {records && records.length > 0 && (
        <section aria-label="Summary" className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#6366f1] px-3 py-1.5 text-xs font-semibold text-white shadow-xs">
            <Sparkles className="h-3 w-3" />
            <span>
              {records.length} event{records.length === 1 ? '' : 's'} attended
            </span>
          </span>
          {perClub.map(([club, count]) => (
            <button
              key={club}
              type="button"
              onClick={() => setSelectedClub(selectedClub === club ? 'ALL' : club)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                selectedClub === club
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#181b24] dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span>{club}: {count}</span>
            </button>
          ))}
        </section>
      )}

      {/* Search Bar Toolbar */}
      {records && records.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attended events or societies..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#6366f1] focus:bg-white focus:ring-2 focus:ring-[#6366f1]/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
            />
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {!records && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {records && records.length === 0 && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 md:p-12 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
          <EmptyState
            icon={ClipboardCheck}
            title="No participation yet"
            description="Once you are checked in to an event, it will show up here."
          />
          <div className="mt-6 text-center">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#a855f7] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:shadow-md transition-all"
            >
              <span>Explore Upcoming Events</span>
            </Link>
          </div>
        </div>
      )}

      {/* Attended Events Feed */}
      {records && records.length > 0 && (
        <ul className="space-y-3" aria-label="Attended events">
          {filteredRecords.map((r) => {
            const dateBadge = formatEventBadgeDate(r.eventDate || r.markedAt)
            const isQr = r.method === 'QR'

            return (
              <li key={r.eventId}>
                <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-[#181b24] dark:hover:border-slate-700">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Floating Date Badge */}
                    <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#6366f1]/10 text-[#6366f1] dark:bg-[#6366f1]/20 dark:text-[#818cf8] font-bold">
                      <span className="text-[10px] tracking-wider leading-none">{dateBadge.month}</span>
                      <span className="text-lg leading-tight">{dateBadge.day}</span>
                    </div>

                    {/* Title and Club */}
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/events/${r.eventId}`}
                        className="block truncate text-base font-bold text-slate-900 group-hover:text-[#6366f1] dark:text-white dark:group-hover:text-[#818cf8] transition-colors"
                      >
                        {r.eventTitle}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Link
                          to={`/clubs/${r.clubId}`}
                          className="font-medium text-slate-700 hover:underline dark:text-slate-300"
                        >
                          {r.clubName}
                        </Link>
                        {r.eventDate && (
                          <span>
                            · {new Date(r.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Meta & Tag */}
                  <div className="flex flex-wrap sm:flex-col sm:items-end justify-between items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isQr
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-indigo-50 text-[#6366f1] dark:bg-indigo-950/50 dark:text-indigo-300'
                      }`}
                    >
                      {isQr ? <QrCode className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span>{METHOD_LABEL[r.method] || r.method}</span>
                    </span>

                    <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(r.markedAt).toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default MyParticipationPage
