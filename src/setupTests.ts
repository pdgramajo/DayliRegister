import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () =>
      Math.random().toString(36).substring(2) + Date.now().toString(36),
  },
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
