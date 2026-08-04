import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSilenceDetector } from '../silenceDetector'

// Mock AudioContext and AnalyserNode
const mockGetByteFrequencyData = vi.fn()
const mockDisconnect = vi.fn()
const mockClose = vi.fn()

const mockAnalyser = {
  fftSize: 0,
  frequencyBinCount: 256,
  getByteFrequencyData: mockGetByteFrequencyData,
  disconnect: mockDisconnect,
}

const mockSource = {
  connect: vi.fn(),
  disconnect: mockDisconnect,
}

// Use a class so `new AudioContext()` works
class MockAudioContext {
  createAnalyser = vi.fn().mockReturnValue(mockAnalyser)
  createMediaStreamSource = vi.fn().mockReturnValue(mockSource)
  close = mockClose
}

// Mock MediaStream
const mockGetTracks = vi.fn().mockReturnValue([{ stop: vi.fn() }])
const mockStream = {
  getTracks: mockGetTracks,
}

const OriginalAudioContext = globalThis.AudioContext

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  mockGetByteFrequencyData.mockImplementation((arr: Uint8Array) => {
    arr.fill(0)
  })
  mockGetTracks.mockReturnValue([{ stop: vi.fn() }])
  ;(globalThis as any).AudioContext = MockAudioContext
})

afterEach(() => {
  vi.useRealTimers()
  ;(globalThis as any).AudioContext = OriginalAudioContext
})

describe('createSilenceDetector', () => {
  it('resolves after silenceDuration of silence', async () => {
    const detector = createSilenceDetector(mockStream as any, {
      silenceDuration: 1000,
      threshold: 30,
      checkInterval: 200,
    })

    const promise = detector.start()

    // setInterval fires at t=200,400,... First fire at t=200 sets silenceStart=200.
    // Need Date.now()-silenceStart >= 1000, so Date.now() >= 1200.
    // That's the 6th fire at t=1200.
    vi.advanceTimersByTime(1200)

    await promise
    expect(mockClose).toHaveBeenCalled()
  })

  it('does not resolve if sound is detected within silence window', async () => {
    let resolved = false
    const detector = createSilenceDetector(mockStream as any, {
      silenceDuration: 1000,
      threshold: 30,
      checkInterval: 200,
    })

    const promise = detector.start().then(() => {
      resolved = true
    })

    // t=200: first interval fires, silenceStart=200
    vi.advanceTimersByTime(200)

    // t=400: sound detected, silenceStart reset to null
    mockGetByteFrequencyData.mockImplementation((arr: Uint8Array) => {
      arr.fill(100)
    })
    vi.advanceTimersByTime(200)

    // t=1000: silence again from t=400, new silenceStart=600 (fire at 600)
    mockGetByteFrequencyData.mockImplementation((arr: Uint8Array) => {
      arr.fill(0)
    })
    vi.advanceTimersByTime(400)

    // Should NOT have resolved yet (silence since t=400 is only ~400ms at best)
    expect(resolved).toBe(false)

    // Now complete the full silence duration from new silenceStart
    // silenceStart was set at t=600, need t>=1600
    vi.advanceTimersByTime(1200)

    await promise
    expect(resolved).toBe(true)
  })

  it('stop() prevents resolution', async () => {
    let resolved = false
    const detector = createSilenceDetector(mockStream as any, {
      silenceDuration: 500,
      threshold: 30,
      checkInterval: 100,
    })

    detector.start().then(() => {
      resolved = true
    })

    vi.advanceTimersByTime(200)
    detector.stop()

    vi.advanceTimersByTime(2000)
    await vi.advanceTimersByTimeAsync(0)

    expect(resolved).toBe(false)
  })

  it('uses default options when none provided', async () => {
    const detector = createSilenceDetector(mockStream as any)

    const promise = detector.start()

    // Default: silenceDuration=2500, checkInterval=200
    // First fire at t=200 sets silenceStart=200.
    // Need Date.now() >= 200+2500 = 2700, i.e. fire at t=2800 (14th interval).
    vi.advanceTimersByTime(2800)

    await promise
    expect(mockClose).toHaveBeenCalled()
  })
})
