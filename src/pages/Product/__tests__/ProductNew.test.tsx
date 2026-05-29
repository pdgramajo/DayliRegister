import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ProductService } from '../../../services/ProductService'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'branch-1' }),
  }
})

describe('ProductNew', () => {
  it('should render the title', async () => {
    const { ProductNew } = await import('../ProductNew')
    render(
      <MemoryRouter>
        <ProductNew />
      </MemoryRouter>
    )

    expect(screen.getByText('Nuevo Producto')).toBeInTheDocument()
  })

  it('should call createProduct and navigate on submit', async () => {
    vi.spyOn(ProductService, 'createProduct').mockResolvedValue({
      id: 'new-id',
      name: 'New Product',
      price: 1000,
    } as any)
    const user = userEvent.setup()

    const { ProductNew } = await import('../ProductNew')
    render(
      <MemoryRouter>
        <ProductNew />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre'), 'Nuevo Producto')
    await user.type(screen.getByLabelText('Precio'), '2500')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(ProductService.createProduct).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/products')
  })
})
