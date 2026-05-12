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
import { BranchForm } from '../../components/forms/BranchForm'
import { PageHeader, toast } from '../../components/ui'

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
      .then(() => {
        toast.success('Sucursal actualizada correctamente')
        navigate('/branches')
      })
      .catch(() => {
        toast.error('Error al actualizar la sucursal')
      })
  }

  if (!currentBranch && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando sucursal...</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Editar Sucursal"
        description={`Editando: ${currentBranch?.name || ''}`}
      />

      <div className="bg-white shadow rounded-lg p-6">
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
          />
        )}
      </div>
    </div>
  )
}
