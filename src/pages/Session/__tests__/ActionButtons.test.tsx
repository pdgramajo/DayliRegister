import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MovementActionButtons, InventoryActionButtons } from '../ActionButtons'

describe('MovementActionButtons', () => {
  it('renders transaction buttons', () => {
    render(<MovementActionButtons onNavigate={vi.fn()} />)
    expect(screen.getByText('Venta')).toBeInTheDocument()
    expect(screen.getByText('Gasto')).toBeInTheDocument()
    expect(screen.getByText('Retiro')).toBeInTheDocument()
    expect(screen.getByText('Ingreso')).toBeInTheDocument()
  })

  it('calls onNavigate with correct type on button click', async () => {
    const user = userEvent.setup()
    const handleNavigate = vi.fn()
    render(<MovementActionButtons onNavigate={handleNavigate} />)
    await user.click(screen.getByText('Venta'))
    expect(handleNavigate).toHaveBeenCalledWith('sale')

    await user.click(screen.getByText('Gasto'))
    expect(handleNavigate).toHaveBeenCalledWith('expense')

    await user.click(screen.getByText('Retiro'))
    expect(handleNavigate).toHaveBeenCalledWith('withdrawal')

    await user.click(screen.getByText('Ingreso'))
    expect(handleNavigate).toHaveBeenCalledWith('income')
  })
})

describe('InventoryActionButtons', () => {
  it('renders inventory buttons', () => {
    render(<InventoryActionButtons onNavigate={vi.fn()} />)
    expect(screen.getByText('Entrada')).toBeInTheDocument()
    expect(screen.getByText('Salida')).toBeInTheDocument()
  })

  it('calls onNavigate for inventory buttons', async () => {
    const user = userEvent.setup()
    const handleNavigate = vi.fn()
    render(<InventoryActionButtons onNavigate={handleNavigate} />)
    await user.click(screen.getByText('Entrada'))
    expect(handleNavigate).toHaveBeenCalledWith('in')

    await user.click(screen.getByText('Salida'))
    expect(handleNavigate).toHaveBeenCalledWith('out')
  })
})
