import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  MapPin,
  BarChart3,
  ClipboardList,
  Settings,
  Sun,
} from 'lucide-react'
import { fetchBranches, deleteBranch } from '../../store/branchSlice'
import type { RootState } from '../../store'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { Button, Card, toast } from '../../components/ui'
import { BranchCard } from './BranchCard'

export const BranchList = () => {
  const dispatch = useAppDispatch()
  const { branches, isLoading, error } = useAppSelector(
    (state: RootState) => state.branches
  )

  useEffect(() => {
    dispatch(fetchBranches())
  }, [dispatch])

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) {
      return
    }
    dispatch(deleteBranch(id))
      .unwrap()
      .then(() => {
        toast.success('Sucursal eliminada correctamente')
      })
      .catch(() => {
        toast.error('Error al eliminar la sucursal')
      })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <p className="text-red-500 mb-4 text-center">{error}</p>
        <Button onClick={() => dispatch(fetchBranches())}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-12 justify-start gap-2 px-3">
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Reportes</span>
            </Button>
            <Button variant="outline" className="h-12 justify-start gap-2 px-3">
              <ClipboardList className="w-5 h-5" />
              <span className="text-xs">Recepciones</span>
            </Button>
            <Button variant="outline" className="h-12 justify-start gap-2 px-3">
              <Settings className="w-5 h-5" />
              <span className="text-xs">Configuración</span>
            </Button>
            <Button variant="outline" className="h-12 justify-start gap-2 px-3">
              <Sun className="w-5 h-5" />
              <span className="text-xs">Tema</span>
            </Button>
          </div>
          <Link to="/branches/new">
            <Button className="w-full shadow-lg shadow-indigo-200 py-6">
              <Plus className="w-4 h-4" />
              Nueva Sucursal
            </Button>
          </Link>
        </div>

        <div className="pt-4">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4">
            SUCURSALES
          </h2>
          {branches.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-gray-500 mb-6">No hay sucursales creadas</p>
              <Link to="/branches/new">
                <Button>Crear Primera Sucursal</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {branches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
