import { AlertTriangle, CheckCircle2, Shield, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import api from '../../api/axios'
import { useToast } from '../../components/ToastProvider'

export default function ResolveAdvisorRequestModal({
  isOpen,
  onClose,
  request,
  onResolved,
  onDeleteClub,
}) {
  const { showToast } = useToast()
  const [status, setStatus] = useState(
    request?.status === 'PENDING' ? 'RESOLVED' : request?.status || 'RESOLVED',
  )
  const [adminResponse, setAdminResponse] = useState(request?.adminResponse || '')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !request) return null

  async function handleResolve(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        status,
        adminResponse: adminResponse.trim(),
      }
      const res = await api.put(`/advisor-requests/${request.id}/resolve`, payload)
      showToast('Advisor request updated and advisor notified')
      if (onResolved) {
        onResolved(res.data)
      }
      onClose()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update request', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolve-advisor-request-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#181b24]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-[#6366f1] dark:bg-indigo-950/50 dark:text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 id="resolve-advisor-request-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Review & Respond to Advisor Request
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submitted by {request.advisorName} ({request.advisorEmail})
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

        {/* Request Details Box */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
              {request.requestType?.replace(/_/g, ' ')}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                request.priority === 'URGENT'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                  : request.priority === 'HIGH'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
              }`}
            >
              {request.priority} Priority
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {request.clubName ? `Regarding Society: ${request.clubName}` : 'General University Governance'}
            </h4>
            <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              Subject: {request.subject}
            </p>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            {request.message}
          </p>
        </div>

        {/* If request type is CLUB_DELETION and onDeleteClub provided */}
        {request.requestType === 'CLUB_DELETION' && request.clubId && onDeleteClub && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50/60 p-3 dark:border-red-900/60 dark:bg-red-950/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-300">
                Advisor proposes deleting <strong>{request.clubName}</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onDeleteClub({ id: request.clubId, name: request.clubName })
                onClose()
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Club</span>
            </button>
          </div>
        )}

        <form onSubmit={handleResolve} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Administrative Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-2xs focus:border-[#6366f1] focus:outline-hidden focus:ring-2 focus:ring-[#6366f1]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="IN_REVIEW">In Review / Under Investigation</option>
              <option value="RESOLVED">Resolved / Action Taken</option>
              <option value="DISMISSED">Dismissed / No Action Needed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Super Admin Response & Resolution Notes
            </label>
            <textarea
              rows={3}
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="e.g. Discussed with Student Affairs; issuing warning to club executives and scheduled follow-up meeting..."
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
              className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#4f46e5] disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{loading ? 'Updating...' : 'Save & Send Response'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
