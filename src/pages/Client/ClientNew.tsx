import { useNavigate, useParams } from 'react-router-dom'
import { ClientService } from '../../services/ClientService'
import { toast } from '../../components/ui'
import { ClientForm } from '../../components/forms/ClientForm'
import type { CreateClientDTO } from '../../types/dtos'

export const ClientNew = () => {
  const { id: branchId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const handleSubmit = async (data: CreateClientDTO) => {
    if (!branchId) return
    try {
      await ClientService.createClient(data)
      navigate(`/branches/${branchId}/clients`)
    } catch (error) {
      toast.error('Error al crear el cliente')
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-content-900 dark:text-white tracking-tight">
            Nuevo Cliente
          </h1>
          <p className="mt-1 text-sm text-content-500 dark:text-content-400">
            Agregá un cliente para controlar sus deudas
          </p>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
          <ClientForm
            branchId={branchId!}
            onSubmit={handleSubmit}
            cancelTo={`/branches/${branchId}/clients`}
          />
        </div>
      </div>
    </div>
  )
}
