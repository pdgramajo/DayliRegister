import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { ClientService } from '../services/ClientService'
import type { Client } from '../types/entities'
import type {
  CreateClientDTO,
  UpdateClientDTO,
  CreateDebtEntryDTO,
} from '../types/dtos'
import type { ClientWithBalance } from '../services/ClientService'

interface ClientState {
  clients: ClientWithBalance[]
  currentClient: ClientWithBalance | null
  isLoading: boolean
  error: string | null
}

const initialState: ClientState = {
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,
}

export const fetchClientsByBranch = createAsyncThunk(
  'clients/fetchByBranch',
  async (branchId: string, { rejectWithValue }) => {
    try {
      return await ClientService.getClientsByBranch(branchId)
    } catch (error) {
      return rejectWithValue('Error al cargar los clientes')
    }
  }
)

export const fetchClientById = createAsyncThunk(
  'clients/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await ClientService.getClientById(id)
    } catch (error) {
      return rejectWithValue('Error al cargar el cliente')
    }
  }
)

export const createClient = createAsyncThunk(
  'clients/create',
  async (data: CreateClientDTO, { rejectWithValue }) => {
    try {
      return await ClientService.createClient(data)
    } catch (error) {
      return rejectWithValue('Error al crear el cliente')
    }
  }
)

export const updateClient = createAsyncThunk(
  'clients/update',
  async (
    { id, data }: { id: string; data: UpdateClientDTO },
    { rejectWithValue }
  ) => {
    try {
      return await ClientService.updateClient(id, data)
    } catch (error) {
      return rejectWithValue('Error al actualizar el cliente')
    }
  }
)

export const deleteClient = createAsyncThunk(
  'clients/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await ClientService.deleteClient(id)
      return id
    } catch (error) {
      return rejectWithValue('Error al eliminar el cliente')
    }
  }
)

export const addDebtEntry = createAsyncThunk(
  'clients/addDebtEntry',
  async (data: CreateDebtEntryDTO, { rejectWithValue }) => {
    try {
      await ClientService.addDebtEntry(data)
      return data.clientId
    } catch (error) {
      return rejectWithValue('Error al registrar')
    }
  }
)

export const deleteDebtEntry = createAsyncThunk(
  'clients/deleteDebtEntry',
  async (
    { entryId, clientId }: { entryId: string; clientId: string },
    { rejectWithValue }
  ) => {
    try {
      await ClientService.deleteDebtEntry(entryId)
      return { entryId, clientId }
    } catch (error) {
      return rejectWithValue('Error al eliminar')
    }
  }
)

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearCurrentClient: (state) => {
      state.currentClient = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientsByBranch.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchClientsByBranch.fulfilled,
        (state, action: PayloadAction<ClientWithBalance[]>) => {
          state.isLoading = false
          state.clients = action.payload
        }
      )
      .addCase(fetchClientsByBranch.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchClientById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchClientById.fulfilled,
        (state, action: PayloadAction<ClientWithBalance>) => {
          state.isLoading = false
          state.currentClient = action.payload
        }
      )
      .addCase(fetchClientById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createClient.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        createClient.fulfilled,
        (state, action: PayloadAction<Client>) => {
          state.isLoading = false
          const withBalance: ClientWithBalance = {
            ...action.payload,
            balance: 0,
            entries: [],
          }
          state.clients.push(withBalance)
        }
      )
      .addCase(createClient.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(updateClient.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        updateClient.fulfilled,
        (state, action: PayloadAction<Client>) => {
          state.isLoading = false
          const index = state.clients.findIndex(
            (c) => c.id === action.payload.id
          )
          if (index !== -1) {
            state.clients[index] = {
              ...state.clients[index],
              ...action.payload,
            }
          }
          if (state.currentClient?.id === action.payload.id) {
            state.currentClient = {
              ...state.currentClient,
              ...action.payload,
            }
          }
        }
      )
      .addCase(updateClient.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(deleteClient.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        deleteClient.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false
          state.clients = state.clients.filter((c) => c.id !== action.payload)
        }
      )
      .addCase(deleteClient.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(addDebtEntry.fulfilled, (state, action) => {
        const clientId = action.payload
        state.isLoading = false
        const idx = state.clients.findIndex((c) => c.id === clientId)
        if (idx !== -1) {
          if (state.currentClient?.id === clientId) {
            const client = state.clients[idx]
            state.currentClient = null
            state.clients[idx] = { ...client }
          }
        }
      })
      .addCase(deleteDebtEntry.fulfilled, (state, action) => {
        state.isLoading = false
        const { clientId } = action.payload
        const idx = state.clients.findIndex((c) => c.id === clientId)
        if (idx !== -1) {
          if (state.currentClient?.id === clientId) {
            state.currentClient = null
          }
        }
      })
  },
})

export const { clearCurrentClient, clearError } = clientSlice.actions
export default clientSlice.reducer
