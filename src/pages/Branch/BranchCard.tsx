import { Link } from 'react-router-dom'
import { MapPin, Phone, Pencil, Trash2, ArrowRight } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import type { Branch } from '../../types/entities'

interface BranchCardProps {
  branch: Branch
  onDelete: (id: string, name: string) => void
}

export const BranchCard = ({ branch, onDelete }: BranchCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {branch.name}
                </h3>
                <Badge variant={branch.isActive ? 'success' : 'secondary'}>
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
            onClick={() => onDelete(branch.id, branch.name)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Link to={`/branches/${branch.id}/sessions`} className="flex-1">
            <Button size="sm" className="w-full justify-center">
              Abrir
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
