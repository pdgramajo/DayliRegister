import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Mic, Loader2 } from 'lucide-react'
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
  setTransactionFilter,
} from '../../store/transactionSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import { Button, Modal, MoneyInput, toast } from '../../components/ui'
import { Entities } from '../../types/entities'
import { TABS, DELETE_TARGET_TYPES } from '../../constants/session'
import { ROUTES, buildRoute } from '../../constants/routes'
import { SessionHeaderOpen, SessionHeaderClosed } from './SessionHeader'
import { SummaryCards } from './SummaryCards'
import { TabSwitch } from './TabSwitch'
import { MovementActionButtons, InventoryActionButtons } from './ActionButtons'
import { TransactionList } from './TransactionList'
import { InventoryList } from './InventoryList'
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition'
import type { TabType } from './types'

export const SessionDetail = () => {
  const { id: branchId, sessionId } = useParams<{
    id: string
    sessionId: string
  }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const location = useLocation()
  const initialTab =
    new URLSearchParams(location.search).get('tab') === TABS.INVENTORY
      ? TABS.INVENTORY
      : TABS.MOVEMENTS
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [closingBalance, setClosingBalance] = useState<number | undefined>()
  const [closeError, setCloseError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: (typeof DELETE_TARGET_TYPES)[keyof typeof DELETE_TARGET_TYPES]
    id: string
  } | null>(null)

  const { currentSession, isLoading: sessionLoading } = useAppSelector(
    (state: RootState) => state.sessions
  )
  const {
    transactions,
    inventoryMovements,
    inventoryCategories,
    transactionFilter,
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
    setDeleteTarget({ type: DELETE_TARGET_TYPES.TRANSACTION, id })
  }

  const handleDeleteInventoryMovement = (id: string) => {
    setDeleteTarget({ type: DELETE_TARGET_TYPES.INVENTORY, id })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === DELETE_TARGET_TYPES.TRANSACTION) {
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
      `${buildRoute(ROUTES.BRANCH_SESSION_TRANSACTION_NEW, { id: branchId, sessionId })}?type=${type}`
    )
  const navigateToInventory = (type: string) =>
    navigate(
      `${buildRoute(ROUTES.BRANCH_SESSION_INVENTORY_NEW, { id: branchId, sessionId })}?type=${type}`
    )

  const {
    status: voiceStatus,
    start: startVoice,
    stop: stopVoice,
  } = useVoiceRecognition({
    branchId: branchId!,
    sessionId: sessionId!,
    categories: inventoryCategories,
  })

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

  return (
    <div className="flex flex-col h-dvh max-w-2xl mx-auto px-4 pt-4">
      {isOpen ? (
        <SessionHeaderOpen
          name={currentSession.name}
          onClose={handleCloseSession}
          onBack={() =>
            navigate(buildRoute(ROUTES.BRANCH_SESSIONS, { id: branchId }))
          }
        />
      ) : (
        <SessionHeaderClosed
          name={currentSession.name}
          onBack={() =>
            navigate(buildRoute(ROUTES.BRANCH_SESSIONS, { id: branchId }))
          }
        />
      )}
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
      {isOpen && activeTab === TABS.MOVEMENTS && (
        <MovementActionButtons onNavigate={navigateToTransaction} />
      )}
      {isOpen && activeTab === TABS.INVENTORY && (
        <InventoryActionButtons onNavigate={navigateToInventory} />
      )}
      <div className="flex-1 min-h-0 flex flex-col">
        {activeTab === TABS.MOVEMENTS ? (
          <TransactionList
            transactions={transactions}
            isLoading={transactionsLoading}
            filter={transactionFilter}
            isOpen={isOpen}
            onFilterChange={(f) => dispatch(setTransactionFilter(f))}
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
      </div>

      {/* FAB - Ingreso por voz */}
      {isOpen && (
        <button
          onClick={voiceStatus === 'recording' ? stopVoice : startVoice}
          disabled={voiceStatus === 'processing'}
          className={`fixed bottom-6 right-4 sm:right-6 z-40 flex items-center justify-center size-14 rounded-full shadow-lg transition-all duration-200 ${
            voiceStatus === 'recording'
              ? 'bg-red-500 text-white animate-pulse shadow-xl'
              : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed'
          }`}
          aria-label={
            voiceStatus === 'recording'
              ? 'Detener grabación'
              : 'Ingreso por voz'
          }
        >
          {voiceStatus === 'processing' ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Mic className="size-6" />
          )}
        </button>
      )}

      <Modal open={showCloseModal} onClose={() => setShowCloseModal(false)}>
        <Modal.Content title="Cerrar sesión">
          <p className="text-sm text-content-500 mb-4">
            {currentSession?.name}
          </p>
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
        </Modal.Content>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <Modal.Content
          title={
            deleteTarget?.type === DELETE_TARGET_TYPES.TRANSACTION
              ? 'Eliminar transacción'
              : 'Eliminar movimiento'
          }
        >
          <p className="text-sm text-content-500 mb-6">
            {deleteTarget?.type === DELETE_TARGET_TYPES.TRANSACTION
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
        </Modal.Content>
      </Modal>
    </div>
  )
}
