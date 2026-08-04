import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock @huggingface/transformers — hoisted by vitest
const mockPipeline = vi.fn()

vi.mock('@huggingface/transformers', () => ({
  pipeline: mockPipeline,
}))

// Mock AudioContext for decodeAudioBlob
const mockDecodeAudioData = vi.fn()
const mockGetChannelData = vi.fn()
const mockClose = vi.fn()

const mockAudioBuffer = {
  sampleRate: 48000,
  getChannelData: mockGetChannelData,
}

class MockAudioContext {
  decodeAudioData = mockDecodeAudioData
  close = mockClose
}

const OriginalAudioContext = globalThis.AudioContext

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  ;(globalThis as any).AudioContext = MockAudioContext

  // Default: decodeAudioData returns a buffer with some samples
  const fakeSamples = new Float32Array(48000) // 1s of silence at 48kHz
  mockDecodeAudioData.mockResolvedValue(mockAudioBuffer)
  mockGetChannelData.mockReturnValue(fakeSamples)
  mockClose.mockResolvedValue(undefined)
})

afterEach(() => {
  ;(globalThis as any).AudioContext = OriginalAudioContext
})

// Re-import after mocks are set
let transcribe: typeof import('../whisperTranscriber').transcribe
let isWebGPUSupported: typeof import('../whisperTranscriber').isWebGPUSupported

beforeEach(async () => {
  vi.resetModules()
  vi.clearAllMocks()
  ;(globalThis as any).AudioContext = MockAudioContext
  mockDecodeAudioData.mockResolvedValue(mockAudioBuffer)
  mockGetChannelData.mockReturnValue(new Float32Array(48000))
  mockClose.mockResolvedValue(undefined)

  const mod = await import('../whisperTranscriber')
  transcribe = mod.transcribe
  isWebGPUSupported = mod.isWebGPUSupported
})

describe('whisperTranscriber', () => {
  describe('transcribe', () => {
    it('returns transcribed text from audio blob', async () => {
      const mockTranscribeFn = vi.fn().mockResolvedValue({ text: 'venta 500' })
      mockPipeline.mockResolvedValue(mockTranscribeFn)

      const blob = new Blob(['fake-audio'], { type: 'audio/webm' })
      const result = await transcribe(blob)

      expect(result).toBe('venta 500')
    })

    it('decodes Blob to Float32Array and resamples to 16kHz', async () => {
      const mockTranscribeFn = vi.fn().mockResolvedValue({ text: 'test' })
      mockPipeline.mockResolvedValue(mockTranscribeFn)

      // Simulate 48kHz audio (3 seconds)
      const samples48k = new Float32Array(48000 * 3)
      mockGetChannelData.mockReturnValue(samples48k)

      const blob = new Blob(['audio'], { type: 'audio/webm' })
      await transcribe(blob)

      // Should have called decodeAudioData with an ArrayBuffer
      expect(mockDecodeAudioData).toHaveBeenCalled()
      const arrayBuffer = mockDecodeAudioData.mock.calls[0][0]
      expect(arrayBuffer).toBeInstanceOf(ArrayBuffer)

      // Pipeline should receive a Float32Array (resampled to 16kHz)
      const receivedAudio = mockTranscribeFn.mock.calls[0][0]
      expect(receivedAudio).toBeInstanceOf(Float32Array)
      // 48kHz × 3s = 144000 samples → resampled to 16kHz = 48000 samples
      expect(receivedAudio.length).toBe(48000)
    })

    it('skips resampling when audio is already 16kHz', async () => {
      const mockTranscribeFn = vi.fn().mockResolvedValue({ text: 'test' })
      mockPipeline.mockResolvedValue(mockTranscribeFn)

      // Simulate 16kHz audio
      const samples16k = new Float32Array(16000 * 2)
      mockGetChannelData.mockReturnValue(samples16k)
      mockAudioBuffer.sampleRate = 16000

      const blob = new Blob(['audio'], { type: 'audio/webm' })
      await transcribe(blob)

      const receivedAudio = mockTranscribeFn.mock.calls[0][0]
      expect(receivedAudio.length).toBe(32000)

      // Restore
      mockAudioBuffer.sampleRate = 48000
    })

    it('passes language option to pipeline', async () => {
      const mockTranscribeFn = vi.fn().mockResolvedValue({ text: 'test' })
      mockPipeline.mockResolvedValue(mockTranscribeFn)

      const blob = new Blob(['audio'], { type: 'audio/webm' })
      await transcribe(blob, { language: 'es' })

      expect(mockTranscribeFn).toHaveBeenCalledWith(
        expect.any(Float32Array),
        expect.objectContaining({ language: 'es' })
      )
    })

    it('handles array result format', async () => {
      const mockTranscribeFn = vi
        .fn()
        .mockResolvedValue([{ text: 'venta ' }, { text: 'quinientos' }])
      mockPipeline.mockResolvedValue(mockTranscribeFn)

      const blob = new Blob(['audio'], { type: 'audio/webm' })
      const result = await transcribe(blob)

      expect(result).toBe('venta quinientos')
    })

    it('trims whitespace from result', async () => {
      const mockTranscribeFn = vi.fn().mockResolvedValue({ text: '  hello  ' })
      mockPipeline.mockResolvedValue(mockTranscribeFn)

      const blob = new Blob(['audio'], { type: 'audio/webm' })
      const result = await transcribe(blob)

      expect(result).toBe('hello')
    })

    it('throws on timeout', async () => {
      const mockTranscribeFn = vi.fn().mockReturnValue(new Promise(() => {}))
      mockPipeline.mockResolvedValue(mockTranscribeFn)

      const blob = new Blob(['audio'], { type: 'audio/webm' })

      await expect(transcribe(blob, { timeout: 100 })).rejects.toThrow(
        'Transcription timeout'
      )
    })

    it('uses default language es when none specified', async () => {
      const mockTranscribeFn = vi.fn().mockResolvedValue({ text: 'hola' })
      mockPipeline.mockResolvedValue(mockTranscribeFn)

      const blob = new Blob(['audio'], { type: 'audio/webm' })
      await transcribe(blob)

      expect(mockTranscribeFn).toHaveBeenCalledWith(
        expect.any(Float32Array),
        expect.objectContaining({ language: 'es' })
      )
    })
  })

  describe('isWebGPUSupported', () => {
    it('returns true when navigator.gpu exists', async () => {
      ;(navigator as any).gpu = {}
      const result = await isWebGPUSupported()
      expect(result).toBe(true)
    })

    it('returns false when navigator.gpu is missing', async () => {
      const original = (navigator as any).gpu
      delete (navigator as any).gpu
      const result = await isWebGPUSupported()
      expect(result).toBe(false)
      if (original) (navigator as any).gpu = original
    })
  })
})
