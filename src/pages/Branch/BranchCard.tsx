import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui'
import type { Branch } from '../../types/entities'

interface BranchCardProps {
  branch: Branch
  onDelete: (id: string, name: string) => void
}

export const BranchCard = ({ branch, onDelete }: BranchCardProps) => {
  const navigate = useNavigate()

  const hasContactInfo = branch.address || branch.phone

  return (
    <div
      onClick={() => navigate(`/branches/${branch.id}/sessions`)}
      className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${hasContactInfo ? 'py-3' : 'py-2'}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          data-testid="status-indicator"
          className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${branch.isActive ? 'bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900' : 'bg-gray-300 dark:bg-gray-600'}`}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {branch.name}
          </span>
          {branch.address && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
              <span className="truncate">{branch.address}</span>
            </span>
          )}
          {branch.phone && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <Phone className="w-3 h-3 shrink-0 mt-0.5" />
              <span>{branch.phone}</span>
            </span>
          )}
        </div>
      </div>

      <div
        className="flex items-center gap-1 shrink-0 ml-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(`/branches/${branch.id}`)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          onClick={() => onDelete(branch.id, branch.name)}
          data-testid="delete-button"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
