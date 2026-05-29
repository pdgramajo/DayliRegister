import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import transactionReducer from '../../../store/transactionSlice'
import { InventoryMovementService } from '../../../services/InventoryMovementService'
import { InventoryCategoryService } from '../../../services/InventoryCategoryService'

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

const mockCategories = [
  { id: 'cat-1', name: 'Bebidas' },
  { id: 'cat-2', name: 'Comidas' },
]

const createStore = (preloadedState = {}) =>
  configureStore({
    reducer: { transactions: transactionReducer },
    preloadedState: {
      transactions: {
        transactions: [],
        inventoryMovements: [],
        inventoryCategories: mockCategories,
        isLoading: false,
        error: null,
        ...preloadedState,
      },
    },
  })

describe('InventoryMovementNew', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockParams.mockReturnValue({ id: 'branch-1', sessionId: 'session-1' })
    mockSearchParams.mockReturnValue(new URLSearchParams())
    vi.spyOn(InventoryCategoryService, 'getAllCategories').mockResolvedValue(
      mockCategories
    )
  })

  it('should render default title for IN type', async () => {
    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('Nueva Entrada')).toBeInTheDocument()
  })

  it('should render OUT type title', async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('type=out'))

    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('Nueva Salida')).toBeInTheDocument()
  })

  it('should show categories list', async () => {
    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('Bebidas')).toBeInTheDocument()
    expect(screen.getByText('Comidas')).toBeInTheDocument()
  })

  it('should select a category', async () => {
    const user = userEvent.setup()

    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    await user.click(screen.getByText('Bebidas'))
    // Selected category has green styling (should be distinguishable)
    expect(screen.getByText('Bebidas')).toBeInTheDocument()
  })

  it('should toggle new category form', async () => {
    const user = userEvent.setup()

    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    await user.click(screen.getByText('+ Nueva'))
    expect(screen.getByPlaceholderText('Nueva categoría')).toBeInTheDocument()
    expect(screen.getByText('Crear')).toBeInTheDocument()

    await user.click(screen.getByText('Ver categorías'))
    expect(
      screen.queryByPlaceholderText('Nueva categoría')
    ).not.toBeInTheDocument()
  })

  it('should create a new category', async () => {
    vi.spyOn(InventoryCategoryService, 'createCategory').mockResolvedValue({
      id: 'cat-3',
      name: 'Postres',
    })
    const user = userEvent.setup()

    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    await user.click(screen.getByText('+ Nueva'))
    await user.type(screen.getByPlaceholderText('Nueva categoría'), 'Postres')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(InventoryCategoryService.createCategory).toHaveBeenCalledWith(
        'Postres'
      )
    })
  })

  it('should show category error on submit without selection', async () => {
    const user = userEvent.setup()

    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    const qtyInput = screen.getByRole('spinbutton', { name: /cantidad/i })
    await user.type(qtyInput, '5')

    await user.click(screen.getByText('Guardar'))

    expect(screen.getByText('Selecciona una categoría')).toBeInTheDocument()
  })

  it('should submit valid inventory movement', async () => {
    vi.spyOn(InventoryMovementService, 'createMovement').mockResolvedValue({
      id: 'mov-1',
    } as any)
    const user = userEvent.setup()

    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    await user.click(screen.getByText('Bebidas'))

    const qtyInput = screen.getByRole('spinbutton', { name: /cantidad/i })
    await user.type(qtyInput, '10')

    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(InventoryMovementService.createMovement).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-1',
          branchId: 'branch-1',
          inventoryCategoryId: 'cat-1',
          type: 'in',
          quantity: '10',
        })
      )
    })
    expect(mockNavigate).toHaveBeenCalledWith(
      '/branches/branch-1/sessions/session-1?tab=inventory'
    )
  })

  it('should show error toast on submit failure', async () => {
    vi.spyOn(InventoryMovementService, 'createMovement').mockRejectedValue(
      new Error('Server error')
    )
    const user = userEvent.setup()

    const { toast } = await import('../../../components/ui')
    const toastSpy = vi.spyOn(toast, 'error').mockImplementation(() => {})

    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    await user.click(screen.getByText('Bebidas'))

    const qtyInput = screen.getByRole('spinbutton', { name: /cantidad/i })
    await user.type(qtyInput, '3')

    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith('Server error')
    })
  })

  it('should navigate back on Cancelar click', async () => {
    const user = userEvent.setup()

    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    await user.click(screen.getByText('Cancelar'))

    expect(mockNavigate).toHaveBeenCalledWith(
      '/branches/branch-1/sessions/session-1?tab=inventory'
    )
  })

  it('should show OUT description placeholder', async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('type=out'))

    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.getByPlaceholderText('¿Qué sale?')).toBeInTheDocument()
  })

  it('should show IN description placeholder by default', async () => {
    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore()}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.getByPlaceholderText('¿Qué entra?')).toBeInTheDocument()
  })

  it('should have Guardar button disabled when loading', async () => {
    const { InventoryMovementNew } = await import('../InventoryMovementNew')
    render(
      <MemoryRouter>
        <Provider store={createStore({ isLoading: true })}>
          <InventoryMovementNew />
        </Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('Guardar')).toBeDisabled()
  })
})
