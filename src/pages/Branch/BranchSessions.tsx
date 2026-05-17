import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchBranchById, clearCurrentBranch } from '../../store/branchSlice'
import {
  fetchSessionsByBranch,
  closeSession,
  deleteSession,
  clearSessions,
} from '../../store/sessionSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import { Button } from '../../components/ui'
import { Entities } from '../../types/entities'
import { OpenSessionCard, ClosedSessionCard } from './SessionCard'

export const BranchSessions = () => {
  const { id: branchId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { currentBranch, isLoading: branchLoading } = useAppSelector(
    (state: RootState) => state.branches
  )
  const { sessions, isLoading: sessionsLoading } = useAppSelector(
    (state: RootState) => state.sessions
  )

  useEffect(() => {
    if (branchId) {
      dispatch(fetchBranchById(branchId))
      dispatch(fetchSessionsByBranch(branchId))
    }
    return () => {
      dispatch(clearCurrentBranch())
      dispatch(clearSessions())
    }
  }, [dispatch, branchId])

  const openSessions = sessions.filter(
    (s) => s.status === Entities.CashSessionStatus.OPEN
  )
  const closedSessions = sessions.filter(
    (s) => s.status === Entities.CashSessionStatus.CLOSED
  )

  const handleCloseSession = (sessionId: string) => {
    const balance = prompt('Ingrese el balance de cierre (opcional):')
    const closingBalance = balance ? parseFloat(balance) : undefined
    if (branchId) {
      dispatch(closeSession({ id: sessionId, closingBalance }))
    }
  }

  const handleDeleteSession = (sessionId: string) => {
    if (branchId) {
      dispatch(deleteSession(sessionId))
    }
  }

  const isLoading = branchLoading || sessionsLoading

  if (isLoading || !currentBranch) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/branches')}
            className="text-sm text-content-500 hover:text-content-700 dark:hover:text-content-300 transition-colors"
          >
            ← Volver
          </button>
          <span className="text-sm font-medium text-content-600 dark:text-content-400">
            {currentBranch.name}
          </span>
        </div>

        <Button
          onClick={() => navigate(`/branches/${branchId}/sessions/new`)}
          className="w-full"
        >
          + Nueva sesión
        </Button>
      </div>

      {openSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="flex items-center justify-center gap-3 text-xs font-medium text-green-600 uppercase tracking-wider mb-3">
            <span className="h-px flex-1 bg-green-500/40" />
            ABIERTAS
            <span className="h-px flex-1 bg-green-500/40" />
          </h2>
          <div className="space-y-3">
            {openSessions.map((session) => (
              <OpenSessionCard
                key={session.id}
                session={session}
                branchId={branchId!}
                onClose={handleCloseSession}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="flex items-center justify-center gap-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          <span className="h-px flex-1 bg-gray-500/40" />
          HISTORIAL ({closedSessions.length})
          <span className="h-px flex-1 bg-gray-500/40" />
        </h2>
        {closedSessions.length === 0 ? (
          <p className="text-content-500 py-8 text-center">
            No hay sesiones cerradas
          </p>
        ) : (
          <div className="space-y-3">
            {closedSessions.map((session) => (
              <ClosedSessionCard
                key={session.id}
                session={session}
                branchId={branchId!}
                onDelete={handleDeleteSession}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
