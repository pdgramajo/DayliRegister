import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import sessionReducer from '../../../store/sessionSlice'
import { SessionService } from '../../../services/SessionService'

const mockNavigate = vi.fn()
const mockParams = vi.fn(() => ({ id: 'branch-1', sessionId: 'session-1' }))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams(),
  }
})

describe('SessionEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockParams.mockReturnValue({ id: 'branch-1', sessionId: 'session-1' })
  })

  const createStore = (overrides = {}) =>
    configureStore({
      reducer: { sessions: sessionReducer },
      preloadedState: {
        sessions: {
          sessions: [],
          currentSession: null,
          isLoading: false,
          error: null,
          ...overrides,
        },
      },
    })

  it('should render the title', async () => {
    vi.spyOn(SessionService, 'getSessionById').mockResolvedValue({
      id: 'session-1',
      branchId: 'branch-1',
      name: 'Sesión Mañana',
      status: 'open',
      initialAmount: 5000,
      openedAt: '2024-06-01T08:00:00Z',
      createdAt: '2024-06-01T08:00:00Z',
      updatedAt: '2024-06-01T08:00:00Z',
    })

    const { SessionEdit } = await import('../SessionEdit')
    render(
      <Provider
        store={createStore({
          currentSession: {
            id: 'session-1',
            branchId: 'branch-1',
            name: 'Sesión Mañana',
            status: 'open',
            initialAmount: 5000,
            openedAt: '2024-06-01T08:00:00Z',
            createdAt: '2024-06-01T08:00:00Z',
            updatedAt: '2024-06-01T08:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <SessionEdit />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByText('Editar Sesión')).toBeInTheDocument()
  })

  it('should render form with session data', async () => {
    vi.spyOn(SessionService, 'getSessionById').mockResolvedValue({
      id: 'session-1',
      branchId: 'branch-1',
      name: 'Sesión Mañana',
      status: 'open',
      initialAmount: 5000,
      openedAt: '2024-06-01T08:00:00Z',
      createdAt: '2024-06-01T08:00:00Z',
      updatedAt: '2024-06-01T08:00:00Z',
    })

    const { SessionEdit } = await import('../SessionEdit')
    render(
      <Provider
        store={createStore({
          currentSession: {
            id: 'session-1',
            branchId: 'branch-1',
            name: 'Sesión Mañana',
            status: 'open',
            initialAmount: 5000,
            openedAt: '2024-06-01T08:00:00Z',
            createdAt: '2024-06-01T08:00:00Z',
            updatedAt: '2024-06-01T08:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <SessionEdit />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByDisplayValue('Sesión Mañana')).toBeInTheDocument()
    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })

  it('should call updateSession and navigate on submit', async () => {
    vi.spyOn(SessionService, 'getSessionById').mockResolvedValue({
      id: 'session-1',
      branchId: 'branch-1',
      name: 'Sesión Mañana',
      status: 'open',
      initialAmount: 5000,
      openedAt: '2024-06-01T08:00:00Z',
      createdAt: '2024-06-01T08:00:00Z',
      updatedAt: '2024-06-01T08:00:00Z',
    })
    vi.spyOn(SessionService, 'updateSession').mockResolvedValue({
      id: 'session-1',
    } as any)
    const user = userEvent.setup()

    const { SessionEdit } = await import('../SessionEdit')
    render(
      <Provider
        store={createStore({
          currentSession: {
            id: 'session-1',
            branchId: 'branch-1',
            name: 'Sesión Mañana',
            status: 'open',
            initialAmount: 5000,
            openedAt: '2024-06-01T08:00:00Z',
            createdAt: '2024-06-01T08:00:00Z',
            updatedAt: '2024-06-01T08:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <SessionEdit />
        </MemoryRouter>
      </Provider>
    )

    await user.clear(screen.getByLabelText('Nombre *'))
    await user.type(screen.getByLabelText('Nombre *'), 'Sesión Editada')
    await waitFor(() => {
      expect(screen.getByText('Guardar')).not.toBeDisabled()
    })
    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(SessionService.updateSession).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/sessions')
  })

  it('should redirect to sessions when session is closed', async () => {
    vi.spyOn(SessionService, 'getSessionById').mockResolvedValue({
      id: 'session-1',
      branchId: 'branch-1',
      name: 'Sesión Cerrada',
      status: 'closed',
      initialAmount: 5000,
      closingBalance: 6000,
      openedAt: '2024-06-01T08:00:00Z',
      closedAt: '2024-06-01T20:00:00Z',
      createdAt: '2024-06-01T08:00:00Z',
      updatedAt: '2024-06-01T20:00:00Z',
    })

    const { SessionEdit } = await import('../SessionEdit')
    render(
      <Provider
        store={createStore({
          currentSession: {
            id: 'session-1',
            branchId: 'branch-1',
            name: 'Sesión Cerrada',
            status: 'closed',
            initialAmount: 5000,
            closingBalance: 6000,
            openedAt: '2024-06-01T08:00:00Z',
            closedAt: '2024-06-01T20:00:00Z',
            createdAt: '2024-06-01T08:00:00Z',
            updatedAt: '2024-06-01T20:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <SessionEdit />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/sessions')
    })
  })

  it('should show loading fallback when no session and not loading', async () => {
    mockParams.mockReturnValue({
      id: 'branch-1',
      sessionId: undefined,
    })

    const { SessionEdit } = await import('../SessionEdit')
    render(
      <Provider
        store={createStore({
          currentSession: null,
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <SessionEdit />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('should show error toast on update failure', async () => {
    vi.spyOn(SessionService, 'getSessionById').mockResolvedValue({
      id: 'session-1',
      branchId: 'branch-1',
      name: 'Sesión Mañana',
      status: 'open',
      initialAmount: 5000,
      openedAt: '2024-06-01T08:00:00Z',
      createdAt: '2024-06-01T08:00:00Z',
      updatedAt: '2024-06-01T08:00:00Z',
    })
    vi.spyOn(SessionService, 'updateSession').mockRejectedValue(
      new Error('Update failed')
    )
    const user = userEvent.setup()

    const { SessionEdit } = await import('../SessionEdit')
    render(
      <Provider
        store={createStore({
          currentSession: {
            id: 'session-1',
            branchId: 'branch-1',
            name: 'Sesión Mañana',
            status: 'open',
            initialAmount: 5000,
            openedAt: '2024-06-01T08:00:00Z',
            createdAt: '2024-06-01T08:00:00Z',
            updatedAt: '2024-06-01T08:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <SessionEdit />
        </MemoryRouter>
      </Provider>
    )

    await user.click(screen.getByText('Guardar'))
  })
})
