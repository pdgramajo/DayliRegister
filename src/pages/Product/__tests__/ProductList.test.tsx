import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { ProductList } from '../ProductList'
import productReducer from '../../../store/productSlice'
import branchReducer from '../../../store/branchSlice'
import { BranchService } from '../../../services'
import { ProductService } from '../../../services/ProductService'
import type { Product } from '../../../types/entities'
import type { Branch } from '../../../types/entities'

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

const mockBranch: Branch = {
  id: 'branch-1',
  name: 'Sucursal Centro',
  address: 'Av. Siempre Viva 123',
  phone: '+543881234567',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Café',
    price: 1500,
    category: 'Bebidas',
    branchId: 'branch-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Medialuna',
    price: 800,
    branchId: 'branch-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

const createStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      products: productReducer,
      branches: branchReducer,
    },
    preloadedState,
  })

describe('ProductList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockParams.mockReturnValue({ id: 'branch-1' })
  })

  it('should show loading spinner', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue(mockBranch)
    vi.spyOn(ProductService, 'getProductsByBranch').mockResolvedValue([])

    const { container } = render(
      <MemoryRouter initialEntries={['/branches/branch-1/products']}>
        <Provider
          store={createStore({
            products: {
              products: [],
              currentProduct: null,
              isLoading: true,
              error: null,
            },
            branches: {
              branches: [],
              currentBranch: null,
              isLoading: false,
              error: null,
            },
          })}
        >
          <ProductList />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  it('should show empty state when no products', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue(mockBranch)
    vi.spyOn(ProductService, 'getProductsByBranch').mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={['/branches/branch-1/products']}>
        <Provider
          store={createStore({
            products: {
              products: [],
              currentProduct: null,
              isLoading: false,
              error: null,
            },
            branches: {
              branches: [],
              currentBranch: mockBranch,
              isLoading: false,
              error: null,
            },
          })}
        >
          <ProductList />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(
        screen.getByText('No hay productos registrados')
      ).toBeInTheDocument()
    })
  })

  it('should render products list', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue(mockBranch)
    vi.spyOn(ProductService, 'getProductsByBranch').mockResolvedValue(
      mockProducts
    )

    render(
      <MemoryRouter initialEntries={['/branches/branch-1/products']}>
        <Provider
          store={createStore({
            products: {
              products: mockProducts,
              currentProduct: null,
              isLoading: false,
              error: null,
            },
            branches: {
              branches: [],
              currentBranch: mockBranch,
              isLoading: false,
              error: null,
            },
          })}
        >
          <ProductList />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument()
    })
    expect(screen.getByText('Medialuna')).toBeInTheDocument()
    expect(screen.getByText('2 productos')).toBeInTheDocument()
  })

  it('should navigate to new product page on + Nuevo click', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue(mockBranch)
    vi.spyOn(ProductService, 'getProductsByBranch').mockResolvedValue(
      mockProducts
    )
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/branches/branch-1/products']}>
        <Provider
          store={createStore({
            products: {
              products: mockProducts,
              currentProduct: null,
              isLoading: false,
              error: null,
            },
            branches: {
              branches: [],
              currentBranch: mockBranch,
              isLoading: false,
              error: null,
            },
          })}
        >
          <ProductList />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument()
    })

    await user.click(screen.getByText('+ Nuevo'))
    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/products/new')
  })

  it('should navigate back to branch sessions', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue(mockBranch)
    vi.spyOn(ProductService, 'getProductsByBranch').mockResolvedValue(
      mockProducts
    )
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/branches/branch-1/products']}>
        <Provider
          store={createStore({
            products: {
              products: mockProducts,
              currentProduct: null,
              isLoading: false,
              error: null,
            },
            branches: {
              branches: [],
              currentBranch: mockBranch,
              isLoading: false,
              error: null,
            },
          })}
        >
          <ProductList />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument()
    })

    await user.click(screen.getByText('← Volver a Sucursal Centro'))
    expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/sessions')
  })

  it('should open delete modal and cancel', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue(mockBranch)
    vi.spyOn(ProductService, 'getProductsByBranch').mockResolvedValue(
      mockProducts
    )
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/branches/branch-1/products']}>
        <Provider
          store={createStore({
            products: {
              products: mockProducts,
              currentProduct: null,
              isLoading: false,
              error: null,
            },
            branches: {
              branches: [],
              currentBranch: mockBranch,
              isLoading: false,
              error: null,
            },
          })}
        >
          <ProductList />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    const trashButton = deleteButtons.find((btn) =>
      btn.querySelector('.lucide-trash2')
    )
    expect(trashButton).toBeDefined()
    await user.click(trashButton!)

    expect(screen.getByText('Eliminar producto')).toBeInTheDocument()
    await user.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Eliminar producto')).not.toBeInTheDocument()
  })

  it('should confirm delete and call service', async () => {
    const deleteSpy = vi
      .spyOn(ProductService, 'deleteProduct')
      .mockResolvedValue(undefined)
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue(mockBranch)
    vi.spyOn(ProductService, 'getProductsByBranch').mockResolvedValue(
      mockProducts
    )
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/branches/branch-1/products']}>
        <Provider
          store={createStore({
            products: {
              products: mockProducts,
              currentProduct: null,
              isLoading: false,
              error: null,
            },
            branches: {
              branches: [],
              currentBranch: mockBranch,
              isLoading: false,
              error: null,
            },
          })}
        >
          <ProductList />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: '' })
    const trashButton = deleteButtons.find((btn) =>
      btn.querySelector('.lucide-trash2')
    )
    await user.click(trashButton!)

    await user.click(screen.getByText('Eliminar'))

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('prod-1')
    })
  })

  async function setupClipboard() {
    const writeText = vi.fn().mockResolvedValue(undefined)
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      })
    } else {
      navigator.clipboard.writeText = writeText
    }
    return writeText
  }

  it('should copy all products to clipboard', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue(mockBranch)
    vi.spyOn(ProductService, 'getProductsByBranch').mockResolvedValue(
      mockProducts
    )
    const writeText = await setupClipboard()
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/branches/branch-1/products']}>
        <Provider
          store={createStore({
            products: {
              products: mockProducts,
              currentProduct: null,
              isLoading: false,
              error: null,
            },
            branches: {
              branches: [],
              currentBranch: mockBranch,
              isLoading: false,
              error: null,
            },
          })}
        >
          <ProductList />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Copiar todo'))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('Café: $1.500\nMedialuna: $800')
    })
  })

  it('should copy selected products to clipboard', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue(mockBranch)
    vi.spyOn(ProductService, 'getProductsByBranch').mockResolvedValue(
      mockProducts
    )
    const writeText = await setupClipboard()
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/branches/branch-1/products']}>
        <Provider
          store={createStore({
            products: {
              products: mockProducts,
              currentProduct: null,
              isLoading: false,
              error: null,
            },
            branches: {
              branches: [],
              currentBranch: mockBranch,
              isLoading: false,
              error: null,
            },
          })}
        >
          <ProductList />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    await user.click(screen.getByText(/Copiar seleccionados/))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('Café: $1.500')
    })
  })

  it('should disable copy selected button when no products selected', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue(mockBranch)
    vi.spyOn(ProductService, 'getProductsByBranch').mockResolvedValue(
      mockProducts
    )

    render(
      <MemoryRouter initialEntries={['/branches/branch-1/products']}>
        <Provider
          store={createStore({
            products: {
              products: mockProducts,
              currentProduct: null,
              isLoading: false,
              error: null,
            },
            branches: {
              branches: [],
              currentBranch: mockBranch,
              isLoading: false,
              error: null,
            },
          })}
        >
          <ProductList />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument()
    })

    expect(screen.getByText(/Copiar seleccionados/)).toBeDisabled()
  })

  it('should navigate to edit product on pencil click', async () => {
    vi.spyOn(BranchService, 'getBranchById').mockResolvedValue(mockBranch)
    vi.spyOn(ProductService, 'getProductsByBranch').mockResolvedValue(
      mockProducts
    )
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/branches/branch-1/products']}>
        <Provider
          store={createStore({
            products: {
              products: mockProducts,
              currentProduct: null,
              isLoading: false,
              error: null,
            },
            branches: {
              branches: [],
              currentBranch: mockBranch,
              isLoading: false,
              error: null,
            },
          })}
        >
          <ProductList />
        </Provider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Café')).toBeInTheDocument()
    })

    const pencilButtons = screen.getAllByRole('button', { name: '' })
    const pencilButton = pencilButtons.find((btn) =>
      btn.querySelector('.lucide-pencil')
    )
    expect(pencilButton).toBeDefined()
    await user.click(pencilButton!)

    expect(mockNavigate).toHaveBeenCalledWith(
      '/branches/branch-1/products/prod-1/edit'
    )
  })
})
