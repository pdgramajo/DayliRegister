import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReportResult } from '../ReportResult'
import type { ReportData } from '../../../services/ReportService'

const mockData: ReportData = {
  branchName: 'Test Branch',
  from: '2026-05-25',
  to: '2026-05-31',
  salesByDay: [
    {
      date: '2026-05-25',
      dayName: 'Lunes',
      dayNumber: 25,
      total: 1000,
      cash: 500,
      transfer: 500,
    },
  ],
  totalSales: 1000,
  totalExpenses: 200,
  totalWithdrawals: 100,
  totalIncome: 50,
  balance: 750,
}

describe('ReportResult', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render report preview when there is data', () => {
    render(<ReportResult data={mockData} reportText="REPORTE SEMANAL" />)
    expect(screen.getByText('Vista previa')).toBeInTheDocument()
    expect(screen.getByText('REPORTE SEMANAL')).toBeInTheDocument()
  })

  it('should show copy button', () => {
    render(<ReportResult data={mockData} reportText="REPORTE SEMANAL" />)
    expect(screen.getByText('Copiar texto')).toBeInTheDocument()
  })

  it('should show empty state when no sales', () => {
    const emptyData: ReportData = {
      branchName: 'Test',
      from: '2026-05-25',
      to: '2026-05-31',
      salesByDay: [],
      totalSales: 0,
    }
    render(<ReportResult data={emptyData} reportText="" />)
    expect(
      screen.getByText('No hay datos para el período seleccionado.')
    ).toBeInTheDocument()
  })
})
