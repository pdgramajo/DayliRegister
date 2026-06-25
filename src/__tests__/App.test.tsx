import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { FILTERS } from '../constants/session'
import branchReducer from '../store/branchSlice'
import sessionReducer from '../store/sessionSlice'
import transactionReducer from '../store/transactionSlice'
import productReducer from '../store/productSlice'
import clientReducer from '../store/clientSlice'
import uiReducer from '../store/uiSlice'

const mockBranch = {
  id: '1',
  name: 'Sucursal Centro',
  address: 'Av. Siempre Viva 123',
  phone: '+543881234567',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockSession = {
  id: 's1',
  branchId: '1',
  name: 'Sesión Mañana',
  status: 'open' as const,
  initialAmount: 5000,
  openingBalance: 5000,
  openedAt: '2024-06-01T08:00:00Z',
  createdAt: '2024-06-01T08:00:00Z',
  updatedAt: '2024-06-01T08:00:00Z',
}

const createStore = (overrides = {}) =>
  configureStore({
    reducer: {
      branches: branchReducer,
      sessions: sessionReducer,
      transactions: transactionReducer,
      products: productReducer,
      clients: clientReducer,
      ui: uiReducer,
    },
    preloadedState: {
      branches: {
        branches: [mockBranch],
        currentBranch: mockBranch,
        isLoading: false,
        error: null,
      },
      sessions: {
        sessions: [mockSession],
        currentSession: mockSession,
        isLoading: false,
        error: null,
      },
      transactions: {
        transactions: [],
        inventoryMovements: [],
        inventoryCategories: [],
        isLoading: false,
        error: null,
        transactionFilter: FILTERS.ALL,
        currentSessionId: null,
      },
      products: {
        products: [],
        currentProduct: null,
        isLoading: false,
        error: null,
      },
      clients: {
        clients: [],
        currentClient: null,
        isLoading: false,
        error: null,
      },
      ...overrides,
    },
  })

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading fallback then BranchList on home route', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No hay sucursales creadas')).toBeInTheDocument()
    })
  })

  it('should render BranchNew on /branches/new', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/new']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Nueva Sucursal')).toBeInTheDocument()
    })
  })

  it('should render BranchList on /branches', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No hay sucursales creadas')).toBeInTheDocument()
    })
  })

  it('should render ProductNew on /branches/1/products/new', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/1/products/new']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Nuevo Producto')).toBeInTheDocument()
    })
  })

  it('should render ClientNew on /branches/1/clients/new', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/1/clients/new']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Nuevo Cliente')).toBeInTheDocument()
    })
  })

  it('should render SessionNew on /branches/1/sessions/new', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/1/sessions/new']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Nueva Sesión')).toBeInTheDocument()
    })
  })

  it('should render SessionDetail on /branches/1/sessions/s1', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/1/sessions/s1']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
    })
  })

  it('should render TransactionNew on /branches/1/sessions/s1/transaction/new', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter
        initialEntries={['/branches/1/sessions/s1/transaction/new']}
      >
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Nueva Venta')).toBeInTheDocument()
    })
  })

  it('should render ProductList on /branches/1/products', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/1/products']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Productos')).toBeInTheDocument()
    })
  })

  it('should render ClientList on /branches/1/clients', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/1/clients']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Clientes')).toBeInTheDocument()
    })
  })

  it('should render BranchSessions on /branches/1/sessions', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/1/sessions']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
    })
  })

  it('should render BranchEdit on /branches/1/edit', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/1']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Sucursal')).toBeInTheDocument()
    })
  })

  it('should render SessionEdit on /branches/1/sessions/s1/edit', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/1/sessions/s1/edit']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Sesión')).toBeInTheDocument()
    })
  })

  it('should render InventoryMovementNew on /branches/1/sessions/s1/inventory/new', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/1/sessions/s1/inventory/new']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Nueva Entrada')).toBeInTheDocument()
    })
  })

  it('should render ProductEdit on /branches/1/products/p1/edit', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/1/products/p1/edit']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Producto')).toBeInTheDocument()
    })
  })

  it('should render ClientEdit on /branches/1/clients/c1/edit', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/branches/1/clients/c1/edit']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Cliente')).toBeInTheDocument()
    })
  })

  it('should redirect unknown routes to home', async () => {
    const App = (await import('../App')).default
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No hay sucursales creadas')).toBeInTheDocument()
    })
  })
})
