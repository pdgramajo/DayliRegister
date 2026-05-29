import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import branchReducer from '../../../store/branchSlice'
import sessionReducer from '../../../store/sessionSlice'
import { BranchService } from '../../../services'
import { SessionService } from '../../../services/SessionService'
import type { CashSession } from '../../../types/entities'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'branch-1' }),
  }
})

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

describe('BranchSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createStore = (branchOverrides = {}, sessionOverrides = {}) =>
    configureStore({
      reducer: { branches: branchReducer, sessions: sessionReducer },
      preloadedState: {
        branches: {
          branches: [],
          currentBranch: null,
          isLoading: false,
          error: null,
          ...branchOverrides,
        },
        sessions: {
          sessions: [],
          currentSession: null,
          isLoading: false,
          error: null,
          ...sessionOverrides,
        },
      },
    })

  it('should show loading state when branch is loading', async () => {
    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider store={createStore({ isLoading: true })}>
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should show loading state when sessions are loading', async () => {
    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore(
          { currentBranch: { id: 'branch-1', name: 'Test' } },
          { isLoading: true }
        )}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should show loading state when currentBranch is null', async () => {
    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider store={createStore({ isLoading: false, currentBranch: null })}>
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should render branch name', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Sucursal Centro',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([])

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Sucursal Centro' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Sucursal Centro')).toBeInTheDocument()
    })
  })

  it('should show empty state when no closed sessions', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Test',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([])

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Test' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('No hay sesiones cerradas')).toBeInTheDocument()
    })
  })

  it('should render open and closed sessions', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Test',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([
      openSession,
      closedSession,
    ])

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Test' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Mañana')).toBeInTheDocument()
      expect(screen.getByText('Sesión Tarde')).toBeInTheDocument()
    })
  })

  it('should navigate to products page', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Test',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([])
    const user = userEvent.setup()

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Test' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Productos')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Productos'))
    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/products')
  })

  it('should navigate to clients page', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Test',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([])
    const user = userEvent.setup()

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Test' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Clientes')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Clientes'))
    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/clients')
  })

  it('should navigate to new session page', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Test',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([])
    const user = userEvent.setup()

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Test' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('+ Nueva sesión')).toBeInTheDocument()
    })
    await user.click(screen.getByText('+ Nueva sesión'))
    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/sessions/new')
  })

  it('should navigate back to branches', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Test',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([])
    const user = userEvent.setup()

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Test' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('← Volver')).toBeInTheDocument()
    })
    await user.click(screen.getByText('← Volver'))
    expect(mockNavigate).toHaveBeenCalledWith('/branches')
  })

  it('should show ABIERTAS section when there are open sessions', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Test',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([
      openSession,
    ])

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Test' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('ABIERTAS')).toBeInTheDocument()
    })
  })

  it('should not show ABIERTAS section when no open sessions', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Test',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([
      closedSession,
    ])

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Test' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.queryByText('ABIERTAS')).not.toBeInTheDocument()
    })
  })

  it('should show delete modal when clicking eliminar on closed session', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Test',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([
      closedSession,
    ])
    const user = userEvent.setup()

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Test' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Tarde')).toBeInTheDocument()
    })

    await user.click(screen.getByTitle('Eliminar'))

    await waitFor(() => {
      expect(screen.getByText('Eliminar sesión')).toBeInTheDocument()
    })
  })

  it('should close delete modal on cancel', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Test',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([
      closedSession,
    ])
    const user = userEvent.setup()

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Test' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Sesión Tarde')).toBeInTheDocument()
    })

    await user.click(screen.getByTitle('Eliminar'))

    await waitFor(() => {
      expect(screen.getByText('Eliminar sesión')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Cancelar'))

    await waitFor(() => {
      expect(screen.queryByText('Eliminar sesión')).not.toBeInTheDocument()
    })
  })

  it('should call deleteSession on confirm delete', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Test',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([
      closedSession,
    ])
    vi.spyOn(SessionService, 'deleteSession').mockResolvedValue(undefined)
    const user = userEvent.setup()

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Test' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await user.click(await screen.findByTitle('Eliminar'))

    await waitFor(() => {
      expect(screen.getByText('Eliminar sesión')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Eliminar'))

    await waitFor(() => {
      expect(SessionService.deleteSession).toHaveBeenCalledWith('session-2')
    })
  })

  it('should show HISTORIAL count', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue({
      id: 'branch-1',
      name: 'Test',
    } as any)
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue([
      closedSession,
    ])

    const { BranchSessions } = await import('../BranchSessions')
    render(
      <Provider
        store={createStore({
          currentBranch: { id: 'branch-1', name: 'Test' },
        })}
      >
        <MemoryRouter>
          <BranchSessions />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('HISTORIAL (1)')).toBeInTheDocument()
    })
  })
})
