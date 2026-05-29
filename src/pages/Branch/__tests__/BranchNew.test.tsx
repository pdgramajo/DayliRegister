import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { BranchService } from '../../../services'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.spyOn(BranchService, 'createBranch')

describe('BranchNew', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    BranchService.createBranch.mockClear()
  })

  it('should render the title and form', async () => {
    const { BranchNew } = await import('../BranchNew')
    render(
      <MemoryRouter>
        <BranchNew />
      </MemoryRouter>
    )

    expect(screen.getByText('Nueva Sucursal')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Crear')).toBeInTheDocument()
  })

  it('should call createBranch and navigate on submit', async () => {
    BranchService.createBranch.mockResolvedValue({
      id: 'new-id',
      name: 'Nueva Suc',
    } as any)
    const user = userEvent.setup()
    const { BranchNew } = await import('../BranchNew')

    render(
      <MemoryRouter>
        <BranchNew />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre'), 'Nueva Suc')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(BranchService.createBranch).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/branches')
  })

  it('should not navigate when createBranch fails', async () => {
    BranchService.createBranch.mockRejectedValue(new Error('DB error'))
    const user = userEvent.setup()
    const { BranchNew } = await import('../BranchNew')

    render(
      <MemoryRouter>
        <BranchNew />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre'), 'Falla')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(BranchService.createBranch).toHaveBeenCalled()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
