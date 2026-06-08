import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionHeaderOpen, SessionHeaderClosed } from '../SessionHeader'

describe('SessionHeaderOpen', () => {
  it('renders session name', () => {
    render(
      <SessionHeaderOpen
        name="Test Session"
        onClose={vi.fn()}
        onBack={vi.fn()}
      />
    )
    expect(screen.getByText('Test Session')).toBeInTheDocument()
  })

  it('shows close button', () => {
    render(<SessionHeaderOpen name="Test" onClose={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(
      <SessionHeaderOpen name="Test" onClose={handleClose} onBack={vi.fn()} />
    )
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(handleClose).toHaveBeenCalledOnce()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    const handleBack = vi.fn()
    render(
      <SessionHeaderOpen name="Test" onClose={vi.fn()} onBack={handleBack} />
    )
    await user.click(screen.getByText('← Atrás'))
    expect(handleBack).toHaveBeenCalledOnce()
  })
})

describe('SessionHeaderClosed', () => {
  it('renders session name', () => {
    render(<SessionHeaderClosed name="Test Session" onBack={vi.fn()} />)
    expect(screen.getByText('Test Session')).toBeInTheDocument()
  })

  it('hides close button', () => {
    render(<SessionHeaderClosed name="Test" onBack={vi.fn()} />)
    expect(
      screen.queryByRole('button', { name: 'Cerrar' })
    ).not.toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    const handleBack = vi.fn()
    render(<SessionHeaderClosed name="Test" onBack={handleBack} />)
    await user.click(screen.getByText('← Atrás'))
    expect(handleBack).toHaveBeenCalledOnce()
  })
})
