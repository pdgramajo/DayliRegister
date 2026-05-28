import { Modal, Button } from '../../components/ui'

interface DeleteConfirmModalProps {
  open: boolean
  title: string
  message: string
  onClose: () => void
  onConfirm: () => void
}

export const DeleteConfirmModal = ({
  open,
  title,
  message,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) => {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-content-500 mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Eliminar
        </Button>
      </div>
    </Modal>
  )
}
