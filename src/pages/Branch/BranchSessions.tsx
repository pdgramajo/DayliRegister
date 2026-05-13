import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchBranchById, clearCurrentBranch } from '../../store/branchSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import { PageHeader, Button } from '../../components/ui'

export const BranchSessions = () => {
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

  if (isLoading || !currentBranch) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/branches')}>
          ← Seleccionar otra sucursal
        </Button>
      </div>

      <PageHeader
        title={`Sesiones - ${currentBranch.name}`}
        description="Gestiona las sesiones de caja de esta sucursal"
      />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800">
          <strong>Próximamente:</strong> Esta sección permitirá gestionar las
          sesiones de caja.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Sesiones Abiertas</h2>
        <p className="text-gray-500">No hay sesiones abiertas</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 shadow rounded-lg p-6 mt-4">
        <h2 className="text-lg font-semibold mb-4">Sesiones Cerradas</h2>
        <p className="text-gray-500">No hay sesiones cerradas</p>
      </div>
    </div>
  )
}
