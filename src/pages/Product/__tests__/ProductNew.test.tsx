import { describe, it, expect, vi, beforeEach } from 'vitest'
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

vi.spyOn(ProductService, 'createProduct')

describe('ProductNew', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    ProductService.createProduct.mockClear()
  })

  it('should render the title and form', async () => {
    const { ProductNew } = await import('../ProductNew')
    render(
      <MemoryRouter>
        <ProductNew />
      </MemoryRouter>
    )

    expect(screen.getByText('Nuevo Producto')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Nombre$/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Precio$/)).toBeInTheDocument()
  })

  it('should call createProduct and navigate on submit', async () => {
    ProductService.createProduct.mockResolvedValue({
      id: 'new-id',
      name: 'Producto Nuevo',
    } as any)
    const user = userEvent.setup()
    const { ProductNew } = await import('../ProductNew')

    render(
      <MemoryRouter>
        <ProductNew />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/^Nombre$/), 'Producto Nuevo')
    await user.type(screen.getByLabelText(/^Precio$/), '2500')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(ProductService.createProduct).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/products')
  })

  it('should not navigate when createProduct fails', async () => {
    ProductService.createProduct.mockRejectedValue(new Error('DB error'))
    const user = userEvent.setup()
    const { ProductNew } = await import('../ProductNew')

    render(
      <MemoryRouter>
        <ProductNew />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/^Nombre$/), 'Falla')
    await user.type(screen.getByLabelText(/^Precio$/), '100')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(ProductService.createProduct).toHaveBeenCalled()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
