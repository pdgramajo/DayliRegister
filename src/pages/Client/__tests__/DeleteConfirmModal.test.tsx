import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteConfirmModal } from '../DeleteConfirmModal'

describe('DeleteConfirmModal', () => {
  const defaultProps = {
    open: true,
    title: 'Eliminar cliente',
    message: '¿Estás seguro de eliminar este cliente?',
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  }

  it('should render title', () => {
    render(<DeleteConfirmModal {...defaultProps} />)

    expect(screen.getByText('Eliminar cliente')).toBeInTheDocument()
  })

  it('should render message', () => {
    render(<DeleteConfirmModal {...defaultProps} />)

    expect(
      screen.getByText('¿Estás seguro de eliminar este cliente?')
    ).toBeInTheDocument()
  })

  it('should call onClose when clicking Cancelar', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    render(<DeleteConfirmModal {...defaultProps} onClose={handleClose} />)

    await user.click(screen.getByText('Cancelar'))

    expect(handleClose).toHaveBeenCalled()
  })

  it('should call onConfirm when clicking Eliminar', async () => {
    const user = userEvent.setup()
    const handleConfirm = vi.fn()

    render(<DeleteConfirmModal {...defaultProps} onConfirm={handleConfirm} />)

    await user.click(screen.getByText('Eliminar'))

    expect(handleConfirm).toHaveBeenCalled()
  })
})
