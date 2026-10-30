import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const ICON_TONES = {
  indigo: 'bg-indigo-50 text-[#6366f1] dark:bg-indigo-950/50 dark:text-indigo-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend = '↑ 12%',
  trendLabel = 'since last month',
  tone = 'indigo',
  to,
  onClick,
  className = '',
}) {
  const iconStyle = ICON_TONES[tone] || ICON_TONES.indigo

  const content = (
    <div
      onClick={onClick}
      className={`group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-[#181b24] dark:hover:border-slate-700 ${
        to || onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top Row: Label and Icon Box */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
          {label}
        </p>
        {Icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${iconStyle}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Middle Row: Large Value */}
      <div className="mt-3">
        <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
          {value}
        </p>
      </div>

      {/* Bottom Row: Trend Line */}
      {(trend || trendLabel) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend && (
            <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
              {trend.startsWith('↑') || trend.startsWith('+') ? (
                <span>{trend}</span>
              ) : (
                <span className="flex items-center">
                  <ArrowUpRight className="h-3 w-3 inline" />
                  {trend}
                </span>
              )}
            </span>
          )}
          {trendLabel && (
            <span className="text-slate-400 dark:text-slate-500 font-normal truncate">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="block no-underline">
        {content}
      </Link>
    )
  }

  return content
}
