import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchSessionById,
  closeSession,
  clearCurrentSession,
} from '../../store/sessionSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import { Button } from '../../components/ui'
import { Entities } from '../../types/entities'
import { formatDate, formatMoney } from '../../lib/formatters'
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  PiggyBank,
  Plus,
  X,
  ArrowDownLeft,
  ArrowUpLeft,
} from 'lucide-react'

type TabType = 'movements' | 'inventory'
type TransactionFilter = 'all' | 'cash' | 'transfer' | 'expenses'

const mockTransactions = [
  {
    id: '1',
    type: 'expense',
    amount: 100,
    description: 'desayuno',
    createdAt: '2026-05-17T20:24:00Z',
  },
  {
    id: '2',
    type: 'withdrawal',
    amount: 10,
    description: 'Robeto (Dueño)',
    createdAt: '2026-05-12T16:33:00Z',
  },
  {
    id: '3',
    type: 'sale',
    paymentMethod: 'transfer',
    amount: 5000,
    description: 'descripcion corta',
    createdAt: '2026-05-12T00:29:00Z',
  },
  {
    id: '4',
    type: 'sale',
    paymentMethod: 'cash',
    amount: 1400000,
    description: '',
    createdAt: '2026-05-12T00:29:00Z',
  },
]

const mockInventoryMovements = [
  {
    id: '1',
    type: 'in',
    quantity: 10,
    description: 'Cervezas',
    createdAt: '2026-05-17T18:00:00Z',
  },
  {
    id: '2',
    type: 'out',
    quantity: 5,
    description: 'Refrescos',
    createdAt: '2026-05-16T14:00:00Z',
  },
]

export const SessionDetail = () => {
  const { id: branchId, sessionId } = useParams<{
    id: string
    sessionId: string
  }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState<TabType>('movements')
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>('all')

  const { currentSession, isLoading } = useAppSelector(
    (state: RootState) => state.sessions
  )

  useEffect(() => {
    if (sessionId) {
      dispatch(fetchSessionById(sessionId))
    }
    return () => {
      dispatch(clearCurrentSession())
    }
  }, [dispatch, sessionId])

  const handleCloseSession = () => {
    const balance = prompt('Ingrese el balance de cierre (opcional):')
    const closingBalance = balance ? parseFloat(balance) : undefined
    if (branchId && sessionId) {
      dispatch(closeSession({ id: sessionId, closingBalance }))
    }
  }

  if (isLoading || !currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const isOpen = currentSession.status === Entities.CashSessionStatus.OPEN

  const cashSales = mockTransactions
    .filter((t) => t.type === 'sale' && t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.amount, 0)

  const transferSales = mockTransactions
    .filter((t) => t.type === 'sale' && t.paymentMethod === 'transfer')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalSales = mockTransactions
    .filter((t) => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = mockTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalWithdrawals = mockTransactions
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0)

  const cashInBox =
    (currentSession.initialAmount || 0) +
    cashSales -
    totalExpenses -
    totalWithdrawals

  const filteredTransactions = mockTransactions.filter((t) => {
    if (transactionFilter === 'all') return true
    if (transactionFilter === 'cash')
      return t.type === 'sale' && t.paymentMethod === 'cash'
    if (transactionFilter === 'transfer')
      return t.type === 'sale' && t.paymentMethod === 'transfer'
    if (transactionFilter === 'expenses')
      return t.type === 'expense' || t.type === 'withdrawal'
    return true
  })

  const getTransactionLabel = (type: string, paymentMethod?: string) => {
    if (type === 'sale' && paymentMethod === 'transfer') return 'Venta'
    if (type === 'sale' && paymentMethod === 'cash') return 'Venta'
    if (type === 'expense') return 'Gasto'
    if (type === 'withdrawal') return 'Retiro'
    if (type === 'income') return 'Ingreso'
    return type
  }

  const getPaymentMethodLabel = (paymentMethod?: string) => {
    if (paymentMethod === 'transfer') return 'Transferencia'
    if (paymentMethod === 'cash') return 'Efectivo'
    return null
  }

  const getPaymentMethodColor = (paymentMethod?: string) => {
    if (paymentMethod === 'transfer') return 'text-blue-600 dark:text-blue-400'
    if (paymentMethod === 'cash') return 'text-green-600 dark:text-green-300'
    return ''
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate(`/branches/${branchId}/sessions`)}
          className="text-sm text-content-500 hover:text-content-700 dark:hover:text-content-300 transition-colors"
        >
          ← Atrás
        </button>
        <span className="text-lg font-semibold text-content-900 dark:text-content-100">
          {currentSession.name}
        </span>
        {isOpen && (
          <Button variant="destructive" size="sm" onClick={handleCloseSession}>
            Cerrar
          </Button>
        )}
        {!isOpen && <div className="w-16" />}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        <div className="p-1.5 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Wallet className="size-3 text-green-600" />
            <span className="text-md text-green-600 dark:text-green-300">
              Efectivo
            </span>
          </div>
          <p className="text-xl font-semibold text-green-600 dark:text-green-300">
            {formatMoney(cashSales)}
          </p>
        </div>

        <div className="p-1.5 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <ArrowUpRight className="size-3 text-blue-500" />
            <span className="text-md text-blue-600 dark:text-blue-400">
              Transferencias
            </span>
          </div>
          <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            {formatMoney(transferSales)}
          </p>
        </div>

        <div className="p-1.5 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <TrendingUp className="size-3 text-indigo-600" />
            <span className="text-md text-content-500">Total Ventas</span>
          </div>
          <p className="text-xl font-semibold text-content-900 dark:text-content-100">
            {formatMoney(totalSales)}
          </p>
        </div>

        <div className="p-1.5 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <PiggyBank className="size-3 text-amber-600" />
            <span className="text-md text-content-500">Dinero Caja</span>
          </div>
          <p className="text-xl font-semibold text-content-900 dark:text-content-100">
            {formatMoney(cashInBox)}
          </p>
        </div>
      </div>

      <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-lg mb-2">
        <button
          onClick={() => setActiveTab('movements')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'movements'
              ? 'bg-white dark:bg-surface-700 text-content-900 dark:text-content-100 font-semibold shadow-sm'
              : 'text-content-500 hover:text-content-700'
          }`}
        >
          Movimientos ({mockTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'inventory'
              ? 'bg-white dark:bg-surface-700 text-content-900 dark:text-content-100 font-semibold shadow-sm'
              : 'text-content-500 hover:text-content-700'
          }`}
        >
          Inventario ({mockInventoryMovements.length})
        </button>
      </div>

      {activeTab === 'movements' && (
        <>
          <div className="flex justify-between gap-2 mb-2">
            <Button variant="outline" className="h-8 flex-1">
              <Plus className="size-4 mr-1" />
              Venta
            </Button>
            <Button variant="outline" className="h-8 flex-1">
              <Plus className="size-4 mr-1" />
              Gasto
            </Button>
            <Button variant="outline" className="h-8 flex-1">
              <Plus className="size-4 mr-1" />
              Retiro
            </Button>
          </div>
          <div className="flex justify-between gap-2 mb-2">
            {(['all', 'cash', 'transfer', 'expenses'] as const).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setTransactionFilter(filter)}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    transactionFilter === filter
                      ? 'bg-surface-200 dark:bg-surface-700 text-content-900 dark:text-content-100 font-medium'
                      : 'bg-surface-100 dark:bg-surface-800 text-content-600 dark:text-content-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                  }`}
                >
                  {filter === 'all' && 'Todos'}
                  {filter === 'cash' && 'Efectivo'}
                  {filter === 'transfer' && 'Transf'}
                  {filter === 'expenses' && 'Gastos'}
                </button>
              )
            )}
          </div>

          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-content-500 py-8">
                No hay movimientos
              </p>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-content-900 dark:text-content-100">
                      {getTransactionLabel(
                        transaction.type,
                        transaction.paymentMethod
                      )}
                      {getPaymentMethodLabel(transaction.paymentMethod) && (
                        <span
                          className={getPaymentMethodColor(
                            transaction.paymentMethod
                          )}
                        >
                          {' ('}
                          {getPaymentMethodLabel(transaction.paymentMethod)}
                          {')'}
                        </span>
                      )}
                    </p>
                    {transaction.description && (
                      <p className="text-xs text-content-500">
                        {transaction.description}
                      </p>
                    )}
                    <p className="text-xs text-content-400">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        transaction.type === 'sale'
                          ? transaction.paymentMethod === 'cash'
                            ? 'text-green-600 dark:text-green-300'
                            : 'text-blue-600 dark:text-blue-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.type === 'sale' ? '+' : '-'}
                      {formatMoney(transaction.amount)}
                    </span>
                    <button className="p-1 text-content-400 hover:text-red-600">
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-2">
          <div className="flex justify-between gap-2 mb-2">
            <Button variant="outline" className="h-8 flex-1">
              <Plus className="size-4 mr-1" />
              Entrada
            </Button>
            <Button variant="outline" className="h-8 flex-1">
              <Plus className="size-4 mr-1" />
              Salida
            </Button>
          </div>
          {mockInventoryMovements.length === 0 ? (
            <p className="text-center text-content-500 py-8">
              No hay movimientos de inventario
            </p>
          ) : (
            mockInventoryMovements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700"
              >
                <div className="flex items-center gap-2">
                  {movement.type === 'in' ? (
                    <ArrowDownLeft className="size-4 text-green-600" />
                  ) : (
                    <ArrowUpLeft className="size-4 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-content-900 dark:text-content-100">
                      {movement.type === 'in' ? 'Entrada' : 'Salida'}
                    </p>
                    <p className="text-xs text-content-500">
                      {movement.description}
                    </p>
                    <p className="text-xs text-content-400">
                      {formatDate(movement.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {movement.type === 'in' ? '+' : '-'}
                    {movement.quantity}
                  </span>
                  <button className="p-1 text-content-400 hover:text-red-600">
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
