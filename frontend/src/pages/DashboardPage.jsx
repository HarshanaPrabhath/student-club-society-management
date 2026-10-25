import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  MapPin,
  Megaphone,
  Shield,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useToast } from '../components/ToastProvider'

function getClubCoverGradient(category = '') {
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

function timeAgo(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function DashboardPage() {
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const { showToast } = useToast()

  const [memberships, setMemberships] = useState([])
  const [events, setEvents] = useState([])
  const [rsvps, setRsvps] = useState([])
  const [notifications, setNotifications] = useState([])
  const [clubsList, setClubsList] = useState([])
  const [auditLogs, setAuditLogs] = useState([])

  useEffect(() => {
    let mounted = true

    const pMemberships = api.get('/memberships/me').then((r) => r.data).catch(() => [])
    const pEvents = api.get('/events').then((r) => r.data).catch(() => [])
    const pRsvps = api.get('/rsvps/me').then((r) => r.data).catch(() => [])
    const pNotifications = api.get('/notifications/me').then((r) => r.data).catch(() => [])
    const pClubs = api.get('/clubs').then((r) => r.data).catch(() => [])
    const pAudit =
      user?.role === 'SUPER_ADMIN'
        ? api.get('/audit-logs').then((r) => r.data).catch(() => [])
        : Promise.resolve([])

    Promise.all([pMemberships, pEvents, pRsvps, pNotifications, pClubs, pAudit])
      .then(([memData, evtData, rsvpData, notifData, clubData, auditData]) => {
        if (!mounted) return
        setMemberships(Array.isArray(memData) ? memData : [])
        setEvents(Array.isArray(evtData) ? evtData : [])
        setRsvps(Array.isArray(rsvpData) ? rsvpData : [])
        setNotifications(Array.isArray(notifData) ? notifData : [])
        setClubsList(Array.isArray(clubData) ? clubData : [])
        setAuditLogs(Array.isArray(auditData) ? auditData : [])
      })

    return () => {
      mounted = false
    }
  }, [user?.role])

  // Real membership derivations
  const approvedMemberships = useMemo(
    () => memberships.filter((m) => m.status === 'APPROVED'),
    [memberships],
  )
  const pendingMemberships = useMemo(
    () => memberships.filter((m) => m.status === 'PENDING'),
    [memberships],
  )
  const adminClubs = useMemo(
    () => approvedMemberships.filter((m) => m.position === 'PRESIDENT'),
    [approvedMemberships],
  )

  // Map club details by ID for fast lookup
  const clubMap = useMemo(() => {
    const map = new Map()
    clubsList.forEach((c) => map.set(c.id, c))
    return map
  }, [clubsList])

  // Real upcoming events sorted chronologically
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return events
      .filter((e) => !e.cancelled && new Date(e.eventDate) >= now)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
  }, [events])

  // Real RSVP interaction
  async function handleRsvpToggle(event) {
    const isGoing = rsvps.some((r) => r.eventId === event.id && r.status === 'GOING')
    try {
      if (isGoing) {
        await api.delete(`/events/${event.id}/rsvp`)
        setRsvps((prev) => prev.filter((r) => r.eventId !== event.id))
        showToast('RSVP cancelled')
      } else {
        const res = await api.post(`/events/${event.id}/rsvp`)
        setRsvps((prev) => [...prev.filter((r) => r.eventId !== event.id), res.data])
        showToast('RSVP confirmed! See you there 🎉')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update RSVP', 'error')
    }
  }

  // Real recent activities: notifications + audit logs
  const recentActivities = useMemo(() => {
    const items = []

    notifications.forEach((n) => {
      items.push({
        id: `notif-${n.id}`,
        content: n.message,
        createdAt: n.createdAt,
      })
    })

    auditLogs.slice(0, 5).forEach((log) => {
      items.push({
        id: `audit-${log.id}`,
        content: (
          <>
            <strong className="font-semibold text-slate-900 dark:text-white">{log.actorName}</strong>{' '}
            <span>{log.details || log.action}</span>
          </>
        ),
        createdAt: log.createdAt,
      })
    })

    return items
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }, [notifications, auditLogs])

  // Real metric counts
  const myClubsCount =
    user?.role === 'SUPER_ADMIN' && approvedMemberships.length === 0
      ? clubsList.length
      : approvedMemberships.length

  const upcomingEventsCount = upcomingEvents.length
  const waitlistedCount = rsvps.filter((r) => r.status === 'WAITLISTED').length
  const pendingRsvpsCount = pendingMemberships.length + waitlistedCount
  const announcementsCount = notifications.length

  // Clubs to showcase: user's registered clubs or campus clubs
  const registeredClubCards = useMemo(() => {
    if (approvedMemberships.length > 0) {
      return approvedMemberships.map((m) => {
        const club = clubMap.get(m.clubId)
        return {
          id: m.clubId,
          name: m.clubName,
          category: club?.category || 'General',
          badge: m.position,
          logoB64: club?.logoB64,
          isMember: true,
        }
      })
    }
    // If not joined any yet, show top approved campus clubs
    return clubsList.slice(0, 4).map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category || 'General',
      badge: 'Explore',
      logoB64: c.logoB64,
      isMember: false,
    }))
  }, [approvedMemberships, clubsList, clubMap])

  const firstName = user?.name ? user.name.split(' ')[0] : 'User'

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e4dafa] bg-gradient-to-r from-[#f5f1fe] via-[#ede7fe] to-[#f5f1fe] p-6 shadow-xs md:p-8 dark:border-[#382f63] dark:bg-gradient-to-r dark:from-[#1b1735] dark:via-[#251d48] dark:to-[#1b1735]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="mt-2 text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {upcomingEventsCount > 0 ? (
                <>
                  You have {upcomingEventsCount} upcoming event{upcomingEventsCount === 1 ? '' : 's'} scheduled.{' '}
                  {upcomingEvents[0]?.title ? `Next up is "${upcomingEvents[0].title}". ` : ''}
                  Get ready to participate and explore new opportunities!
                </>
              ) : myClubsCount > 0 ? (
                <>
                  You are a member of {myClubsCount} student club{myClubsCount === 1 ? '' : 's'}. Browse upcoming
                  activities and discover new societies below.
                </>
              ) : (
                <>
                  Welcome to your campus club portal! Discover exciting student societies, join clubs, and attend
                  campus events.
                </>
              )}
            </p>
          </div>

          <Link
            to="/clubs"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6366f1] px-5 py-2.5 text-xs md:text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#4f46e5] hover:shadow-md dark:bg-gradient-to-r dark:from-[#6366f1] dark:to-[#9333ea] shrink-0 self-start md:self-center"
          >
            <span>Explore New Clubs</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 4 Metric / Stat Cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-4">
        {/* Card 1: My Clubs */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[#6366f1] dark:bg-indigo-500/15 dark:text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">My Clubs</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {myClubsCount}
              </span>
              <span className="text-xs font-bold text-emerald-500">↗</span>
            </div>
          </div>
        </div>

        {/* Card 2: Upcoming Events */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Upcoming Events</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {upcomingEventsCount}
              </span>
              <span className="text-xs font-bold text-emerald-500">↗</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending RSVPs */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending RSVPs</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {pendingRsvpsCount}
              </span>
              <span className="text-xs font-bold text-emerald-500">↗</span>
            </div>
          </div>
        </div>

        {/* Card 4: Announcements */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Announcements</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {announcementsCount}
              </span>
              <span className="text-xs font-bold text-emerald-500">↗</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (Clubs & Events) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Section: My Registered Clubs */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {approvedMemberships.length > 0 ? 'My Registered Clubs' : 'Discover Campus Clubs'}
              </h2>
              <Link
                to="/clubs"
                className="text-xs font-semibold text-[#6366f1] hover:underline dark:text-[#818cf8]"
              >
                View All
              </Link>
            </div>

            {registeredClubCards.length > 0 ? (
              <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                {registeredClubCards.map((club) => {
                  const gradient = getClubCoverGradient(club.category)
                  return (
                    <div
                      key={club.id}
                      className="flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition-all hover:shadow-md dark:border-slate-800/80 dark:bg-[#181b24]"
                    >
                      <div className="relative h-28 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {club.logoB64 ? (
                          <img
                            src={club.logoB64}
                            alt={club.name}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div
                            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} p-4 text-white shadow-inner`}
                          >
                            <span className="text-xl font-extrabold tracking-wider drop-shadow-xs">
                              {club.name
                                .split(' ')
                                .map((w) => w[0])
                                .slice(0, 3)
                                .join('')
                                .toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-3.5">
                        <div>
                          <h3 className="truncate text-xs font-bold text-slate-900 dark:text-white" title={club.name}>
                            {club.name}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                            {club.badge}
                          </p>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 truncate max-w-[90px]">
                            {club.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate(`/clubs/${club.id}`)}
                            className="rounded-md border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No clubs found in the system yet.{' '}
                <Link to="/clubs" className="font-semibold text-[#6366f1] hover:underline">
                  Browse clubs
                </Link>
              </div>
            )}
          </section>

          {/* Section: Upcoming Events */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Events</h2>
              <Link
                to="/events"
                className="text-xs font-semibold text-[#6366f1] hover:underline dark:text-[#818cf8]"
              >
                View All
              </Link>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="mt-3.5 grid grid-cols-1 gap-3.5 md:grid-cols-3">
                {upcomingEvents.slice(0, 3).map((evt) => {
                  const eventDate = new Date(evt.eventDate)
                  const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
                  const day = eventDate.getDate()
                  const timeStr = formatEventTime(evt.eventDate, evt.endDate)
                  const locationStr = evt.venueName
                    ? `${evt.venueName}${evt.venueBuilding ? `, ${evt.venueBuilding}` : ''}`
                    : evt.location || 'Campus'
                  const isGoing = rsvps.some((r) => r.eventId === evt.id && r.status === 'GOING')

                  return (
                    <div
                      key={evt.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]"
                    >
                      {/* Left: Date Badge */}
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 text-[#6366f1] dark:bg-indigo-950/60 dark:text-indigo-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">{month}</span>
                        <span className="text-base font-extrabold leading-none">{day}</span>
                      </div>

                      {/* Middle Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white" title={evt.title}>
                          {evt.title}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span className="truncate">{timeStr}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{locationStr}</span>
                        </div>
                      </div>

                      {/* Right Button/Badge */}
                      <div className="shrink-0">
                        {isGoing ? (
                          <button
                            type="button"
                            onClick={() => handleRsvpToggle(evt)}
                            title="Click to cancel RSVP"
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 transition-all hover:bg-emerald-100 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-400"
                          >
                            <span>Going</span>
                            <Check className="h-3 w-3 stroke-[2.5]" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRsvpToggle(evt)}
                            className="rounded-md border border-indigo-200 px-3 py-1 text-[11px] font-semibold text-[#6366f1] transition-all hover:bg-indigo-50 dark:border-indigo-800/80 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                          >
                            RSVP
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No upcoming events scheduled right now.{' '}
                <Link to="/events" className="font-semibold text-[#6366f1] hover:underline">
                  Browse all events
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Recent Activity & Management */}
        <aside className="space-y-5 lg:col-span-4">
          {/* Recent Activity Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Activity</h2>

            {recentActivities.length > 0 ? (
              <div className="mt-4 space-y-4">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#6366f1]" />
                    <div className="min-w-0 flex-1">
                      <div className="leading-snug text-slate-700 dark:text-slate-300">{act.content}</div>
                      <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{timeAgo(act.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                No recent activity yet. When you join clubs, RSVP to events, or receive announcements, your activity
                will appear here.
              </p>
            )}
          </div>

          {/* Quick Management Tools (if user manages clubs or is Faculty Advisor) */}
          {adminClubs.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <Shield className="h-4 w-4" />
                Clubs You Manage
              </h3>
              <div className="mt-3 space-y-2">
                {adminClubs.map((m) => (
                  <Link
                    key={m.id}
                    to={`/clubs/${m.clubId}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 transition-all hover:border-purple-200 hover:bg-purple-50/50 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
                  >
                    <span>{m.clubName}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default DashboardPage
