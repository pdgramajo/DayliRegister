import { useNavigate, useParams } from 'react-router-dom'
import { SessionService } from '../../services'
import type { CreateSessionDTO } from '../../types/dtos'
import {
  SessionForm,
  type SessionFormData,
} from '../../components/forms/SessionForm'

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
      navigate(`/branches/${branchId}/sessions`)
    } catch (error) {
      console.error(error)
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
            cancelTo={`/branches/${branchId}/sessions`}
          />
        </div>
      </div>
    </div>
  )
}
