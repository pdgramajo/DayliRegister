import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

/**
 * Aviso global de nueva versión de la PWA.
 *
 * Con `registerType: 'prompt'` el Service Worker nuevo NUNCA toma control a
 * mitad de sesión (evita que se rompan los chunks lazy y los recargos
 * forzados). Este banner le avisa al usuario que hay una versión nueva y lo
 * invita a recargar cuando lo desee.
 *
 * "Ahora no" solo oculta el aviso por ahora: la versión vieja sigue
 * funcionando sin problemas y el aviso reaparece en la próxima visita.
 */
export const PwaUpdateBanner = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white px-4 py-3 shadow-lg dark:border-surface-700 dark:bg-surface-800">
        <RefreshCw className="size-4 shrink-0 text-brand-600 dark:text-brand-400" />
        <p className="text-sm font-medium text-content-900 dark:text-content-100">
          Nueva versión disponible
        </p>
        <Button size="sm" onClick={() => updateServiceWorker(true)}>
          Recargar
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setNeedRefresh(false)}>
          Ahora no
        </Button>
      </div>
    </div>
  )
}
