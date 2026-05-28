import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ClientCard } from '../ClientCard'
import type { ClientWithBalance } from '../../../services/ClientService'

vi.mock('../../../lib/whatsapp', () => ({
  openWhatsApp: vi.fn(),
}))

const baseClient: ClientWithBalance = {
  id: 'client-1',
  branchId: 'branch-1',
  name: 'Juan Pérez',
  phone: '+543884123456',
  balance: 0,
  entries: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

const defaultProps = {
  isExpanded: false,
  onToggleExpand: vi.fn(),
  onRegisterDebt: vi.fn(),
  onEdit: vi.fn(),
  onDeleteClient: vi.fn(),
  onDeleteEntry: vi.fn(),
}

describe('ClientCard', () => {
  it('should render client name', () => {
    renderWithRouter(<ClientCard client={baseClient} {...defaultProps} />)

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
  })

  it('should render phone when provided', () => {
    renderWithRouter(<ClientCard client={baseClient} {...defaultProps} />)

    expect(screen.getByText('📞 +54 388 412 3456')).toBeInTheDocument()
  })

  it('should show Pagado badge when balance is zero', () => {
    renderWithRouter(<ClientCard client={baseClient} {...defaultProps} />)

    expect(screen.getByText('Pagado')).toBeInTheDocument()
  })

  it('should show Debe badge and balance when balance is positive', () => {
    const debtor = { ...baseClient, balance: 2500 }

    renderWithRouter(<ClientCard client={debtor} {...defaultProps} />)

    expect(screen.getByText('Debe')).toBeInTheDocument()
    expect(screen.getByText('$2.500')).toBeInTheDocument()
  })

  it('should not render phone when not provided', () => {
    const withoutPhone = { ...baseClient, phone: '' }

    renderWithRouter(<ClientCard client={withoutPhone} {...defaultProps} />)

    expect(screen.queryByText('📞')).not.toBeInTheDocument()
  })

  it('should call onRegisterDebt when clicking Registrar deuda', async () => {
    const user = userEvent.setup()
    const handleRegister = vi.fn()

    renderWithRouter(
      <ClientCard
        client={baseClient}
        {...defaultProps}
        onRegisterDebt={handleRegister}
      />
    )

    await user.click(screen.getByText('Registrar deuda'))

    expect(handleRegister).toHaveBeenCalledWith('client-1', 'debt')
  })

  it('should call onRegisterDebt when clicking Registrar pago', async () => {
    const user = userEvent.setup()
    const handleRegister = vi.fn()

    renderWithRouter(
      <ClientCard
        client={baseClient}
        {...defaultProps}
        onRegisterDebt={handleRegister}
      />
    )

    await user.click(screen.getByText('Registrar pago'))

    expect(handleRegister).toHaveBeenCalledWith('client-1', 'payment')
  })

  it('should call onEdit when clicking Editar', async () => {
    const user = userEvent.setup()
    const handleEdit = vi.fn()

    renderWithRouter(
      <ClientCard client={baseClient} {...defaultProps} onEdit={handleEdit} />
    )

    await user.click(screen.getByText('Editar'))

    expect(handleEdit).toHaveBeenCalledWith('client-1')
  })

  it('should call onDeleteClient when clicking Eliminar', async () => {
    const user = userEvent.setup()
    const handleDelete = vi.fn()

    renderWithRouter(
      <ClientCard
        client={baseClient}
        {...defaultProps}
        onDeleteClient={handleDelete}
      />
    )

    await user.click(screen.getByText('Eliminar'))

    expect(handleDelete).toHaveBeenCalledWith('client-1')
  })

  it('should call onToggleExpand when clicking chevron', async () => {
    const user = userEvent.setup()
    const handleToggle = vi.fn()

    renderWithRouter(
      <ClientCard
        client={baseClient}
        {...defaultProps}
        onToggleExpand={handleToggle}
      />
    )

    await user.click(screen.getByRole('button', { name: '' }))

    expect(handleToggle).toHaveBeenCalledWith('client-1')
  })

  it('should show history panel when expanded', () => {
    const withEntries = {
      ...baseClient,
      balance: 2000,
      entries: [
        {
          id: 'entry-1',
          clientId: 'client-1',
          branchId: 'branch-1',
          type: 'debt' as const,
          amount: 2000,
          createdAt: '2024-06-15T00:00:00Z',
          updatedAt: '2024-06-15T00:00:00Z',
        },
      ],
    }

    renderWithRouter(
      <ClientCard client={withEntries} {...defaultProps} isExpanded={true} />
    )

    expect(screen.getByText('Historial')).toBeInTheDocument()
  })

  it('should show Sin movimientos when expanded with no entries', () => {
    renderWithRouter(
      <ClientCard client={baseClient} {...defaultProps} isExpanded={true} />
    )

    expect(screen.getByText('Sin movimientos')).toBeInTheDocument()
  })

  it('should show WhatsApp button only when client has phone and debt', () => {
    const debtor = { ...baseClient, balance: 1500 }

    renderWithRouter(<ClientCard client={debtor} {...defaultProps} />)

    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
  })

  it('should hide WhatsApp button when client has no debt', () => {
    renderWithRouter(<ClientCard client={baseClient} {...defaultProps} />)

    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
  })

  it('should hide WhatsApp button when client has no phone', () => {
    const debtorNoPhone = { ...baseClient, phone: '', balance: 1500 }

    renderWithRouter(<ClientCard client={debtorNoPhone} {...defaultProps} />)

    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
  })
})
