import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import productReducer, {
  fetchProductsByBranch,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  clearCurrentProduct,
  clearError,
} from '../productSlice'
import type { Product } from '../../types/entities'

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      products: productReducer,
    },
    preloadedState,
  })
}

const mockProduct: Product = {
  id: 'test-id-1',
  branchId: 'branch-1',
  name: 'Test Product',
  price: 1000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('productSlice', () => {
  describe('reducers', () => {
    it('should return initial state', () => {
      const store = createTestStore()
      const state = store.getState().products

      expect(state.products).toEqual([])
      expect(state.currentProduct).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle clearCurrentProduct', () => {
      const store = createTestStore({
        products: {
          products: [],
          currentProduct: mockProduct,
          isLoading: false,
          error: null,
        },
      })

      store.dispatch(clearCurrentProduct())
      const state = store.getState().products

      expect(state.currentProduct).toBeNull()
    })

    it('should handle clearError', () => {
      const store = createTestStore({
        products: {
          products: [],
          currentProduct: null,
          isLoading: false,
          error: 'Some error',
        },
      })

      store.dispatch(clearError())
      const state = store.getState().products

      expect(state.error).toBeNull()
    })
  })

  describe('async thunks - fetchProductsByBranch', () => {
    it('should set loading to true when pending', () => {
      const store = createTestStore()

      store.dispatch(fetchProductsByBranch.pending('branch-1'))

      const state = store.getState().products
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should set products when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        fetchProductsByBranch.fulfilled([mockProduct], 'fulfilled', 'branch-1')
      )

      const state = store.getState().products
      expect(state.products).toHaveLength(1)
      expect(state.products[0].name).toBe('Test Product')
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        fetchProductsByBranch.rejected(
          null,
          'rejected',
          'branch-1',
          'Error al cargar'
        )
      )

      const state = store.getState().products
      expect(state.error).toBe('Error al cargar')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('async thunks - fetchProductById', () => {
    it('should set currentProduct when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        fetchProductById.fulfilled(mockProduct, 'fulfilled', 'test-id-1')
      )

      const state = store.getState().products
      expect(state.currentProduct?.name).toBe('Test Product')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('async thunks - createProduct', () => {
    it('should add product when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        createProduct.fulfilled(mockProduct, 'fulfilled', {
          branchId: 'branch-1',
          name: 'Test Product',
          price: 1000,
        })
      )

      const state = store.getState().products
      expect(state.products).toHaveLength(1)
      expect(state.products[0].name).toBe('Test Product')
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        createProduct.rejected(
          null,
          'rejected',
          { branchId: 'b', name: 'n', price: 0 },
          'Error al crear'
        )
      )

      const state = store.getState().products
      expect(state.error).toBe('Error al crear')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('async thunks - updateProduct', () => {
    it('should update product when fulfilled', () => {
      const store = createTestStore({
        products: {
          products: [mockProduct],
          currentProduct: null,
          isLoading: false,
          error: null,
        },
      })

      const updatedProduct = { ...mockProduct, name: 'Updated Product' }
      store.dispatch(
        updateProduct.fulfilled(updatedProduct, 'fulfilled', {
          id: 'test-id-1',
          data: { name: 'Updated Product' },
        })
      )

      const state = store.getState().products
      expect(state.products[0].name).toBe('Updated Product')
    })

    it('should also update currentProduct if it matches', () => {
      const store = createTestStore({
        products: {
          products: [mockProduct],
          currentProduct: mockProduct,
          isLoading: false,
          error: null,
        },
      })

      const updatedProduct = { ...mockProduct, name: 'Updated Product' }
      store.dispatch(
        updateProduct.fulfilled(updatedProduct, 'fulfilled', {
          id: 'test-id-1',
          data: { name: 'Updated Product' },
        })
      )

      const state = store.getState().products
      expect(state.currentProduct?.name).toBe('Updated Product')
    })
  })

  describe('async thunks - deleteProduct', () => {
    it('should set loading when pending', () => {
      const store = createTestStore({
        products: {
          products: [mockProduct],
          currentProduct: null,
          isLoading: false,
          error: 'old error',
        },
      })

      store.dispatch(deleteProduct.pending('pending', 'test-id-1'))

      const state = store.getState().products
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should remove product when fulfilled', () => {
      const store = createTestStore({
        products: {
          products: [mockProduct],
          currentProduct: null,
          isLoading: false,
          error: null,
        },
      })

      store.dispatch(
        deleteProduct.fulfilled('test-id-1', 'fulfilled', 'test-id-1')
      )

      const state = store.getState().products
      expect(state.products).toHaveLength(0)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        deleteProduct.rejected(
          null,
          'rejected',
          'test-id-1',
          'Error al eliminar el producto'
        )
      )

      const state = store.getState().products
      expect(state.error).toBe('Error al eliminar el producto')
      expect(state.isLoading).toBe(false)
    })
  })
})
