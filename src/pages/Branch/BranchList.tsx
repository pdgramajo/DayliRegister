import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  MapPin,
  BarChart3,
  ClipboardList,
  Settings,
  Sun,
  Moon,
} from 'lucide-react'
import { fetchBranches, deleteBranch } from '../../store/branchSlice'
import type { RootState } from '../../store'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { useTheme } from '../../hooks/useTheme'
import { Button, toast } from '../../components/ui'
import { BranchCard } from './BranchCard'

export const BranchList = () => {
  const dispatch = useAppDispatch()
  const { toggleTheme, isDark } = useTheme()
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
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <p className="text-red-500 dark:text-red-400 mb-4 text-center">
          {error}
        </p>
        <Button onClick={() => dispatch(fetchBranches())}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-12 justify-start gap-2 px-3 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600"
            >
              <BarChart3 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs">Reportes</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start gap-2 px-3 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600"
            >
              <ClipboardList className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <span className="text-xs">Recepciones</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start gap-2 px-3 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600"
            >
              <Settings className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <span className="text-xs">Configuración</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start gap-2 px-3 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-600"
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              )}
              <span className="text-xs">{isDark ? 'Claro' : 'Oscuro'}</span>
            </Button>
          </div>
          <Link to="/branches/new">
            <Button className="w-full shadow-lg shadow-indigo-200 dark:shadow-none py-6 hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-300 dark:hover:shadow-none">
              <Plus className="w-4 h-4" />
              Nueva Sucursal
            </Button>
          </Link>
        </div>

        <div className="pt-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            SUCURSALES
          </h2>
          {branches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay sucursales creadas
              </p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto space-y-2 -mx-2 px-2">
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
