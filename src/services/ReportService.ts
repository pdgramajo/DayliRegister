import {
  TransactionRepository,
  InventoryMovementRepository,
} from '../repositories'
import { InventoryCategoryService } from './InventoryCategoryService'
import type { ReportConfig } from '../pages/Report/useReportStorage'

export interface DaySales {
  date: string // ISO date YYYY-MM-DD
  dayName: string // "Lunes"
  dayNumber: number // 4
  total: number
  cash: number
  transfer: number
}

export interface CategoryMovement {
  categoryId: string
  categoryName: string
  quantity: number
}

export interface ReportData {
  branchName: string
  from: string // ISO date
  to: string // ISO date
  salesByDay: DaySales[]
  totalSales: number
  totalExpenses?: number
  totalWithdrawals?: number
  totalIncome?: number
  movements?: CategoryMovement[]
  balance?: number
}

const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

const toISODate = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const parseISODate = (iso: string): Date => {
  // Full ISO datetime (e.g. "2026-05-25T14:30:00.000Z") → use standard Date constructor
  if (iso.includes('T')) return new Date(iso)
  // Date-only (YYYY-MM-DD) → use local-time constructor to avoid UTC offset issues
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Snaps a date to the Monday of its week */
export const snapToMonday = (isoDate: string): string => {
  const d = parseISODate(isoDate)
  const day = d.getDay() // 0=Sun, 1=Mon...
  const diff = day === 0 ? 1 : 1 - day // Sunday → go forward 1 (next day), others → go back to Monday
  d.setDate(d.getDate() + diff)
  return toISODate(d)
}

/** Snaps a date to the Sunday of its week */
export const snapToSunday = (isoDate: string): string => {
  const d = parseISODate(isoDate)
  const day = d.getDay() // 0=Sun, 1=Mon...
  const diff = day === 0 ? 0 : 7 - day // Sunday → stay, others → go forward to Sunday
  d.setDate(d.getDate() + diff)
  return toISODate(d)
}

export const getWeekRange = (): [string, string] => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon...
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return [toISODate(monday), toISODate(sunday)]
}

export const getReportData = async (
  branchId: string,
  branchName: string,
  from: string,
  to: string,
  config: ReportConfig
): Promise<ReportData> => {
  const fromDate = parseISODate(from)
  const toDate = parseISODate(to)
  toDate.setHours(23, 59, 59, 999)

  const allTransactions = await TransactionRepository.getByBranchId(branchId)

  // Filter by date range
  const inRange = allTransactions.filter((t) => {
    const tDate = parseISODate(t.createdAt)
    return tDate >= fromDate && tDate <= toDate
  })

  // Sales by day
  const sales = inRange.filter((t) => t.type === 'sale')
  const salesByDayMap = new Map<
    string,
    { total: number; cash: number; transfer: number }
  >()

  for (const s of sales) {
    const day = toISODate(parseISODate(s.createdAt))
    const entry = salesByDayMap.get(day) || { total: 0, cash: 0, transfer: 0 }
    entry.total += s.amount
    if (s.paymentMethod === 'cash') entry.cash += s.amount
    else if (s.paymentMethod === 'transfer') entry.transfer += s.amount
    // If no paymentMethod, count as cash for simplicity
    else entry.cash += s.amount
    salesByDayMap.set(day, entry)
  }

  // Build salesByDay sorted
  const salesByDay: DaySales[] = []
  const cursor = new Date(fromDate)
  while (cursor <= toDate) {
    const dayStr = toISODate(cursor)
    const entry = salesByDayMap.get(dayStr)
    salesByDay.push({
      date: dayStr,
      dayName: DAY_NAMES[cursor.getDay()],
      dayNumber: cursor.getDate(),
      total: entry?.total ?? 0,
      cash: entry?.cash ?? 0,
      transfer: entry?.transfer ?? 0,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  const totalSales = sales.reduce((sum, t) => sum + t.amount, 0)

  // Optional aggregations
  let totalExpenses: number | undefined
  let totalWithdrawals: number | undefined
  let totalIncome: number | undefined

  if (config.showExpenses) {
    totalExpenses = inRange
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }
  if (config.showWithdrawals) {
    totalWithdrawals = inRange
      .filter((t) => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0)
  }
  if (config.showIncome) {
    totalIncome = inRange
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  // Inventory movements
  let movements: CategoryMovement[] | undefined
  if (config.showMovements && config.selectedCategoryIds.length > 0) {
    const allMovements =
      await InventoryMovementRepository.getByBranchId(branchId)
    const categories = await InventoryCategoryService.getAllCategories()
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

    const inRangeMovements = allMovements.filter((m) => {
      const mDate = parseISODate(m.createdAt)
      return (
        mDate >= fromDate &&
        mDate <= toDate &&
        m.type === 'in' &&
        config.selectedCategoryIds.includes(m.inventoryCategoryId)
      )
    })

    const movementMap = new Map<string, number>()
    for (const m of inRangeMovements) {
      const current = movementMap.get(m.inventoryCategoryId) ?? 0
      movementMap.set(m.inventoryCategoryId, current + m.quantity)
    }

    movements = config.selectedCategoryIds
      .map((catId) => ({
        categoryId: catId,
        categoryName: categoryMap.get(catId) ?? 'Sin categoría',
        quantity: movementMap.get(catId) ?? 0,
      }))
      .filter((m) => m.quantity > 0 || true) // show even if 0
  }

  // Balance
  let balance: number | undefined
  if (config.showBalance) {
    balance =
      totalSales -
      (totalExpenses ?? 0) -
      (totalWithdrawals ?? 0) +
      (totalIncome ?? 0)
  }

  return {
    branchName,
    from,
    to,
    salesByDay,
    totalSales,
    totalExpenses,
    totalWithdrawals,
    totalIncome,
    movements,
    balance,
  }
}

const formatReportDate = (iso: string): string => {
  const d = parseISODate(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

export const generateReportText = (
  data: ReportData,
  config: ReportConfig
): string => {
  const lines: string[] = []

  lines.push('REPORTE SEMANAL')
  lines.push(
    `Período: ${formatReportDate(data.from)} - ${formatReportDate(data.to)}`
  )
  lines.push('')
  lines.push(`SUCURSAL: ${data.branchName}`)
  lines.push('-'.repeat(30))

  // Sales by day
  lines.push('Ventas por día')
  for (const day of data.salesByDay) {
    if (config.showPaymentBreakdown) {
      lines.push(
        `${day.dayName} ${day.dayNumber} => $ ${day.total.toLocaleString('es-AR')}  ($ ${day.cash.toLocaleString('es-AR')} ef. / $ ${day.transfer.toLocaleString('es-AR')} trans.)`
      )
    } else {
      lines.push(
        `${day.dayName} ${day.dayNumber} => $ ${day.total.toLocaleString('es-AR')}`
      )
    }
  }
  lines.push('')
  lines.push(`Total semana: $ ${data.totalSales.toLocaleString('es-AR')}`)

  if (config.showExpenses && data.totalExpenses !== undefined) {
    lines.push(`Gastos: $ ${data.totalExpenses.toLocaleString('es-AR')}`)
  }
  if (config.showWithdrawals && data.totalWithdrawals !== undefined) {
    lines.push(`Retiros: $ ${data.totalWithdrawals.toLocaleString('es-AR')}`)
  }
  if (config.showIncome && data.totalIncome !== undefined) {
    lines.push(`Ingresos: $ ${data.totalIncome.toLocaleString('es-AR')}`)
  }

  lines.push('-'.repeat(30))

  // Inventory movements
  if (config.showMovements && data.movements) {
    lines.push('Medias res recibidas')
    for (const m of data.movements) {
      lines.push(`${m.categoryName}: ${m.quantity}`)
    }
    lines.push('-'.repeat(30))
  }

  // Balance
  if (config.showBalance && data.balance !== undefined) {
    lines.push(`Balance: $ ${data.balance.toLocaleString('es-AR')}`)
    lines.push('-'.repeat(30))
  }

  return lines.join('\n')
}
