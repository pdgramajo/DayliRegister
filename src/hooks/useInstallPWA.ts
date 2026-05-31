import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  prompt(): Promise<void>
}

/**
 * Hook para detectar soporte e iniciar la instalación de la PWA.
 * - `isSupported`: el navegador disparó `beforeinstallprompt`
 * - `isInstalled`: la app ya está instalada (standalone mode) o se instaló en esta sesión
 * - `install()`: dispara el prompt de instalación
 */
export const useInstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Detectar si ya está instalada via display-mode
    const mql = window.matchMedia('(display-mode: standalone)')
    if (mql.matches) {
      setIsInstalled(true)
    }
    const handler = (e: MediaQueryListEvent) => setIsInstalled(e.matches)
    mql.addEventListener('change', handler)

    return () => mql.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const onAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  return {
    isSupported: deferredPrompt !== null,
    isInstalled,
    install,
  }
}
