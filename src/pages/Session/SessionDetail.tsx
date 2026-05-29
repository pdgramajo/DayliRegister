import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  fetchSessionById,
  closeSession,
  clearCurrentSession,
} from '../../store/sessionSlice'
import {
  fetchTransactionsBySession,
  fetchInventoryMovementsBySession,
  fetchInventoryCategories,
  deleteTransaction,
  deleteInventoryMovement,
  clearTransactions,
} from '../../store/transactionSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import { Button, Modal, MoneyInput, toast } from '../../components/ui'
import { Entities } from '../../types/entities'
import { SessionHeader } from './SessionHeader'
import { SummaryCards } from './SummaryCards'
import { TabSwitch } from './TabSwitch'
import { ActionButtons } from './ActionButtons'
import { TransactionList } from './TransactionList'
import { InventoryList } from './InventoryList'
import type { TabType, TransactionFilter } from './types'

export const SessionDetail = () => {
  const { id: branchId, sessionId } = useParams<{
    id: string
    sessionId: string
  }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const location = useLocation()
  const initialTab =
    new URLSearchParams(location.search).get('tab') === 'inventory'
      ? 'inventory'
      : 'movements'
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>('all')
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [closingBalance, setClosingBalance] = useState<number | undefined>()
  const [closeError, setCloseError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'transaction' | 'inventory'
    id: string
  } | null>(null)

  const { currentSession, isLoading: sessionLoading } = useAppSelector(
    (state: RootState) => state.sessions
  )
  const {
    transactions,
    inventoryMovements,
    inventoryCategories,
    isLoading: transactionsLoading,
  } = useAppSelector((state: RootState) => state.transactions)

  useEffect(() => {
    if (sessionId) {
      dispatch(fetchSessionById(sessionId))
      dispatch(fetchTransactionsBySession(sessionId))
      dispatch(fetchInventoryMovementsBySession(sessionId))
      dispatch(fetchInventoryCategories())
    }
    return () => {
      dispatch(clearCurrentSession())
      dispatch(clearTransactions())
    }
  }, [dispatch, sessionId])

  const handleCloseSession = () => {
    setClosingBalance(cashInBox)
    setCloseError(null)
    setShowCloseModal(true)
  }

  const confirmCloseSession = () => {
    if (
      closingBalance === undefined ||
      isNaN(closingBalance) ||
      closingBalance < 0
    ) {
      setCloseError('Ingrese un balance válido')
      return
    }
    if (!branchId || !sessionId) return
    dispatch(closeSession({ id: sessionId, closingBalance }))
      .unwrap()
      .then(() => {
        toast.success('Sesión cerrada correctamente')
        setShowCloseModal(false)
      })
      .catch((error) => toast.error(error || 'Error al cerrar la sesión'))
  }

  const handleDeleteTransaction = (id: string) => {
    setDeleteTarget({ type: 'transaction', id })
  }

  const handleDeleteInventoryMovement = (id: string) => {
    setDeleteTarget({ type: 'inventory', id })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'transaction') {
      dispatch(deleteTransaction(deleteTarget.id))
        .unwrap()
        .then(() => {
          toast.success('Transacción eliminada')
          setDeleteTarget(null)
        })
        .catch((error) =>
          toast.error(error || 'Error al eliminar la transacción')
        )
    } else {
      dispatch(deleteInventoryMovement(deleteTarget.id))
        .unwrap()
        .then(() => {
          toast.success('Movimiento eliminado')
          setDeleteTarget(null)
        })
        .catch((error) =>
          toast.error(error || 'Error al eliminar el movimiento')
        )
    }
  }

  const navigateToTransaction = (type: string) =>
    navigate(
      `/branches/${branchId}/sessions/${sessionId}/transaction/new?type=${type}`
    )
  const navigateToInventory = (type: string) =>
    navigate(
      `/branches/${branchId}/sessions/${sessionId}/inventory/new?type=${type}`
    )

  if (sessionLoading || !currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const isOpen = currentSession.status === Entities.CashSessionStatus.OPEN

  const cashSales = transactions
    .filter(
      (t) =>
        t.type === Entities.TransactionTypes.SALE &&
        t.paymentMethod === Entities.PaymentMethods.CASH
    )
    .reduce((s, t) => s + t.amount, 0)
  const transferSales = transactions
    .filter(
      (t) =>
        t.type === Entities.TransactionTypes.SALE &&
        t.paymentMethod === Entities.PaymentMethods.TRANSFER
    )
    .reduce((s, t) => s + t.amount, 0)
  const totalSales = transactions
    .filter((t) => t.type === Entities.TransactionTypes.SALE)
    .reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions
    .filter((t) => t.type === Entities.TransactionTypes.EXPENSE)
    .reduce((s, t) => s + t.amount, 0)
  const totalWithdrawals = transactions
    .filter((t) => t.type === Entities.TransactionTypes.WITHDRAWAL)
    .reduce((s, t) => s + t.amount, 0)
  const totalIncome = transactions
    .filter((t) => t.type === Entities.TransactionTypes.INCOME)
    .reduce((s, t) => s + t.amount, 0)
  const cashInBox =
    (currentSession.initialAmount || 0) +
    cashSales +
    totalIncome -
    totalExpenses -
    totalWithdrawals

  const handleNavigate = (path: string) => {
    if (activeTab === 'movements') navigateToTransaction(path)
    else navigateToInventory(path)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <SessionHeader
        name={currentSession.name}
        isOpen={isOpen}
        onClose={handleCloseSession}
        onBack={() => navigate(`/branches/${branchId}/sessions`)}
      />
      <SummaryCards
        cashSales={cashSales}
        transferSales={transferSales}
        totalSales={totalSales}
        cashInBox={cashInBox}
      />
      <TabSwitch
        activeTab={activeTab}
        onChange={setActiveTab}
        transactionCount={transactions.length}
        inventoryCount={inventoryMovements.length}
      />
      <ActionButtons
        type={activeTab}
        isOpen={isOpen}
        onNavigate={handleNavigate}
      />
      {activeTab === 'movements' ? (
        <TransactionList
          transactions={transactions}
          isLoading={transactionsLoading}
          filter={transactionFilter}
          isOpen={isOpen}
          onFilterChange={setTransactionFilter}
          onDelete={handleDeleteTransaction}
        />
      ) : (
        <InventoryList
          movements={inventoryMovements}
          categories={inventoryCategories}
          isLoading={transactionsLoading}
          isOpen={isOpen}
          onDelete={handleDeleteInventoryMovement}
        />
      )}

      <Modal
        open={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Cerrar sesión"
      >
        <p className="text-sm text-content-500 mb-4">{currentSession?.name}</p>
        <div className="space-y-2 mb-4">
          <span className="text-sm font-medium text-content-700 dark:text-content-300">
            Balance de cierre
          </span>
          <MoneyInput
            id="closingBalance"
            autoComplete="off"
            value={closingBalance}
            onChange={(v) => {
              setClosingBalance(v)
              setCloseError(null)
            }}
          />
          {closeError && <p className="text-sm text-red-500">{closeError}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowCloseModal(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmCloseSession}>
            Cerrar sesión
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={
          deleteTarget?.type === 'transaction'
            ? 'Eliminar transacción'
            : 'Eliminar movimiento'
        }
      >
        <p className="text-sm text-content-500 mb-6">
          {deleteTarget?.type === 'transaction'
            ? '¿Eliminar esta transacción?'
            : '¿Eliminar este movimiento de inventario?'}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
