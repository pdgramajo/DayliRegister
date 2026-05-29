import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ClientService } from '../../../services/ClientService'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'branch-1' }),
  }
})

vi.spyOn(ClientService, 'createClient')

describe('ClientNew', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    ClientService.createClient.mockClear()
  })

  it('should render the title and form', async () => {
    const { ClientNew } = await import('../ClientNew')
    render(
      <MemoryRouter>
        <ClientNew />
      </MemoryRouter>
    )

    expect(screen.getByText('Nuevo Cliente')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
  })

  it('should call createClient and navigate on submit', async () => {
    ClientService.createClient.mockResolvedValue({
      id: 'new-id',
      name: 'Cliente Nuevo',
    } as any)
    const user = userEvent.setup()
    const { ClientNew } = await import('../ClientNew')

    render(
      <MemoryRouter>
        <ClientNew />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre'), 'Cliente Nuevo')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(ClientService.createClient).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/clients')
  })

  it('should not navigate when createClient fails', async () => {
    ClientService.createClient.mockRejectedValue(new Error('DB error'))
    const user = userEvent.setup()
    const { ClientNew } = await import('../ClientNew')

    render(
      <MemoryRouter>
        <ClientNew />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre'), 'Falla')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(ClientService.createClient).toHaveBeenCalled()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
