import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionButtons } from '../ActionButtons'

describe('ActionButtons', () => {
  it('renders transaction buttons when type is movements and isOpen', () => {
    render(
      <ActionButtons type="movements" isOpen={true} onNavigate={vi.fn()} />
    )
    expect(screen.getByText('Venta')).toBeInTheDocument()
    expect(screen.getByText('Gasto')).toBeInTheDocument()
    expect(screen.getByText('Retiro')).toBeInTheDocument()
    expect(screen.getByText('Ingreso')).toBeInTheDocument()
  })

  it('renders inventory buttons when type is inventory and isOpen', () => {
    render(
      <ActionButtons type="inventory" isOpen={true} onNavigate={vi.fn()} />
    )
    expect(screen.getByText('Entrada')).toBeInTheDocument()
    expect(screen.getByText('Salida')).toBeInTheDocument()
  })

  it('renders nothing when session is closed', () => {
    const { container } = render(
      <ActionButtons type="movements" isOpen={false} onNavigate={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('calls onNavigate with correct type on button click', async () => {
    const user = userEvent.setup()
    const handleNavigate = vi.fn()
    render(
      <ActionButtons
        type="movements"
        isOpen={true}
        onNavigate={handleNavigate}
      />
    )
    await user.click(screen.getByText('Venta'))
    expect(handleNavigate).toHaveBeenCalledWith('sale')

    await user.click(screen.getByText('Gasto'))
    expect(handleNavigate).toHaveBeenCalledWith('expense')
  })

  it('calls onNavigate for inventory buttons', async () => {
    const user = userEvent.setup()
    const handleNavigate = vi.fn()
    render(
      <ActionButtons
        type="inventory"
        isOpen={true}
        onNavigate={handleNavigate}
      />
    )
    await user.click(screen.getByText('Entrada'))
    expect(handleNavigate).toHaveBeenCalledWith('in')

    await user.click(screen.getByText('Salida'))
    expect(handleNavigate).toHaveBeenCalledWith('out')
  })
})
