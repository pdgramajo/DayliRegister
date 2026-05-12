import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { BranchService } from '../services'
import type { Branch } from '../types/entities'
import type { CreateBranchDTO, UpdateBranchDTO } from '../types/dtos'

interface BranchState {
  branches: Branch[]
  currentBranch: Branch | null
  isLoading: boolean
  error: string | null
}

const initialState: BranchState = {
  branches: [],
  currentBranch: null,
  isLoading: false,
  error: null,
}

export const fetchBranches = createAsyncThunk(
  'branches/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const branches = await BranchService.getAllBranches()
      return branches
    } catch (error) {
      console.error('Error fetching branches:', error)
      return rejectWithValue('Error al cargar las sucursales')
    }
  }
)

export const fetchBranchById = createAsyncThunk(
  'branches/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await BranchService.getBranchById(id)
    } catch (error) {
      return rejectWithValue('Error al cargar la sucursal')
    }
  }
)

export const createBranch = createAsyncThunk(
  'branches/create',
  async (data: CreateBranchDTO, { rejectWithValue }) => {
    try {
      return await BranchService.createBranch(data)
    } catch (error) {
      return rejectWithValue('Error al crear la sucursal')
    }
  }
)

export const updateBranch = createAsyncThunk(
  'branches/update',
  async (
    { id, data }: { id: string; data: UpdateBranchDTO },
    { rejectWithValue }
  ) => {
    try {
      return await BranchService.updateBranch(id, data)
    } catch (error) {
      return rejectWithValue('Error al actualizar la sucursal')
    }
  }
)

export const deleteBranch = createAsyncThunk(
  'branches/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await BranchService.deleteBranch(id)
      return id
    } catch (error) {
      return rejectWithValue('Error al eliminar la sucursal')
    }
  }
)

const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    clearCurrentBranch: (state) => {
      state.currentBranch = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchBranches.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchBranches.fulfilled,
        (state, action: PayloadAction<Branch[]>) => {
          state.isLoading = false
          state.branches = action.payload
        }
      )
      .addCase(fetchBranches.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch by ID
      .addCase(fetchBranchById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchBranchById.fulfilled,
        (state, action: PayloadAction<Branch>) => {
          state.isLoading = false
          state.currentBranch = action.payload
        }
      )
      .addCase(fetchBranchById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create
      .addCase(createBranch.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        createBranch.fulfilled,
        (state, action: PayloadAction<Branch>) => {
          state.isLoading = false
          state.branches.push(action.payload)
        }
      )
      .addCase(createBranch.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update
      .addCase(updateBranch.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        updateBranch.fulfilled,
        (state, action: PayloadAction<Branch>) => {
          state.isLoading = false
          const index = state.branches.findIndex(
            (b) => b.id === action.payload.id
          )
          if (index !== -1) {
            state.branches[index] = action.payload
          }
          if (state.currentBranch?.id === action.payload.id) {
            state.currentBranch = action.payload
          }
        }
      )
      .addCase(updateBranch.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete
      .addCase(deleteBranch.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        deleteBranch.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false
          state.branches = state.branches.filter((b) => b.id !== action.payload)
        }
      )
      .addCase(deleteBranch.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCurrentBranch, clearError } = branchSlice.actions
export default branchSlice.reducer
