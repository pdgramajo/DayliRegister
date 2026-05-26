import { useEffect, useState, useMemo } from 'react'
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
import { Button, toast } from '../../components/ui'
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

const SessionHeader = ({
  name,
  isOpen,
  onClose,
  onBack,
}: {
  name: string
  isOpen: boolean
  onClose: () => void
  onBack: () => void
}) => (
  <div className="flex items-center justify-between mb-2">
    <button
      onClick={onBack}
      className="text-sm text-content-500 hover:text-content-700 dark:hover:text-content-300 transition-colors"
    >
      ← Atrás
    </button>
    <span className="text-lg font-semibold text-content-900 dark:text-content-100">
      {name}
    </span>
    {isOpen ? (
      <Button variant="destructive" size="sm" onClick={onClose}>
        Cerrar
      </Button>
    ) : (
      <div className="w-16" />
    )}
  </div>
)

const SummaryCards = ({
  cashSales,
  transferSales,
  totalSales,
  cashInBox,
}: {
  cashSales: number
  transferSales: number
  totalSales: number
  cashInBox: number
}) => {
  const handleCopy = (value: number) => {
    navigator.clipboard.writeText(value.toString())
    toast.success('Copiado')
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      <Card
        icon={<Wallet width={14} height={14} />}
        iconColor="text-green-600"
        label="Efectivo"
        value={cashSales}
        valueColor="text-green-600"
        onCopy={() => handleCopy(cashSales)}
      />
      <Card
        icon={<ArrowUpRight width={14} height={14} />}
        iconColor="text-blue-500"
        label="Transferencias"
        value={transferSales}
        valueColor="text-blue-600"
        onCopy={() => handleCopy(transferSales)}
      />
      <Card
        icon={<TrendingUp width={14} height={14} />}
        iconColor="text-grey-100"
        label="Total Ventas"
        value={totalSales}
        valueColor="text-grey-100"
        onCopy={() => handleCopy(totalSales)}
      />
      <Card
        icon={<PiggyBank width={14} height={14} />}
        iconColor="text-grey-100"
        label="Dinero Caja"
        value={cashInBox}
        valueColor="text-grey-100"
        onCopy={() => handleCopy(cashInBox)}
      />
    </div>
  )
}

const Card = ({
  icon,
  iconColor,
  label,
  value,
  valueColor = 'text-content-900',
  onCopy,
}: {
  icon: React.ReactNode
  iconColor: string
  label: string
  value: number
  valueColor?: string
  onCopy?: () => void
}) => (
  <button
    onClick={onCopy}
    title="Clic para copiar"
    className="w-full p-1.5 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 text-center hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer"
  >
    <div className="flex items-center justify-center gap-1 mb-0.5">
      <span className={`size-3 ${iconColor}`}>{icon}</span>
      <span className={`text-md ${valueColor}`}>{label}</span>
    </div>
    <p className={`text-xl font-semibold ${valueColor}`}>
      {formatMoney(value)}
    </p>
  </button>
)

const TabSwitch = ({
  activeTab,
  onChange,
  transactionCount,
  inventoryCount,
}: {
  activeTab: TabType
  onChange: (tab: TabType) => void
  transactionCount: number
  inventoryCount: number
}) => (
  <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-lg mb-2">
    <TabButton
      active={activeTab === 'movements'}
      onClick={() => onChange('movements')}
    >
      Movimientos ({transactionCount})
    </TabButton>
    <TabButton
      active={activeTab === 'inventory'}
      onClick={() => onChange('inventory')}
    >
      Inventario ({inventoryCount})
    </TabButton>
  </div>
)

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
      active
        ? 'bg-white dark:bg-surface-700 text-content-900 dark:text-content-100 font-semibold shadow-sm'
        : 'text-content-500 hover:text-content-700'
    }`}
  >
    {children}
  </button>
)

const ActionButtons = ({
  type,
  onNavigate,
}: {
  type: TabType
  onNavigate: (path: string) => void
}) => {
  if (type === 'movements') {
    return (
      <div className="flex justify-between gap-2 mb-2">
        <Button
          variant="outline"
          className="h-8 flex-1"
          onClick={() => onNavigate('sale')}
        >
          <Plus className="size-4 mr-1" />
          Venta
        </Button>
        <Button
          variant="outline"
          className="h-8 flex-1"
          onClick={() => onNavigate('expense')}
        >
          <Plus className="size-4 mr-1" />
          Gasto
        </Button>
        <Button
          variant="outline"
          className="h-8 flex-1"
          onClick={() => onNavigate('withdrawal')}
        >
          <Plus className="size-4 mr-1" />
          Retiro
        </Button>
      </div>
    )
  }
  return (
    <div className="flex justify-between gap-2 mb-2">
      <Button
        variant="outline"
        className="h-8 flex-1"
        onClick={() => onNavigate('in')}
      >
        <Plus className="size-4 mr-1" />
        Entrada
      </Button>
      <Button
        variant="outline"
        className="h-8 flex-1"
        onClick={() => onNavigate('out')}
      >
        <Plus className="size-4 mr-1" />
        Salida
      </Button>
    </div>
  )
}

const TransactionFilters = ({
  transactions,
  filter,
  onChange,
}: {
  transactions: any[]
  filter: TransactionFilter
  onChange: (f: TransactionFilter) => void
}) => {
  const counts = useMemo(
    () => ({
      all: transactions.length,
      cash: transactions.filter(
        (t) =>
          t.type === Entities.TransactionTypes.SALE &&
          t.paymentMethod === Entities.PaymentMethods.CASH
      ).length,
      transfer: transactions.filter(
        (t) =>
          t.type === Entities.TransactionTypes.SALE &&
          t.paymentMethod === Entities.PaymentMethods.TRANSFER
      ).length,
      expenses: transactions.filter(
        (t) =>
          t.type === Entities.TransactionTypes.EXPENSE ||
          t.type === Entities.TransactionTypes.WITHDRAWAL
      ).length,
    }),
    [transactions]
  )

  const labels: Record<TransactionFilter, string> = {
    all: `Todos (${counts.all})`,
    cash: `Efectivo (${counts.cash})`,
    transfer: `Transf (${counts.transfer})`,
    expenses: `Gastos (${counts.expenses})`,
  }

  return (
    <div className="flex justify-between gap-2 mb-2">
      {(['all', 'cash', 'transfer', 'expenses'] as const).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`flex-1 px-1 py-1.5 text-xs rounded-lg transition-colors ${
            filter === f
              ? 'bg-surface-200 dark:bg-surface-700 text-content-900 dark:text-content-100 font-medium'
              : 'bg-surface-100 dark:bg-surface-800 text-content-600 dark:text-content-400 hover:bg-surface-200 dark:hover:bg-surface-700'
          }`}
        >
          {labels[f]}
        </button>
      ))}
    </div>
  )
}

const TransactionItem = ({
  transaction,
  onDelete,
}: {
  transaction: any
  onDelete: (id: string) => void
}) => {
  const getLabel = (type: string) => {
    const labels: Record<string, string> = {
      [Entities.TransactionTypes.SALE]: 'Venta',
      [Entities.TransactionTypes.EXPENSE]: 'Gasto',
      [Entities.TransactionTypes.WITHDRAWAL]: 'Retiro',
      [Entities.TransactionTypes.INCOME]: 'Ingreso',
    }
    return labels[type] || type
  }

  const getPaymentLabel = (pm?: string) => {
    if (pm === Entities.PaymentMethods.TRANSFER) return 'Transferencia'
    if (pm === Entities.PaymentMethods.CASH) return 'Efectivo'
    return null
  }

  const getPaymentColor = (pm?: string) => {
    if (pm === Entities.PaymentMethods.TRANSFER)
      return 'text-blue-600 dark:text-blue-400'
    if (pm === Entities.PaymentMethods.CASH)
      return 'text-green-600 dark:text-green-300'
    return ''
  }

  const isSale = transaction.type === Entities.TransactionTypes.SALE
  const isCash = transaction.paymentMethod === Entities.PaymentMethods.CASH

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
      <div className="flex-1">
        <p className="text-sm font-medium text-content-900 dark:text-content-100">
          {getLabel(transaction.type)}
          {getPaymentLabel(transaction.paymentMethod) && (
            <span className={getPaymentColor(transaction.paymentMethod)}>
              {' ('}
              {getPaymentLabel(transaction.paymentMethod)}
              {')'}
            </span>
          )}
        </p>
        {transaction.description && (
          <p className="text-xs text-content-500">{transaction.description}</p>
        )}
        <p className="text-xs text-content-400">
          {formatDate(transaction.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium ${
            isSale
              ? isCash
                ? 'text-green-600 dark:text-green-300'
                : 'text-blue-600 dark:text-blue-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isSale ? '+' : '-'}
          {formatMoney(transaction.amount)}
        </span>
        <button
          onClick={() => onDelete(transaction.id)}
          className="p-1 text-content-400 hover:text-red-600"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

const InventoryItem = ({
  movement,
  onDelete,
}: {
  movement: any
  onDelete: (id: string) => void
}) => {
  const isIn = movement.type === Entities.InventoryMovementTypes.IN
  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
      <div className="flex items-center gap-2">
        {isIn ? (
          <ArrowDownLeft className="size-4 text-green-600" />
        ) : (
          <ArrowUpLeft className="size-4 text-red-600" />
        )}
        <div>
          <p className="text-sm font-medium text-content-900 dark:text-content-100">
            {isIn ? 'Entrada' : 'Salida'}
          </p>
          <p className="text-xs text-content-500">{movement.description}</p>
          <p className="text-xs text-content-400">
            {formatDate(movement.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium ${isIn ? 'text-green-600' : 'text-red-600'}`}
        >
          {isIn ? '+' : '-'}
          {movement.quantity}
        </span>
        <button
          onClick={() => onDelete(movement.id)}
          className="p-1 text-content-400 hover:text-red-600"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

const TransactionList = ({
  transactions,
  isLoading,
  filter,
  onFilterChange,
  onDelete,
}: {
  transactions: any[]
  isLoading: boolean
  filter: TransactionFilter
  onFilterChange: (f: TransactionFilter) => void
  onDelete: (id: string) => void
}) => {
  const filtered = useMemo(() => {
    if (filter === 'all') return transactions
    if (filter === 'cash')
      return transactions.filter(
        (t) =>
          t.type === Entities.TransactionTypes.SALE &&
          t.paymentMethod === Entities.PaymentMethods.CASH
      )
    if (filter === 'transfer')
      return transactions.filter(
        (t) =>
          t.type === Entities.TransactionTypes.SALE &&
          t.paymentMethod === Entities.PaymentMethods.TRANSFER
      )
    if (filter === 'expenses')
      return transactions.filter(
        (t) =>
          t.type === Entities.TransactionTypes.EXPENSE ||
          t.type === Entities.TransactionTypes.WITHDRAWAL
      )
    return transactions
  }, [transactions, filter])

  return (
    <>
      <TransactionFilters
        transactions={transactions}
        filter={filter}
        onChange={onFilterChange}
      />
      <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-content-500 py-8">
            No hay movimientos
          </p>
        ) : (
          filtered.map((t) => (
            <TransactionItem key={t.id} transaction={t} onDelete={onDelete} />
          ))
        )}
      </div>
    </>
  )
}

const InventoryList = ({
  movements,
  isLoading,
  onDelete,
}: {
  movements: any[]
  isLoading: boolean
  onDelete: (id: string) => void
}) => (
  <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
    {isLoading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    ) : movements.length === 0 ? (
      <p className="text-center text-content-500 py-8">
        No hay movimientos de inventario
      </p>
    ) : (
      movements.map((m) => (
        <InventoryItem key={m.id} movement={m} onDelete={onDelete} />
      ))
    )}
  </div>
)

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
        .unwrap()
        .then(() => toast.success('Sesión cerrada correctamente'))
        .catch((error) => toast.error(error || 'Error al cerrar la sesión'))
    }
  }

  const handleDeleteTransaction = (id: string) => {
    if (confirm('¿Eliminar esta transacción?'))
      dispatch(deleteTransaction(id))
        .unwrap()
        .then(() => toast.success('Transacción eliminada'))
        .catch((error) =>
          toast.error(error || 'Error al eliminar la transacción')
        )
  }

  const handleDeleteInventoryMovement = (id: string) => {
    if (confirm('¿Eliminar este movimiento de inventario?'))
      dispatch(deleteInventoryMovement(id))
        .unwrap()
        .then(() => toast.success('Movimiento eliminado'))
        .catch((error) =>
          toast.error(error || 'Error al eliminar el movimiento')
        )
  }

  const navigateToTransaction = (type: string) =>
    navigate(
      `/branches/${branchId}/sessions/${sessionId}/transaction/new?type=${type}`
    )
  const navigateToInventory = (type: string) =>
    navigate(
      `/branches/${branchId}/sessions/${sessionId}/inventory/new?type=${type}`
    )

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
    .reduce((s, t) => s + t.amount, 0)
  const transferSales = transactions
    .filter(
      (t) =>
        t.type === Entities.TransactionTypes.SALE &&
        t.paymentMethod === Entities.PaymentMethods.TRANSFER
    )
    .reduce((s, t) => s + t.amount, 0)
  const totalSales = transactions
    .filter((t) => t.type === Entities.TransactionTypes.SALE)
    .reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions
    .filter((t) => t.type === Entities.TransactionTypes.EXPENSE)
    .reduce((s, t) => s + t.amount, 0)
  const totalWithdrawals = transactions
    .filter((t) => t.type === Entities.TransactionTypes.WITHDRAWAL)
    .reduce((s, t) => s + t.amount, 0)
  const cashInBox =
    (currentSession.initialAmount || 0) +
    cashSales -
    totalExpenses -
    totalWithdrawals

  const handleNavigate = (path: string) => {
    if (activeTab === 'movements') navigateToTransaction(path)
    else navigateToInventory(path)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <SessionHeader
        name={currentSession.name}
        isOpen={isOpen}
        onClose={handleCloseSession}
        onBack={() => navigate(`/branches/${branchId}/sessions`)}
      />
      <SummaryCards
        cashSales={cashSales}
        transferSales={transferSales}
        totalSales={totalSales}
        cashInBox={cashInBox}
      />
      <TabSwitch
        activeTab={activeTab}
        onChange={setActiveTab}
        transactionCount={transactions.length}
        inventoryCount={inventoryMovements.length}
      />
      <ActionButtons type={activeTab} onNavigate={handleNavigate} />
      {activeTab === 'movements' ? (
        <TransactionList
          transactions={transactions}
          isLoading={transactionsLoading}
          filter={transactionFilter}
          onFilterChange={setTransactionFilter}
          onDelete={handleDeleteTransaction}
        />
      ) : (
        <InventoryList
          movements={inventoryMovements}
          isLoading={transactionsLoading}
          onDelete={handleDeleteInventoryMovement}
        />
      )}
    </div>
  )
}
