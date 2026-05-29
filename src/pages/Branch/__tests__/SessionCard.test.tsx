import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { OpenSessionCard, ClosedSessionCard } from '../SessionCard'
import type { CashSession } from '../../../types/entities'

const openSession: CashSession = {
  id: 'session-1',
  branchId: 'branch-1',
  name: 'Sesión Mañana',
  initialAmount: 5000,
  status: 'open',
  openedAt: '2024-06-01T08:00:00Z',
  createdAt: '2024-06-01T08:00:00Z',
  updatedAt: '2024-06-01T08:00:00Z',
}

const closedSession: CashSession = {
  id: 'session-2',
  branchId: 'branch-1',
  name: 'Sesión Tarde',
  initialAmount: 3000,
  closingBalance: 8500,
  status: 'closed',
  openedAt: '2024-06-01T14:00:00Z',
  closedAt: '2024-06-01T20:00:00Z',
  createdAt: '2024-06-01T14:00:00Z',
  updatedAt: '2024-06-01T20:00:00Z',
}

const renderWithRouter = (component: React.ReactElement) =>
  render(<BrowserRouter>{component}</BrowserRouter>)

describe('OpenSessionCard', () => {
  it('should render session name', () => {
    renderWithRouter(
      <OpenSessionCard
        session={openSession}
        branchId="branch-1"
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
  })

  it('should show Abierta badge', () => {
    renderWithRouter(
      <OpenSessionCard
        session={openSession}
        branchId="branch-1"
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText('Abierta')).toBeInTheDocument()
  })

  it('should render initial amount', () => {
    renderWithRouter(
      <OpenSessionCard
        session={openSession}
        branchId="branch-1"
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText(/Saldo inicial: 5\.000/)).toBeInTheDocument()
  })

  it('should render opened date', () => {
    renderWithRouter(
      <OpenSessionCard
        session={openSession}
        branchId="branch-1"
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText(/2024/)).toBeInTheDocument()
  })
})

describe('ClosedSessionCard', () => {
  it('should render session name', () => {
    renderWithRouter(
      <ClosedSessionCard
        session={closedSession}
        branchId="branch-1"
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('Sesión Tarde')).toBeInTheDocument()
  })

  it('should render initial and closing balances', () => {
    renderWithRouter(
      <ClosedSessionCard
        session={closedSession}
        branchId="branch-1"
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText(/Inicial: 3\.000/)).toBeInTheDocument()
    expect(screen.getByText(/Cierre: 8\.500/)).toBeInTheDocument()
  })

  it('should render opened date', () => {
    renderWithRouter(
      <ClosedSessionCard
        session={closedSession}
        branchId="branch-1"
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText(/2024/)).toBeInTheDocument()
  })

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const handleDelete = vi.fn()
    renderWithRouter(
      <ClosedSessionCard
        session={closedSession}
        branchId="branch-1"
        onDelete={handleDelete}
      />
    )

    await user.click(screen.getByTitle('Eliminar'))

    expect(handleDelete).toHaveBeenCalledWith('session-2')
  })

  it('should not render balances when undefined', () => {
    const minimalSession: CashSession = {
      ...closedSession,
      initialAmount: undefined,
      closingBalance: undefined,
    }
    renderWithRouter(
      <ClosedSessionCard
        session={minimalSession}
        branchId="branch-1"
        onDelete={vi.fn()}
      />
    )

    expect(screen.queryByText(/Inicial:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Cierre:/)).not.toBeInTheDocument()
  })
})
