import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { FILTERS } from '../../../constants/session'
import sessionReducer from '../../../store/sessionSlice'
import transactionReducer from '../../../store/transactionSlice'
import { SessionService } from '../../../services'
import { TransactionService } from '../../../services/TransactionService'
import { InventoryMovementService } from '../../../services/InventoryMovementService'
import { InventoryCategoryService } from '../../../services/InventoryCategoryService'

const mockNavigate = vi.fn()
const mockParams = vi.fn(() => ({ id: 'branch-1', sessionId: 'session-1' }))
const mockLocation = vi.fn(() => ({ search: '' }))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams(),
    useLocation: () => mockLocation(),
  }
})

const currentSession = {
  id: 'session-1',
  branchId: 'branch-1',
  name: 'Sesión Mañana',
  status: 'open' as const,
  initialAmount: 5000,
  openingBalance: 5000,
  openedAt: '2024-06-01T08:00:00Z',
  createdAt: '2024-06-01T08:00:00Z',
  updatedAt: '2024-06-01T08:00:00Z',
}

const defaultSessionState = {
  sessions: [],
  currentSession,
  isLoading: false,
  error: null,
}

const mockTransaction = {
  id: 'tx-1',
  sessionId: 'session-1',
  branchId: 'branch-1',
  type: 'sale' as const,
  amount: 1500,
  paymentMethod: 'cash' as const,
  description: 'Venta de café',
  createdAt: '2024-06-01T09:00:00Z',
  updatedAt: '2024-06-01T09:00:00Z',
}

const defaultTransactionState = {
  transactions: [mockTransaction],
  inventoryMovements: [],
  inventoryCategories: [],
  isLoading: false,
  error: null,
  transactionFilter: FILTERS.ALL,
  currentSessionId: null,
}

const createStore = (sessionOverrides = {}, transactionOverrides = {}) =>
  configureStore({
    reducer: {
      sessions: sessionReducer,
      transactions: transactionReducer,
    },
    preloadedState: {
      sessions: { ...defaultSessionState, ...sessionOverrides },
      transactions: { ...defaultTransactionState, ...transactionOverrides },
    },
  })

function mockRequiredServices() {
  vi.spyOn(SessionService, 'getSessionById').mockResolvedValue(currentSession)
  vi.spyOn(TransactionService, 'getTransactionsBySession').mockResolvedValue([
    mockTransaction,
  ])
  vi.spyOn(InventoryMovementService, 'getMovementsBySession').mockResolvedValue(
    []
  )
  vi.spyOn(InventoryCategoryService, 'getAllCategories').mockResolvedValue([])
}

describe('SessionDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockParams.mockReturnValue({ id: 'branch-1', sessionId: 'session-1' })
    mockLocation.mockReturnValue({ search: '' })
  })

  it('should show loading spinner', async () => {
    const { SessionDetail } = await import('../SessionDetail')
    const { container } = render(
      <MemoryRouter>
        <Provider
          store={createStore({ isLoading: true, currentSession: null })}
        >
          <SessionDetail />
        </Provider>
      </MemoryRouter>
    )

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should render session detail with movements tab', async () => {
    mockRequiredServices()
    const { SessionDetail } = await import('../SessionDetail')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <SessionDetail />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
    })
    expect(
      screen.getByText((c) => c.startsWith('Movimientos'))
    ).toBeInTheDocument()
    expect(screen.getByText('Venta de café')).toBeInTheDocument()
  })

  it('should show inventory tab from URL param', async () => {
    mockRequiredServices()
    mockLocation.mockReturnValue({ search: '?tab=inventory' })

    const { SessionDetail } = await import('../SessionDetail')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <SessionDetail />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
    })
    expect(
      screen.getByText((c) => c.startsWith('Inventario'))
    ).toBeInTheDocument()
  })

  it('should open close session modal and cancel', async () => {
    mockRequiredServices()
    const user = userEvent.setup()

    const { SessionDetail } = await import('../SessionDetail')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <SessionDetail />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
    })
    const closeBtn = screen.getByText('Cerrar')
    await user.click(closeBtn)

    expect(screen.getByText('Balance de cierre')).toBeInTheDocument()
    await user.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Balance de cierre')).not.toBeInTheDocument()
  })

  it('should show error when closing with invalid balance', async () => {
    mockRequiredServices()
    const user = userEvent.setup()

    const { SessionDetail } = await import('../SessionDetail')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <SessionDetail />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
    })
    const closeBtn = screen.getByText('Cerrar')
    await user.click(closeBtn)

    // Clear the pre-filled balance to trigger validation error
    const amountInput = screen.getByRole('textbox')
    await user.clear(amountInput)

    const confirmBtn = screen.getByRole('button', {
      name: /cerrar sesión/i,
    })
    await user.click(confirmBtn)

    expect(screen.getByText('Ingrese un balance válido')).toBeInTheDocument()
  })

  it('should close session with valid balance', async () => {
    mockRequiredServices()
    vi.spyOn(SessionService, 'closeSession').mockResolvedValue(currentSession)
    const user = userEvent.setup()

    const { toast } = await import('../../../components/ui')
    const toastSpy = vi.spyOn(toast, 'success').mockImplementation(() => {})

    const { SessionDetail } = await import('../SessionDetail')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <SessionDetail />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
    })
    const closeBtn = screen.getByText('Cerrar')
    await user.click(closeBtn)

    const amountInput = screen.getByRole('textbox')
    await user.clear(amountInput)
    await user.type(amountInput, '9999')

    const confirmBtn = screen.getByRole('button', {
      name: /cerrar sesión/i,
    })
    await user.click(confirmBtn)

    await waitFor(() => {
      expect(SessionService.closeSession).toHaveBeenCalledWith(
        'session-1',
        9999
      )
    })
    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith('Sesión cerrada correctamente')
    })
  })

  it('should open delete transaction modal and cancel', async () => {
    mockRequiredServices()
    const user = userEvent.setup()

    const { SessionDetail } = await import('../SessionDetail')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <SessionDetail />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
    })

    const xButtons = screen.getAllByRole('button', { name: '' })
    const xButton = xButtons.find((btn) => btn.querySelector('.lucide-x'))
    expect(xButton).toBeDefined()
    await user.click(xButton!)

    expect(screen.getByText('Eliminar transacción')).toBeInTheDocument()
    await user.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Eliminar transacción')).not.toBeInTheDocument()
  })

  it('should confirm delete transaction', async () => {
    mockRequiredServices()
    vi.spyOn(TransactionService, 'deleteTransaction').mockResolvedValue(
      undefined
    )
    const user = userEvent.setup()

    const { toast } = await import('../../../components/ui')
    vi.spyOn(toast, 'success').mockImplementation(() => {})

    const { SessionDetail } = await import('../SessionDetail')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <SessionDetail />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
    })

    const xButtons = screen.getAllByRole('button', { name: '' })
    const xButton = xButtons.find((btn) => btn.querySelector('.lucide-x'))
    await user.click(xButton!)

    await user.click(screen.getByText('Eliminar'))

    await waitFor(() => {
      expect(TransactionService.deleteTransaction).toHaveBeenCalledWith('tx-1')
    })
  })

  it('should navigate to new transaction page', async () => {
    mockRequiredServices()
    const user = userEvent.setup()

    const { SessionDetail } = await import('../SessionDetail')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <SessionDetail />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
    })

    // Button says just 'Venta' (not 'Total Ventas')
    const buttons = screen.getAllByRole('button', { name: /venta/i })
    const saleBtn = buttons.find((b) => b.textContent === 'Venta')
    expect(saleBtn).toBeDefined()
    await user.click(saleBtn!)

    expect(mockNavigate).toHaveBeenCalledWith(
      '/branches/branch-1/sessions/session-1/transaction/new?type=sale'
    )
  })

  it('should navigate back to sessions list', async () => {
    mockRequiredServices()
    const user = userEvent.setup()

    const { SessionDetail } = await import('../SessionDetail')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <SessionDetail />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
    })

    const backBtn = screen.getByText((c) => c.includes('Atrás'))
    await user.click(backBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/sessions')
  })
})
