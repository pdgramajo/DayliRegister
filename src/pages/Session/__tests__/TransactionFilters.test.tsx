import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionFilters } from '../TransactionFilters'
import type { Transaction } from '../../../types/entities'

const sale: Transaction = {
  id: '1',
  sessionId: 's1',
  branchId: 'b1',
  type: 'sale',
  amount: 100,
  paymentMethod: 'cash',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const transfer: Transaction = {
  ...sale,
  id: '2',
  paymentMethod: 'transfer',
}

const expense: Transaction = {
  ...sale,
  id: '3',
  type: 'expense',
  amount: 50,
  paymentMethod: undefined,
}

const withdrawal: Transaction = {
  ...sale,
  id: '4',
  type: 'withdrawal',
  amount: 30,
  paymentMethod: undefined,
}

const income: Transaction = {
  ...sale,
  id: '5',
  type: 'income',
  amount: 200,
  paymentMethod: undefined,
}

describe('TransactionFilters', () => {
  it('renders all filter options with counts', () => {
    const transactions = [sale, transfer, expense, withdrawal, income]
    render(
      <TransactionFilters
        transactions={transactions}
        filter="all"
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText('Todos (5)')).toBeInTheDocument()
    expect(screen.getByText('Efectivo (2)')).toBeInTheDocument()
    expect(screen.getByText('Transf (1)')).toBeInTheDocument()
    expect(screen.getByText('Gastos (2)')).toBeInTheDocument()
  })

  it('highlights the active filter', () => {
    const transactions = [sale]
    render(
      <TransactionFilters
        transactions={transactions}
        filter="cash"
        onChange={vi.fn()}
      />
    )
    const cashButton = screen.getByText('Efectivo (1)')
    expect(cashButton.className).toContain('font-medium')
  })

  it('calls onChange with the correct filter', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <TransactionFilters
        transactions={[sale, transfer]}
        filter="all"
        onChange={handleChange}
      />
    )
    await user.click(screen.getByText('Transf (1)'))
    expect(handleChange).toHaveBeenCalledWith('transfer')
  })
})
