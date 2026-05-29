import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionHeader } from '../SessionHeader'

describe('SessionHeader', () => {
  it('renders session name', () => {
    render(
      <SessionHeader
        name="Test Session"
        isOpen={true}
        onClose={vi.fn()}
        onBack={vi.fn()}
      />
    )
    expect(screen.getByText('Test Session')).toBeInTheDocument()
  })

  it('shows close button when session is open', () => {
    render(
      <SessionHeader
        name="Test"
        isOpen={true}
        onClose={vi.fn()}
        onBack={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
  })

  it('hides close button when session is closed', () => {
    render(
      <SessionHeader
        name="Test"
        isOpen={false}
        onClose={vi.fn()}
        onBack={vi.fn()}
      />
    )
    expect(
      screen.queryByRole('button', { name: 'Cerrar' })
    ).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(
      <SessionHeader
        name="Test"
        isOpen={true}
        onClose={handleClose}
        onBack={vi.fn()}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(handleClose).toHaveBeenCalledOnce()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    const handleBack = vi.fn()
    render(
      <SessionHeader
        name="Test"
        isOpen={true}
        onClose={vi.fn()}
        onBack={handleBack}
      />
    )
    await user.click(screen.getByText('← Atrás'))
    expect(handleBack).toHaveBeenCalledOnce()
  })
})
