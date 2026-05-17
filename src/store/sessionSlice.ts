import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { SessionService } from '../services'
import type { CashSession } from '../types/entities'
import type { CreateSessionDTO, UpdateSessionDTO } from '../types/dtos'

interface SessionState {
  sessions: CashSession[]
  currentSession: CashSession | null
  isLoading: boolean
  error: string | null
}

const initialState: SessionState = {
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
}

export const fetchSessionsByBranch = createAsyncThunk(
  'sessions/fetchByBranch',
  async (branchId: string, { rejectWithValue }) => {
    try {
      return await SessionService.getSessionsByBranch(branchId)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      return rejectWithValue('Error al cargar las sesiones')
    }
  }
)

export const fetchSessionById = createAsyncThunk(
  'sessions/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await SessionService.getSessionById(id)
    } catch (error) {
      return rejectWithValue('Error al cargar la sesión')
    }
  }
)

export const createSession = createAsyncThunk(
  'sessions/create',
  async (data: CreateSessionDTO, { rejectWithValue }) => {
    try {
      return await SessionService.createSession(data)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al crear la sesión'
      return rejectWithValue(message)
    }
  }
)

export const updateSession = createAsyncThunk(
  'sessions/update',
  async (
    { id, data }: { id: string; data: UpdateSessionDTO },
    { rejectWithValue }
  ) => {
    try {
      return await SessionService.updateSession(id, data)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al actualizar la sesión'
      return rejectWithValue(message)
    }
  }
)

export const closeSession = createAsyncThunk(
  'sessions/close',
  async (
    { id, closingBalance }: { id: string; closingBalance?: number },
    { rejectWithValue }
  ) => {
    try {
      return await SessionService.closeSession(id, closingBalance)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al cerrar la sesión'
      return rejectWithValue(message)
    }
  }
)

export const deleteSession = createAsyncThunk(
  'sessions/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await SessionService.deleteSession(id)
      return id
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al eliminar la sesión'
      return rejectWithValue(message)
    }
  }
)

const sessionSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    clearCurrentSession: (state) => {
      state.currentSession = null
    },
    clearSessions: (state) => {
      state.sessions = []
      state.currentSession = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch by branch
      .addCase(fetchSessionsByBranch.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchSessionsByBranch.fulfilled,
        (state, action: PayloadAction<CashSession[]>) => {
          state.isLoading = false
          state.sessions = action.payload
        }
      )
      .addCase(fetchSessionsByBranch.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch by ID
      .addCase(fetchSessionById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchSessionById.fulfilled,
        (state, action: PayloadAction<CashSession>) => {
          state.isLoading = false
          state.currentSession = action.payload
        }
      )
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create
      .addCase(createSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        createSession.fulfilled,
        (state, action: PayloadAction<CashSession>) => {
          state.isLoading = false
          state.sessions.unshift(action.payload)
          state.currentSession = action.payload
        }
      )
      .addCase(createSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update
      .addCase(updateSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        updateSession.fulfilled,
        (state, action: PayloadAction<CashSession>) => {
          state.isLoading = false
          const index = state.sessions.findIndex(
            (s) => s.id === action.payload.id
          )
          if (index !== -1) {
            state.sessions[index] = action.payload
          }
          if (state.currentSession?.id === action.payload.id) {
            state.currentSession = action.payload
          }
        }
      )
      .addCase(updateSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Close
      .addCase(closeSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        closeSession.fulfilled,
        (state, action: PayloadAction<CashSession>) => {
          state.isLoading = false
          const index = state.sessions.findIndex(
            (s) => s.id === action.payload.id
          )
          if (index !== -1) {
            state.sessions[index] = action.payload
          }
          if (state.currentSession?.id === action.payload.id) {
            state.currentSession = action.payload
          }
        }
      )
      .addCase(closeSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete
      .addCase(deleteSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        deleteSession.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false
          state.sessions = state.sessions.filter((s) => s.id !== action.payload)
        }
      )
      .addCase(deleteSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCurrentSession, clearSessions, clearError } =
  sessionSlice.actions
export default sessionSlice.reducer
