import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { ClientList } from '../ClientList'
import clientReducer from '../../../store/clientSlice'
import branchReducer from '../../../store/branchSlice'
import { ClientService } from '../../../services/ClientService'
import type { ClientWithBalance } from '../../../services/ClientService'
import type { Branch } from '../../../types/entities'

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

const mockBranch: Branch = {
  id: 'test-branch-1',
  name: 'Test Branch',
  address: 'Av. Test 123',
  phone: '+543881234567',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const createStore = (clientsState = {}, branchesState = {}) =>
  configureStore({
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
        currentBranch: mockBranch,
        isLoading: false,
        error: null,
        ...branchesState,
      },
    },
  })

const renderWithProviders = (clientsState = {}, branchesState = {}) =>
  render(
    <Provider store={createStore(clientsState, branchesState)}>
      <MemoryRouter initialEntries={['/branches/test-branch-1/clients']}>
        <ClientList />
      </MemoryRouter>
    </Provider>
  )

describe('ClientList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it('should filter by search query', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      {
        clients: [mockClient, mockClientPaid],
      },
      {}
    )

    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, 'Juan')

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.queryByText('María García')).not.toBeInTheDocument()
  })

  it('should show no results message when search has no matches', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      {
        clients: [mockClient, mockClientPaid],
      },
      {}
    )

    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, 'NonExistent')

    expect(screen.getByText('No se encontraron clientes')).toBeInTheDocument()
    expect(screen.getByText('Probá con otro nombre')).toBeInTheDocument()
  })

  it('should filter by solo con deuda toggle', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      {
        clients: [mockClient, mockClientPaid],
      },
      {}
    )

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('María García')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Solo con deuda'))

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.queryByText('María García')).not.toBeInTheDocument()
  })

  it('should show no debtors message when no clients with debt', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      {
        clients: [mockClientPaid],
      },
      {}
    )

    await user.click(screen.getByLabelText('Solo con deuda'))

    expect(screen.getByText('No hay clientes con deuda')).toBeInTheDocument()
    expect(
      screen.getByText('Los clientes sin deuda están ocultos')
    ).toBeInTheDocument()
  })

  it('should open delete client modal and cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      {
        clients: [mockClient],
      },
      {}
    )

    const deleteButton = screen.getByTestId('delete-client-button')
    await user.click(deleteButton)

    expect(
      screen.getByText(
        '¿Estás seguro de eliminar este cliente? Los registros de deuda también se eliminarán.'
      )
    ).toBeInTheDocument()

    await user.click(screen.getByText('Cancelar'))

    expect(
      screen.queryByText(
        '¿Estás seguro de eliminar este cliente? Los registros de deuda también se eliminarán.'
      )
    ).not.toBeInTheDocument()
  })

  it('should confirm delete client and call service', async () => {
    const user = userEvent.setup()
    const deleteSpy = vi
      .spyOn(ClientService, 'deleteClient')
      .mockResolvedValue(undefined)

    renderWithProviders(
      {
        clients: [mockClient],
      },
      {}
    )

    const deleteButton = screen.getByTestId('delete-client-button')
    await user.click(deleteButton)

    await user.click(screen.getAllByText('Eliminar')[1])

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('client-1')
    })
  })

  it('should open delete entry modal and cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      {
        clients: [
          {
            ...mockClient,
            entries: [
              {
                id: 'entry-1',
                clientId: 'client-1',
                type: 'debt',
                amount: 500,
                description: 'test',
                date: '2024-01-15T00:00:00Z',
              },
            ],
          },
        ],
      },
      {}
    )

    const expandButton = screen.getByTestId('expand-button')
    await user.click(expandButton)

    const deleteEntryButton = screen.getByTestId('delete-entry-button')
    await user.click(deleteEntryButton)

    expect(
      screen.getByText(
        '¿Estás seguro de eliminar este registro? Esto afectará el saldo del cliente.'
      )
    ).toBeInTheDocument()

    await user.click(screen.getByText('Cancelar'))

    expect(
      screen.queryByText(
        '¿Estás seguro de eliminar este registro? Esto afectará el saldo del cliente.'
      )
    ).not.toBeInTheDocument()
  })

  it('should open debt entry modal and cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      {
        clients: [mockClient],
      },
      {}
    )

    const debtButton = screen.getByTestId('add-debt-button')
    await user.click(debtButton)

    expect(screen.getByText('Agregar deuda')).toBeInTheDocument()

    await user.click(screen.getByText('Cancelar'))

    expect(screen.queryByText('Agregar deuda')).not.toBeInTheDocument()
  })
})
