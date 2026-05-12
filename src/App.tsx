import { lazy, Suspense } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
} as const

const Loading = () => (
  <div role="status" aria-live="polite" aria-label="Cargando página">
    <span className="loading-spinner" />
  </div>
)

const App = () => (
  <div>
    <nav aria-label="Navegación principal">
      <Link to={ROUTES.HOME}>Home</Link>
      {' | '}
      <Link to={ROUTES.ABOUT}>About</Link>
    </nav>
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.ABOUT} element={<About />} />
      </Routes>
    </Suspense>
  </div>
)

export default App
