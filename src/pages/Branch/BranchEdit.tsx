import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchBranchById,
  updateBranch,
  clearCurrentBranch,
} from '../../store/branchSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import type { UpdateBranchDTO } from '../../types/dtos'
import { BranchForm, toast } from '../../components/ui'

export const BranchEdit = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentBranch, isLoading } = useAppSelector(
    (state: RootState) => state.branches
  )

  useEffect(() => {
    if (id) {
      dispatch(fetchBranchById(id))
    }
    return () => {
      dispatch(clearCurrentBranch())
    }
  }, [dispatch, id])

  const handleSubmit = (data: UpdateBranchDTO) => {
    if (!id) return
    dispatch(updateBranch({ id, data }))
      .unwrap()
      .then(() => navigate('/branches'))
      .catch((error) => {
        toast.error(error || 'Error al actualizar la sucursal')
      })
  }

  if (!currentBranch && !isLoading) {
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
            Editar Sucursal
          </h1>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
          {currentBranch && (
            <BranchForm
              initialValues={{
                name: currentBranch.name,
                address: currentBranch.address,
                phone: currentBranch.phone,
                isActive: currentBranch.isActive,
              }}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              cancelTo="/branches"
            />
          )}
        </div>
      </div>
    </div>
  )
}
