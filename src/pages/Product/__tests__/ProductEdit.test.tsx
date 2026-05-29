import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import productReducer from '../../../store/productSlice'
import { ProductService } from '../../../services/ProductService'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'branch-1', productId: 'product-1' }),
  }
})

describe('ProductEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createStore = (overrides = {}) =>
    configureStore({
      reducer: { products: productReducer },
      preloadedState: {
        products: {
          products: [],
          currentProduct: null,
          isLoading: false,
          error: null,
          ...overrides,
        },
      },
    })

  it('should render the title', async () => {
    const { ProductEdit } = await import('../ProductEdit')
    render(
      <Provider store={createStore()}>
        <MemoryRouter>
          <ProductEdit />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByText('Editar Producto')).toBeInTheDocument()
  })

  it('should render form with product data', async () => {
    const { ProductEdit } = await import('../ProductEdit')
    render(
      <Provider
        store={createStore({
          currentProduct: {
            id: 'product-1',
            name: 'Producto Test',
            price: 1500,
            category: 'Cat A',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <ProductEdit />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByDisplayValue('Producto Test')).toBeInTheDocument()
    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })

  it('should call updateProduct and navigate on submit', async () => {
    const user = userEvent.setup()
    vi.spyOn(ProductService, 'updateProduct').mockResolvedValue({
      id: 'product-1',
    } as any)

    const { ProductEdit } = await import('../ProductEdit')
    render(
      <Provider
        store={createStore({
          currentProduct: {
            id: 'product-1',
            name: 'Producto Test',
            price: 1500,
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <ProductEdit />
        </MemoryRouter>
      </Provider>
    )

    await user.clear(screen.getByLabelText('Nombre'))
    await user.type(screen.getByLabelText('Nombre'), 'Producto Editado')

    await user.clear(screen.getByLabelText('Precio'))
    await user.type(screen.getByLabelText('Precio'), '2000')
    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(ProductService.updateProduct).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/products')
  })

  it('should not navigate when updateProduct fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(ProductService, 'updateProduct').mockRejectedValue(
      new Error('fail')
    )

    const { ProductEdit } = await import('../ProductEdit')
    render(
      <Provider
        store={createStore({
          currentProduct: {
            id: 'product-1',
            name: 'Producto Test',
            price: 1500,
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          isLoading: false,
        })}
      >
        <MemoryRouter>
          <ProductEdit />
        </MemoryRouter>
      </Provider>
    )

    await user.clear(screen.getByLabelText('Nombre'))
    await user.type(screen.getByLabelText('Nombre'), ' Falla')
    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(ProductService.updateProduct).toHaveBeenCalled()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
