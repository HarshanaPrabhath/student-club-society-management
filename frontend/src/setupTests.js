import '@testing-library/jest-dom/vitest'
import React from 'react'
import { vi } from 'vitest'

if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

vi.mock('react-chartjs-2', () => ({
  Bar: (props) => React.createElement('div', { 'data-testid': 'bar-chart', role: 'img', 'aria-label': props.options?.ariaLabel || 'Bar Chart' }),
  Line: (props) => React.createElement('div', { 'data-testid': 'line-chart', role: 'img', 'aria-label': props.options?.ariaLabel || 'Line Chart' }),
  Doughnut: (props) => React.createElement('div', { 'data-testid': 'doughnut-chart', role: 'img', 'aria-label': props.options?.ariaLabel || 'Doughnut Chart' }),
  Radar: (props) => React.createElement('div', { 'data-testid': 'radar-chart', role: 'img', 'aria-label': props.options?.ariaLabel || 'Radar Chart' }),
  Pie: (props) => React.createElement('div', { 'data-testid': 'pie-chart', role: 'img', 'aria-label': props.options?.ariaLabel || 'Pie Chart' }),
}))
