import { useNavigate } from 'react-router-dom'
import { BranchService } from '../../services'
import type { CreateBranchDTO } from '../../types/dtos'
import { BranchForm } from '../../components/forms/BranchForm'
import { toast } from '../../components/ui'

export const BranchNew = () => {
  const navigate = useNavigate()

  const handleSubmit = async (data: CreateBranchDTO) => {
    try {
      await BranchService.createBranch(data)
      toast.success('Sucursal creada correctamente')
      navigate('/branches')
    } catch (error) {
      toast.error('Error al crear la sucursal')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/branches')}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Nueva Sucursal
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Crea una nueva sucursal para tu negocio
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <BranchForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
