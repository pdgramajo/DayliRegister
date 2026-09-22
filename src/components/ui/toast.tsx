import { Toaster as HotToaster, toast as hotToast } from 'react-hot-toast'
import type { Renderable, Toast } from 'react-hot-toast'

const InfoIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ minWidth: '20px', minHeight: '20px' }}
  >
    <circle cx="10" cy="10" r="10" fill="#3B82F6" />
    <circle cx="10" cy="6.5" r="1.25" fill="#fff" />
    <rect x="9" y="9.5" width="2" height="5" rx="0.5" fill="#fff" />
  </svg>
)

const TOAST_CONFIG = {
  duration: 1000,
  style: {
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '13px',
    maxWidth: '90vw',
  },
  success: {
    style: {
      background: '#10B981',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  },
  error: {
    style: {
      background: '#EF4444',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
    },
  },
  info: {
    style: {
      background: '#3B82F6',
      color: '#fff',
    },
    icon: <InfoIcon />,
  },
}

export const ToastProvider = () => (
  <HotToaster position="top-center" toastOptions={TOAST_CONFIG} />
)

const DEFAULT_DURATION = 1000

export const toast = {
  success: (message: string, duration: number = DEFAULT_DURATION) => {
    hotToast.success(message, { duration })
  },
  error: (message: string, duration: number = DEFAULT_DURATION) => {
    hotToast.error(message, { duration })
  },
  info: (message: string, duration: number = DEFAULT_DURATION) => {
    hotToast(message, { duration })
  },
  /**
   * Muestra un toast con contenido JSX personalizado.
   * Útil para notificaciones con botones de acción.
   */
  custom: (
    render: (t: Toast) => Renderable,
    options?: { duration?: number }
  ) => {
    return hotToast(render, {
      duration: options?.duration ?? DEFAULT_DURATION,
      ...options,
    })
  },
  /**
   * Descarta un toast por su id.
   */
  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId)
  },
}

export type ToastId = string
