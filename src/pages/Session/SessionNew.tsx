import { useNavigate, useParams } from 'react-router-dom'
import { SessionService, SessionAlreadyOpenError } from '../../services'
import type { CreateSessionDTO } from '../../types/dtos'
import {
  SessionForm,
  type SessionFormData,
} from '../../components/forms/SessionForm'
import { toast } from '../../components/ui'
import { ROUTES, buildRoute } from '../../constants/routes'

export const SessionNew = () => {
  const { id: branchId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const handleSubmit = async (data: SessionFormData) => {
    if (!branchId) return
    try {
      const sessionData: CreateSessionDTO = {
        name: data.name,
        branchId,
        initialAmount: data.initialAmount,
        notes: data.notes,
      }
      await SessionService.createSession(sessionData)
      navigate(buildRoute(ROUTES.BRANCH_SESSIONS, { id: branchId }))
    } catch (error) {
      if (error instanceof SessionAlreadyOpenError) {
        toast.error('Ya hay una sesión abierta para esta sucursal')
      } else {
        toast.error('Error al crear la sesión')
      }
    }
  }

  if (!branchId) {
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
            Nueva Sesión
          </h1>
          <p className="mt-1 text-sm text-content-500 dark:text-content-400">
            Abre una nueva sesión de caja
          </p>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
          <SessionForm
            onSubmit={handleSubmit}
            cancelTo={buildRoute(ROUTES.BRANCH_SESSIONS, { id: branchId })}
          />
        </div>
      </div>
    </div>
  )
}
