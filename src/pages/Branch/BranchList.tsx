import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchBranches, deleteBranch } from '../../store/branchSlice'
import type { RootState } from '../../store'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { Button, toast } from '../../components/ui'

export const BranchList = () => {
  const dispatch = useAppDispatch()
  const { branches, isLoading, error } = useAppSelector(
    (state: RootState) => state.branches
  )

  useEffect(() => {
    dispatch(fetchBranches())
  }, [dispatch])

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la sucursal "${name}"?`)) {
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
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Sucursales
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona las sucursales de tu negocio
            </p>
          </div>
          <Link to="/branches/new" className="sm:order-first">
            <Button className="w-full sm:w-auto h-12 px-6 text-base font-semibold shadow-sm hover:shadow-md transition-all">
              + Nueva
            </Button>
          </Link>
        </div>

        {branches.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <p className="text-gray-500 mb-6">No hay sucursales creadas</p>
            <Link to="/branches/new">
              <Button className="h-12 px-8 text-base font-semibold">
                Crear primera sucursal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/branches/${branch.id}/sessions`}
                      className="block"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-indigo-600 transition-colors">
                        {branch.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            branch.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {branch.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                        {branch.address && (
                          <span className="text-xs text-gray-400 truncate">
                            {branch.address}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link to={`/branches/${branch.id}`}>
                      <Button
                        variant="ghost"
                        className="h-10 px-4 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="h-10 px-3 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(branch.id, branch.name)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
