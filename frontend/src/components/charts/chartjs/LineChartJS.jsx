import React from 'react'
import { Line } from 'react-chartjs-2'
import './ChartSetup'

export default function LineChartJS({ data, options = {}, height = 260, ariaLabel = 'Trend Line Chart' }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          color: '#64748b',
          font: { weight: '500', size: 12 },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.6)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          precision: 0,
        },
      },
    },
    ...options,
  }

  return (
    <div style={{ height }} aria-label={ariaLabel} className="w-full relative">
      <Line data={data} options={defaultOptions} />
    </div>
  )
}
