import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpLeft,
  Copy,
  Check,
  ClipboardList,
  RefreshCw,
} from 'lucide-react'
import { Button, toast } from '../../components/ui'
import { LoggerService } from '../../services/LoggerService'
import { DatePickerCard } from '../Report/DatePickerCard'
import { InventoryMovementService } from '../../services/InventoryMovementService'
import { InventoryCategoryService } from '../../services/InventoryCategoryService'
import { SessionService } from '../../services/SessionService'
import { getWeekRange } from '../../services/ReportService'
import { formatDate } from '../../lib/formatters'
import {
  Entities,
  type InventoryMovement,
  type InventoryCategory,
  type CashSession,
} from '../../types/entities'
import { ROUTES, buildRoute } from '../../constants/routes'

interface CategorySummary {
  categoryId: string
  categoryName: string
  totalIn: number
  totalOut: number
  net: number
}

const INVENTORY_TYPES = [
  { value: '', label: 'Todos' },
  { value: Entities.InventoryMovementTypes.IN, label: 'Entradas' },
  { value: Entities.InventoryMovementTypes.OUT, label: 'Salidas' },
] as const

export const InventoryMovements = () => {
  const { id: branchId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [sessionMap, setSessionMap] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Filters
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const loadData = useCallback(async () => {
    if (!branchId) return
    setIsLoading(true)
    try {
      const [allMovements, allCategories, allSessions] = await Promise.all([
        InventoryMovementService.getByBranchId(branchId),
        InventoryCategoryService.getAllCategories(),
        SessionService.getSessionsByBranch(branchId),
      ])
      setMovements(allMovements)
      setCategories(allCategories)
      setSessionMap(
        new Map(allSessions.map((s: CashSession) => [s.id, s.name]))
      )
    } catch (error) {
      toast.error('Error al cargar movimientos')
      console.error(error)
      LoggerService.error(
        'Error al cargar movimientos',
        'InventoryMovements.loadData',
        error
      )
    } finally {
      setIsLoading(false)
    }
  }, [branchId])

  useEffect(() => {
    const [monday, sunday] = getWeekRange()
    setFromDate(monday)
    setToDate(sunday)
    loadData()
  }, [loadData])

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

  const filteredMovements = movements.filter((m) => {
    if (typeFilter && m.type !== typeFilter) return false
    if (categoryFilter && m.inventoryCategoryId !== categoryFilter) return false
    if (fromDate && m.createdAt < fromDate) return false
    if (toDate) {
      const toEnd = new Date(toDate)
      toEnd.setHours(23, 59, 59, 999)
      if (new Date(m.createdAt) > toEnd) return false
    }
    return true
  })

  // Compute summary by category
  const summaries = new Map<string, CategorySummary>()
  for (const m of filteredMovements) {
    const existing = summaries.get(m.inventoryCategoryId) || {
      categoryId: m.inventoryCategoryId,
      categoryName: categoryMap.get(m.inventoryCategoryId) ?? 'Sin categoría',
      totalIn: 0,
      totalOut: 0,
      net: 0,
    }
    if (m.type === Entities.InventoryMovementTypes.IN) {
      existing.totalIn += m.quantity
      existing.net += m.quantity
    } else {
      existing.totalOut += m.quantity
      existing.net -= m.quantity
    }
    summaries.set(m.inventoryCategoryId, existing)
  }
  const summaryList = Array.from(summaries.values())

  const generateSummaryText = useCallback((): string => {
    const lines: string[] = []
    lines.push('RECEPCIONES')
    lines.push(
      `Período: ${fromDate ? fromDate.split('-').reverse().join('/') : '—'} - ${toDate ? toDate.split('-').reverse().join('/') : '—'}`
    )
    lines.push('')

    if (summaryList.length === 0) {
      lines.push('Sin movimientos en el período seleccionado.')
      return lines.join('\n')
    }

    lines.push('Resumen por categoría:')
    for (const s of summaryList) {
      const parts = [`${s.categoryName}:`]
      if (s.totalIn > 0) parts.push(`+${s.totalIn}`)
      if (s.totalOut > 0) parts.push(`-${s.totalOut}`)
      parts.push(`= ${s.net > 0 ? '+' : ''}${s.net}`)
      lines.push(parts.join(' '))
    }
    lines.push('')
    lines.push('-'.repeat(30))
    lines.push('')

    for (const m of filteredMovements) {
      const catName = categoryMap.get(m.inventoryCategoryId) ?? 'Sin categoría'
      const sign = m.type === Entities.InventoryMovementTypes.IN ? '+' : '-'
      const sessionName = sessionMap.get(m.sessionId) ?? 'Sesión'
      const date = new Date(m.createdAt).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
      })
      let line = `${sign}${m.quantity} ${catName} — ${sessionName} (${date})`
      if (m.notes) line += ` — ${m.notes}`
      lines.push(line)
    }

    return lines.join('\n')
  }, [
    fromDate,
    toDate,
    summaryList,
    filteredMovements,
    categoryMap,
    sessionMap,
  ])

  const handleCopy = useCallback(async () => {
    const text = generateSummaryText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Resumen copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Error al copiar')
    }
  }, [generateSummaryText])

  return (
    <div className="h-screen flex flex-col bg-surface-50 dark:bg-surface-900">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="shrink-0 px-4 pt-6 sm:px-6 lg:px-8">
          <button
            onClick={() =>
              navigate(buildRoute(ROUTES.BRANCH_SESSIONS, { id: branchId }))
            }
            className="text-sm text-content-500 hover:text-content-700 dark:hover:text-content-300 transition-colors mb-4 block"
          >
            <ArrowLeft className="size-4 inline mr-1" />
            Volver a sucursal
          </button>

          <div className="flex items-center gap-3 mb-6">
            <ClipboardList className="size-6 text-emerald-500" />
            <h1 className="text-xl font-bold text-content-900 dark:text-white">
              Recepciones
            </h1>
          </div>

          {/* Filters */}
          <div className="space-y-2 mb-6">
            {/* Type filter — equal-width pills, auto-adapts to any count */}
            <div className="grid grid-flow-col auto-cols-fr rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-0.5 gap-px">
              {INVENTORY_TYPES.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTypeFilter(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    typeFilter === opt.value
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-content-500 dark:text-content-400 hover:text-content-700 dark:hover:text-content-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Category filter — 4-column grid, wraps automatically */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => setCategoryFilter('')}
                className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors truncate ${
                  categoryFilter === ''
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                    : 'bg-white dark:bg-surface-800 text-content-600 dark:text-content-400 border-surface-200 dark:border-surface-700 hover:border-brand-400 dark:hover:border-brand-500/50 hover:text-brand-600 dark:hover:text-brand-400'
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors truncate ${
                    categoryFilter === cat.id
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'bg-white dark:bg-surface-800 text-content-600 dark:text-content-400 border-surface-200 dark:border-surface-700 hover:border-brand-400 dark:hover:border-brand-500/50 hover:text-brand-600 dark:hover:text-brand-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <DatePickerCard
                label="Desde"
                value={fromDate}
                onChange={setFromDate}
              />
              <DatePickerCard
                label="Hasta"
                value={toDate}
                onChange={setToDate}
              />
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-8 sm:px-6 lg:px-8 space-y-4">
          {/* Summary by category */}
          {summaryList.length > 0 && (
            <section className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-content-700 dark:text-content-300">
                  Resumen por categoría
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5"
                >
                  {copied ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
              <div className="divide-y divide-surface-100 dark:divide-surface-700/50 px-4">
                {summaryList.map((s) => (
                  <div
                    key={s.categoryId}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="text-sm font-medium text-content-700 dark:text-content-300">
                      {s.categoryName}
                    </span>
                    <div className="flex items-center gap-3 text-xs tabular-nums">
                      {s.totalIn > 0 && (
                        <span className="text-green-600 dark:text-green-400">
                          +{s.totalIn}
                        </span>
                      )}
                      {s.totalOut > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          -{s.totalOut}
                        </span>
                      )}
                      <span
                        className={`font-semibold ${
                          s.net > 0
                            ? 'text-green-700 dark:text-green-300'
                            : s.net < 0
                              ? 'text-red-700 dark:text-red-300'
                              : 'text-content-500 dark:text-content-400'
                        }`}
                      >
                        {s.net > 0 ? '+' : ''}
                        {s.net}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Movement list */}
          <section className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-content-700 dark:text-content-300">
                Movimientos
              </h2>
              <button
                onClick={loadData}
                disabled={isLoading}
                className="p-1 text-content-400 hover:text-content-600 dark:hover:text-content-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              </button>
            </div>

            <div className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500" />
                </div>
              ) : filteredMovements.length === 0 ? (
                <p className="text-center text-content-500 py-12 text-sm">
                  No hay movimientos para los filtros seleccionados.
                </p>
              ) : (
                filteredMovements.map((m) => {
                  const isIn = m.type === Entities.InventoryMovementTypes.IN
                  const catName =
                    categoryMap.get(m.inventoryCategoryId) ?? 'Sin categoría'
                  const sessionName = sessionMap.get(m.sessionId) ?? 'Sesión'
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors"
                    >
                      <div
                        className={`shrink-0 size-8 rounded-lg flex items-center justify-center ${
                          isIn
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}
                      >
                        {isIn ? (
                          <ArrowDownLeft className="size-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowUpLeft className="size-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-content-900 dark:text-content-100 truncate">
                            {catName}
                          </span>
                          <span className="text-xs text-content-400 dark:text-content-500 shrink-0">
                            {sessionName}
                          </span>
                        </div>
                        {m.notes && (
                          <p className="text-xs text-content-500 dark:text-content-400 italic truncate">
                            {m.notes}
                          </p>
                        )}
                        <p className="text-xs text-content-400 dark:text-content-500">
                          {formatDate(m.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-sm font-semibold tabular-nums ${
                          isIn
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isIn ? '+' : '-'}
                        {m.quantity}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
