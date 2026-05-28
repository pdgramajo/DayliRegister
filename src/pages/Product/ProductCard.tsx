import { Pencil, Trash2 } from 'lucide-react'
import { Button, Badge } from '../../components/ui'
import type { Product } from '../../types/entities'
import { formatMoney } from '../../lib/formatters'

interface ProductCardProps {
  product: Product
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const ProductCard = ({
  product,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: ProductCardProps) => {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        isSelected
          ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/20'
          : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(product.id)}
        className="size-5 rounded border-surface-300 text-brand-600 focus:ring-brand-500 dark:bg-surface-700 dark:border-surface-600 shrink-0"
      />

      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-content-900 dark:text-white block truncate">
          {product.name}
        </span>
        {product.category && (
          <span className="text-xs text-content-400 dark:text-content-500">
            {product.category}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <span className="text-sm font-semibold text-content-900 dark:text-white">
            ${formatMoney(product.price)}
          </span>
          {product.offerPrice !== undefined && product.offerPrice !== null && (
            <div>
              <Badge variant="success" className="text-xs">
                Oferta: ${formatMoney(product.offerPrice)}
              </Badge>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(product.id)}
        >
          <Pencil className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-content-400 hover:text-red-500 dark:hover:text-red-400"
          onClick={() => onDelete(product.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}
