/**
 * Whisper transcription wrapper using @huggingface/transformers.
 * Loads the ONNX Whisper model in the browser and transcribes audio blobs.
 * The model is cached after first download for offline use.
 */

import {
  pipeline,
  type AutomaticSpeechRecognitionPipeline,
} from '@huggingface/transformers'

// whisper-small ONNX: significantly better accuracy for Spanish (~486MB download, cached after first use)
const MODEL_ID = 'onnx-community/whisper-small'

/** Whisper expects 16kHz mono Float32Array */
const WHISPER_SAMPLE_RATE = 16_000

let pipe: AutomaticSpeechRecognitionPipeline | null = null
let loadingPromise: Promise<AutomaticSpeechRecognitionPipeline> | null = null

// ── Model load status ───────────────────────────────────────────

export type WhisperLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

let loadStatus: WhisperLoadStatus = 'idle'
let loadError: string | null = null
type StatusListener = (status: WhisperLoadStatus) => void
const listeners = new Set<StatusListener>()

function setLoadStatus(status: WhisperLoadStatus) {
  loadStatus = status
  for (const fn of listeners) fn(status)
}

/**
 * Subscribe to model load status changes.
 * Returns an unsubscribe function.
 */
export function onLoadStatusChange(fn: StatusListener): () => void {
  listeners.add(fn)
  // Emit current state immediately
  fn(loadStatus)
  return () => {
    listeners.delete(fn)
  }
}

/** Returns the current model load status (synchronous). */
export function getLoadStatus(): WhisperLoadStatus {
  return loadStatus
}

/** Returns the error message if loadStatus === 'error', otherwise null. */
export function getLoadError(): string | null {
  return loadError
}

/**
 * Decodes a Blob (webm/opus, mp3, wav, etc.) into a Float32Array
 * resampled to 16kHz mono — the format Whisper expects.
 */
async function decodeAudioBlob(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer()
  const audioContext = new AudioContext()
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const raw = audioBuffer.getChannelData(0) // mono channel

    // Resample to 16kHz if the source rate differs
    if (audioBuffer.sampleRate === WHISPER_SAMPLE_RATE) {
      return raw
    }

    const ratio = audioBuffer.sampleRate / WHISPER_SAMPLE_RATE
    const newLength = Math.round(raw.length / ratio)
    const resampled = new Float32Array(newLength)
    for (let i = 0; i < newLength; i++) {
      resampled[i] = raw[Math.round(i * ratio)]
    }
    return resampled
  } finally {
    await audioContext.close()
  }
}

/**
 * Lazily loads the Whisper pipeline. Reuses the existing instance if already
 * loaded, or shares a single loading promise to avoid double-init.
 */
async function getPipeline(): Promise<AutomaticSpeechRecognitionPipeline> {
  if (pipe) return pipe

  if (!loadingPromise) {
    setLoadStatus('loading')
    loadingPromise = (async () => {
      const instance = await pipeline(
        'automatic-speech-recognition',
        MODEL_ID,
        {
          // Use WebGPU if available, fall back to WASM
          device: 'webgpu',
          // dtype: 'fp32',  // default
        }
      )
      pipe = instance
      setLoadStatus('ready')
      return instance
    })().catch((err) => {
      // Reset so we can retry
      loadingPromise = null
      loadError = err?.message ?? String(err)
      setLoadStatus('error')
      throw err
    })
  }

  return loadingPromise
}

/**
 * Eagerly starts downloading + loading the Whisper model in the background.
 * Safe to call multiple times — subsequent calls are no-ops if already
 * loading or loaded.
 */
export function preloadModel(): void {
  if (pipe || loadingPromise) return
  getPipeline().catch(() => {
    // Fallo silencioso: se reintentará al transcribir
  })
}

/**
 * Retries loading after an error. Resets state so getPipeline() will try again.
 */
export function retryLoad(): void {
  if (loadStatus !== 'error') return
  loadingPromise = null
  loadError = null
  preloadModel()
}

export interface WhisperOptions {
  /** ISO language code hint (e.g. 'es'). Omit for auto-detect. */
  language?: string
  /** Timeout in ms for the transcription. Default 30s. */
  timeout?: number
}

/**
 * Transcribes an audio Blob to text using the Whisper model.
 *
 * @param audio - Audio Blob (webm, mp3, wav, etc.)
 * @param options - Language hint and timeout
 * @returns Transcribed text string
 */
export async function transcribe(
  audio: Blob,
  options: WhisperOptions = {}
): Promise<string> {
  const { language = 'es', timeout = 30_000 } = options

  const instance = await getPipeline()

  // Decode Blob → Float32Array @ 16kHz (Whisper expects raw PCM samples)
  const audioData = await decodeAudioBlob(audio)

  const result = await Promise.race([
    instance(audioData, {
      language,
      task: 'transcribe', // force transcription (not translation to English)
      num_beams: 5, // beam search for better accuracy
      temperature: 0.0, // deterministic, no randomness
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Transcription timeout')), timeout)
    ),
  ])

  // result can be { text: string } or { chunks: [...] }
  if (Array.isArray(result)) {
    // Some pipeline versions return chunks — normalize whitespace to avoid double spaces
    const text = result
      .map((c: { text?: string }) => (c.text ?? '').trim())
      .filter(Boolean)
      .join(' ')
      .trim()
    return text
  }

  const text = (result as { text: string }).text.trim()
  return text
}

/**
 * Checks whether the Whisper model is loaded and ready.
 */
export function isLoaded(): boolean {
  return pipe !== null
}

/**
 * Checks whether WebGPU is available in this browser.
 */
export async function isWebGPUSupported(): Promise<boolean> {
  try {
    return typeof navigator !== 'undefined' && 'gpu' in navigator
  } catch {
    return false
  }
}
