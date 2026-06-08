import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppDispatch } from './useAppStore'
import {
  createTransaction,
  createInventoryMovement,
} from '../store/transactionSlice'
import { toast } from '../components/ui'
import { parseVoiceInput } from '../lib/voiceParser'
import type { InventoryCategory } from '../types/entities'

export type VoiceStatus = 'idle' | 'recording' | 'processing'

interface UseVoiceRecognitionOptions {
  branchId: string
  sessionId: string
  categories: InventoryCategory[]
}

export function useVoiceRecognition({
  branchId,
  sessionId,
  categories,
}: UseVoiceRecognitionOptions) {
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const recognitionRef = useRef<any>(null)
  const gotResultRef = useRef(false)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  const start = useCallback(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ??
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      toast.error(
        'Tu navegador no soporta reconocimiento de voz. Probá con Chrome o Edge.',
        2000
      )
      return
    }

    gotResultRef.current = false

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'es-AR'
    recognition.continuous = false
    recognition.interimResults = false // only final results for simplicity
    recognition.maxAlternatives = 1

    recognition.onresult = async (event: any) => {
      gotResultRef.current = true
      const text = event.results[0][0].transcript
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
  }, [categories, branchId, sessionId, dispatch])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  return { status, start, stop }
}
