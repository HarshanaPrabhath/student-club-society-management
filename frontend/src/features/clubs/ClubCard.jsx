import { Check, Clock, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useToast } from '../../components/ToastProvider'

function getCategoryGradient(category = '') {
  const cat = (category || '').toLowerCase()
  if (cat.includes('tech') || cat.includes('code') || cat.includes('ai') || cat.includes('robot')) {
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
  return 'from-[#6366f1] via-[#7c3aed] to-[#4f46e5]'
}

function ClubCard({ club, user, membership, onMembershipChange }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [joining, setJoining] = useState(false)
  const [localStatus, setLocalStatus] = useState(membership?.status || null)

  const effectiveStatus = localStatus || membership?.status || null
  const isApproved = effectiveStatus === 'APPROVED'
  const isPending = effectiveStatus === 'PENDING'
  const memberCount = Number(club?.memberCount) || (isApproved ? 1 : 0)

  async function handleJoin(e) {
    e.preventDefault()
    e.stopPropagation()

    if (isApproved || isPending) {
      navigate(`/clubs/${club.id}`)
      return
    }

    if (user?.role !== 'STUDENT') {
      navigate(`/clubs/${club.id}`)
      return
    }

    const fee = Number(club.membershipFee) || 0
    if (fee > 0) {
      const confirmed = window.confirm(
        `Joining "${club.name}" charges a membership fee of $${fee}. Proceed and pay?`,
      )
      if (!confirmed) return
    }

    setJoining(true)
    try {
      const res = await api.post(`/clubs/${club.id}/join`)
      const newStatus = res.data?.status || (club.joinPolicy === 'APPLICATION' ? 'PENDING' : 'APPROVED')
      setLocalStatus(newStatus)
      if (onMembershipChange) onMembershipChange(club.id, newStatus)
      showToast(
        newStatus === 'PENDING'
          ? 'Join request sent! Pending officer approval.'
          : 'Welcome! You have joined ' + club.name + ' 🎉',
      )
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to join club', 'error')
    } finally {
      setJoining(false)
    }
  }

  const gradient = getCategoryGradient(club.category)

  return (
    <div
      onClick={() => navigate(`/clubs/${club.id}`)}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-slate-800/80 dark:bg-[#181b24] dark:hover:border-slate-700 cursor-pointer"
    >
      {/* Cover / Image Header */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {club.logoB64 && club.logoB64.startsWith('data:image') ? (
          <img
            src={club.logoB64}
            alt={club.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} p-6 text-white`}
          >
            <span className="text-2xl font-black tracking-wider drop-shadow-md">
              {club.name
                ?.split(' ')
                .map((w) => w[0])
                .filter(Boolean)
                .slice(0, 3)
                .join('')
                .toUpperCase() || 'CLUB'}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 gap-4">
        <div>
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-[#6366f1] dark:text-white dark:group-hover:text-[#818cf8] transition-colors line-clamp-1">
            {club.name}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
            {club.description || 'Discover activities, connect with students, and learn new skills.'}
          </p>
        </div>

        {/* Member Count & Category Tag Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span>
              {memberCount} Member{memberCount === 1 ? '' : 's'}
            </span>
          </div>

          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6366f1] dark:bg-indigo-950/60 dark:text-indigo-300">
            {club.category || 'GENERAL'}
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleJoin}
          disabled={joining}
          className={`w-full rounded-2xl py-3 px-4 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] shadow-xs ${
            isApproved
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
              : isPending
                ? 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300'
                : 'bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#a855f7] text-white hover:opacity-95 hover:shadow-md'
          }`}
        >
          {isApproved ? (
            <>
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Joined</span>
            </>
          ) : isPending ? (
            <>
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Requested</span>
            </>
          ) : (
            <span>{joining ? 'Joining…' : 'Join Club'}</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default ClubCard
