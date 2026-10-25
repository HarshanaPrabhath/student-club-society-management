import { Award, CheckCircle2, Download, ExternalLink, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { useToast } from '../../components/ToastProvider'
import { fetchMyCertificates } from './certificatesSlice'

function formatDate(iso) {
  if (!iso) return 'Recent'
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return 'Recent'
  }
}

function CertificatesPage() {
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.certificates)
  const { showToast } = useToast()
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => {
    dispatch(fetchMyCertificates())
  }, [dispatch])

  const uniqueClubsCount = useMemo(() => {
    const set = new Set(items.map((c) => c.clubId || c.clubName))
    return set.size
  }, [items])

  async function handleDownload(certificate) {
    setDownloadingId(certificate.id)
    try {
      const res = await api.get(`/certificates/${certificate.id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(res.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `${certificate.clubName.replace(/\s+/g, '-')}-certificate.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      showToast('Could not download certificate', 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 space-y-6">
      {/* Breadcrumb Top */}
      <div className="flex items-center gap-2 text-xs md:text-sm">
        <Link to="/" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 font-medium">
          Home
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="font-semibold text-slate-900 dark:text-white">Certificates</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Certificates
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Official completion and merit certificates earned through active society engagement and event participation.
          </p>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 self-start md:self-center"
        >
          <span>Explore More Events</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Summary Metrics Row (when items exist) */}
      {status !== 'loading' && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Earned</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{items.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Verified Credentials</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{items.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#6366f1] dark:bg-indigo-950/40 dark:text-indigo-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Societies Honored</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{uniqueClubsCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24] space-y-4"
            >
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {status !== 'loading' && items.length === 0 && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 md:p-12 shadow-xs dark:border-slate-800/80 dark:bg-[#181b24]">
          <EmptyState
            icon={Award}
            title="No certificates earned yet"
            description="You will automatically earn verified certificates once you meet attendance thresholds for your clubs and workshops."
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

      {/* Certificates Grid */}
      {status !== 'loading' && items.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((certificate) => (
            <div
              key={certificate.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-slate-800/80 dark:bg-[#181b24] dark:hover:border-slate-700"
            >
              <div className="space-y-4">
                {/* Top Row: Icon + Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25">
                    <Award className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                </div>

                {/* Society Name & Certificate Info */}
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#6366f1] dark:text-white dark:group-hover:text-[#818cf8] transition-colors line-clamp-1">
                    {certificate.clubName}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                    Certificate of Active Society Participation
                  </p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Awarded on {formatDate(certificate.issuedAt)}
                  </p>
                </div>

                {/* Verification Code Box */}
                {certificate.verificationCode && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/50 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Code</span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">
                      {certificate.verificationCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="mt-6 flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  disabled={downloadingId === certificate.id}
                  onClick={() => handleDownload(certificate)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#a855f7] py-2.5 px-3 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-all disabled:opacity-60"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{downloadingId === certificate.id ? 'Downloading…' : 'Download PDF'}</span>
                </button>

                {certificate.verificationCode && (
                  <Link
                    to={`/verify-certificate/${certificate.verificationCode}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800 transition-all shrink-0"
                    title="Public Certificate Verification"
                  >
                    <span>Verify</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CertificatesPage
