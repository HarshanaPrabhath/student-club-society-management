import React from 'react'
import { Bar } from 'react-chartjs-2'
import './ChartSetup'

export default function BarChartJS({
  data,
  options = {},
  height = 260,
  horizontal = false,
  ariaLabel = 'Bar Chart',
}) {
  const defaultOptions = {
    indexAxis: horizontal ? 'y' : 'x',
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
          display: horizontal,
          color: 'rgba(226, 232, 240, 0.6)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          precision: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: !horizontal,
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
      <Bar data={data} options={defaultOptions} />
    </div>
  )
}
