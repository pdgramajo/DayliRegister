import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { TransactionService } from '../services/TransactionService'
import { InventoryMovementService } from '../services/InventoryMovementService'
import { InventoryCategoryService } from '../services/InventoryCategoryService'
import type { Transaction, InventoryCategory } from '../types/entities'
import type {
  CreateTransactionDTO,
  CreateInventoryMovementDTO,
} from '../types/dtos'

interface TransactionState {
  transactions: Transaction[]
  inventoryMovements: any[]
  inventoryCategories: InventoryCategory[]
  isLoading: boolean
  error: string | null
}

const initialState: TransactionState = {
  transactions: [],
  inventoryMovements: [],
  inventoryCategories: [],
  isLoading: false,
  error: null,
}

export const fetchTransactionsBySession = createAsyncThunk(
  'transactions/fetchBySession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      return await TransactionService.getTransactionsBySession(sessionId)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al cargar transacciones'
      return rejectWithValue(message)
    }
  }
)

export const fetchInventoryMovementsBySession = createAsyncThunk(
  'transactions/fetchInventoryMovements',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      return await InventoryMovementService.getMovementsBySession(sessionId)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al cargar movimientos de inventario'
      return rejectWithValue(message)
    }
  }
)

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (data: CreateTransactionDTO, { rejectWithValue }) => {
    try {
      return await TransactionService.createTransaction(data)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al crear transacción'
      return rejectWithValue(message)
    }
  }
)

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await TransactionService.deleteTransaction(id)
      return id
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al eliminar transacción'
      return rejectWithValue(message)
    }
  }
)

export const createInventoryMovement = createAsyncThunk(
  'transactions/createInventoryMovement',
  async (data: CreateInventoryMovementDTO, { rejectWithValue }) => {
    try {
      return await InventoryMovementService.createMovement(data)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al crear movimiento de inventario'
      return rejectWithValue(message)
    }
  }
)

export const deleteInventoryMovement = createAsyncThunk(
  'transactions/deleteInventoryMovement',
  async (id: string, { rejectWithValue }) => {
    try {
      await InventoryMovementService.deleteMovement(id)
      return id
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al eliminar movimiento de inventario'
      return rejectWithValue(message)
    }
  }
)

export const fetchInventoryCategories = createAsyncThunk(
  'transactions/fetchInventoryCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await InventoryCategoryService.getAllCategories()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al cargar categorías de inventario'
      return rejectWithValue(message)
    }
  }
)

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactions: (state) => {
      state.transactions = []
      state.inventoryMovements = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactionsBySession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchTransactionsBySession.fulfilled,
        (state, action: PayloadAction<Transaction[]>) => {
          state.isLoading = false
          state.transactions = action.payload
        }
      )
      .addCase(fetchTransactionsBySession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch inventory movements
      .addCase(fetchInventoryMovementsBySession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchInventoryMovementsBySession.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.isLoading = false
          state.inventoryMovements = action.payload
        }
      )
      .addCase(fetchInventoryMovementsBySession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        createTransaction.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          state.isLoading = false
          state.transactions.unshift(action.payload)
        }
      )
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        deleteTransaction.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false
          state.transactions = state.transactions.filter(
            (t) => t.id !== action.payload
          )
        }
      )
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create inventory movement
      .addCase(createInventoryMovement.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        createInventoryMovement.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false
          state.inventoryMovements.unshift(action.payload)
        }
      )
      .addCase(createInventoryMovement.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete inventory movement
      .addCase(deleteInventoryMovement.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        deleteInventoryMovement.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false
          state.inventoryMovements = state.inventoryMovements.filter(
            (m) => m.id !== action.payload
          )
        }
      )
      .addCase(deleteInventoryMovement.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch inventory categories
      .addCase(fetchInventoryCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchInventoryCategories.fulfilled,
        (state, action: PayloadAction<InventoryCategory[]>) => {
          state.isLoading = false
          state.inventoryCategories = action.payload
        }
      )
      .addCase(fetchInventoryCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearTransactions } = transactionSlice.actions
export default transactionSlice.reducer
