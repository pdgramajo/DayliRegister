import { Toaster as HotToaster, toast as hotToast } from 'react-hot-toast'
import type { Renderable, Toast } from 'react-hot-toast'

export const ToastProvider = () => (
  <HotToaster
    position="top-center"
    toastOptions={{
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
    }}
  />
)

const DEFAULT_DURATION = 1000

export const toast = {
  success: (message: string, duration: number = DEFAULT_DURATION) => {
    hotToast.success(message, { duration })
  },
  error: (message: string, duration: number = DEFAULT_DURATION) => {
    hotToast.error(message, { duration })
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
