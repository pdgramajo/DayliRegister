import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { ClientList } from '../ClientList'
import clientReducer from '../../../store/clientSlice'
import branchReducer from '../../../store/branchSlice'
import type { ClientWithBalance } from '../../../services/ClientService'

const mockClient: ClientWithBalance = {
  id: 'client-1',
  branchId: 'test-branch-1',
  name: 'Juan Pérez',
  phone: '+543884123456',
  balance: 2500,
  entries: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockClientPaid: ClientWithBalance = {
  id: 'client-2',
  branchId: 'test-branch-1',
  name: 'María García',
  phone: '',
  balance: 0,
  entries: [],
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
}

const renderWithProviders = (clientsState = {}, branchesState = {}) => {
  const store = configureStore({
    reducer: {
      clients: clientReducer,
      branches: branchReducer,
    },
    preloadedState: {
      clients: {
        clients: [],
        currentClient: null,
        isLoading: false,
        error: null,
        ...clientsState,
      },
      branches: {
        branches: [],
        currentBranch: {
          id: 'test-branch-1',
          name: 'Test Branch',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        isLoading: false,
        error: null,
        ...branchesState,
      },
    },
  })

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/branches/test-branch-1/clients']}>
        <ClientList />
      </MemoryRouter>
    </Provider>
  )
}

describe('ClientList', () => {
  it('should show loading state', () => {
    const { container } = renderWithProviders({ isLoading: true }, {})

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should show loading when currentBranch is null', () => {
    const { container } = renderWithProviders({}, { currentBranch: null })

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should render clients list', () => {
    renderWithProviders(
      {
        clients: [mockClient, mockClientPaid],
      },
      {}
    )

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('María García')).toBeInTheDocument()
  })

  it('should show empty state when no clients', () => {
    renderWithProviders({}, {})

    expect(screen.getByText('No hay clientes registrados')).toBeInTheDocument()
  })

  it('should show client count', () => {
    renderWithProviders(
      {
        clients: [mockClient],
      },
      {}
    )

    expect(screen.getByText('1 cliente')).toBeInTheDocument()
  })

  it('should show branch name in back button', () => {
    renderWithProviders({}, {})

    expect(screen.getByText(/Test Branch/)).toBeInTheDocument()
  })
})
