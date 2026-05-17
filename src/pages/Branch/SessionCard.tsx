import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui'
import type { CashSession } from '../../types/entities'
import { Entities } from '../../types/entities'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMoney = (amount?: number) => {
  if (amount === undefined || amount === null) return '-'
  return new Intl.NumberFormat('es-AR').format(amount)
}

interface OpenSessionCardProps {
  session: CashSession
  branchId: string
  onClose: (sessionId: string) => void
}

export const OpenSessionCard = ({
  session,
  branchId,
}: OpenSessionCardProps) => {
  const navigate = useNavigate()

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/branches/${branchId}/sessions/${session.id}/edit`)
  }

  return (
    <div
      onClick={() => navigate(`/branches/${branchId}/sessions/${session.id}`)}
      className="group p-2 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 cursor-pointer transition-all duration-300 hover:border-green-400 dark:hover:border-green-600 hover:shadow-lg hover:shadow-green-500/10"
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <h3 className="text-base font-medium text-content-900 dark:text-content-100 truncate">
          {session.name}
        </h3>
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-lg text-content-400 hover:text-content-600 dark:hover:text-content-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            title="Editar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/20">
            Abierta
          </span>
        </div>
      </div>
      <p className="text-sm text-content-500 mb-2">
        {formatDate(session.openedAt)}
      </p>
      {session.initialAmount !== undefined && (
        <p className="text-sm text-content-600 dark:text-content-400">
          Saldo inicial: {formatMoney(session.initialAmount)}
        </p>
      )}
    </div>
  )
}

interface ClosedSessionCardProps {
  session: CashSession
  branchId: string
  onDelete: (sessionId: string) => void
}

export const ClosedSessionCard = ({
  session,
  branchId,
  onDelete,
}: ClosedSessionCardProps) => {
  const navigate = useNavigate()

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/branches/${branchId}/sessions/${session.id}/edit`)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('¿Estás seguro de eliminar esta sesión?')) {
      onDelete(session.id)
    }
  }

  return (
    <div
      onClick={() => navigate(`/branches/${branchId}/sessions/${session.id}`)}
      className="group p-2 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 cursor-pointer transition-all duration-300 hover:border-surface-300 dark:hover:border-surface-500"
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <h3 className="text-base font-medium text-content-900 dark:text-content-100 truncate">
          {session.name}
        </h3>
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg text-content-400 hover:text-content-600 dark:hover:text-content-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            title="Editar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-content-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Eliminar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
          </button>
        </div>
      </div>
      <p className="text-sm text-content-500 mb-2">
        {formatDate(session.openedAt)}
      </p>
      {(session.initialAmount !== undefined ||
        session.closingBalance !== undefined) && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-content-600 dark:text-content-400">
            Inicial: {formatMoney(session.initialAmount)}
          </span>
          <span className="text-content-600 dark:text-content-400">
            Cierre: {formatMoney(session.closingBalance)}
          </span>
        </div>
      )}
    </div>
  )
}
