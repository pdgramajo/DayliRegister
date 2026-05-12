import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () =>
      Math.random().toString(36).substring(2) + Date.now().toString(36),
  },
})
