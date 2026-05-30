import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchSessionById,
  updateSession,
  clearCurrentSession,
} from '../../store/sessionSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import {
  SessionForm,
  type SessionFormData,
} from '../../components/forms/SessionForm'
import { Entities } from '../../types/entities'
import { toast } from '../../components/ui'
import { ROUTES, buildRoute } from '../../constants/routes'

export const SessionEdit = () => {
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

  useEffect(() => {
    if (
      currentSession &&
      currentSession.status === Entities.CashSessionStatus.CLOSED
    ) {
      if (branchId) {
        navigate(buildRoute(ROUTES.BRANCH_SESSIONS, { id: branchId }))
      }
    }
  }, [currentSession, branchId, navigate])

  const handleSubmit = (data: SessionFormData) => {
    if (!sessionId) return
    dispatch(updateSession({ id: sessionId, data }))
      .unwrap()
      .then(() => {
        if (branchId) {
          navigate(buildRoute(ROUTES.BRANCH_SESSIONS, { id: branchId }))
        }
      })
      .catch((error) => {
        toast.error(error || 'Error al actualizar la sesión')
      })
  }

  if (!currentSession && !isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 px-4 py-6">
        <p className="text-content-500 text-center">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-content-900 dark:text-white tracking-tight">
            Editar Sesión
          </h1>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
          {currentSession && (
            <SessionForm
              initialValues={{
                name: currentSession.name,
                initialAmount: currentSession.initialAmount,
                notes: currentSession.notes,
              }}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              cancelTo={
                branchId
                  ? buildRoute(ROUTES.BRANCH_SESSIONS, { id: branchId })
                  : ROUTES.BRANCHES
              }
              submitText="Guardar"
            />
          )}
        </div>
      </div>
    </div>
  )
}
