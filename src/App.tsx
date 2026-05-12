import { lazy, Suspense } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

const Loading = () => <div>Loading...</div>

const App = () => (
  <div>
    <nav>
      <Link to="/">Home</Link> | <Link to="/about">About</Link>
    </nav>
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  </div>
)

export default App
