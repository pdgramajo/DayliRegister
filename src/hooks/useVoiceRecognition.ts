import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppDispatch } from './useAppStore'
import {
  createTransaction,
  createInventoryMovement,
} from '../store/transactionSlice'
import { toast } from '../components/ui'
import { parseVoiceInput } from '../lib/voiceParser'
import { transcribe } from '../lib/whisperTranscriber'
import { createSilenceDetector } from '../lib/silenceDetector'
import type { InventoryCategory } from '../types/entities'

export type VoiceStatus = 'idle' | 'recording' | 'processing'

interface UseVoiceRecognitionOptions {
  branchId: string
  sessionId: string
  categories: InventoryCategory[]
}

/**
 * Voice recognition hook that uses:
 * - Online: MediaRecorder + Whisper (via @huggingface/transformers)
 * - Offline fallback: Web Speech API (browser built-in)
 *
 * Audio is recorded locally, transcribed via Whisper running in the browser
 * (ONNX model cached after first download), and parsed into structured data
 * using the existing voiceParser.
 *
 * Recording auto-stops after detecting silence (2.5s).
 * The same { status, start, stop } interface is preserved.
 */
export function useVoiceRecognition({
  branchId,
  sessionId,
  categories,
}: UseVoiceRecognitionOptions) {
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<VoiceStatus>('idle')

  // Refs for MediaRecorder flow
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const silenceDetectorRef = useRef<ReturnType<
    typeof createSilenceDetector
  > | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Refs for Web Speech API fallback
  const recognitionRef = useRef<any>(null)
  const gotResultRef = useRef(false)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      silenceDetectorRef.current?.stop()
      recognitionRef.current?.abort()
    }
  }, [])

  // ── Shared: process transcript through parser and dispatch ─────

  const processTranscript = useCallback(
    async (text: string) => {
      setStatus('processing')

      const parsed = parseVoiceInput(text, categories)
      if (!parsed) {
        toast.error(
          `No se entendió "${text}". Probá con "venta 500 efectivo", "gasto 200", etc.`,
          2000
        )
        setStatus('idle')
        return
      }

      try {
        if (parsed.type === 'transaction') {
          const amountStr = `$${parsed.amount.toLocaleString('es-AR')}`
          const paymentStr =
            parsed.transactionType === 'sale'
              ? parsed.paymentMethod === 'cash'
                ? ' - Efectivo'
                : ' - Transferencia'
              : ''
          const typeLabel: Record<string, string> = {
            sale: 'Venta',
            expense: 'Gasto',
            withdrawal: 'Retiro',
            income: 'Ingreso',
          }

          await dispatch(
            createTransaction({
              sessionId,
              branchId,
              type: parsed.transactionType,
              amount: parsed.amount,
              paymentMethod:
                parsed.transactionType === 'sale'
                  ? parsed.paymentMethod
                  : undefined,
              ...(parsed.description
                ? { description: parsed.description }
                : {}),
            })
          ).unwrap()

          const descStr = parsed.description ? ` - ${parsed.description}` : ''
          toast.success(
            `${typeLabel[parsed.transactionType]} ${amountStr}${paymentStr}${descStr}`,
            2000
          )
        } else {
          // Find category by name
          const category = categories.find(
            (c) => c.name.toLowerCase() === parsed.categoryName.toLowerCase()
          )
          if (!category) {
            throw new Error(`Categoría "${parsed.categoryName}" no encontrada`)
          }

          await dispatch(
            createInventoryMovement({
              sessionId,
              branchId,
              inventoryCategoryId: category.id,
              type: parsed.movementType,
              quantity: parsed.quantity,
              notes: parsed.notes,
            })
          ).unwrap()

          const typeLabel = parsed.movementType === 'in' ? 'Entrada' : 'Salida'
          toast.success(
            `${typeLabel}: ${parsed.quantity} ${parsed.categoryName}${parsed.notes ? ` (${parsed.notes})` : ''}`,
            2000
          )
        }
      } catch (err: any) {
        toast.error(
          typeof err === 'string' ? err : err?.message || 'Error al crear',
          2000
        )
      }

      setStatus('idle')
    },
    [categories, branchId, sessionId, dispatch]
  )

  // ── Online flow: MediaRecorder + Whisper ───────────────────────

  const startMediaRecorder = useCallback(async () => {
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      toast.error(
        'Permiso de micrófono denegado. Permití el acceso e intentá de nuevo.',
        2000
      )
      setStatus('idle')
      return
    }

    streamRef.current = stream
    audioChunksRef.current = []

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm',
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      // Stop all mic tracks
      stream.getTracks().forEach((t) => t.stop())

      if (audioChunksRef.current.length === 0) {
        toast.error('No se grabó audio. Intentá de nuevo.', 2000)
        setStatus('idle')
        return
      }

      const audioBlob = new Blob(audioChunksRef.current, {
        type: mediaRecorder.mimeType,
      })

      // Check if audio is too short (< 0.5s of data)
      if (audioBlob.size < 1000) {
        toast.error('Audio muy corto. Hablá un poco más.', 2000)
        setStatus('idle')
        return
      }

      try {
        const text = await transcribe(audioBlob, { language: 'es' })
        if (!text || text.trim().length === 0) {
          toast.error('No se detectó voz. Intentá de nuevo.', 2000)
          setStatus('idle')
          return
        }
        await processTranscript(text)
      } catch (err: any) {
        toast.error(
          err?.message === 'Transcription timeout'
            ? 'La transcripción tardó demasiado. Intentá de nuevo.'
            : `Error de transcripción: ${err?.message || 'desconocido'}`,
          2000
        )
        setStatus('idle')
      }
    }

    // Start silence detection for auto-stop
    const detector = createSilenceDetector(stream, {
      silenceDuration: 2500,
      threshold: 30,
      checkInterval: 200,
    })
    silenceDetectorRef.current = detector

    // Start recording
    mediaRecorder.start(250) // collect data every 250ms
    mediaRecorderRef.current = mediaRecorder
    setStatus('recording')

    // Start silence detection — auto-stop after 2.5s of silence
    detector.start().then(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop()
        silenceDetectorRef.current = null
      }
    })
  }, [processTranscript])

  const stopMediaRecorder = useCallback(() => {
    silenceDetectorRef.current?.stop()
    silenceDetectorRef.current = null
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  // ── Offline fallback: Web Speech API ───────────────────────────

  const startWebSpeechRecognition = useCallback(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ??
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      toast.error(
        'Tu navegador no soporta reconocimiento de voz. Probá con Chrome o Edge.',
        2000
      )
      setStatus('idle')
      return
    }

    gotResultRef.current = false

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'es-AR'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      gotResultRef.current = true
      const text = event.results[0][0].transcript
      processTranscript(text)
    }

    recognition.onerror = (event: any) => {
      gotResultRef.current = true
      const errorMap: Record<string, string> = {
        'not-allowed':
          'Permiso de micrófono denegado. Permití el acceso e intentá de nuevo.',
        'no-speech': 'No se detectó voz. Intentá de nuevo.',
        'audio-capture':
          'No se encontró micrófono. Conectá uno e intentá de nuevo.',
        network: 'Error de red. Verificá tu conexión.',
        'service-not-allowed': 'Reconocimiento de voz no disponible.',
      }
      toast.error(errorMap[event.error] || `Error: ${event.error}`, 2000)
      setStatus('idle')
    }

    recognition.onend = () => {
      if (!gotResultRef.current) {
        toast.error('No se detectó voz. Intentá de nuevo.', 2000)
        setStatus('idle')
      }
    }

    recognition.start()
    recognitionRef.current = recognition
    setStatus('recording')
  }, [processTranscript])

  // ── Public API ─────────────────────────────────────────────────

  const start = useCallback(() => {
    const online = navigator.onLine
    if (online) {
      startMediaRecorder()
    } else {
      startWebSpeechRecognition()
    }
  }, [startMediaRecorder, startWebSpeechRecognition])

  const stop = useCallback(() => {
    if (navigator.onLine) {
      stopMediaRecorder()
    } else {
      recognitionRef.current?.stop()
    }
  }, [stopMediaRecorder])

  return { status, start, stop }
}
