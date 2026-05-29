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

  it('should include expenses, withdrawals, income, movements and balance when enabled', () => {
    const data: ReportData = {
      ...baseData,
      totalExpenses: 500,
      totalWithdrawals: 300,
      totalIncome: 200,
      movements: [
        { categoryId: 'cat-1', categoryName: 'novillo', quantity: 5 },
        { categoryId: 'cat-2', categoryName: 'cerdo', quantity: 3 },
      ],
      balance: 2400,
    }
    const text = generateReportText(data, {
      phone: '',
      selectedCategoryIds: ['cat-1', 'cat-2'],
      showPaymentBreakdown: false,
      showExpenses: true,
      showWithdrawals: true,
      showIncome: true,
      showMovements: true,
      showBalance: true,
    })
    expect(text).toContain('Gastos')
    expect(text).toContain('500')
    expect(text).toContain('Retiros')
    expect(text).toContain('300')
    expect(text).toContain('Ingresos')
    expect(text).toContain('200')
    expect(text).toContain('Medias res recibidas')
    expect(text).toContain('novillo: 5')
    expect(text).toContain('cerdo: 3')
    expect(text).toContain('Balance')
    expect(text).toContain('2.400')
  })

  it('should format dates as DD/MM in the header', () => {
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
    expect(text).toContain('25/05')
    expect(text).toContain('31/05')
  })
})

describe('getReportData', () => {
  beforeEach(async () => {
    const { db } = await import('../../db')
    await db.transactions.clear()
    await db.inventoryMovements.clear()
    await db.inventoryCategories.clear()
  })

  it('should return sales grouped by day', async () => {
    const { getReportData } = await import('../ReportService')
    const { db } = await import('../../db')

    await db.transactions.bulkAdd([
      {
        id: crypto.randomUUID(),
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'sale' as const,
        amount: 1000,
        paymentMethod: 'cash' as const,
        createdAt: '2026-05-25T10:00:00.000Z',
        updatedAt: '2026-05-25T10:00:00.000Z',
      },
      {
        id: crypto.randomUUID(),
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'sale' as const,
        amount: 2000,
        paymentMethod: 'transfer' as const,
        createdAt: '2026-05-26T10:00:00.000Z',
        updatedAt: '2026-05-26T10:00:00.000Z',
      },
    ])

    const data = await getReportData(
      'branch-1',
      'Test Branch',
      '2026-05-25',
      '2026-05-31',
      {
        phone: '',
        selectedCategoryIds: [],
        showPaymentBreakdown: false,
        showExpenses: false,
        showWithdrawals: false,
        showIncome: false,
        showMovements: false,
        showBalance: false,
      }
    )

    expect(data.branchName).toBe('Test Branch')
    expect(data.salesByDay).toHaveLength(7) // Mon-Sun = 7 days
    expect(data.salesByDay[0].total).toBe(1000) // Monday
    expect(data.salesByDay[1].total).toBe(2000) // Tuesday
    expect(data.totalSales).toBe(3000)
  })

  it('should return zeroes for days without sales', async () => {
    const { getReportData } = await import('../ReportService')

    const data = await getReportData(
      'branch-1',
      'Test Branch',
      '2026-05-25',
      '2026-05-31',
      {
        phone: '',
        selectedCategoryIds: [],
        showPaymentBreakdown: false,
        showExpenses: false,
        showWithdrawals: false,
        showIncome: false,
        showMovements: false,
        showBalance: false,
      }
    )

    expect(data.salesByDay).toHaveLength(7)
    expect(data.salesByDay.every((d) => d.total === 0)).toBe(true)
    expect(data.totalSales).toBe(0)
  })

  it('should aggregate optional fields when enabled', async () => {
    const { getReportData } = await import('../ReportService')
    const { db } = await import('../../db')

    await db.transactions.bulkAdd([
      {
        id: crypto.randomUUID(),
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'sale' as const,
        amount: 5000,
        paymentMethod: 'cash' as const,
        createdAt: '2026-05-27T10:00:00.000Z',
        updatedAt: '2026-05-27T10:00:00.000Z',
      },
      {
        id: crypto.randomUUID(),
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'expense' as const,
        amount: 300,
        paymentMethod: 'cash' as const,
        createdAt: '2026-05-27T12:00:00.000Z',
        updatedAt: '2026-05-27T12:00:00.000Z',
      },
      {
        id: crypto.randomUUID(),
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'withdrawal' as const,
        amount: 200,
        paymentMethod: 'cash' as const,
        createdAt: '2026-05-27T14:00:00.000Z',
        updatedAt: '2026-05-27T14:00:00.000Z',
      },
      {
        id: crypto.randomUUID(),
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'income' as const,
        amount: 100,
        paymentMethod: 'cash' as const,
        createdAt: '2026-05-27T16:00:00.000Z',
        updatedAt: '2026-05-27T16:00:00.000Z',
      },
    ])

    await db.inventoryCategories.add({
      id: 'cat-1',
      name: 'novillo',
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
    })

    await db.inventoryMovements.add({
      id: crypto.randomUUID(),
      sessionId: 'session-1',
      branchId: 'branch-1',
      inventoryCategoryId: 'cat-1',
      type: 'in' as const,
      quantity: 5,
      createdAt: '2026-05-27T10:00:00.000Z',
      updatedAt: '2026-05-27T10:00:00.000Z',
    })

    const data = await getReportData(
      'branch-1',
      'Test Branch',
      '2026-05-25',
      '2026-05-31',
      {
        phone: '',
        selectedCategoryIds: ['cat-1'],
        showPaymentBreakdown: false,
        showExpenses: true,
        showWithdrawals: true,
        showIncome: true,
        showMovements: true,
        showBalance: true,
      }
    )

    expect(data.totalSales).toBe(5000)
    expect(data.totalExpenses).toBe(300)
    expect(data.totalWithdrawals).toBe(200)
    expect(data.totalIncome).toBe(100)
    expect(data.movements).toBeDefined()
    expect(data.movements).toHaveLength(1)
    expect(data.movements![0].categoryName).toBe('novillo')
    expect(data.movements![0].quantity).toBe(5)
    expect(data.balance).toBe(4600) // 5000 - 300 - 200 + 100
  })

  it('should filter out transactions outside date range', async () => {
    const { getReportData } = await import('../ReportService')
    const { db } = await import('../../db')

    await db.transactions.add({
      id: crypto.randomUUID(),
      sessionId: 'session-1',
      branchId: 'branch-1',
      type: 'sale' as const,
      amount: 999,
      paymentMethod: 'cash' as const,
      createdAt: '2026-05-20T10:00:00.000Z', // before range
      updatedAt: '2026-05-20T10:00:00.000Z',
    })

    const data = await getReportData(
      'branch-1',
      'Test Branch',
      '2026-05-25',
      '2026-05-31',
      {
        phone: '',
        selectedCategoryIds: [],
        showPaymentBreakdown: false,
        showExpenses: false,
        showWithdrawals: false,
        showIncome: false,
        showMovements: false,
        showBalance: false,
      }
    )

    expect(data.totalSales).toBe(0) // transaction from May 20 excluded
  })
})
