import React from 'react'
import { Radar } from 'react-chartjs-2'
import './ChartSetup'

export default function RadarChartJS({ data, options = {}, height = 260, ariaLabel = 'Radar Chart' }) {
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
          font: { weight: '500', size: 11 },
        },
      },
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(226, 232, 240, 0.8)',
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.8)',
        },
        pointLabels: {
          color: '#64748b',
          font: { size: 11, weight: '500' },
        },
        ticks: {
          display: false,
        },
      },
    },
    ...options,
  }

  return (
    <div style={{ height }} aria-label={ariaLabel} className="w-full relative">
      <Radar data={data} options={defaultOptions} />
    </div>
  )
}
