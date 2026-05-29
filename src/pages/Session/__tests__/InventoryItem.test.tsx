import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InventoryList } from '../InventoryList'
import type { InventoryMovement } from '../../../types/entities'

const inbound: InventoryMovement = {
  id: 'inv-1',
  sessionId: 's1',
  branchId: 'b1',
  inventoryCategoryId: 'cat-1',
  type: 'in',
  quantity: 10,
  notes: 'Nota de entrada',
  createdAt: '2024-06-15T10:30:00Z',
  updatedAt: '2024-06-15T10:30:00Z',
}

const outbound: InventoryMovement = {
  id: 'inv-2',
  sessionId: 's1',
  branchId: 'b1',
  inventoryCategoryId: 'cat-2',
  type: 'out',
  quantity: 5,
  description: 'Salida por venta',
  createdAt: '2024-06-15T11:00:00Z',
  updatedAt: '2024-06-15T11:00:00Z',
}

const categories = [
  { id: 'cat-1', name: 'Categoria 1' },
  { id: 'cat-2', name: 'Categoria 2' },
]

describe('InventoryItem', () => {
  it('renders inbound movement with category and quantity', () => {
    render(
      <InventoryList
        movements={[inbound]}
        categories={categories}
        isLoading={false}
        isOpen={true}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Categoria 1')).toBeInTheDocument()
    expect(screen.getByText('+10')).toBeInTheDocument()
  })

  it('renders outbound movement with negative quantity', () => {
    render(
      <InventoryList
        movements={[outbound]}
        categories={categories}
        isLoading={false}
        isOpen={true}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Categoria 2')).toBeInTheDocument()
    expect(screen.getByText('-5')).toBeInTheDocument()
  })

  it('shows "Sin categoría" when category is not found', () => {
    const unknown: InventoryMovement = {
      ...inbound,
      inventoryCategoryId: 'cat-unknown',
    }
    render(
      <InventoryList
        movements={[unknown]}
        categories={categories}
        isLoading={false}
        isOpen={true}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Sin categoría')).toBeInTheDocument()
  })

  it('shows notes and description', () => {
    render(
      <InventoryList
        movements={[inbound, outbound]}
        categories={categories}
        isLoading={false}
        isOpen={true}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Nota de entrada')).toBeInTheDocument()
    expect(screen.getByText('Salida por venta')).toBeInTheDocument()
  })

  it('shows delete button when isOpen is true', () => {
    render(
      <InventoryList
        movements={[inbound]}
        categories={categories}
        isLoading={false}
        isOpen={true}
        onDelete={vi.fn()}
      />
    )
    const xButtons = document.querySelectorAll('button svg.lucide-x')
    expect(xButtons.length).toBe(1)
  })

  it('hides delete button when isOpen is false', () => {
    render(
      <InventoryList
        movements={[inbound]}
        categories={categories}
        isLoading={false}
        isOpen={false}
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
      <InventoryList
        movements={[inbound]}
        categories={categories}
        isLoading={false}
        isOpen={true}
        onDelete={handleDelete}
      />
    )
    const deleteBtn = document
      .querySelector('button svg.lucide-x')
      ?.closest('button')
    if (deleteBtn) {
      await user.click(deleteBtn)
      expect(handleDelete).toHaveBeenCalledWith('inv-1')
    }
  })

  it('shows loading spinner', () => {
    render(
      <InventoryList
        movements={[]}
        categories={[]}
        isLoading={true}
        isOpen={true}
        onDelete={vi.fn()}
      />
    )
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows empty message when no movements', () => {
    render(
      <InventoryList
        movements={[]}
        categories={[]}
        isLoading={false}
        isOpen={true}
        onDelete={vi.fn()}
      />
    )
    expect(
      screen.getByText('No hay movimientos de inventario')
    ).toBeInTheDocument()
  })
})
