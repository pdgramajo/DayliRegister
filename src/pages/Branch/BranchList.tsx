import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Pencil, Trash2, ArrowRight } from 'lucide-react'
import { fetchBranches, deleteBranch } from '../../store/branchSlice'
import type { RootState } from '../../store'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import { Button, Card, CardContent, Badge, toast } from '../../components/ui'

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            SUCURSALES
          </h1>
          <Link to="/branches/new">
            <Button className="shadow-lg shadow-indigo-200">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nueva Sucursal
            </Button>
          </Link>
        </div>

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
              <Card
                key={branch.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {branch.name}
                          </h3>
                          <Badge
                            variant={branch.isActive ? 'success' : 'secondary'}
                          >
                            {branch.isActive ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>

                        <div className="space-y-1.5 mt-3">
                          {branch.address && (
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{branch.address}</span>
                            </p>
                          )}
                          {branch.phone && (
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span>{branch.phone}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-5 py-3 bg-gray-50/80 border-t border-gray-100">
                    <Link to={`/branches/${branch.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(branch.id, branch.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Link
                      to={`/branches/${branch.id}/sessions`}
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full justify-center">
                        Abrir
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
