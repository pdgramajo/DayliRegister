import { Toaster as HotToaster, toast as hotToast } from 'react-hot-toast'

export const ToastProvider = () => (
  <HotToaster
    position="top-center"
    toastOptions={{
      duration: 1500,
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

export const toast = {
  success: (message: string) => {
    hotToast.success(message)
  },
  error: (message: string) => {
    hotToast.error(message)
  },
}
