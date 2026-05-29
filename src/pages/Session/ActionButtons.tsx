import { Plus } from 'lucide-react'
import { Button } from '../../components/ui'
import type { TabType } from './types'

interface ActionButtonsProps {
  type: TabType
  isOpen: boolean
  onNavigate: (path: string) => void
}

export const ActionButtons = ({
  type,
  isOpen,
  onNavigate,
}: ActionButtonsProps) => {
  if (!isOpen) return null
  if (type === 'movements') {
    return (
      <div className="grid grid-cols-4 gap-1 mb-2">
        <Button
          variant="outline"
          className="h-8 gap-0"
          onClick={() => onNavigate('sale')}
        >
          <Plus className="size-4 mr-1" />
          Venta
        </Button>
        <Button
          variant="outline"
          className="h-8 gap-0"
          onClick={() => onNavigate('expense')}
        >
          <Plus className="size-4 mr-1" />
          Gasto
        </Button>
        <Button
          variant="outline"
          className="h-8 gap-0"
          onClick={() => onNavigate('withdrawal')}
        >
          <Plus className="size-4 mr-1" />
          Retiro
        </Button>
        <Button
          variant="outline"
          className="h-8 gap-0"
          onClick={() => onNavigate('income')}
        >
          <Plus className="size-4 mr-1" />
          Ingreso
        </Button>
      </div>
    )
  }
  return (
    <div className="flex justify-between gap-2 mb-2">
      <Button
        variant="outline"
        className="h-8 flex-1"
        onClick={() => onNavigate('in')}
      >
        <Plus className="size-4 mr-1" />
        Entrada
      </Button>
      <Button
        variant="outline"
        className="h-8 flex-1"
        onClick={() => onNavigate('out')}
      >
        <Plus className="size-4 mr-1" />
        Salida
      </Button>
    </div>
  )
}
