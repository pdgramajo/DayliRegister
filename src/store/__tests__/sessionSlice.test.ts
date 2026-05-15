import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import sessionReducer, {
  fetchSessionsByBranch,
  fetchSessionById,
  createSession,
  updateSession,
  closeSession,
  clearCurrentSession,
  clearSessions,
  clearError,
} from '../sessionSlice'
import type { CashSession } from '../../types/entities'
import { Entities } from '../../types/entities'

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      sessions: sessionReducer,
    },
    preloadedState,
  })
}

const mockSession: CashSession = {
  id: 'session-id-1',
  name: 'Test Session',
  branchId: 'branch-id-1',
  status: Entities.CashSessionStatus.OPEN,
  openedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('sessionSlice', () => {
  describe('reducers', () => {
    it('should return initial state', () => {
      const store = createTestStore()
      const state = store.getState().sessions

      expect(state.sessions).toEqual([])
      expect(state.currentSession).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle clearCurrentSession', () => {
      const store = createTestStore({
        sessions: {
          sessions: [],
          currentSession: mockSession,
          isLoading: false,
          error: null,
        },
      })

      store.dispatch(clearCurrentSession())
      const state = store.getState().sessions

      expect(state.currentSession).toBeNull()
    })

    it('should handle clearSessions', () => {
      const store = createTestStore({
        sessions: {
          sessions: [mockSession],
          currentSession: mockSession,
          isLoading: false,
          error: null,
        },
      })

      store.dispatch(clearSessions())
      const state = store.getState().sessions

      expect(state.sessions).toEqual([])
      expect(state.currentSession).toBeNull()
    })

    it('should handle clearError', () => {
      const store = createTestStore({
        sessions: {
          sessions: [],
          currentSession: null,
          isLoading: false,
          error: 'Some error',
        },
      })

      store.dispatch(clearError())
      const state = store.getState().sessions

      expect(state.error).toBeNull()
    })
  })

  describe('async thunks - fetchSessionsByBranch', () => {
    it('should set loading to true when pending', () => {
      const store = createTestStore()

      store.dispatch(fetchSessionsByBranch.pending(undefined, 'branch-id-1'))

      const state = store.getState().sessions
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should set sessions when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        fetchSessionsByBranch.fulfilled(
          [mockSession],
          'fulfilled',
          'branch-id-1'
        )
      )

      const state = store.getState().sessions
      expect(state.sessions).toHaveLength(1)
      expect(state.sessions[0].name).toBe('Test Session')
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        fetchSessionsByBranch.rejected(
          null,
          'rejected',
          'branch-id-1',
          'Error al cargar'
        )
      )

      const state = store.getState().sessions
      expect(state.error).toBe('Error al cargar')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('async thunks - fetchSessionById', () => {
    it('should set currentSession when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        fetchSessionById.fulfilled(mockSession, 'fulfilled', 'session-id-1')
      )

      const state = store.getState().sessions
      expect(state.currentSession).toEqual(mockSession)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('async thunks - createSession', () => {
    it('should add session when fulfilled', () => {
      const store = createTestStore()

      store.dispatch(
        createSession.fulfilled(mockSession, 'fulfilled', {
          name: 'Test Session',
          branchId: 'branch-id-1',
        })
      )

      const state = store.getState().sessions
      expect(state.sessions).toHaveLength(1)
      expect(state.sessions[0].name).toBe('Test Session')
      expect(state.currentSession).toEqual(mockSession)
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const store = createTestStore()

      store.dispatch(
        createSession.rejected(null, 'rejected', undefined, 'Error al crear')
      )

      const state = store.getState().sessions
      expect(state.error).toBe('Error al crear')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('async thunks - updateSession', () => {
    it('should update session when fulfilled', () => {
      const store = createTestStore({
        sessions: {
          sessions: [mockSession],
          currentSession: null,
          isLoading: false,
          error: null,
        },
      })

      const updatedSession = { ...mockSession, name: 'Updated Session' }
      store.dispatch(
        updateSession.fulfilled(updatedSession, 'fulfilled', {
          id: 'session-id-1',
          data: { name: 'Updated Session' },
        })
      )

      const state = store.getState().sessions
      expect(state.sessions[0].name).toBe('Updated Session')
    })

    it('should update currentSession when fulfilled', () => {
      const store = createTestStore({
        sessions: {
          sessions: [mockSession],
          currentSession: mockSession,
          isLoading: false,
          error: null,
        },
      })

      const updatedSession = { ...mockSession, name: 'Updated Session' }
      store.dispatch(
        updateSession.fulfilled(updatedSession, 'fulfilled', {
          id: 'session-id-1',
          data: { name: 'Updated Session' },
        })
      )

      const state = store.getState().sessions
      expect(state.currentSession?.name).toBe('Updated Session')
    })
  })

  describe('async thunks - closeSession', () => {
    it('should update session when closed', () => {
      const store = createTestStore({
        sessions: {
          sessions: [mockSession],
          currentSession: null,
          isLoading: false,
          error: null,
        },
      })

      const closedSession = {
        ...mockSession,
        status: Entities.CashSessionStatus.CLOSED,
        closingBalance: 1500,
        closedAt: new Date().toISOString(),
      }
      store.dispatch(
        closeSession.fulfilled(closedSession, 'fulfilled', {
          id: 'session-id-1',
          closingBalance: 1500,
        })
      )

      const state = store.getState().sessions
      expect(state.sessions[0].status).toBe(Entities.CashSessionStatus.CLOSED)
      expect(state.sessions[0].closingBalance).toBe(1500)
    })
  })
})
