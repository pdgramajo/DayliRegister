import { type ReactNode } from 'react'
import { X, ArrowDownLeft, ArrowUpLeft } from 'lucide-react'
import { Entities, type InventoryMovement } from '../../types/entities'
import { formatDate } from '../../lib/formatters'

interface InventoryItemProps {
  movement: InventoryMovement
  categories: { id: string; name: string }[]
  deleteButton?: ReactNode
}

const InventoryItem = ({
  movement,
  categories,
  deleteButton,
}: InventoryItemProps) => {
  const isIn = movement.type === Entities.InventoryMovementTypes.IN
  const category = categories.find((c) => c.id === movement.inventoryCategoryId)
  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
      <div className="flex items-center gap-2">
        {isIn ? (
          <ArrowDownLeft className="size-4 text-green-600" />
        ) : (
          <ArrowUpLeft className="size-4 text-red-600" />
        )}
        <div>
          <p className="text-sm font-medium text-content-900 dark:text-content-100">
            {category?.name || 'Sin categoría'}
          </p>
          {movement.notes && (
            <p className="text-xs text-content-500 italic">{movement.notes}</p>
          )}
          {movement.description && (
            <p className="text-xs text-content-500">{movement.description}</p>
          )}
          <p className="text-xs text-content-400">
            {formatDate(movement.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium ${isIn ? 'text-green-600' : 'text-red-600'}`}
        >
          {isIn ? '+' : '-'}
          {movement.quantity}
        </span>
        {deleteButton}
      </div>
    </div>
  )
}

interface InventoryListProps {
  movements: InventoryMovement[]
  categories: { id: string; name: string }[]
  isLoading: boolean
  isOpen: boolean
  onDelete: (id: string) => void
}

export const InventoryList = ({
  movements,
  categories,
  isLoading,
  isOpen,
  onDelete,
}: InventoryListProps) => (
  <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
    {isLoading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    ) : movements.length === 0 ? (
      <p className="text-center text-content-500 py-8">
        No hay movimientos de inventario
      </p>
    ) : (
      movements.map((m) => (
        <InventoryItem
          key={m.id}
          movement={m}
          categories={categories}
          deleteButton={
            isOpen ? (
              <button
                onClick={() => onDelete(m.id)}
                className="p-1 text-content-400 hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            ) : undefined
          }
        />
      ))
    )}
  </div>
)
