import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { FILTERS } from '../../../constants/session'
import transactionReducer from '../../../store/transactionSlice'
import uiReducer from '../../../store/uiSlice'
import { TransactionService } from '../../../services/TransactionService'

const mockNavigate = vi.fn()
const mockParams = vi.fn(() => ({ id: 'branch-1', sessionId: 'session-1' }))
const mockSearchParams = vi.fn(() => new URLSearchParams())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams(),
    useSearchParams: () => [mockSearchParams()],
  }
})

const createStore = (preloadedState = {}) =>
  configureStore({
    reducer: { transactions: transactionReducer, ui: uiReducer },
    preloadedState: {
      transactions: {
        transactions: [],
        inventoryMovements: [],
        inventoryCategories: [],
        isLoading: false,
        error: null,
        transactionFilter: FILTERS.ALL,
        currentSessionId: null,
        ...preloadedState,
      },
    },
  })

describe('TransactionNew', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockParams.mockReturnValue({ id: 'branch-1', sessionId: 'session-1' })
    mockSearchParams.mockReturnValue(new URLSearchParams())
  })

  it('should render default title for sale type', async () => {
    const { TransactionNew } = await import('../TransactionNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <TransactionNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('Nueva Venta')).toBeInTheDocument()
  })

  it('should render expense title from search params', async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('type=expense'))
    const { TransactionNew } = await import('../TransactionNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <TransactionNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('Nuevo Gasto')).toBeInTheDocument()
  })

  it('should render withdrawal title from search params', async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('type=withdrawal'))
    const { TransactionNew } = await import('../TransactionNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <TransactionNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('Nuevo Retiro')).toBeInTheDocument()
  })

  it('should render income title from search params', async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('type=income'))
    const { TransactionNew } = await import('../TransactionNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <TransactionNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('Nuevo Ingreso')).toBeInTheDocument()
  })

  it('should show payment method selector for sale type', async () => {
    const { TransactionNew } = await import('../TransactionNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <TransactionNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('Efectivo')).toBeInTheDocument()
    expect(screen.getByText('Transferencia')).toBeInTheDocument()
  })

  it('should hide payment method selector for non-sale type', async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('type=expense'))
    const { TransactionNew } = await import('../TransactionNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <TransactionNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.queryByText('Efectivo')).not.toBeInTheDocument()
    expect(screen.queryByText('Transferencia')).not.toBeInTheDocument()
  })

  it('should submit valid sale transaction', async () => {
    vi.spyOn(TransactionService, 'createTransaction').mockResolvedValue({
      id: 'tx-1',
    } as any)
    const user = userEvent.setup()

    const { TransactionNew } = await import('../TransactionNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <TransactionNew />
        </Provider>
      </MemoryRouter>
    )

    const amountInput = screen.getByRole('textbox', { name: /monto/i })
    await user.type(amountInput, '1500')

    const descInput = screen.getByPlaceholderText(
      /Ej: cobré menos porque no había cambio/
    )
    await user.type(descInput, 'Venta del día')

    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(TransactionService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-1',
          branchId: 'branch-1',
          type: 'sale',
          amount: 1500,
          description: 'Venta del día',
        })
      )
    })
    expect(mockNavigate).toHaveBeenCalledWith(
      '/branches/branch-1/sessions/session-1'
    )
  })

  it('should submit with transfer payment method', async () => {
    vi.spyOn(TransactionService, 'createTransaction').mockResolvedValue({
      id: 'tx-1',
    } as any)
    const user = userEvent.setup()

    const { TransactionNew } = await import('../TransactionNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <TransactionNew />
        </Provider>
      </MemoryRouter>
    )

    await user.click(screen.getByText('Transferencia'))

    const amountInput = screen.getByRole('textbox', { name: /monto/i })
    await user.type(amountInput, '2500')

    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(TransactionService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: 'transfer',
          amount: 2500,
        })
      )
    })
  })

  it('should show error toast on create failure', async () => {
    vi.spyOn(TransactionService, 'createTransaction').mockRejectedValue(
      new Error('Error creating')
    )
    const user = userEvent.setup()

    const { toast } = await import('../../../components/ui')
    const toastSpy = vi.spyOn(toast, 'error').mockImplementation(() => {})

    const { TransactionNew } = await import('../TransactionNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <TransactionNew />
        </Provider>
      </MemoryRouter>
    )

    const amountInput = screen.getByRole('textbox', { name: /monto/i })
    await user.type(amountInput, '3000')

    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith('Error al crear transacción')
    })
  })

  it('should navigate back on Cancelar click', async () => {
    const user = userEvent.setup()

    const { TransactionNew } = await import('../TransactionNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <TransactionNew />
        </Provider>
      </MemoryRouter>
    )

    await user.click(screen.getByText('Cancelar'))
    expect(mockNavigate).toHaveBeenCalledWith(
      '/branches/branch-1/sessions/session-1'
    )
  })

  it('should have Guardar button disabled when loading', async () => {
    const { TransactionNew } = await import('../TransactionNew')
    render(
      <MemoryRouter>
        <Provider store={createStore({ isLoading: true })}>
          <TransactionNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('Guardar')).toBeDisabled()
  })
})
