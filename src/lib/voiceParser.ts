/**
 * Voice command parser for transaction and inventory movement creation.
 * Converts Spanish natural language into structured data.
 */

export interface ParsedTransaction {
  type: 'transaction'
  transactionType: 'sale' | 'expense' | 'withdrawal' | 'income'
  amount: number
  paymentMethod?: 'cash' | 'transfer'
  description?: string
}

export interface ParsedInventoryMovement {
  type: 'inventory'
  movementType: 'in' | 'out'
  quantity: number
  categoryName: string
  notes?: string
}

export type ParsedMovement = ParsedTransaction | ParsedInventoryMovement

type CategoryMatch = { id: string; name: string }

/** Fuzzy-match a spoken category name against available categories */
const fuzzyMatchCategory = (
  spoken: string,
  categories: CategoryMatch[]
): CategoryMatch | undefined => {
  const normalized = spoken.trim().toLowerCase()
  // Exact match first
  const exact = categories.find((c) => c.name.toLowerCase() === normalized)
  if (exact) return exact
  // Partial match (spoken is contained in category name or vice versa)
  return categories.find(
    (c) =>
      c.name.toLowerCase().includes(normalized) ||
      normalized.includes(c.name.toLowerCase())
  )
}

const parseNumber = (str: string): number | null => {
  const cleaned = str.replace(/[^0-9]/g, '')
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? null : num
}

/**
 * Attempts to parse a voice transcript into a structured movement.
 * Returns null if the transcript doesn't match any known pattern.
 */
export const parseVoiceInput = (
  text: string,
  categories: CategoryMatch[]
): ParsedMovement | null => {
  const trimmed = text.trim().toLowerCase()

  // ── Transaction patterns ──────────────────────────────────────

  // "efectivo/efect/ef 500" → sale, cash
  const cashSaleMatch = trimmed.match(/^(efectivo|efect|ef)\s+(\d[\d\s]*)$/i)
  if (cashSaleMatch) {
    const amount = parseNumber(cashSaleMatch[2])
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount,
        paymentMethod: 'cash',
      }
    }
  }

  // "transferencia/transf/transfer 490" → sale, transfer
  const transferSaleMatch = trimmed.match(
    /^(transferencia|transf|transfer)\s+(\d[\d\s]*)$/i
  )
  if (transferSaleMatch) {
    const amount = parseNumber(transferSaleMatch[2])
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount,
        paymentMethod: 'transfer',
      }
    }
  }

  // "venta/vta 500 efectivo/efect"
  const saleCashMatch = trimmed.match(
    /^(venta|vta)\s+(\d[\d\s]*)\s*(efectivo|efect|ef)/i
  )
  if (saleCashMatch) {
    const amount = parseNumber(saleCashMatch[2])
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount,
        paymentMethod: 'cash',
      }
    }
  }

  // "venta/vta 500 transferencia/transf/tranferencia"
  const saleTransferMatch = trimmed.match(
    /^(venta|vta)\s+(\d[\d\s]*)\s*(transferencia|transf|transfer)/i
  )
  if (saleTransferMatch) {
    const amount = parseNumber(saleTransferMatch[2])
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount,
        paymentMethod: 'transfer',
      }
    }
  }

  // "venta/vta 500"
  const salePlainMatch = trimmed.match(/^(venta|vta)\s+(\d[\d\s]*)$/i)
  if (salePlainMatch) {
    const amount = parseNumber(salePlainMatch[2])
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount,
        paymentMethod: 'cash', // default
      }
    }
  }

  // "gasto/gto 200" o "gasto/gto 5 desayuno"
  const expenseMatch = trimmed.match(/^(gasto|gto)\s+(\d[\d\s]*)\s*(.+)?$/i)
  if (expenseMatch) {
    const amount = parseNumber(expenseMatch[2])
    const rest = expenseMatch[3]?.trim()
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'expense',
        amount,
        ...(rest ? { description: rest } : {}),
      }
    }
  }

  // "retiro/ret 100" o "retiro/ret 5000 juan"
  const withdrawalMatch = trimmed.match(/^(retiro|ret)\s+(\d[\d\s]*)\s*(.+)?$/i)
  if (withdrawalMatch) {
    const amount = parseNumber(withdrawalMatch[2])
    const rest = withdrawalMatch[3]?.trim()
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'withdrawal',
        amount,
        ...(rest ? { description: rest } : {}),
      }
    }
  }

  // "ingreso/ing 300" o "ingreso/ing 5000 alquiler"
  const incomeMatch = trimmed.match(/^(ingreso|ing)\s+(\d[\d\s]*)\s*(.+)?$/i)
  if (incomeMatch) {
    const amount = parseNumber(incomeMatch[2])
    const rest = incomeMatch[3]?.trim()
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'income',
        amount,
        ...(rest ? { description: rest } : {}),
      }
    }
  }

  // ── Inventory patterns ────────────────────────────────────────

  // "entrada/ent 5 novillo [nota]"
  const inMatch = trimmed.match(/^(entrada|ent)\s+(\d[\d\s]*)\s+(.+)/i)
  if (inMatch) {
    const quantity = parseNumber(inMatch[2])
    const rest = inMatch[3].trim()
    if (quantity !== null && rest) {
      const category = fuzzyMatchCategory(rest, categories)
      return {
        type: 'inventory',
        movementType: 'in',
        quantity,
        categoryName: category?.name ?? rest,
        notes: category ? undefined : rest,
      }
    }
  }

  // "salida/sal 2 cerdo [nota]"
  const outMatch = trimmed.match(/^(salida|sal)\s+(\d[\d\s]*)\s+(.+)/i)
  if (outMatch) {
    const quantity = parseNumber(outMatch[2])
    const rest = outMatch[3].trim()
    if (quantity !== null && rest) {
      const category = fuzzyMatchCategory(rest, categories)
      return {
        type: 'inventory',
        movementType: 'out',
        quantity,
        categoryName: category?.name ?? rest,
        notes: category ? undefined : rest,
      }
    }
  }

  return null
}
