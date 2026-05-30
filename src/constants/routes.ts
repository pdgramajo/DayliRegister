export const ROUTES = {
  HOME: '/',
  BRANCHES: '/branches',
  BRANCH_NEW: '/branches/new',
  BRANCH_EDIT: '/branches/:id',
  BRANCH_SESSIONS: '/branches/:id/sessions',
  BRANCH_SESSION_NEW: '/branches/:id/sessions/new',
  BRANCH_SESSION_DETAIL: '/branches/:id/sessions/:sessionId',
  BRANCH_SESSION_EDIT: '/branches/:id/sessions/:sessionId/edit',
  BRANCH_SESSION_TRANSACTION_NEW:
    '/branches/:id/sessions/:sessionId/transaction/new',
  BRANCH_SESSION_INVENTORY_NEW:
    '/branches/:id/sessions/:sessionId/inventory/new',
  BRANCH_PRODUCTS: '/branches/:id/products',
  BRANCH_PRODUCT_NEW: '/branches/:id/products/new',
  BRANCH_PRODUCT_EDIT: '/branches/:id/products/:productId/edit',
  BRANCH_CLIENTS: '/branches/:id/clients',
  BRANCH_CLIENT_NEW: '/branches/:id/clients/new',
  BRANCH_CLIENT_EDIT: '/branches/:id/clients/:clientId/edit',
  BRANCH_REPORT: '/branches/:id/report',
  BRANCH_INVENTORY: '/branches/:id/inventory',
} as const

type RouteParams = Record<string, string>

/**
 * Reemplaza los parámetros `:param` en un patrón de ruta con valores reales.
 *
 * @example
 * buildRoute(ROUTES.BRANCH_SESSION_DETAIL, { id: 'abc', sessionId: 'xyz' })
 * // → '/branches/abc/sessions/xyz'
 */
export const buildRoute = (pattern: string, params: RouteParams): string => {
  let path = pattern
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`:${key}`, encodeURIComponent(value))
  }
  return path
}
