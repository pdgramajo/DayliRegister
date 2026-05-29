import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import sessionReducer, {
  fetchSessionsByBranch,
  fetchSessionById,
  createSession,
  updateSession,
  closeSession,
  deleteSession,
  clearCurrentSession,
  clearSessions,
  clearError,
} from '../sessionSlice'
import type { CashSession } from '../../types/entities'

const mockSession: CashSession = {
  id: 'session-1',
  branchId: 'branch-1',
  name: 'Sesión Test',
  initialAmount: 5000,
  status: 'open',
  openedAt: '2024-06-01T08:00:00Z',
  createdAt: '2024-06-01T08:00:00Z',
  updatedAt: '2024-06-01T08:00:00Z',
}

const mockSessionClosed: CashSession = {
  ...mockSession,
  id: 'session-2',
  name: 'Sesión Cerrada',
  closingBalance: 8500,
  status: 'closed',
  closedAt: '2024-06-01T20:00:00Z',
  updatedAt: '2024-06-01T20:00:00Z',
}

const createStore = (preloadedState = {}) =>
  configureStore({
    reducer: { sessions: sessionReducer },
    preloadedState: {
      sessions: {
        sessions: [],
        currentSession: null,
        isLoading: false,
        error: null,
        ...preloadedState,
      },
    },
  })

describe('sessionSlice', () => {
  describe('reducers', () => {
    it('should handle clearCurrentSession', () => {
      const store = createStore({ currentSession: mockSession })
      store.dispatch(clearCurrentSession())
      expect(store.getState().sessions.currentSession).toBeNull()
    })

    it('should handle clearSessions', () => {
      const store = createStore({
        sessions: [mockSession],
        currentSession: mockSession,
      })
      store.dispatch(clearSessions())
      expect(store.getState().sessions.sessions).toEqual([])
      expect(store.getState().sessions.currentSession).toBeNull()
    })

    it('should handle clearError', () => {
      const store = createStore({ error: 'some error' })
      store.dispatch(clearError())
      expect(store.getState().sessions.error).toBeNull()
    })
  })

  describe('fetchSessionsByBranch', () => {
    it('should set loading on pending', () => {
      const store = createStore()
      store.dispatch(fetchSessionsByBranch.pending('', ''))
      expect(store.getState().sessions.isLoading).toBe(true)
      expect(store.getState().sessions.error).toBeNull()
    })

    it('should set sessions on fulfilled', () => {
      const store = createStore()
      store.dispatch(fetchSessionsByBranch.fulfilled([mockSession], '', ''))
      expect(store.getState().sessions.isLoading).toBe(false)
      expect(store.getState().sessions.sessions).toEqual([mockSession])
    })

    it('should set error on rejected', () => {
      const store = createStore()
      store.dispatch(
        fetchSessionsByBranch.rejected(
          new Error('fail'),
          '',
          '',
          'Error al cargar las sesiones'
        )
      )
      expect(store.getState().sessions.isLoading).toBe(false)
      expect(store.getState().sessions.error).toBe(
        'Error al cargar las sesiones'
      )
    })
  })

  describe('fetchSessionById', () => {
    it('should set loading on pending', () => {
      const store = createStore()
      store.dispatch(fetchSessionById.pending('', ''))
      expect(store.getState().sessions.isLoading).toBe(true)
    })

    it('should set currentSession on fulfilled', () => {
      const store = createStore()
      store.dispatch(fetchSessionById.fulfilled(mockSession, '', ''))
      expect(store.getState().sessions.isLoading).toBe(false)
      expect(store.getState().sessions.currentSession).toEqual(mockSession)
    })

    it('should set error on rejected', () => {
      const store = createStore()
      store.dispatch(
        fetchSessionById.rejected(
          new Error('fail'),
          '',
          '',
          'Error al cargar la sesión'
        )
      )
      expect(store.getState().sessions.error).toBe('Error al cargar la sesión')
    })
  })

  describe('createSession', () => {
    it('should set loading on pending', () => {
      const store = createStore()
      store.dispatch(
        createSession.pending('', {
          name: 'New',
          branchId: 'b1',
          initialAmount: 0,
        })
      )
      expect(store.getState().sessions.isLoading).toBe(true)
    })

    it('should prepend session and set as current on fulfilled', () => {
      const store = createStore({ sessions: [mockSessionClosed] })
      store.dispatch(
        createSession.fulfilled(mockSession, '', {
          name: 'New',
          branchId: 'b1',
          initialAmount: 0,
        })
      )
      expect(store.getState().sessions.isLoading).toBe(false)
      expect(store.getState().sessions.sessions).toEqual([
        mockSession,
        mockSessionClosed,
      ])
      expect(store.getState().sessions.currentSession).toEqual(mockSession)
    })

    it('should set error on rejected', () => {
      const store = createStore()
      store.dispatch(
        createSession.rejected(
          new Error('fail'),
          '',
          { name: 'New', branchId: 'b1', initialAmount: 0 },
          'Error al crear la sesión'
        )
      )
      expect(store.getState().sessions.error).toBe('Error al crear la sesión')
    })
  })

  describe('updateSession', () => {
    it('should set loading on pending', () => {
      const store = createStore()
      store.dispatch(updateSession.pending('', { id: 'session-1', data: {} }))
      expect(store.getState().sessions.isLoading).toBe(true)
    })

    it('should update session in list on fulfilled', () => {
      const updated = { ...mockSession, name: 'Updated' }
      const store = createStore({
        sessions: [mockSession, mockSessionClosed],
        currentSession: mockSession,
      })
      store.dispatch(
        updateSession.fulfilled(updated, '', { id: 'session-1', data: {} })
      )
      expect(store.getState().sessions.sessions[0].name).toBe('Updated')
      expect(store.getState().sessions.currentSession?.name).toBe('Updated')
    })

    it('should not crash if session not in list on fulfilled', () => {
      const store = createStore({ sessions: [], currentSession: null })
      store.dispatch(
        updateSession.fulfilled(mockSession, '', { id: 'session-1', data: {} })
      )
      expect(store.getState().sessions.isLoading).toBe(false)
    })

    it('should set error on rejected', () => {
      const store = createStore()
      store.dispatch(
        updateSession.rejected(
          new Error('fail'),
          '',
          { id: 'session-1', data: {} },
          'Error al actualizar la sesión'
        )
      )
      expect(store.getState().sessions.error).toBe(
        'Error al actualizar la sesión'
      )
    })
  })

  describe('closeSession', () => {
    it('should set loading on pending', () => {
      const store = createStore()
      store.dispatch(closeSession.pending('', { id: 'session-1' }))
      expect(store.getState().sessions.isLoading).toBe(true)
    })

    it('should update session in list on fulfilled', () => {
      const closed = {
        ...mockSession,
        status: 'closed' as const,
        closingBalance: 8000,
      }
      const store = createStore({
        sessions: [mockSession],
        currentSession: mockSession,
      })
      store.dispatch(closeSession.fulfilled(closed, '', { id: 'session-1' }))
      expect(store.getState().sessions.sessions[0].status).toBe('closed')
      expect(store.getState().sessions.currentSession?.status).toBe('closed')
    })

    it('should not crash if session not in list on fulfilled', () => {
      const store = createStore({ sessions: [] })
      store.dispatch(
        closeSession.fulfilled(mockSession, '', { id: 'session-1' })
      )
      expect(store.getState().sessions.isLoading).toBe(false)
    })

    it('should set error on rejected', () => {
      const store = createStore()
      store.dispatch(
        closeSession.rejected(
          new Error('fail'),
          '',
          { id: 'session-1' },
          'Error al cerrar la sesión'
        )
      )
      expect(store.getState().sessions.error).toBe('Error al cerrar la sesión')
    })
  })

  describe('deleteSession', () => {
    it('should set loading on pending', () => {
      const store = createStore()
      store.dispatch(deleteSession.pending('', ''))
      expect(store.getState().sessions.isLoading).toBe(true)
    })

    it('should remove session from list on fulfilled', () => {
      const store = createStore({ sessions: [mockSession, mockSessionClosed] })
      store.dispatch(deleteSession.fulfilled('session-1', '', ''))
      expect(store.getState().sessions.sessions).toEqual([mockSessionClosed])
    })

    it('should set error on rejected', () => {
      const store = createStore()
      store.dispatch(
        deleteSession.rejected(
          new Error('fail'),
          '',
          '',
          'Error al eliminar la sesión'
        )
      )
      expect(store.getState().sessions.error).toBe(
        'Error al eliminar la sesión'
      )
    })
  })
})
