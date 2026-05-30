import { useMemo } from 'react'
import { X } from 'lucide-react'
import { Entities, type Transaction } from '../../types/entities'
import { formatDate, formatMoney } from '../../lib/formatters'
import { FILTERS } from '../../constants/session'
import { TransactionFilters } from './TransactionFilters'
import type { TransactionFilter } from './types'

interface TransactionItemProps {
  transaction: Transaction
  isOpen: boolean
  onDelete: (id: string) => void
}

const TransactionItem = ({
  transaction,
  isOpen,
  onDelete,
}: TransactionItemProps) => {
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
  const isPositive =
    isSale || transaction.type === Entities.TransactionTypes.INCOME

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
            isPositive
              ? isSale && isCash
                ? 'text-green-600 dark:text-green-300'
                : isSale
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-green-600 dark:text-green-300'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isPositive ? '+' : '-'}
          {formatMoney(transaction.amount)}
        </span>
        {isOpen && (
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-1 text-content-400 hover:text-red-600"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}

interface TransactionListProps {
  transactions: Transaction[]
  isLoading: boolean
  filter: TransactionFilter
  isOpen: boolean
  onFilterChange: (f: TransactionFilter) => void
  onDelete: (id: string) => void
}

export const TransactionList = ({
  transactions,
  isLoading,
  filter,
  isOpen,
  onFilterChange,
  onDelete,
}: TransactionListProps) => {
  const filtered = useMemo(() => {
    if (filter === FILTERS.ALL) return transactions
    if (filter === FILTERS.CASH)
      return transactions.filter(
        (t) =>
          (t.type === Entities.TransactionTypes.SALE &&
            t.paymentMethod === Entities.PaymentMethods.CASH) ||
          t.type === Entities.TransactionTypes.INCOME
      )
    if (filter === FILTERS.TRANSFER)
      return transactions.filter(
        (t) =>
          t.type === Entities.TransactionTypes.SALE &&
          t.paymentMethod === Entities.PaymentMethods.TRANSFER
      )
    if (filter === FILTERS.EXPENSES)
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
            <TransactionItem
              key={t.id}
              transaction={t}
              isOpen={isOpen}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </>
  )
}
