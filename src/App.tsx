import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

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

const ROUTES = {
  HOME: '/',
  BRANCHES: '/branches',
  BRANCH_NEW: '/branches/new',
  BRANCH_EDIT: '/branches/:id',
  BRANCH_SESSIONS: '/branches/:id/sessions',
} as const

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
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path={ROUTES.HOME} element={<BranchList />} />
          <Route path={ROUTES.BRANCHES} element={<BranchList />} />
          <Route path={ROUTES.BRANCH_NEW} element={<BranchNew />} />
          <Route path={ROUTES.BRANCH_EDIT} element={<BranchEdit />} />
          <Route path={ROUTES.BRANCH_SESSIONS} element={<BranchSessions />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
