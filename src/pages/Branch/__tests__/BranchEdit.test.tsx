import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import branchReducer from '../../../store/branchSlice'
import { BranchService } from '../../../services'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'branch-1' }),
  }
})

describe('BranchEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createStore = (overrides = {}) =>
    configureStore({
      reducer: { branches: branchReducer },
      preloadedState: {
        branches: {
          branches: [],
          currentBranch: null,
          isLoading: false,
          error: null,
          ...overrides,
        },
      },
    })

  it('should render the title', async () => {
    const { BranchEdit } = await import('../BranchEdit')
    render(
      <Provider store={createStore()}>
        <MemoryRouter>
          <BranchEdit />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByText('Editar Sucursal')).toBeInTheDocument()
  })

  it('should render form with branch data', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Sucursal Centro',
      address: 'Av. Siempre Viva 123',
      phone: '+543881234567',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    } as any)

    const { BranchEdit } = await import('../BranchEdit')
    render(
      <Provider
        store={createStore({
          currentBranch: {
            id: 'branch-1',
            name: 'Sucursal Centro',
            address: 'Av. Siempre Viva 123',
            phone: '+543881234567',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <BranchEdit />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByDisplayValue('Sucursal Centro')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Av. Siempre Viva 123')).toBeInTheDocument()
    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })

  it('should call updateBranch and navigate on submit', async () => {
    const user = userEvent.setup()
    vi.spyOn(BranchService, 'updateBranch').mockResolvedValue({
      id: 'branch-1',
    } as any)

    const { BranchEdit } = await import('../BranchEdit')
    render(
      <Provider
        store={createStore({
          currentBranch: {
            id: 'branch-1',
            name: 'Sucursal Centro',
            address: 'Av. Siempre Viva 123',
            phone: '+543881234567',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <BranchEdit />
        </MemoryRouter>
      </Provider>
    )

    await user.clear(screen.getByLabelText('Nombre'))
    await user.type(screen.getByLabelText('Nombre'), 'Sucursal Editada')
    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(BranchService.updateBranch).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/branches')
  })

  it('should not navigate when updateBranch fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(BranchService, 'updateBranch').mockRejectedValue(new Error('fail'))

    const { BranchEdit } = await import('../BranchEdit')
    render(
      <Provider
        store={createStore({
          currentBranch: {
            id: 'branch-1',
            name: 'Sucursal Centro',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <BranchEdit />
        </MemoryRouter>
      </Provider>
    )

    await user.type(screen.getByLabelText('Nombre'), ' Falla')
    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(BranchService.updateBranch).toHaveBeenCalled()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
