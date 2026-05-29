import { useMemo } from 'react'
import { Entities } from '../../types/entities'
import type { Transaction } from '../../types/entities'
import type { TransactionFilter } from './types'

interface TransactionFiltersProps {
  transactions: Transaction[]
  filter: TransactionFilter
  onChange: (f: TransactionFilter) => void
}

export const TransactionFilters = ({
  transactions,
  filter,
  onChange,
}: TransactionFiltersProps) => {
  const counts = useMemo(
    () => ({
      all: transactions.length,
      cash: transactions.filter(
        (t) =>
          (t.type === Entities.TransactionTypes.SALE &&
            t.paymentMethod === Entities.PaymentMethods.CASH) ||
          t.type === Entities.TransactionTypes.INCOME
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
