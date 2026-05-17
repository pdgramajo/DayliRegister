import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchSessionById,
  closeSession,
  clearCurrentSession,
} from '../../store/sessionSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import { PageHeader, Button } from '../../components/ui'
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
  return new Intl.NumberFormat('es-AR').format(amount)
}

export const SessionDetail = () => {
  const { id: branchId, sessionId } = useParams<{
    id: string
    sessionId: string
  }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { currentSession, isLoading } = useAppSelector(
    (state: RootState) => state.sessions
  )

  useEffect(() => {
    if (sessionId) {
      dispatch(fetchSessionById(sessionId))
    }
    return () => {
      dispatch(clearCurrentSession())
    }
  }, [dispatch, sessionId])

  const handleCloseSession = () => {
    const balance = prompt('Ingrese el balance de cierre (opcional):')
    const closingBalance = balance ? parseFloat(balance) : undefined
    if (branchId && sessionId) {
      dispatch(closeSession({ id: sessionId, closingBalance }))
    }
  }

  if (isLoading || !currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const isOpen = currentSession.status === Entities.CashSessionStatus.OPEN

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/branches/${branchId}/sessions`)}
        >
          ← Volver a sesiones
        </Button>
      </div>

      <PageHeader
        title={currentSession.name}
        description={
          isOpen ? 'Sesión de caja abierta' : 'Sesión de caja cerrada'
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
          <p className="text-sm text-content-500 mb-1">Estado</p>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              isOpen
                ? 'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/20'
                : 'bg-surface-200/60 text-content-600 dark:text-content-400 border border-surface-300/40'
            }`}
          >
            {isOpen ? 'Abierta' : 'Cerrada'}
          </span>
        </div>

        <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
          <p className="text-sm text-content-500 mb-1">Monto Inicial</p>
          <p className="text-lg font-semibold text-content-900 dark:text-content-100">
            {formatMoney(currentSession.initialAmount)}
          </p>
        </div>

        {!isOpen && currentSession.closingBalance !== undefined && (
          <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
            <p className="text-sm text-content-500 mb-1">Balance de Cierre</p>
            <p className="text-lg font-semibold text-content-900 dark:text-content-100">
              {formatMoney(currentSession.closingBalance)}
            </p>
          </div>
        )}
      </div>

      <div className="bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-content-500">Abierta</p>
            <p className="text-content-900 dark:text-content-100">
              {formatDate(currentSession.openedAt)}
            </p>
          </div>
          {currentSession.closedAt && (
            <div>
              <p className="text-content-500">Cerrada</p>
              <p className="text-content-900 dark:text-content-100">
                {formatDate(currentSession.closedAt)}
              </p>
            </div>
          )}
        </div>
      </div>

      {currentSession.notes && (
        <div className="bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4 mb-6">
          <p className="text-sm text-content-500 mb-1">Notas</p>
          <p className="text-content-900 dark:text-content-100">
            {currentSession.notes}
          </p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Transacciones</h2>
        <div className="text-center py-8 text-content-500">
          No hay transacciones aún
        </div>
      </div>

      <div className="flex gap-3">
        {isOpen && (
          <>
            <Button
              onClick={() =>
                navigate(`/branches/${branchId}/sessions/${sessionId}/edit`)
              }
            >
              Editar Sesión
            </Button>
            <Button variant="destructive" onClick={handleCloseSession}>
              Cerrar Sesión
            </Button>
          </>
        )}
        {!isOpen && (
          <Button
            variant="outline"
            onClick={() => navigate(`/branches/${branchId}/sessions`)}
          >
            Volver
          </Button>
        )}
      </div>
    </div>
  )
}
