import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionList } from '../TransactionList'
import type { Transaction } from '../../../types/entities'

const sale: Transaction = {
  id: 'tx-1',
  sessionId: 's1',
  branchId: 'b1',
  type: 'sale',
  amount: 1500,
  paymentMethod: 'cash',
  description: 'Venta de prueba',
  createdAt: '2024-06-15T10:30:00Z',
  updatedAt: '2024-06-15T10:30:00Z',
}

const expense: Transaction = {
  id: 'tx-2',
  sessionId: 's1',
  branchId: 'b1',
  type: 'expense',
  amount: 300,
  paymentMethod: undefined,
  createdAt: '2024-06-15T11:00:00Z',
  updatedAt: '2024-06-15T11:00:00Z',
}

describe('TransactionItem', () => {
  it('renders sale type and payment method', () => {
    render(
      <TransactionList
        transactions={[sale]}
        isLoading={false}
        filter="all"
        isOpen={true}
        onFilterChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Venta')).toBeInTheDocument()
    expect(screen.getByText(/\(Efectivo\)/)).toBeInTheDocument()
  })

  it('shows positive amount for sale', () => {
    render(
      <TransactionList
        transactions={[sale]}
        isLoading={false}
        filter="all"
        isOpen={true}
        onFilterChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText(/\+1\.500/)).toBeInTheDocument()
  })

  it('shows negative amount for expense', () => {
    render(
      <TransactionList
        transactions={[expense]}
        isLoading={false}
        filter="all"
        isOpen={true}
        onFilterChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText(/-300/)).toBeInTheDocument()
  })

  it('shows delete button when isOpen is true', () => {
    render(
      <TransactionList
        transactions={[sale]}
        isLoading={false}
        filter="all"
        isOpen={true}
        onFilterChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    const xButtons = document.querySelectorAll('button svg.lucide-x')
    expect(xButtons.length).toBe(1)
  })

  it('hides delete button when isOpen is false', () => {
    render(
      <TransactionList
        transactions={[sale]}
        isLoading={false}
        filter="all"
        isOpen={false}
        onFilterChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    const xButtons = document.querySelectorAll('button svg.lucide-x')
    expect(xButtons.length).toBe(0)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const handleDelete = vi.fn()
    render(
      <TransactionList
        transactions={[sale]}
        isLoading={false}
        filter="all"
        isOpen={true}
        onFilterChange={vi.fn()}
        onDelete={handleDelete}
      />
    )
    const deleteBtn = document
      .querySelector('button svg.lucide-x')
      ?.closest('button')
    if (deleteBtn) {
      await user.click(deleteBtn)
      expect(handleDelete).toHaveBeenCalledWith('tx-1')
    }
  })

  it('shows transaction description', () => {
    render(
      <TransactionList
        transactions={[sale]}
        isLoading={false}
        filter="all"
        isOpen={true}
        onFilterChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Venta de prueba')).toBeInTheDocument()
  })

  it('shows loading spinner', () => {
    render(
      <TransactionList
        transactions={[]}
        isLoading={true}
        filter="all"
        isOpen={true}
        onFilterChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows empty message when no transactions', () => {
    render(
      <TransactionList
        transactions={[]}
        isLoading={false}
        filter="all"
        isOpen={true}
        onFilterChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('No hay movimientos')).toBeInTheDocument()
  })

  it('filters by cash sales and income', () => {
    const transferSale: Transaction = {
      ...sale,
      id: 'tx-3',
      paymentMethod: 'transfer',
    }
    const income: Transaction = {
      id: 'tx-4',
      sessionId: 's1',
      branchId: 'b1',
      type: 'income',
      amount: 500,
      createdAt: '2024-06-15T12:00:00Z',
      updatedAt: '2024-06-15T12:00:00Z',
    }
    render(
      <TransactionList
        transactions={[sale, transferSale, expense, income]}
        isLoading={false}
        filter="cash"
        isOpen={true}
        onFilterChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Venta')).toBeInTheDocument()
    expect(screen.getByText('Ingreso')).toBeInTheDocument()
    expect(screen.queryByText(/\(Transferencia\)/)).not.toBeInTheDocument()
    expect(screen.queryByText('Gasto')).not.toBeInTheDocument()
  })

  it('filters by transfer sales', () => {
    const transferSale: Transaction = {
      ...sale,
      id: 'tx-3',
      paymentMethod: 'transfer',
    }
    render(
      <TransactionList
        transactions={[sale, transferSale]}
        isLoading={false}
        filter="transfer"
        isOpen={true}
        onFilterChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText(/\(Transferencia\)/)).toBeInTheDocument()
    expect(screen.queryByText(/\(Efectivo\)/)).not.toBeInTheDocument()
  })

  it('filters by expenses and withdrawals', () => {
    const withdrawal: Transaction = {
      id: 'tx-5',
      sessionId: 's1',
      branchId: 'b1',
      type: 'withdrawal',
      amount: 200,
      createdAt: '2024-06-15T13:00:00Z',
      updatedAt: '2024-06-15T13:00:00Z',
    }
    render(
      <TransactionList
        transactions={[sale, expense, withdrawal]}
        isLoading={false}
        filter="expenses"
        isOpen={true}
        onFilterChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Gasto')).toBeInTheDocument()
    expect(screen.getByText('Retiro')).toBeInTheDocument()
    expect(screen.queryByText('Venta')).not.toBeInTheDocument()
  })
})
