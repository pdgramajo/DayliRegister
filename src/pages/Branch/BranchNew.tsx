import { useNavigate } from 'react-router-dom'
import { BranchService } from '../../services'
import type { CreateBranchDTO } from '../../types/dtos'
import { BranchForm } from '../../components/forms/BranchForm'

export const BranchNew = () => {
  const navigate = useNavigate()

  const handleSubmit = async (data: CreateBranchDTO) => {
    try {
      await BranchService.createBranch(data)
      navigate('/branches')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-content-900 dark:text-white tracking-tight">
            Nueva Sucursal
          </h1>
          <p className="mt-1 text-sm text-content-500 dark:text-content-400">
            Crea una nueva sucursal para tu negocio
          </p>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
          <BranchForm onSubmit={handleSubmit} cancelTo="/branches" />
        </div>
      </div>
    </div>
  )
}
