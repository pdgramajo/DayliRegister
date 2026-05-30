import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchClientsByBranch,
  deleteClient,
  addDebtEntry,
  deleteDebtEntry,
  clearCurrentClient,
} from '../../store/clientSlice'
import { fetchBranchById, clearCurrentBranch } from '../../store/branchSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import { Button, toast } from '../../components/ui'
import { Users, Search } from 'lucide-react'
import { ClientCard } from './ClientCard'
import { Entities, type DebtEntryType } from '../../types/entities'
import { DebtEntryModal } from './DebtEntryModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'

export const ClientList = () => {
  const { id: branchId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { clients, isLoading } = useAppSelector(
    (state: RootState) => state.clients
  )
  const { currentBranch } = useAppSelector((state: RootState) => state.branches)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null)
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null)
  const [deleteEntryClientId, setDeleteEntryClientId] = useState<string | null>(
    null
  )
  const [showOnlyDebtors, setShowOnlyDebtors] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [debtModalClient, setDebtModalClient] = useState<string | null>(null)
  const [debtModalType, setDebtModalType] = useState<DebtEntryType>('debt')

  useEffect(() => {
    if (branchId) {
      dispatch(fetchBranchById(branchId))
      dispatch(fetchClientsByBranch(branchId))
    }
    return () => {
      dispatch(clearCurrentBranch())
      dispatch(clearCurrentClient())
    }
  }, [dispatch, branchId])

  const handleAddEntry = useCallback(
    (amount: number, description: string) => {
      if (!branchId || !debtModalClient) return
      dispatch(
        addDebtEntry({
          clientId: debtModalClient,
          branchId,
          type: debtModalType,
          amount,
          description: description || undefined,
        })
      )
        .unwrap()
        .then(() => {
          toast.success(
            debtModalType === Entities.DebtEntryTypes.DEBT
              ? 'Deuda registrada'
              : 'Pago registrado'
          )
          setDebtModalClient(null)
          dispatch(fetchClientsByBranch(branchId))
        })
        .catch((error) => toast.error(error || 'Error al registrar'))
    },
    [branchId, debtModalClient, debtModalType, dispatch]
  )

  const handleDeleteEntry = () => {
    if (!deleteEntryId || !deleteEntryClientId || !branchId) return
    dispatch(
      deleteDebtEntry({ entryId: deleteEntryId, clientId: deleteEntryClientId })
    )
      .unwrap()
      .then(() => {
        toast.success('Registro eliminado')
        setDeleteEntryId(null)
        setDeleteEntryClientId(null)
        dispatch(fetchClientsByBranch(branchId))
      })
      .catch((error) => toast.error(error || 'Error al eliminar'))
  }

  const handleDeleteClient = () => {
    if (!deleteClientId) return
    dispatch(deleteClient(deleteClientId))
      .unwrap()
      .then(() => {
        toast.success('Cliente eliminado')
        setDeleteClientId(null)
      })
      .catch((error) => toast.error(error || 'Error al eliminar'))
  }

  const handleRegisterDebt = (clientId: string, type: DebtEntryType) => {
    setDebtModalClient(clientId)
    setDebtModalType(type)
  }

  const displayClients = clients
    .filter((c) => (showOnlyDebtors ? c.balance > 0 : true))
    .filter((c) =>
      searchQuery
        ? c.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )

  if (isLoading || !currentBranch) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-surface-50 dark:bg-surface-900">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 min-h-0">
        <div className="px-4 pt-6 sm:px-6 lg:px-8 shrink-0">
          <button
            onClick={() => navigate(`/branches/${branchId}/sessions`)}
            className="text-sm text-content-400 hover:text-content-600 dark:hover:text-content-300 transition-colors mb-5 block"
          >
            ← Volver a {currentBranch.name}
          </button>

          <div className="flex items-start justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold text-content-900 dark:text-white tracking-tight">
                Clientes
              </h1>
              <p className="text-sm text-content-400 mt-0.5">
                {clients.length} cliente{clients.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={() => navigate(`/branches/${branchId}/clients/new`)}
            >
              + Nuevo
            </Button>
          </div>

          <div className="flex items-center gap-3 mt-5 mb-4">
            <label className="flex items-center gap-2 text-sm text-content-500 dark:text-content-400 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={showOnlyDebtors}
                onChange={() => setShowOnlyDebtors(!showOnlyDebtors)}
                className="size-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500 dark:bg-surface-700 dark:border-surface-600"
              />
              Solo con deuda
            </label>

            <div className="relative flex-1 max-w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-content-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-content-700 dark:text-content-300 placeholder:text-content-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-8 sm:px-6 lg:px-8">
          {displayClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="size-10 text-content-300 dark:text-content-600 mb-4" />
              <p className="text-sm text-content-500 dark:text-content-400 mb-1">
                {searchQuery
                  ? 'No se encontraron clientes'
                  : showOnlyDebtors
                    ? 'No hay clientes con deuda'
                    : 'No hay clientes registrados'}
              </p>
              <p className="text-xs text-content-400 dark:text-content-500 mb-6">
                {searchQuery
                  ? 'Probá con otro nombre'
                  : showOnlyDebtors
                    ? 'Los clientes sin deuda están ocultos'
                    : 'Agregá clientes para llevar el control de sus deudas'}
              </p>
              {!searchQuery && !showOnlyDebtors && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/branches/${branchId}/clients/new`)}
                >
                  + Agregar cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  isExpanded={expandedId === client.id}
                  onToggleExpand={(id) =>
                    setExpandedId(expandedId === id ? null : id)
                  }
                  onRegisterDebt={handleRegisterDebt}
                  onEdit={(id) =>
                    navigate(`/branches/${branchId}/clients/${id}/edit`)
                  }
                  onDeleteClient={setDeleteClientId}
                  onDeleteEntry={(entryId, cId) => {
                    setDeleteEntryId(entryId)
                    setDeleteEntryClientId(cId)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <DebtEntryModal
          open={!!debtModalClient}
          type={debtModalType}
          onClose={() => setDebtModalClient(null)}
          onConfirm={handleAddEntry}
        />

        <DeleteConfirmModal
          open={!!deleteEntryId}
          title="Eliminar registro"
          message="¿Estás seguro de eliminar este registro? Esto afectará el saldo del cliente."
          onClose={() => {
            setDeleteEntryId(null)
            setDeleteEntryClientId(null)
          }}
          onConfirm={handleDeleteEntry}
        />

        <DeleteConfirmModal
          open={!!deleteClientId}
          title="Eliminar cliente"
          message="¿Estás seguro de eliminar este cliente? Los registros de deuda también se eliminarán."
          onClose={() => setDeleteClientId(null)}
          onConfirm={handleDeleteClient}
        />
      </div>
    </div>
  )
}
