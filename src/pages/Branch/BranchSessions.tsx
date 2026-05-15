import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchBranchById, clearCurrentBranch } from '../../store/branchSlice'
import {
  fetchSessionsByBranch,
  closeSession,
  clearSessions,
} from '../../store/sessionSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import { PageHeader, Button, Badge } from '../../components/ui'
import { Entities } from '../../types/entities'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMoney = (amount?: number) => {
  if (amount === undefined || amount === null) return '-'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount)
}

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

  const isLoading = branchLoading || sessionsLoading

  if (isLoading || !currentBranch) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/branches')}>
          ← Seleccionar otra sucursal
        </Button>
      </div>

      <PageHeader
        title={`Sesiones - ${currentBranch.name}`}
        description="Gestiona las sesiones de caja de esta sucursal"
      />

      <div className="mb-6">
        <Button onClick={() => navigate(`/branches/${branchId}/sessions/new`)}>
          + Nueva Sesión
        </Button>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">Sesiones Abiertas</h2>
        {openSessions.length === 0 ? (
          <p className="text-content-500">No hay sesiones abiertas</p>
        ) : (
          <div className="space-y-3">
            {openSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
              >
                <div>
                  <p className="font-medium text-content-900 dark:text-content-100">
                    {session.name}
                  </p>
                  <p className="text-sm text-content-500">
                    Abierta: {formatDate(session.openedAt)}
                  </p>
                  {session.initialAmount !== undefined && (
                    <p className="text-sm text-content-600 dark:text-content-300">
                      Monto inicial: {formatMoney(session.initialAmount)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="success">Abierta</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/branches/${branchId}/sessions/${session.id}`)
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCloseSession(session.id)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Sesiones Cerradas</h2>
        {closedSessions.length === 0 ? (
          <p className="text-content-500">No hay sesiones cerradas</p>
        ) : (
          <div className="space-y-3">
            {closedSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-700/50 rounded-xl border border-surface-200 dark:border-surface-600"
              >
                <div>
                  <p className="font-medium text-content-900 dark:text-content-100">
                    {session.name}
                  </p>
                  <p className="text-sm text-content-500">
                    {formatDate(session.openedAt)} -{' '}
                    {session.closedAt ? formatDate(session.closedAt) : '-'}
                  </p>
                  {(session.initialAmount !== undefined ||
                    session.closingBalance !== undefined) && (
                    <p className="text-sm text-content-600 dark:text-content-300">
                      Inicial: {formatMoney(session.initialAmount)} | Cierre:{' '}
                      {formatMoney(session.closingBalance)}
                    </p>
                  )}
                </div>
                <Badge variant="secondary">Cerrada</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
