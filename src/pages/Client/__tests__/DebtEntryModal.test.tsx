import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DebtEntryModal } from '../DebtEntryModal'

describe('DebtEntryModal', () => {
  const defaultProps = {
    open: true,
    type: 'debt' as const,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  }

  it('should show title "Registrar deuda" when type is debt', () => {
    render(<DebtEntryModal {...defaultProps} />)

    expect(screen.getByText('Registrar deuda')).toBeInTheDocument()
  })

  it('should show description field when type is debt', () => {
    render(<DebtEntryModal {...defaultProps} />)

    expect(
      screen.getByPlaceholderText('Ej: pollo, pan, gaseosa')
    ).toBeInTheDocument()
  })

  it('should hide description field when type is payment', () => {
    render(<DebtEntryModal {...defaultProps} type="payment" />)

    expect(
      screen.queryByPlaceholderText('Ej: pollo, pan, gaseosa')
    ).not.toBeInTheDocument()
  })

  it('should show amount label', () => {
    render(<DebtEntryModal {...defaultProps} />)

    expect(screen.getByText('Monto')).toBeInTheDocument()
  })

  it('should call onClose when clicking Cancelar', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    render(<DebtEntryModal {...defaultProps} onClose={handleClose} />)

    await user.click(screen.getByText('Cancelar'))

    expect(handleClose).toHaveBeenCalled()
  })

  it('should call onConfirm with amount and description', async () => {
    const user = userEvent.setup()
    const handleConfirm = vi.fn()

    render(<DebtEntryModal {...defaultProps} onConfirm={handleConfirm} />)

    const amountInput = screen.getByPlaceholderText('0')
    await user.type(amountInput, '1500')

    const descInput = screen.getByPlaceholderText('Ej: pollo, pan, gaseosa')
    await user.type(descInput, 'Pollo')

    await user.click(screen.getByText('Agregar deuda'))

    expect(handleConfirm).toHaveBeenCalledWith(1500, 'Pollo')
  })

  it('should show "Agregar deuda" button when type is debt', () => {
    render(<DebtEntryModal {...defaultProps} />)

    const buttons = screen.getAllByText('Agregar deuda')
    expect(buttons).toHaveLength(1)
  })

  it('should not call onConfirm when amount is zero', async () => {
    const user = userEvent.setup()
    const handleConfirm = vi.fn()

    render(<DebtEntryModal {...defaultProps} onConfirm={handleConfirm} />)

    await user.click(screen.getByText('Agregar deuda'))

    expect(handleConfirm).not.toHaveBeenCalled()
  })

  it('should show title and button "Registrar pago" when type is payment', () => {
    render(<DebtEntryModal {...defaultProps} type="payment" />)

    expect(screen.getAllByText('Registrar pago')).toHaveLength(2)
  })
})
