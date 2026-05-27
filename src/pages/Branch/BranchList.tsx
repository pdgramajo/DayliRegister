import { useEffect, useState } from 'react'
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
import { Button, Modal, toast } from '../../components/ui'
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

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    dispatch(deleteBranch(deleteTarget.id))
      .unwrap()
      .then(() => {
        toast.success('Sucursal eliminada correctamente')
        setDeleteTarget(null)
      })
      .catch(() => {
        toast.error('Error al eliminar la sucursal')
      })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="size-8 border-4 border-surface-200 dark:border-surface-700 border-t-indigo-600 rounded-full animate-spin" />
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
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-12 justify-start gap-2 px-3 dark:border-surface-700 dark:text-content-300 dark:hover:bg-surface-800 dark:hover:border-surface-600"
            >
              <BarChart3 className="size-5 text-indigo-500 dark:text-indigo-400" />
              <span className="text-xs">Reportes</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start gap-2 px-3 dark:border-surface-700 dark:text-content-300 dark:hover:bg-surface-800 dark:hover:border-surface-600"
            >
              <ClipboardList className="size-5 text-emerald-500 dark:text-emerald-400" />
              <span className="text-xs">Recepciones</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start gap-2 px-3 dark:border-surface-700 dark:text-content-300 dark:hover:bg-surface-800 dark:hover:border-surface-600"
            >
              <Settings className="size-5 text-amber-500 dark:text-amber-400" />
              <span className="text-xs">Configuración</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start gap-2 px-3 dark:border-surface-700 dark:text-content-300 dark:hover:bg-surface-800 dark:hover:border-surface-600"
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className="size-5 text-amber-500 dark:text-amber-400" />
              ) : (
                <Moon className="size-5 text-indigo-500 dark:text-indigo-400" />
              )}
              <span className="text-xs">{isDark ? 'Claro' : 'Oscuro'}</span>
            </Button>
          </div>
          <Link to="/branches/new">
            <Button className="w-full shadow-lg shadow-indigo-200 dark:shadow-none py-6 hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-300 dark:hover:shadow-none">
              <Plus className="size-4" />
              Nueva Sucursal
            </Button>
          </Link>
        </div>

        <div className="pt-4">
          <h2 className="text-lg font-bold text-content-900 dark:text-white tracking-tight mb-4">
            SUCURSALES
          </h2>
          {branches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                <MapPin className="size-6 text-content-400 dark:text-surface-500" />
              </div>
              <p className="text-sm text-surface-500 dark:text-content-400">
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

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar sucursal"
      >
        <p className="text-sm text-content-500 mb-6">
          ¿Estás seguro de que quieres eliminar "{deleteTarget?.name}"?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
