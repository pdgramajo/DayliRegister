import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createLoggedAsyncThunk } from '../lib/createLoggedAsyncThunk'
import { TransactionService } from '../services/TransactionService'
import { InventoryMovementService } from '../services/InventoryMovementService'
import { InventoryCategoryService } from '../services/InventoryCategoryService'
import { FILTERS } from '../constants/session'
import type {
  Transaction,
  InventoryCategory,
  InventoryMovement,
} from '../types/entities'
import type {
  CreateTransactionDTO,
  CreateInventoryMovementDTO,
} from '../types/dtos'

type TransactionFilter = (typeof FILTERS)[keyof typeof FILTERS]

interface TransactionState {
  transactions: Transaction[]
  inventoryMovements: InventoryMovement[]
  inventoryCategories: InventoryCategory[]
  isLoading: boolean
  error: string | null
  transactionFilter: TransactionFilter
  currentSessionId: string | null
}

const initialState: TransactionState = {
  transactions: [],
  inventoryMovements: [],
  inventoryCategories: [],
  isLoading: false,
  error: null,
  transactionFilter: FILTERS.ALL,
  currentSessionId: null,
}

export const fetchTransactionsBySession = createLoggedAsyncThunk(
  'transactions/fetchBySession',
  async (sessionId: string) => {
    return await TransactionService.getTransactionsBySession(sessionId)
  },
  'Error al cargar transacciones'
)

export const fetchInventoryMovementsBySession = createLoggedAsyncThunk(
  'transactions/fetchInventoryMovements',
  async (sessionId: string) => {
    return await InventoryMovementService.getMovementsBySession(sessionId)
  },
  'Error al cargar movimientos de inventario'
)

export const createTransaction = createLoggedAsyncThunk(
  'transactions/create',
  async (data: CreateTransactionDTO) => {
    return await TransactionService.createTransaction(data)
  },
  'Error al crear transacción'
)

export const deleteTransaction = createLoggedAsyncThunk(
  'transactions/delete',
  async (id: string) => {
    await TransactionService.deleteTransaction(id)
    return id
  },
  'Error al eliminar transacción'
)

export const createInventoryMovement = createLoggedAsyncThunk(
  'transactions/createInventoryMovement',
  async (data: CreateInventoryMovementDTO) => {
    return await InventoryMovementService.createMovement(data)
  },
  'Error al crear movimiento de inventario'
)

export const deleteInventoryMovement = createLoggedAsyncThunk(
  'transactions/deleteInventoryMovement',
  async (id: string) => {
    await InventoryMovementService.deleteMovement(id)
    return id
  },
  'Error al eliminar movimiento de inventario'
)

export const fetchInventoryCategories = createLoggedAsyncThunk(
  'transactions/fetchInventoryCategories',
  async () => {
    return await InventoryCategoryService.getAllCategories()
  },
  'Error al cargar categorías de inventario'
)

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactions: (state) => {
      state.transactions = []
      state.inventoryMovements = []
    },
    setTransactionFilter: (state, action: PayloadAction<TransactionFilter>) => {
      state.transactionFilter = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactionsBySession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTransactionsBySession.fulfilled, (state, action) => {
        state.isLoading = false
        const sessionId = action.meta.arg
        if (state.currentSessionId !== sessionId) {
          state.transactionFilter = FILTERS.ALL
        }
        state.currentSessionId = sessionId
        state.transactions = action.payload
      })
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
        (state, action: PayloadAction<InventoryMovement[]>) => {
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
        (state, action: PayloadAction<InventoryMovement>) => {
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

export const { clearTransactions, setTransactionFilter } =
  transactionSlice.actions
export default transactionSlice.reducer
