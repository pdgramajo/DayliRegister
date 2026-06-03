import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './constants/routes'
import { ErrorBoundary } from './components/ErrorBoundary'

const BranchList = lazy(() =>
  import('./pages/Branch/BranchList').then((m) => ({ default: m.BranchList }))
)
const BranchNew = lazy(() =>
  import('./pages/Branch/BranchNew').then((m) => ({ default: m.BranchNew }))
)
const BranchEdit = lazy(() =>
  import('./pages/Branch/BranchEdit').then((m) => ({ default: m.BranchEdit }))
)
const BranchSessions = lazy(() =>
  import('./pages/Branch/BranchSessions').then((m) => ({
    default: m.BranchSessions,
  }))
)
const SessionNew = lazy(() =>
  import('./pages/Session/SessionNew').then((m) => ({
    default: m.SessionNew,
  }))
)
const SessionEdit = lazy(() =>
  import('./pages/Session/SessionEdit').then((m) => ({
    default: m.SessionEdit,
  }))
)
const SessionDetail = lazy(() =>
  import('./pages/Session/SessionDetail').then((m) => ({
    default: m.SessionDetail,
  }))
)
const TransactionNew = lazy(() =>
  import('./pages/Transaction/TransactionNew').then((m) => ({
    default: m.TransactionNew,
  }))
)
const InventoryMovementNew = lazy(() =>
  import('./pages/Inventory/InventoryMovementNew').then((m) => ({
    default: m.InventoryMovementNew,
  }))
)

const ProductList = lazy(() =>
  import('./pages/Product/ProductList').then((m) => ({
    default: m.ProductList,
  }))
)
const ProductNew = lazy(() =>
  import('./pages/Product/ProductNew').then((m) => ({
    default: m.ProductNew,
  }))
)
const ProductEdit = lazy(() =>
  import('./pages/Product/ProductEdit').then((m) => ({
    default: m.ProductEdit,
  }))
)
const ClientList = lazy(() =>
  import('./pages/Client/ClientList').then((m) => ({
    default: m.ClientList,
  }))
)
const ClientNew = lazy(() =>
  import('./pages/Client/ClientNew').then((m) => ({
    default: m.ClientNew,
  }))
)
const ClientEdit = lazy(() =>
  import('./pages/Client/ClientEdit').then((m) => ({
    default: m.ClientEdit,
  }))
)
const ReportPage = lazy(() =>
  import('./pages/Report/ReportPage').then((m) => ({
    default: m.ReportPage,
  }))
)
const InventoryMovements = lazy(() =>
  import('./pages/Inventory/InventoryMovements').then((m) => ({
    default: m.InventoryMovements,
  }))
)
const SettingsPage = lazy(() =>
  import('./pages/Settings/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  }))
)
const BackupPage = lazy(() =>
  import('./pages/Backup/BackupPage').then((m) => ({
    default: m.BackupPage,
  }))
)

const Loading = () => (
  <div
    role="status"
    aria-live="polite"
    aria-label="Cargando página"
    className="flex items-center justify-center h-64"
  >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
)

const App = () => {
  useEffect(() => {
    if (navigator.storage?.persist) {
      navigator.storage.persist().then((granted) => {
        if (granted) {
          console.log(
            'Storage persistente concedido — los datos no se borrarán automáticamente'
          )
        }
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 transition-colors">
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path={ROUTES.HOME} element={<BranchList />} />
            <Route path={ROUTES.BRANCHES} element={<BranchList />} />
            <Route path={ROUTES.BRANCH_NEW} element={<BranchNew />} />
            <Route path={ROUTES.BRANCH_EDIT} element={<BranchEdit />} />
            <Route path={ROUTES.BRANCH_SESSIONS} element={<BranchSessions />} />
            <Route path={ROUTES.BRANCH_SESSION_NEW} element={<SessionNew />} />
            <Route
              path={ROUTES.BRANCH_SESSION_DETAIL}
              element={<SessionDetail />}
            />
            <Route
              path={ROUTES.BRANCH_SESSION_EDIT}
              element={<SessionEdit />}
            />
            <Route
              path={ROUTES.BRANCH_SESSION_TRANSACTION_NEW}
              element={<TransactionNew />}
            />
            <Route
              path={ROUTES.BRANCH_SESSION_INVENTORY_NEW}
              element={<InventoryMovementNew />}
            />
            <Route path={ROUTES.BRANCH_PRODUCTS} element={<ProductList />} />
            <Route path={ROUTES.BRANCH_PRODUCT_NEW} element={<ProductNew />} />
            <Route
              path={ROUTES.BRANCH_PRODUCT_EDIT}
              element={<ProductEdit />}
            />
            <Route path={ROUTES.BRANCH_CLIENTS} element={<ClientList />} />
            <Route path={ROUTES.BRANCH_CLIENT_NEW} element={<ClientNew />} />
            <Route path={ROUTES.BRANCH_CLIENT_EDIT} element={<ClientEdit />} />
            <Route path={ROUTES.BRANCH_REPORT} element={<ReportPage />} />
            <Route
              path={ROUTES.BRANCH_INVENTORY}
              element={<InventoryMovements />}
            />
            <Route path={ROUTES.BACKUP} element={<BackupPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

export default App
