import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import clientReducer, {
  fetchClientsByBranch,
  fetchClientById,
  createClient,
  updateClient,
  deleteClient,
  addDebtEntry,
  deleteDebtEntry,
  clearCurrentClient,
  clearError,
} from '../clientSlice'
import type { Client } from '../../types/entities'
import type { ClientWithBalance } from '../../services/ClientService'

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      clients: clientReducer,
    },
    preloadedState,
  })
}

const mockClient: Client = {
  id: 'client-1',
  branchId: 'branch-1',
  name: 'Test Client',
  phone: '+543884123456',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockClientWithBalance: ClientWithBalance = {
  ...mockClient,
  balance: 1500,
  entries: [
    {
      id: 'entry-1',
      clientId: 'client-1',
      branchId: 'branch-1',
      type: 'debt',
      amount: 1500,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
}

describe('clientSlice', () => {
  describe('reducers', () => {
    it('should return initial state', () => {
      const store = createTestStore()
      const state = store.getState().clients

      expect(state.clients).toEqual([])
      expect(state.currentClient).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle clearCurrentClient', () => {
      const store = createTestStore({
        clients: {
          clients: [],
          currentClient: mockClientWithBalance,
          isLoading: false,
          error: null,
        },
      })

      store.dispatch(clearCurrentClient())
      const state = store.getState().clients

      expect(state.currentClient).toBeNull()
    })

    it('should handle clearError', () => {
      const store = createTestStore({
        clients: {
          clients: [],
          currentClient: null,
          isLoading: false,
          error: 'Some error',
        },
      })

      store.dispatch(clearError())
      const state = store.getState().clients

      expect(state.error).toBeNull()
    })
  })

  describe('async thunks - fetchClientsByBranch', () => {
    it('should set loading to true when pending', () => {
      const store = createTestStore()

      store.dispatch(fetchClientsByBranch.pending('branch-1', undefined))

      const state = store.getState().clients
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should set clients when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        fetchClientsByBranch.fulfilled(
          [mockClientWithBalance],
          'fulfilled',
          'branch-1'
        )
      )

      const state = store.getState().clients
      expect(state.clients).toHaveLength(1)
      expect(state.clients[0].name).toBe('Test Client')
      expect(state.clients[0].balance).toBe(1500)
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        fetchClientsByBranch.rejected(
          null,
          'rejected',
          'branch-1',
          'Error al cargar los clientes'
        )
      )

      const state = store.getState().clients
      expect(state.error).toBe('Error al cargar los clientes')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('async thunks - fetchClientById', () => {
    it('should set loading when pending', () => {
      const store = createTestStore()

      store.dispatch(fetchClientById.pending('client-1', undefined))

      expect(store.getState().clients.isLoading).toBe(true)
    })

    it('should set currentClient when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        fetchClientById.fulfilled(
          mockClientWithBalance,
          'fulfilled',
          'client-1'
        )
      )

      const state = store.getState().clients
      expect(state.currentClient?.name).toBe('Test Client')
      expect(state.currentClient?.balance).toBe(1500)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        fetchClientById.rejected(
          null,
          'rejected',
          'client-1',
          'Error al cargar el cliente'
        )
      )

      expect(store.getState().clients.error).toBe('Error al cargar el cliente')
    })
  })

  describe('async thunks - createClient', () => {
    it('should add client to list when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        createClient.fulfilled(mockClient, 'fulfilled', {
          branchId: 'branch-1',
          name: 'Test Client',
          phone: '+543884123456',
        })
      )

      const state = store.getState().clients
      expect(state.clients).toHaveLength(1)
      expect(state.clients[0].name).toBe('Test Client')
      expect(state.clients[0].balance).toBe(0)
      expect(state.clients[0].entries).toEqual([])
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        createClient.rejected(
          null,
          'rejected',
          undefined,
          'Error al crear el cliente'
        )
      )

      expect(store.getState().clients.error).toBe('Error al crear el cliente')
    })
  })

  describe('async thunks - updateClient', () => {
    it('should update client in list when fulfilled', () => {
      const store = createTestStore({
        clients: {
          clients: [mockClientWithBalance],
          currentClient: null,
          isLoading: false,
          error: null,
        },
      })

      const updated = { ...mockClient, name: 'Updated Client' }
      store.dispatch(
        updateClient.fulfilled(updated, 'fulfilled', {
          id: 'client-1',
          data: { name: 'Updated Client' },
        })
      )

      const state = store.getState().clients
      expect(state.clients[0].name).toBe('Updated Client')
    })

    it('should update currentClient if matches', () => {
      const store = createTestStore({
        clients: {
          clients: [mockClientWithBalance],
          currentClient: mockClientWithBalance,
          isLoading: false,
          error: null,
        },
      })

      const updated = { ...mockClient, name: 'Updated Client' }
      store.dispatch(
        updateClient.fulfilled(updated, 'fulfilled', {
          id: 'client-1',
          data: { name: 'Updated Client' },
        })
      )

      expect(store.getState().clients.currentClient?.name).toBe(
        'Updated Client'
      )
    })
  })

  describe('async thunks - deleteClient', () => {
    it('should remove client when fulfilled', () => {
      const store = createTestStore({
        clients: {
          clients: [mockClientWithBalance],
          currentClient: null,
          isLoading: false,
          error: null,
        },
      })

      store.dispatch(
        deleteClient.fulfilled('client-1', 'fulfilled', 'client-1')
      )

      const state = store.getState().clients
      expect(state.clients).toHaveLength(0)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        deleteClient.rejected(
          null,
          'rejected',
          'client-1',
          'Error al eliminar el cliente'
        )
      )

      expect(store.getState().clients.error).toBe(
        'Error al eliminar el cliente'
      )
    })
  })

  describe('async thunks - addDebtEntry', () => {
    it('should return clientId when fulfilled', () => {
      const store = createTestStore()

      const result = store.dispatch(
        addDebtEntry.fulfilled('client-1', 'fulfilled', {
          clientId: 'client-1',
          branchId: 'branch-1',
          type: 'debt',
          amount: 1000,
        })
      )

      expect(result.payload).toBe('client-1')
    })
  })

  describe('async thunks - deleteDebtEntry', () => {
    it('should return entryId and clientId when fulfilled', () => {
      const store = createTestStore()

      const result = store.dispatch(
        deleteDebtEntry.fulfilled(
          { entryId: 'entry-1', clientId: 'client-1' },
          'fulfilled',
          { entryId: 'entry-1', clientId: 'client-1' }
        )
      )

      expect(result.payload).toEqual({
        entryId: 'entry-1',
        clientId: 'client-1',
      })
    })
  })
})
