import { describe, it, expect, vi } from 'vitest'
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
    useParams: () => ({ id: 'branch-1' }),
  }
})

describe('BranchNew', () => {
  it('should render the title', async () => {
    const { BranchNew } = await import('../BranchNew')
    render(
      <MemoryRouter>
        <BranchNew />
      </MemoryRouter>
    )

    expect(screen.getByText('Nueva Sucursal')).toBeInTheDocument()
  })

  it('should call createBranch and navigate on submit', async () => {
    vi.spyOn(BranchService, 'createBranch').mockResolvedValue({
      id: 'new-id',
      name: 'New Branch',
      isActive: true,
    } as any)
    const user = userEvent.setup()

    const { BranchNew } = await import('../BranchNew')
    render(
      <MemoryRouter>
        <BranchNew />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre'), 'Mi Nueva Sucursal')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(BranchService.createBranch).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/branches')
  })
})
