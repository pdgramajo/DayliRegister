import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import branchReducer, {
  fetchBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  clearCurrentBranch,
  clearError,
} from '../branchSlice'
import type { Branch } from '../../types/entities'

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      branches: branchReducer,
    },
    preloadedState,
  })
}

const mockBranch: Branch = {
  id: 'test-id-1',
  name: 'Test Branch',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('branchSlice', () => {
  describe('reducers', () => {
    it('should return initial state', () => {
      const store = createTestStore()
      const state = store.getState().branches

      expect(state.branches).toEqual([])
      expect(state.currentBranch).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle clearCurrentBranch', () => {
      const store = createTestStore({
        branches: {
          branches: [],
          currentBranch: mockBranch,
          isLoading: false,
          error: null,
        },
      })

      store.dispatch(clearCurrentBranch())
      const state = store.getState().branches

      expect(state.currentBranch).toBeNull()
    })

    it('should handle clearError', () => {
      const store = createTestStore({
        branches: {
          branches: [],
          currentBranch: null,
          isLoading: false,
          error: 'Some error',
        },
      })

      store.dispatch(clearError())
      const state = store.getState().branches

      expect(state.error).toBeNull()
    })
  })

  describe('async thunks - fetchBranches', () => {
    it('should set loading to true when pending', () => {
      const store = createTestStore()

      store.dispatch(fetchBranches.pending('test-request'))

      const state = store.getState().branches
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })
  })

  describe('async thunks - createBranch', () => {
    it('should set loading when pending', () => {
      const store = createTestStore({
        branches: {
          branches: [],
          currentBranch: null,
          isLoading: false,
          error: 'old error',
        },
      })

      store.dispatch(
        createBranch.pending('pending', { name: 'Test', isActive: true })
      )

      const state = store.getState().branches
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should add branch when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        createBranch.fulfilled(mockBranch, 'fulfilled', {
          name: 'Test Branch',
          isActive: true,
        })
      )

      const state = store.getState().branches
      expect(state.branches).toHaveLength(1)
      expect(state.branches[0].name).toBe('Test Branch')
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        createBranch.rejected(
          null,
          'rejected',
          { name: 'Test', isActive: true },
          'Error al crear'
        )
      )

      const state = store.getState().branches
      expect(state.error).toBe('Error al crear')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('async thunks - updateBranch', () => {
    it('should update branch when fulfilled', () => {
      const store = createTestStore({
        branches: {
          branches: [mockBranch],
          currentBranch: null,
          isLoading: false,
          error: null,
        },
      })

      const updatedBranch = { ...mockBranch, name: 'Updated Branch' }
      store.dispatch(
        updateBranch.fulfilled(updatedBranch, 'fulfilled', {
          id: 'test-id-1',
          data: { name: 'Updated Branch' },
        })
      )

      const state = store.getState().branches
      expect(state.branches[0].name).toBe('Updated Branch')
    })
  })

  describe('async thunks - deleteBranch', () => {
    it('should remove branch when fulfilled', () => {
      const store = createTestStore({
        branches: {
          branches: [mockBranch],
          currentBranch: null,
          isLoading: false,
          error: null,
        },
      })

      store.dispatch(
        deleteBranch.fulfilled('test-id-1', 'fulfilled', 'test-id-1')
      )

      const state = store.getState().branches
      expect(state.branches).toHaveLength(0)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        deleteBranch.rejected(
          null,
          'rejected',
          'test-id-1',
          'Error al eliminar la sucursal'
        )
      )

      const state = store.getState().branches
      expect(state.error).toBe('Error al eliminar la sucursal')
      expect(state.isLoading).toBe(false)
    })
  })
})
