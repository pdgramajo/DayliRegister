import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import transactionReducer, {
  fetchTransactionsBySession,
  fetchInventoryMovementsBySession,
  fetchInventoryCategories,
  createTransaction,
  deleteTransaction,
  createInventoryMovement,
  deleteInventoryMovement,
  clearTransactions,
} from '../transactionSlice'
import type {
  Transaction,
  InventoryMovement,
  InventoryCategory,
} from '../../types/entities'

const mockTransaction: Transaction = {
  id: 'tx-1',
  sessionId: 'session-1',
  branchId: 'branch-1',
  type: 'sale',
  amount: 1500,
  paymentMethod: 'cash',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockMovement: InventoryMovement = {
  id: 'mov-1',
  sessionId: 'session-1',
  branchId: 'branch-1',
  inventoryCategoryId: 'cat-1',
  type: 'in',
  quantity: 10,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockCategory: InventoryCategory = {
  id: 'cat-1',
  name: 'Categoria 1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      transactions: transactionReducer,
    },
    preloadedState,
  })
}

describe('transactionSlice', () => {
  describe('reducers', () => {
    it('should return initial state', () => {
      const store = createTestStore()
      const state = store.getState().transactions

      expect(state.transactions).toEqual([])
      expect(state.inventoryMovements).toEqual([])
      expect(state.inventoryCategories).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle clearTransactions', () => {
      const store = createTestStore({
        transactions: {
          transactions: [mockTransaction],
          inventoryMovements: [mockMovement],
          inventoryCategories: [],
          isLoading: false,
          error: null,
        },
      })

      store.dispatch(clearTransactions())
      const state = store.getState().transactions

      expect(state.transactions).toEqual([])
      expect(state.inventoryMovements).toEqual([])
    })
  })

  describe('fetchTransactionsBySession', () => {
    it('should set loading when pending', () => {
      const store = createTestStore()

      store.dispatch(fetchTransactionsBySession.pending('', 'session-1'))

      expect(store.getState().transactions.isLoading).toBe(true)
      expect(store.getState().transactions.error).toBeNull()
    })

    it('should set transactions when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        fetchTransactionsBySession.fulfilled([mockTransaction], '', 'session-1')
      )

      const state = store.getState().transactions
      expect(state.transactions).toHaveLength(1)
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        fetchTransactionsBySession.rejected(
          null,
          '',
          'session-1',
          'Error al cargar'
        )
      )

      const state = store.getState().transactions
      expect(state.error).toBe('Error al cargar')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('fetchInventoryMovementsBySession', () => {
    it('should set loading when pending', () => {
      const store = createTestStore()

      store.dispatch(fetchInventoryMovementsBySession.pending('', 'session-1'))

      expect(store.getState().transactions.isLoading).toBe(true)
    })

    it('should set movements when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        fetchInventoryMovementsBySession.fulfilled(
          [mockMovement],
          '',
          'session-1'
        )
      )

      const state = store.getState().transactions
      expect(state.inventoryMovements).toHaveLength(1)
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        fetchInventoryMovementsBySession.rejected(
          null,
          '',
          'session-1',
          'Error al cargar movimientos'
        )
      )

      expect(store.getState().transactions.error).toBe(
        'Error al cargar movimientos'
      )
    })
  })

  describe('fetchInventoryCategories', () => {
    it('should set loading when pending', () => {
      const store = createTestStore()

      store.dispatch(fetchInventoryCategories.pending('', undefined))

      expect(store.getState().transactions.isLoading).toBe(true)
    })

    it('should set categories when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        fetchInventoryCategories.fulfilled([mockCategory], '', undefined)
      )

      const state = store.getState().transactions
      expect(state.inventoryCategories).toHaveLength(1)
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        fetchInventoryCategories.rejected(
          null,
          '',
          undefined,
          'Error al cargar categorías'
        )
      )

      expect(store.getState().transactions.error).toBe(
        'Error al cargar categorías'
      )
    })
  })

  describe('createTransaction', () => {
    it('should set loading when pending', () => {
      const store = createTestStore()

      store.dispatch(
        createTransaction.pending('', {
          sessionId: 'session-1',
          branchId: 'branch-1',
          type: 'sale',
          amount: 500,
        })
      )

      expect(store.getState().transactions.isLoading).toBe(true)
    })

    it('should prepend transaction when fulfilled', () => {
      const store = createTestStore({
        transactions: {
          transactions: [mockTransaction],
          inventoryMovements: [],
          inventoryCategories: [],
          isLoading: false,
          error: null,
        },
      })

      const newTx: Transaction = {
        ...mockTransaction,
        id: 'tx-2',
        amount: 500,
      }

      store.dispatch(
        createTransaction.fulfilled(newTx, '', {
          sessionId: 'session-1',
          branchId: 'branch-1',
          type: 'sale',
          amount: 500,
        })
      )

      const state = store.getState().transactions
      expect(state.transactions).toHaveLength(2)
      expect(state.transactions[0].id).toBe('tx-2')
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        createTransaction.rejected(
          null,
          '',
          {
            sessionId: 'session-1',
            branchId: 'branch-1',
            type: 'sale',
            amount: 500,
          },
          'Error al crear'
        )
      )

      expect(store.getState().transactions.error).toBe('Error al crear')
    })
  })

  describe('deleteTransaction', () => {
    it('should remove transaction when fulfilled', () => {
      const store = createTestStore({
        transactions: {
          transactions: [mockTransaction],
          inventoryMovements: [],
          inventoryCategories: [],
          isLoading: false,
          error: null,
        },
      })

      store.dispatch(deleteTransaction.fulfilled('tx-1', '', 'tx-1'))

      const state = store.getState().transactions
      expect(state.transactions).toHaveLength(0)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        deleteTransaction.rejected(null, '', 'tx-1', 'Error al eliminar')
      )

      expect(store.getState().transactions.error).toBe('Error al eliminar')
    })
  })

  describe('createInventoryMovement', () => {
    it('should prepend movement when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        createInventoryMovement.fulfilled(mockMovement, '', {
          sessionId: 'session-1',
          branchId: 'branch-1',
          inventoryCategoryId: 'cat-1',
          type: 'in',
          quantity: 10,
        })
      )

      const state = store.getState().transactions
      expect(state.inventoryMovements).toHaveLength(1)
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        createInventoryMovement.rejected(
          null,
          '',
          {
            sessionId: 'session-1',
            branchId: 'branch-1',
            inventoryCategoryId: 'cat-1',
            type: 'in',
            quantity: 10,
          },
          'Error al crear movimiento'
        )
      )

      expect(store.getState().transactions.error).toBe(
        'Error al crear movimiento'
      )
    })
  })

  describe('deleteInventoryMovement', () => {
    it('should remove movement when fulfilled', () => {
      const store = createTestStore({
        transactions: {
          transactions: [],
          inventoryMovements: [mockMovement],
          inventoryCategories: [],
          isLoading: false,
          error: null,
        },
      })

      store.dispatch(deleteInventoryMovement.fulfilled('mov-1', '', 'mov-1'))

      const state = store.getState().transactions
      expect(state.inventoryMovements).toHaveLength(0)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        deleteInventoryMovement.rejected(
          null,
          '',
          'mov-1',
          'Error al eliminar movimiento'
        )
      )

      expect(store.getState().transactions.error).toBe(
        'Error al eliminar movimiento'
      )
    })
  })
})
