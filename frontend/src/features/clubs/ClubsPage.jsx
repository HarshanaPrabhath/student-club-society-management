import { Flag, Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import ClubCard from './ClubCard'
import CreateClubModal from './CreateClubModal'
import { fetchClubs } from './clubsSlice'

const CATEGORIES = ['Sports', 'Academic', 'Cultural', 'Tech']

function ClubsPage() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth?.user)
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const { items, status } = useSelector((state) => state.clubs)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [userMemberships, setUserMemberships] = useState([])

  useEffect(() => {
    dispatch(fetchClubs(category || undefined))
  }, [dispatch, category])

  useEffect(() => {
    if (user?.id) {
      api
        .get('/memberships/me')
        .then((res) => setUserMemberships(Array.isArray(res.data) ? res.data : []))
        .catch(() => {})
    }
  }, [user?.id])

  function handleMembershipChange(clubId, newStatus) {
    setUserMemberships((prev) => [
      ...prev.filter((m) => m.clubId !== clubId),
      { clubId, status: newStatus },
    ])
  }

  const visibleClubs = items.filter((club) =>
    club.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 space-y-6">
      {/* Breadcrumb Top */}
      <div className="flex items-center gap-2 text-xs md:text-sm">
        <Link to="/" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 font-medium">
          Home
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="font-semibold text-slate-900 dark:text-white">Clubs</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Clubs &amp; Societies
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Explore student-led organizations, build connections, and join vibrant campus communities.
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#4f46e5] hover:shadow-md shrink-0 self-start md:self-center"
          >
            <Plus className="h-4 w-4" />
            <span>Create club</span>
          </Button>
        )}
      </div>

      {/* Filter & Search Bar Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs by name..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#6366f1] focus:bg-white focus:ring-2 focus:ring-[#6366f1]/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by category">
          {['', ...CATEGORIES].map((c) => {
            const active = category === c
            return (
              <button
                key={c || 'all'}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#6366f1] text-white shadow-xs'
                    : 'border border-slate-200/80 bg-slate-50/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {c || 'All'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading Skeleton Grid */}
      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24] space-y-4"
            >
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {status !== 'loading' && visibleClubs.length === 0 && (
        <EmptyState
          icon={Flag}
          description={
            items.length === 0
              ? isSuperAdmin
                ? 'No clubs yet — create one!'
                : 'No clubs available yet.'
              : 'No clubs match your search.'
          }
        />
      )}

      {/* Clubs Grid matching uploaded mockup */}
      {status !== 'loading' && visibleClubs.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleClubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              user={user}
              membership={userMemberships.find((m) => m.clubId === club.id)}
              onMembershipChange={handleMembershipChange}
            />
          ))}
        </div>
      )}

      {showCreate && isSuperAdmin && <CreateClubModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

export default ClubsPage
