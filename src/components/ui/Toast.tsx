import { Toaster as HotToaster } from 'react-hot-toast'

export const ToastProvider = () => (
  <HotToaster
    position="top-center"
    toastOptions={{
      duration: 1500,
      style: {
        borderRadius: '6px',
        padding: '6px 10px',
        fontSize: '12px',
        maxWidth: '120px',
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
      toast.success(message, {
        duration: 1500,
        style: {
          borderRadius: '6px',
          padding: '6px 10px',
          fontSize: '12px',
          maxWidth: '120px',
        },
      })
    })
  },
  error: (message: string) => {
    import('react-hot-toast').then(({ default: toast }) => {
      toast.error(message, {
        duration: 1500,
        style: {
          borderRadius: '6px',
          padding: '6px 10px',
          fontSize: '12px',
          maxWidth: '120px',
        },
      })
    })
  },
}
