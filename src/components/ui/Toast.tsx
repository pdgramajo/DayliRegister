import { Toaster as HotToaster } from 'react-hot-toast'

export const ToastProvider = () => (
  <HotToaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: {
        borderRadius: '8px',
        padding: '12px 16px',
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
    import('react-hot-toast').then(({ default: toast }) => {
      toast.success(message)
    })
  },
  error: (message: string) => {
    import('react-hot-toast').then(({ default: toast }) => {
      toast.error(message)
    })
  },
}
