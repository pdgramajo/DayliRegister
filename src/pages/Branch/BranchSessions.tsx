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
import { Button, toast } from '../../components/ui'
import { Entities } from '../../types/entities'
import { OpenSessionCard, ClosedSessionCard } from './SessionCard'
import { BarChart3 } from 'lucide-react'

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
        .unwrap()
        .then(() => toast.success('Sesión cerrada correctamente'))
        .catch((error) => toast.error(error || 'Error al cerrar la sesión'))
    }
  }

  const handleDeleteSession = (sessionId: string) => {
    if (branchId) {
      dispatch(deleteSession(sessionId))
        .unwrap()
        .then(() => toast.success('Sesión eliminada correctamente'))
        .catch((error) => toast.error(error || 'Error al eliminar la sesión'))
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Button
            variant="outline"
            className="h-12 justify-start gap-2 px-3 dark:border-surface-700 dark:text-content-300 dark:hover:bg-surface-800 dark:hover:border-surface-600"
          >
            <BarChart3 className="size-5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-xs">Recepciones</span>
          </Button>
          <Button
            variant="outline"
            className="h-12 justify-start gap-2 px-3 dark:border-surface-700 dark:text-content-300 dark:hover:bg-surface-800 dark:hover:border-surface-600"
          >
            <BarChart3 className="size-5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-xs">Reportes</span>
          </Button>
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
