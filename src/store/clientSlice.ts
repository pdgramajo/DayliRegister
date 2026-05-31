import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createLoggedAsyncThunk } from '../lib/createLoggedAsyncThunk'
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

export const fetchClientsByBranch = createLoggedAsyncThunk(
  'clients/fetchByBranch',
  async (branchId: string) => {
    return await ClientService.getClientsByBranch(branchId)
  },
  'Error al cargar los clientes'
)

export const fetchClientById = createLoggedAsyncThunk(
  'clients/fetchById',
  async (id: string) => {
    return await ClientService.getClientById(id)
  },
  'Error al cargar el cliente'
)

export const createClient = createLoggedAsyncThunk(
  'clients/create',
  async (data: CreateClientDTO) => {
    return await ClientService.createClient(data)
  },
  'Error al crear el cliente'
)

export const updateClient = createLoggedAsyncThunk(
  'clients/update',
  async ({ id, data }: { id: string; data: UpdateClientDTO }) => {
    return await ClientService.updateClient(id, data)
  },
  'Error al actualizar el cliente'
)

export const deleteClient = createLoggedAsyncThunk(
  'clients/delete',
  async (id: string) => {
    await ClientService.deleteClient(id)
    return id
  },
  'Error al eliminar el cliente'
)

export const addDebtEntry = createLoggedAsyncThunk(
  'clients/addDebtEntry',
  async (data: CreateDebtEntryDTO) => {
    await ClientService.addDebtEntry(data)
    return data.clientId
  },
  'Error al registrar'
)

export const deleteDebtEntry = createLoggedAsyncThunk(
  'clients/deleteDebtEntry',
  async ({ entryId, clientId }: { entryId: string; clientId: string }) => {
    await ClientService.deleteDebtEntry(entryId)
    return { entryId, clientId }
  },
  'Error al eliminar'
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
