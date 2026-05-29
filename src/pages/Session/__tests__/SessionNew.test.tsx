import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SessionService, SessionAlreadyOpenError } from '../../../services'

const mockNavigate = vi.fn()
const mockParams = vi.fn(() => ({ id: 'branch-1' }))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams(),
  }
})

describe('SessionNew', () => {
  beforeEach(() => {
    mockParams.mockReturnValue({ id: 'branch-1' })
  })

  it('should render the title', async () => {
    const { SessionNew } = await import('../SessionNew')
    render(
      <MemoryRouter>
        <SessionNew />
      </MemoryRouter>
    )

    expect(screen.getByText('Nueva Sesión')).toBeInTheDocument()
  })

  it('should call createSession and navigate on submit', async () => {
    vi.spyOn(SessionService, 'createSession').mockResolvedValue({
      id: 'new-session',
      name: 'New Session',
    } as any)
    const user = userEvent.setup()

    const { SessionNew } = await import('../SessionNew')
    render(
      <MemoryRouter>
        <SessionNew />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre *'), 'Sesión Mañana')
    await user.click(screen.getByText('Abrir sesión'))

    await waitFor(() => {
      expect(SessionService.createSession).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/sessions')
  })

  it('should show error toast when session already open', async () => {
    vi.spyOn(SessionService, 'createSession').mockRejectedValue(
      new SessionAlreadyOpenError('branch-1')
    )
    const { toast } = await import('../../../components/ui')
    const toastErrorSpy = vi.spyOn(toast, 'error').mockImplementation(() => {})
    const user = userEvent.setup()

    const { SessionNew } = await import('../SessionNew')
    render(
      <MemoryRouter>
        <SessionNew />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre *'), 'Another Session')
    await user.click(screen.getByText('Abrir sesión'))

    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith(
        'Ya hay una sesión abierta para esta sucursal'
      )
    })
  })

  it('should show generic error toast on unexpected error', async () => {
    vi.spyOn(SessionService, 'createSession').mockRejectedValue(
      new Error('Unexpected')
    )
    const { toast } = await import('../../../components/ui')
    const toastErrorSpy = vi.spyOn(toast, 'error').mockImplementation(() => {})
    const user = userEvent.setup()

    const { SessionNew } = await import('../SessionNew')
    render(
      <MemoryRouter>
        <SessionNew />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre *'), 'Test')
    await user.click(screen.getByText('Abrir sesión'))

    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith('Error al crear la sesión')
    })
  })

  it('should show loading when branchId is missing', async () => {
    mockParams.mockReturnValue({ id: undefined })

    const { SessionNew } = await import('../SessionNew')
    render(
      <MemoryRouter>
        <SessionNew />
      </MemoryRouter>
    )

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })
})
