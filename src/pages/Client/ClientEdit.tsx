import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchClientById,
  updateClient,
  clearCurrentClient,
} from '../../store/clientSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import type { CreateClientDTO } from '../../types/dtos'
import { ClientForm, toast } from '../../components/ui'
import { ROUTES, buildRoute } from '../../constants/routes'

export const ClientEdit = () => {
  const { id: branchId, clientId } = useParams<{
    id: string
    clientId: string
  }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentClient, isLoading } = useAppSelector(
    (state: RootState) => state.clients
  )

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClientById(clientId))
    }
    return () => {
      dispatch(clearCurrentClient())
    }
  }, [dispatch, clientId])

  const handleSubmit = (data: CreateClientDTO) => {
    if (!clientId) return
    const { branchId: _, ...updateData } = data
    dispatch(updateClient({ id: clientId, data: updateData }))
      .unwrap()
      .then(() => navigate(buildRoute(ROUTES.BRANCH_CLIENTS, { id: branchId })))
      .catch((error) => {
        toast.error(error || 'Error al actualizar el cliente')
      })
  }

  if (!currentClient && !isLoading) {
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
            Editar Cliente
          </h1>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
          {currentClient && (
            <ClientForm
              branchId={branchId!}
              initialValues={{
                name: currentClient.name,
                phone: currentClient.phone,
                notes: currentClient.notes,
              }}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              cancelTo={`/branches/${branchId}/clients`}
            />
          )}
        </div>
      </div>
    </div>
  )
}
