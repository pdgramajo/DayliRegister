import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import clientReducer from '../../../store/clientSlice'
import { ClientService } from '../../../services/ClientService'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'branch-1', clientId: 'client-1' }),
  }
})

describe('ClientEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createStore = (overrides = {}) =>
    configureStore({
      reducer: { clients: clientReducer },
      preloadedState: {
        clients: {
          clients: [],
          currentClient: null,
          isLoading: false,
          error: null,
          ...overrides,
        },
      },
    })

  it('should render the title', async () => {
    const { ClientEdit } = await import('../ClientEdit')
    render(
      <Provider store={createStore()}>
        <MemoryRouter>
          <ClientEdit />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByText('Editar Cliente')).toBeInTheDocument()
  })

  it('should render form with client data', async () => {
    const { ClientEdit } = await import('../ClientEdit')
    render(
      <Provider
        store={createStore({
          currentClient: {
            id: 'client-1',
            branchId: 'branch-1',
            name: 'Juan Pérez',
            phone: '+543884123456',
            balance: 2500,
            entries: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <ClientEdit />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })

  it('should call updateClient and navigate on submit', async () => {
    const user = userEvent.setup()
    vi.spyOn(ClientService, 'getClientById').mockResolvedValue({
      id: 'client-1',
      branchId: 'branch-1',
      name: 'Juan Pérez',
      phone: '+543884123456',
      balance: 2500,
      entries: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })
    vi.spyOn(ClientService, 'updateClient').mockResolvedValue({
      id: 'client-1',
    } as any)

    const { ClientEdit } = await import('../ClientEdit')
    render(
      <Provider
        store={createStore({
          currentClient: {
            id: 'client-1',
            branchId: 'branch-1',
            name: 'Juan Pérez',
            phone: '+543884123456',
            balance: 2500,
            entries: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <ClientEdit />
        </MemoryRouter>
      </Provider>
    )

    await user.clear(screen.getByLabelText('Nombre'))
    await user.type(screen.getByLabelText('Nombre'), 'Juan Editado')
    await waitFor(() => {
      expect(screen.getByText('Guardar')).not.toBeDisabled()
    })
    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(ClientService.updateClient).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/clients')
  })

  it('should not navigate when updateClient fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(ClientService, 'getClientById').mockResolvedValue({
      id: 'client-1',
      branchId: 'branch-1',
      name: 'Juan Pérez',
      phone: '+543884123456',
      balance: 2500,
      entries: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })
    vi.spyOn(ClientService, 'updateClient').mockRejectedValue(new Error('fail'))

    const { ClientEdit } = await import('../ClientEdit')
    render(
      <Provider
        store={createStore({
          currentClient: {
            id: 'client-1',
            branchId: 'branch-1',
            name: 'Juan Pérez',
            phone: '+543884123456',
            balance: 2500,
            entries: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <ClientEdit />
        </MemoryRouter>
      </Provider>
    )

    await user.type(screen.getByLabelText('Nombre'), ' Falla')
    await waitFor(() => {
      expect(screen.getByText('Guardar')).not.toBeDisabled()
    })
    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(ClientService.updateClient).toHaveBeenCalled()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
