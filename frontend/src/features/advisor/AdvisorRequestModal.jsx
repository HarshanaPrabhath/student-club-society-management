import { AlertTriangle, Send, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useToast } from '../../components/ToastProvider'

export default function AdvisorRequestModal({
  isOpen,
  onClose,
  clubs = [],
  preselectedClubId = null,
  onCreated,
}) {
  const { showToast } = useToast()
  const [clubId, setClubId] = useState(preselectedClubId || '')
  const [requestType, setRequestType] = useState('CLUB_DELETION')
  const [priority, setPriority] = useState('NORMAL')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (preselectedClubId) {
      setClubId(preselectedClubId)
    }
  }, [preselectedClubId])

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!subject.trim()) {
      showToast('Please provide a subject', 'error')
      return
    }
    if (!message.trim()) {
      showToast('Please provide details for the Super Admin', 'error')
      return
    }

    setLoading(true)
    try {
      const payload = {
        clubId: clubId ? clubId : null,
        requestType,
        priority,
        subject: subject.trim(),
        message: message.trim(),
      }
      const res = await api.post('/advisor-requests', payload)
      showToast('Request submitted to Super Admin successfully')
      if (onCreated) {
        onCreated(res.data)
      }
      onClose()
      setSubject('')
      setMessage('')
      setClubId(preselectedClubId || '')
      setRequestType('CLUB_DELETION')
      setPriority('NORMAL')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit request', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="advisor-request-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#181b24]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 id="advisor-request-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Submit Request to Super Admin
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official faculty advisor escalations, club dissolution, or disciplinary proposals
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Society / Club
            </label>
            <select
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-2xs focus:border-[#6366f1] focus:outline-hidden focus:ring-2 focus:ring-[#6366f1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">General University Issue / No specific club</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Request Type
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-2xs focus:border-[#6366f1] focus:outline-hidden focus:ring-2 focus:ring-[#6366f1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="CLUB_DELETION">🚨 Club Deletion / Dissolution</option>
                <option value="DISCIPLINARY_ACTION">⚠️ Disciplinary / Misconduct</option>
                <option value="FINANCIAL_AUDIT">💰 Financial & Budget Audit</option>
                <option value="GOVERNANCE_REVIEW">🏛️ Board / Governance Dispute</option>
                <option value="GENERAL_CONSULTATION">💬 General Consultation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 shadow-2xs focus:border-[#6366f1] focus:outline-hidden focus:ring-2 focus:ring-[#6366f1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Escalation</option>
                <option value="LOW">Low / Advisory</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Recommend club deletion due to repeated code of conduct violations"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-2xs focus:border-[#6366f1] focus:outline-hidden focus:ring-2 focus:ring-[#6366f1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Detailed Justification / Message <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain the circumstances, misconduct evidence, or governance concerns for the Super Admin to review and discuss..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 shadow-2xs focus:border-[#6366f1] focus:outline-hidden focus:ring-2 focus:ring-[#6366f1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-purple-700 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? 'Submitting...' : 'Send to Super Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
