/**
 * Silence detection using the Web Audio API.
 *
 * Monitors a MediaStream and resolves when the audio level stays below
 * a threshold for a configurable duration. Useful for auto-stopping
 * a MediaRecorder after the user stops speaking.
 */

export interface SilenceDetectorOptions {
  /** Duration of silence (ms) before resolving. Default 2500. */
  silenceDuration?: number
  /** RMS threshold (0-255) below which audio is considered silent. Default 30. */
  threshold?: number
  /** How often to check audio levels (ms). Default 200. */
  checkInterval?: number
}

export interface SilenceDetector {
  /** Start monitoring the stream. Resolves when silence is detected. */
  start: () => Promise<void>
  /** Stop monitoring without triggering resolution. */
  stop: () => void
}

/**
 * Creates a silence detector for a given MediaStream.
 *
 * @example
 * ```ts
 * const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
 * const detector = createSilenceDetector(stream, { silenceDuration: 3000 })
 * detector.start().then(() => {
 *   // User stopped speaking — stop recording
 *   recorder.stop()
 * })
 * ```
 */
export function createSilenceDetector(
  stream: MediaStream,
  options: SilenceDetectorOptions = {}
): SilenceDetector {
  const {
    silenceDuration = 2500,
    threshold = 30,
    checkInterval = 200,
  } = options

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let source: MediaStreamAudioSourceNode | null = null
  let intervalId: ReturnType<typeof setInterval> | null = null
  let resolvePromise: (() => void) | null = null
  let silenceStart: number | null = null
  let stopped = false

  const cleanup = () => {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
    source?.disconnect()
    analyser?.disconnect()
    audioContext?.close()
    source = null
    analyser = null
    audioContext = null
    silenceStart = null
  }

  const start = (): Promise<void> => {
    return new Promise<void>((resolve) => {
      resolvePromise = resolve
      stopped = false

      audioContext = new AudioContext()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 256

      source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      intervalId = setInterval(() => {
        if (stopped) return

        analyser?.getByteFrequencyData(dataArray)

        // Calculate RMS level
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const average = sum / dataArray.length

        if (average < threshold) {
          if (silenceStart === null) {
            silenceStart = Date.now()
          } else if (Date.now() - silenceStart >= silenceDuration) {
            // Silence threshold reached
            cleanup()
            resolvePromise?.()
          }
        } else {
          // Sound detected, reset silence timer
          silenceStart = null
        }
      }, checkInterval)
    })
  }

  const stop = () => {
    stopped = true
    cleanup()
  }

  return { start, stop }
}
