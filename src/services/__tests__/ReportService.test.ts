import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  snapToMonday,
  snapToSunday,
  getWeekRange,
  generateReportText,
} from '../ReportService'
import type { ReportData } from '../ReportService'

describe('snapToMonday', () => {
  it('should snap Sunday to the next Monday', () => {
    expect(snapToMonday('2026-05-24')).toBe('2026-05-25') // Sun → Mon
  })

  it('should keep Monday unchanged', () => {
    expect(snapToMonday('2026-05-25')).toBe('2026-05-25') // Mon → Mon
  })

  it('should snap Tuesday back to Monday', () => {
    expect(snapToMonday('2026-05-26')).toBe('2026-05-25')
  })

  it('should snap Wednesday back to Monday', () => {
    expect(snapToMonday('2026-05-27')).toBe('2026-05-25')
  })

  it('should snap Thursday back to Monday', () => {
    expect(snapToMonday('2026-05-28')).toBe('2026-05-25')
  })

  it('should snap Friday back to Monday', () => {
    expect(snapToMonday('2026-05-29')).toBe('2026-05-25')
  })

  it('should snap Saturday back to Monday', () => {
    expect(snapToMonday('2026-05-30')).toBe('2026-05-25')
  })

  it('should handle month boundaries', () => {
    // Saturday May 2 → Monday Apr 27
    expect(snapToMonday('2026-05-02')).toBe('2026-04-27')
    // Sunday May 31 → Monday Jun 1
    expect(snapToMonday('2026-05-31')).toBe('2026-06-01')
  })
})

describe('snapToSunday', () => {
  it('should keep Sunday unchanged', () => {
    expect(snapToSunday('2026-05-24')).toBe('2026-05-24')
  })

  it('should snap Monday forward to Sunday', () => {
    expect(snapToSunday('2026-05-25')).toBe('2026-05-31')
  })

  it('should snap Tuesday forward to Sunday', () => {
    expect(snapToSunday('2026-05-26')).toBe('2026-05-31')
  })

  it('should snap Wednesday forward to Sunday', () => {
    expect(snapToSunday('2026-05-27')).toBe('2026-05-31')
  })

  it('should snap Thursday forward to Sunday', () => {
    expect(snapToSunday('2026-05-28')).toBe('2026-05-31')
  })

  it('should snap Friday forward to Sunday', () => {
    expect(snapToSunday('2026-05-29')).toBe('2026-05-31')
  })

  it('should snap Saturday forward to Sunday', () => {
    expect(snapToSunday('2026-05-30')).toBe('2026-05-31')
  })

  it('should handle month boundaries', () => {
    // Saturday May 2 → Sunday May 3
    expect(snapToSunday('2026-05-02')).toBe('2026-05-03')
    // Monday May 25 → Sunday May 31
    expect(snapToSunday('2026-05-25')).toBe('2026-05-31')
  })
})

describe('getWeekRange', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return Monday-Sunday for a Wednesday', () => {
    vi.setSystemTime(new Date('2026-05-27T12:00:00')) // Wednesday
    const [monday, sunday] = getWeekRange()
    expect(monday).toBe('2026-05-25')
    expect(sunday).toBe('2026-05-31')
  })

  it('should return Monday-Sunday for a Sunday', () => {
    vi.setSystemTime(new Date('2026-05-24T12:00:00')) // Sunday
    const [monday, sunday] = getWeekRange()
    expect(monday).toBe('2026-05-18')
    expect(sunday).toBe('2026-05-24')
  })

  it('should return Monday-Sunday for a Monday', () => {
    vi.setSystemTime(new Date('2026-05-25T12:00:00')) // Monday
    const [monday, sunday] = getWeekRange()
    expect(monday).toBe('2026-05-25')
    expect(sunday).toBe('2026-05-31')
  })

  it('should handle year boundaries', () => {
    vi.setSystemTime(new Date('2027-01-01T12:00:00')) // Friday
    const [monday, sunday] = getWeekRange()
    // Dec 28 (Mon) → Jan 3 (Sun)
    expect(monday).toBe('2026-12-28')
    expect(sunday).toBe('2027-01-03')
  })

  it('should always return a 7-day range', () => {
    vi.setSystemTime(new Date('2026-06-15T12:00:00')) // Monday
    const [monday, sunday] = getWeekRange()
    const m = new Date(monday)
    const s = new Date(sunday)
    const diffDays = (s.getTime() - m.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(6)
  })
})

describe('generateReportText', () => {
  const baseData: ReportData = {
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
      {
        date: '2026-05-26',
        dayName: 'Martes',
        dayNumber: 26,
        total: 2000,
        cash: 1500,
        transfer: 500,
      },
    ],
    totalSales: 3000,
  }

  it('should include branch name and period', () => {
    const text = generateReportText(baseData, {
      phone: '',
      selectedCategoryIds: [],
      showPaymentBreakdown: false,
      showExpenses: false,
      showWithdrawals: false,
      showIncome: false,
      showMovements: false,
      showBalance: false,
    })
    expect(text).toContain('REPORTE SEMANAL')
    expect(text).toContain('Test Branch')
    expect(text).toContain('25/05')
    expect(text).toContain('31/05')
  })

  it('should show payment breakdown when enabled', () => {
    const text = generateReportText(baseData, {
      phone: '',
      selectedCategoryIds: [],
      showPaymentBreakdown: true,
      showExpenses: false,
      showWithdrawals: false,
      showIncome: false,
      showMovements: false,
      showBalance: false,
    })
    expect(text).toContain('ef.')
    expect(text).toContain('trans.')
  })

  it('should not show payment breakdown when disabled', () => {
    const text = generateReportText(baseData, {
      phone: '',
      selectedCategoryIds: [],
      showPaymentBreakdown: false,
      showExpenses: false,
      showWithdrawals: false,
      showIncome: false,
      showMovements: false,
      showBalance: false,
    })
    expect(text).not.toContain('ef.')
    expect(text).not.toContain('trans.')
  })

  it('should include total week sales', () => {
    const text = generateReportText(baseData, {
      phone: '',
      selectedCategoryIds: [],
      showPaymentBreakdown: false,
      showExpenses: false,
      showWithdrawals: false,
      showIncome: false,
      showMovements: false,
      showBalance: false,
    })
    expect(text).toContain('Total semana')
    expect(text).toContain('3.000')
  })
})
