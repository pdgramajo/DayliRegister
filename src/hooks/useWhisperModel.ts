import { useSyncExternalStore } from 'react'
import {
  preloadModel,
  onLoadStatusChange,
  getLoadStatus,
  retryLoad,
} from '../lib/whisperTranscriber'

/**
 * Subscribes to the Whisper model load status and triggers a preload on mount.
 *
 * Uses `useSyncExternalStore` for tear-free reads — the hook re-renders
 * exactly once when the status changes, even during concurrent rendering.
 */
export function useWhisperModel() {
  // Start preloading on first render (no-op if already loading/loaded)
  preloadModel()

  const status = useSyncExternalStore(
    (onStoreChange) => onLoadStatusChange(onStoreChange),
    getLoadStatus
  )

  return {
    /** Current load status: idle → loading → ready | error */
    status,
    /** `true` while the model is being downloaded / initialized */
    isLoading: status === 'loading',
    /** `true` when the model is fully loaded and ready for transcription */
    isReady: status === 'ready',
    /** `true` if the last load attempt failed */
    hasError: status === 'error',
    /** Retries loading after an error */
    retry: retryLoad,
  }
}
