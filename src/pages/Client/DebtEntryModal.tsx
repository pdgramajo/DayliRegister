import { useState } from 'react'
import { Entities, type DebtEntryType } from '../../types/entities'
import { Modal, Button, MoneyInput } from '../../components/ui'

interface DebtEntryModalProps {
  open: boolean
  type: DebtEntryType
  onClose: () => void
  onConfirm: (amount: number, description: string) => void
}

export const DebtEntryModal = ({
  open,
  type,
  onClose,
  onConfirm,
}: DebtEntryModalProps) => {
  const [amount, setAmount] = useState<number | undefined>()
  const [description, setDescription] = useState('')

  const handleConfirm = () => {
    if (amount === undefined || amount <= 0) return
    onConfirm(amount, description)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Content
        title={
          type === Entities.DebtEntryTypes.DEBT
            ? 'Registrar deuda'
            : 'Registrar pago'
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-content-700 dark:text-content-300">
              Monto
            </label>
            <MoneyInput
              autoComplete="off"
              value={amount}
              onChange={(v) => setAmount(v)}
            />
          </div>
          {type === Entities.DebtEntryTypes.DEBT && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-content-700 dark:text-content-300">
                Descripción <span className="text-content-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: pollo, pan, gaseosa"
                className="flex h-10 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-content-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-content-100 dark:placeholder:text-content-500 dark:focus-visible:ring-offset-surface-900"
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm}>
              {type === Entities.DebtEntryTypes.DEBT
                ? 'Agregar deuda'
                : 'Registrar pago'}
            </Button>
          </div>
        </div>
      </Modal.Content>
    </Modal>
  )
}
