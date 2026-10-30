import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import './ChartSetup'

export default function DoughnutChartJS({
  data,
  options = {},
  height = 240,
  centerLabel,
  centerSublabel,
  ariaLabel = 'Doughnut Chart',
}) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          padding: 14,
          color: '#64748b',
          font: { weight: '500', size: 11 },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    ...options,
  }

  return (
    <div style={{ height }} aria-label={ariaLabel} className="w-full relative flex items-center justify-center">
      <Doughnut data={data} options={defaultOptions} />
      {(centerLabel || centerSublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-7">
          {centerLabel && (
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {centerLabel}
            </span>
          )}
          {centerSublabel && (
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {centerSublabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
