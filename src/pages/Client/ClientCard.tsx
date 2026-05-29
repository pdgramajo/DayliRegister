import { useState } from 'react'
import { Button, Badge } from '../../components/ui'
import { openWhatsApp } from '../../lib/whatsapp'
import { formatPhoneForDisplay, formatMoney } from '../../lib/formatters'
import type { DebtEntry } from '../../types/entities'
import type { ClientWithBalance } from '../../services/ClientService'
import {
  MessageCircle,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Plus,
  Minus,
} from 'lucide-react'

const HISTORY_PAGE_SIZE = 5

const EntryIcon = ({ type }: { type: 'debt' | 'payment' }) =>
  type === 'debt' ? (
    <Circle className="size-2.5 fill-red-400 text-red-400 shrink-0" />
  ) : (
    <Circle className="size-2.5 fill-emerald-400 text-emerald-400 shrink-0" />
  )

interface HistoryPanelProps {
  entries: DebtEntry[]
  clientId: string
  onDeleteEntry: (entryId: string, clientId: string) => void
}

const HistoryPanel = ({
  entries,
  clientId,
  onDeleteEntry,
}: HistoryPanelProps) => {
  const [showAll, setShowAll] = useState(false)
  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const displayed = showAll ? sorted : sorted.slice(0, HISTORY_PAGE_SIZE)

  return (
    <div className="border-t border-surface-200 dark:border-surface-700 pt-3 mt-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Clock className="size-3.5 text-content-400" />
        <span className="text-[11px] font-semibold text-content-400 uppercase tracking-widest">
          Historial
        </span>
        <span className="text-[11px] text-content-300 ml-auto">
          {entries.length} registro{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      {displayed.length === 0 ? (
        <p className="text-xs text-content-400 py-2 text-center italic">
          Sin movimientos
        </p>
      ) : (
        <div className="space-y-0.5">
          {displayed.map((entry) => (
            <div
              key={entry.id}
              className="group flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800/60 transition-colors"
            >
              <EntryIcon type={entry.type} />
              <span className="text-[11px] text-content-400 w-12 shrink-0 font-mono tabular-nums">
                {new Date(entry.createdAt).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                })}
              </span>
              <span
                className={`text-xs font-semibold tabular-nums ${
                  entry.type === 'debt'
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {entry.type === 'debt' ? '+' : '−'}${formatMoney(entry.amount)}
              </span>
              {entry.description && (
                <span className="text-[11px] text-content-400 truncate flex-1 min-w-0 italic">
                  {entry.description}
                </span>
              )}
              <button
                onClick={() => onDeleteEntry(entry.id, clientId)}
                data-testid="delete-entry-button"
                className="p-1 rounded-md text-content-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0"
                title="Eliminar"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {sorted.length > HISTORY_PAGE_SIZE && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors mt-2 w-full text-center py-1"
        >
          {showAll ? 'Mostrar menos ↑' : `Ver más historial →`}
        </button>
      )}
    </div>
  )
}

interface ClientCardProps {
  client: ClientWithBalance
  isExpanded: boolean
  onToggleExpand: (clientId: string) => void
  onRegisterDebt: (clientId: string, type: 'debt' | 'payment') => void
  onEdit: (clientId: string) => void
  onDeleteClient: (clientId: string) => void
  onDeleteEntry: (entryId: string, clientId: string) => void
}

export const ClientCard = ({
  client,
  isExpanded,
  onToggleExpand,
  onRegisterDebt,
  onEdit,
  onDeleteClient,
  onDeleteEntry,
}: ClientCardProps) => {
  const hasDebt = client.balance > 0

  const handleSendWhatsApp = () => {
    if (!client.phone || !hasDebt) return
    openWhatsApp(
      client.phone,
      `Hola ${client.name}, tu deuda actual es de $${formatMoney(client.balance)}`
    )
  }

  return (
    <div
      className={`rounded-xl border transition-all ${
        hasDebt
          ? 'border-amber-200 dark:border-amber-700/60 bg-white dark:bg-surface-800 shadow-sm'
          : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleExpand(client.id)}
            data-testid="expand-button"
            className="shrink-0 text-content-300 hover:text-content-600 dark:hover:text-content-400 transition-colors -ml-0.5"
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-content-900 dark:text-white block truncate">
              {client.name}
            </span>
            {client.phone && (
              <span className="text-xs text-content-400 dark:text-content-500">
                📞 {formatPhoneForDisplay(client.phone)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className={`text-sm font-bold tabular-nums ${
                hasDebt
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {hasDebt ? `$${formatMoney(client.balance)}` : '$0'}
            </span>
            {hasDebt ? (
              <Badge
                variant="warning"
                className="text-[10px] px-1.5 py-0.5 uppercase tracking-wider font-semibold"
              >
                Debe
              </Badge>
            ) : (
              <Badge
                variant="success"
                className="text-[10px] px-1.5 py-0.5 uppercase tracking-wider font-semibold"
              >
                Pagado
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRegisterDebt(client.id, 'debt')}
            data-testid="add-debt-button"
            className="text-xs gap-1 h-8 flex-1"
          >
            <Plus className="size-3.5" />
            Registrar deuda
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRegisterDebt(client.id, 'payment')}
            className="text-xs gap-1 h-8 flex-1"
          >
            <Minus className="size-3.5" />
            Registrar pago
          </Button>
        </div>

        <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-surface-100 dark:border-surface-700/50">
          {client.phone && hasDebt && (
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-content-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-colors"
            >
              <MessageCircle className="size-3.5" />
              WhatsApp
            </button>
          )}
          <button
            onClick={() => onEdit(client.id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-content-500 hover:text-content-700 hover:bg-surface-100 dark:hover:bg-surface-700 dark:hover:text-content-300 transition-colors"
          >
            <Pencil className="size-3.5" />
            Editar
          </button>
          <button
            onClick={() => onDeleteClient(client.id)}
            data-testid="delete-client-button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-content-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="size-3.5" />
            Eliminar
          </button>
        </div>

        {isExpanded && (
          <HistoryPanel
            entries={client.entries}
            clientId={client.id}
            onDeleteEntry={onDeleteEntry}
          />
        )}
      </div>
    </div>
  )
}
