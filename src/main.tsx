import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './components/ui/toast'
import { store } from './store'
import { LoggerService } from './services/LoggerService'
import './index.css'
import App from './App'

/* =========================================================
 * GLOBAL ERROR HANDLERS
 * =========================================================
 * Capture uncaught JS errors and unhandled promise rejections
 * that fall through React's error boundaries and async thunks.
 */

window.onerror = (_event, _source, _lineno, _colno, error): boolean => {
  LoggerService.error(
    `Uncaught error: ${error?.message ?? 'unknown'}`,
    'window.onerror',
    error
  )
  // Prevent default browser error handling
  return true
}

window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason
  LoggerService.error(
    `Unhandled rejection: ${error?.message ?? 'unknown'}`,
    'unhandledrejection',
    error
  )
})

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <ToastProvider />
          <App />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
)
