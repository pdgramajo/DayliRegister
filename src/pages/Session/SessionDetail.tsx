import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchSessionById,
  closeSession,
  clearCurrentSession,
} from '../../store/sessionSlice'
import {
  fetchTransactionsBySession,
  fetchInventoryMovementsBySession,
  deleteTransaction,
  deleteInventoryMovement,
  clearTransactions,
} from '../../store/transactionSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import { Button } from '../../components/ui'
import { Entities } from '../../types/entities'
import { formatDate, formatMoney } from '../../lib/formatters'
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  PiggyBank,
  Plus,
  X,
  ArrowDownLeft,
  ArrowUpLeft,
} from 'lucide-react'

type TabType = 'movements' | 'inventory'
type TransactionFilter = 'all' | 'cash' | 'transfer' | 'expenses'

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

  const { currentSession, isLoading: sessionLoading } = useAppSelector(
    (state: RootState) => state.sessions
  )

  const {
    transactions,
    inventoryMovements,
    isLoading: transactionsLoading,
  } = useAppSelector((state: RootState) => state.transactions)

  useEffect(() => {
    if (sessionId) {
      dispatch(fetchSessionById(sessionId))
      dispatch(fetchTransactionsBySession(sessionId))
      dispatch(fetchInventoryMovementsBySession(sessionId))
    }
    return () => {
      dispatch(clearCurrentSession())
      dispatch(clearTransactions())
    }
  }, [dispatch, sessionId])

  const handleCloseSession = () => {
    const balance = prompt('Ingrese el balance de cierre (opcional):')
    const closingBalance = balance ? parseFloat(balance) : undefined
    if (branchId && sessionId) {
      dispatch(closeSession({ id: sessionId, closingBalance }))
    }
  }

  const handleDeleteTransaction = (id: string) => {
    if (confirm('¿Eliminar esta transacción?')) {
      dispatch(deleteTransaction(id))
    }
  }

  const handleDeleteInventoryMovement = (id: string) => {
    if (confirm('¿Eliminar este movimiento de inventario?')) {
      dispatch(deleteInventoryMovement(id))
    }
  }

  if (sessionLoading || !currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const isOpen = currentSession.status === Entities.CashSessionStatus.OPEN

  const cashSales = transactions
    .filter(
      (t) =>
        t.type === Entities.TransactionTypes.SALE &&
        t.paymentMethod === Entities.PaymentMethods.CASH
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const transferSales = transactions
    .filter(
      (t) =>
        t.type === Entities.TransactionTypes.SALE &&
        t.paymentMethod === Entities.PaymentMethods.TRANSFER
    )
    .reduce((sum, t) => sum + t.amount, 0)

  const totalSales = transactions
    .filter((t) => t.type === Entities.TransactionTypes.SALE)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === Entities.TransactionTypes.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalWithdrawals = transactions
    .filter((t) => t.type === Entities.TransactionTypes.WITHDRAWAL)
    .reduce((sum, t) => sum + t.amount, 0)

  const cashInBox =
    (currentSession.initialAmount || 0) +
    cashSales -
    totalExpenses -
    totalWithdrawals

  const filteredTransactions = transactions.filter((t) => {
    if (transactionFilter === 'all') return true
    if (transactionFilter === 'cash')
      return (
        t.type === Entities.TransactionTypes.SALE &&
        t.paymentMethod === Entities.PaymentMethods.CASH
      )
    if (transactionFilter === 'transfer')
      return (
        t.type === Entities.TransactionTypes.SALE &&
        t.paymentMethod === Entities.PaymentMethods.TRANSFER
      )
    if (transactionFilter === 'expenses')
      return (
        t.type === Entities.TransactionTypes.EXPENSE ||
        t.type === Entities.TransactionTypes.WITHDRAWAL
      )
    return true
  })

  const getTransactionLabel = (type: string) => {
    if (type === Entities.TransactionTypes.SALE) return 'Venta'
    if (type === Entities.TransactionTypes.EXPENSE) return 'Gasto'
    if (type === Entities.TransactionTypes.WITHDRAWAL) return 'Retiro'
    if (type === Entities.TransactionTypes.INCOME) return 'Ingreso'
    return type
  }

  const getPaymentMethodLabel = (paymentMethod?: string) => {
    if (paymentMethod === Entities.PaymentMethods.TRANSFER)
      return 'Transferencia'
    if (paymentMethod === Entities.PaymentMethods.CASH) return 'Efectivo'
    return null
  }

  const getPaymentMethodColor = (paymentMethod?: string) => {
    if (paymentMethod === Entities.PaymentMethods.TRANSFER)
      return 'text-blue-600 dark:text-blue-400'
    if (paymentMethod === Entities.PaymentMethods.CASH)
      return 'text-green-600 dark:text-green-300'
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
          Movimientos ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'inventory'
              ? 'bg-white dark:bg-surface-700 text-content-900 dark:text-content-100 font-semibold shadow-sm'
              : 'text-content-500 hover:text-content-700'
          }`}
        >
          Inventario ({inventoryMovements.length})
        </button>
      </div>

      {activeTab === 'movements' && (
        <>
          <div className="flex justify-between gap-2 mb-2">
            <Button
              variant="outline"
              className="h-8 flex-1"
              onClick={() =>
                navigate(
                  `/branches/${branchId}/sessions/${sessionId}/transaction/new?type=sale`
                )
              }
            >
              <Plus className="size-4 mr-1" />
              Venta
            </Button>
            <Button
              variant="outline"
              className="h-8 flex-1"
              onClick={() =>
                navigate(
                  `/branches/${branchId}/sessions/${sessionId}/transaction/new?type=expense`
                )
              }
            >
              <Plus className="size-4 mr-1" />
              Gasto
            </Button>
            <Button
              variant="outline"
              className="h-8 flex-1"
              onClick={() =>
                navigate(
                  `/branches/${branchId}/sessions/${sessionId}/transaction/new?type=withdrawal`
                )
              }
            >
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
            {transactionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            ) : filteredTransactions.length === 0 ? (
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
                      {getTransactionLabel(transaction.type)}
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
                        transaction.type === Entities.TransactionTypes.SALE
                          ? transaction.paymentMethod ===
                            Entities.PaymentMethods.CASH
                            ? 'text-green-600 dark:text-green-300'
                            : 'text-blue-600 dark:text-blue-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.type === Entities.TransactionTypes.SALE
                        ? '+'
                        : '-'}
                      {formatMoney(transaction.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="p-1 text-content-400 hover:text-red-600"
                    >
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
          {transactionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          ) : inventoryMovements.length === 0 ? (
            <p className="text-center text-content-500 py-8">
              No hay movimientos de inventario
            </p>
          ) : (
            inventoryMovements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700"
              >
                <div className="flex items-center gap-2">
                  {movement.type === Entities.InventoryMovementTypes.IN ? (
                    <ArrowDownLeft className="size-4 text-green-600" />
                  ) : (
                    <ArrowUpLeft className="size-4 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-content-900 dark:text-content-100">
                      {movement.type === Entities.InventoryMovementTypes.IN
                        ? 'Entrada'
                        : 'Salida'}
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
                      movement.type === Entities.InventoryMovementTypes.IN
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {movement.type === Entities.InventoryMovementTypes.IN
                      ? '+'
                      : '-'}
                    {movement.quantity}
                  </span>
                  <button
                    onClick={() => handleDeleteInventoryMovement(movement.id)}
                    className="p-1 text-content-400 hover:text-red-600"
                  >
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
