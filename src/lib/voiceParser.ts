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

/** Spanish number words mapped to their integer values */
const NUMBER_WORDS: Record<string, number> = {
  cero: 0,
  un: 1,
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  veinte: 20,
  veintiuno: 21,
  veintidós: 22,
  veintidos: 22,
  veintitrés: 23,
  veintitres: 23,
  veinticuatro: 24,
  veinticinco: 25,
  veintiséis: 26,
  veintiseis: 26,
  veintisiete: 27,
  veintiocho: 28,
  veintinueve: 29,
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
  cien: 100,
  ciento: 100,
  doscientos: 200,
  doscientas: 200,
  trescientos: 300,
  trescientas: 300,
  cuatrocientos: 400,
  cuatrocientas: 400,
  quinientos: 500,
  quinientas: 500,
  seiscientos: 600,
  seiscientas: 600,
  setecientos: 700,
  setecientas: 700,
  ochocientos: 800,
  ochocientas: 800,
  novecientos: 900,
  novecientas: 900,
}

/** Multipliers applied to the accumulated value before them */
const MULTIPLIERS: Record<string, number> = {
  mil: 1000,
  millón: 1_000_000,
  millones: 1_000_000,
}

/**
 * Converts a Spanish number expression into an integer.
 *
 * Handles plain digits ("15000"), digit+word ("15 mil"), and
 * fully-spoken Spanish ("quince mil", "doscientos treinta", etc.).
 */
const parseSpanishNumber = (str: string): number | null => {
  const normalized = str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^y\s+/, '')

  if (!normalized) return null

  // Fast path: plain digits only
  if (/^\d+$/.test(normalized)) {
    const num = parseInt(normalized, 10)
    return isNaN(num) ? null : num
  }

  // Token-based parsing for Spanish words + mixed input
  const tokens = normalized.split(/\s+/)
  // Expand concatenated digit+letter tokens ("15mil" → ["15", "mil"])
  const expanded = expandNumberTokens(tokens)
  let total = 0
  let current = 0

  for (const token of expanded) {
    if (token === 'y') continue

    if (MULTIPLIERS[token] !== undefined) {
      // "mil" multiplies whatever we accumulated, default to 1
      total += (current || 1) * MULTIPLIERS[token]
      current = 0
    } else if (NUMBER_WORDS[token] !== undefined) {
      current += NUMBER_WORDS[token]
    } else {
      // Try as a plain digit
      const digit = parseInt(token, 10)
      if (!isNaN(digit)) {
        current += digit
      }
      // Silently skip unrecognised tokens so "mil" still works in phrases
    }
  }

  total += current
  return total > 0 ? total : null
}

/**
 * Splits tokens that contain digits immediately followed by letters,
 * e.g. "15mil" → ["15", "mil"]. This handles speech transcriptions
 * where the speaker doesn't pause between the number and "mil".
 */
const expandNumberTokens = (tokens: string[]): string[] => {
  const result: string[] = []
  for (const token of tokens) {
    const match = token.match(/^(\d+)([a-záéíóú]+)$/i)
    if (match) {
      result.push(match[1])
      result.push(match[2])
    } else {
      result.push(token)
    }
  }
  return result
}

/** Checks if a single token looks like part of a Spanish number expression */
const isNumberToken = (token: string): boolean => {
  if (/^\d+$/.test(token)) return true
  if (NUMBER_WORDS[token] !== undefined) return true
  if (MULTIPLIERS[token] !== undefined) return true
  return false
}

/**
 * Given text that starts with a number expression, extracts the
 * numeric value and the remaining text (description / category).
 *
 * @example
 *   extractNumberFromStart('500 desayuno')       → { amount: 500,  rest: 'desayuno' }
 *   extractNumberFromStart('15 mil')             → { amount: 15000, rest: '' }
 *   extractNumberFromStart('treinta y cinco')    → { amount: 35,    rest: '' }
 */
const extractNumberFromStart = (
  text: string
): { amount: number; rest: string } | null => {
  const tokens = text.trim().split(/\s+/)
  // Expand concatenated digit+letter tokens
  const expanded = expandNumberTokens(tokens)
  if (expanded.length === 0) return null

  const numberTokens: string[] = []
  const restTokens: string[] = []
  let passedNumber = false

  for (const token of expanded) {
    if (!passedNumber && (isNumberToken(token) || token === 'y')) {
      numberTokens.push(token)
    } else {
      passedNumber = true
      restTokens.push(token)
    }
  }

  if (numberTokens.length === 0) return null
  const amount = parseSpanishNumber(numberTokens.join(' '))
  if (amount === null) return null
  return { amount, rest: restTokens.join(' ') }
}

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

/**
 * Attempts to parse a voice transcript into a structured movement.
 * Returns null if the transcript doesn't match any known pattern.
 */
export const parseVoiceInput = (
  text: string,
  categories: CategoryMatch[]
): ParsedMovement | null => {
  const trimmed = text.trim().toLowerCase()

  if (!trimmed) return null

  // ── Transaction patterns ──────────────────────────────────────

  // "efectivo/efect/ef 15 mil" → sale, cash
  const cashSaleMatch = trimmed.match(/^(efectivo|efect|ef)\s+(.+)$/i)
  if (cashSaleMatch) {
    const amount = parseSpanishNumber(cashSaleMatch[2])
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount,
        paymentMethod: 'cash',
      }
    }
  }

  // "transferencia/transf/transfer 15 mil" → sale, transfer
  const transferSaleMatch = trimmed.match(
    /^(transferencia|transf|transfer)\s+(.+)$/i
  )
  if (transferSaleMatch) {
    const amount = parseSpanishNumber(transferSaleMatch[2])
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount,
        paymentMethod: 'transfer',
      }
    }
  }

  // "venta/vta 15 mil efectivo"
  const saleCashMatch = trimmed.match(
    /^(venta|vta)\s+(.+?)\s*(efectivo|efect|ef)$/i
  )
  if (saleCashMatch) {
    const amount = parseSpanishNumber(saleCashMatch[2])
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount,
        paymentMethod: 'cash',
      }
    }
  }

  // "venta/vta 15 mil transferencia/transf"
  const saleTransferMatch = trimmed.match(
    /^(venta|vta)\s+(.+?)\s*(transferencia|transf|transfer)$/i
  )
  if (saleTransferMatch) {
    const amount = parseSpanishNumber(saleTransferMatch[2])
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount,
        paymentMethod: 'transfer',
      }
    }
  }

  // "venta/vta efectivo/efect/ef 15 mil" → sale, cash
  const ventaCashPrefixMatch = trimmed.match(
    /^(venta|vta)\s+(efectivo|efect|ef)\s+(.+)$/i
  )
  if (ventaCashPrefixMatch) {
    const amount = parseSpanishNumber(ventaCashPrefixMatch[3])
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount,
        paymentMethod: 'cash',
      }
    }
  }

  // "venta/vta 15 mil" (plain, defaults to cash)
  const salePlainMatch = trimmed.match(/^(venta|vta)\s+(.+)$/i)
  if (salePlainMatch) {
    const amount = parseSpanishNumber(salePlainMatch[2])
    if (amount !== null) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount,
        paymentMethod: 'cash',
      }
    }
  }

  // "gasto/gto 5 mil desayuno" or "gasto 5000"
  const expenseMatch = trimmed.match(/^(gasto|gto)\s+(.+)$/i)
  if (expenseMatch) {
    const extracted = extractNumberFromStart(expenseMatch[2])
    if (extracted) {
      return {
        type: 'transaction',
        transactionType: 'expense',
        amount: extracted.amount,
        ...(extracted.rest ? { description: extracted.rest } : {}),
      }
    }
  }

  // "retiro/ret 5 mil juan" or "retiro 5000"
  const withdrawalMatch = trimmed.match(/^(retiro|ret)\s+(.+)$/i)
  if (withdrawalMatch) {
    const extracted = extractNumberFromStart(withdrawalMatch[2])
    if (extracted) {
      return {
        type: 'transaction',
        transactionType: 'withdrawal',
        amount: extracted.amount,
        ...(extracted.rest ? { description: extracted.rest } : {}),
      }
    }
  }

  // "ingreso/ing 5 mil alquiler" or "ingreso 3000"
  const incomeMatch = trimmed.match(/^(ingreso|ing)\s+(.+)$/i)
  if (incomeMatch) {
    const extracted = extractNumberFromStart(incomeMatch[2])
    if (extracted) {
      return {
        type: 'transaction',
        transactionType: 'income',
        amount: extracted.amount,
        ...(extracted.rest ? { description: extracted.rest } : {}),
      }
    }
  }

  // ── Suffix patterns: "{amount} {payment_method}" ───────────────
  // "15 mil efectivo" → sale, cash (no keyword prefix)
  const cashSuffixMatch = trimmed.match(/^(.+?)\s*(efectivo|efect|ef)$/i)
  if (cashSuffixMatch) {
    const extracted = extractNumberFromStart(cashSuffixMatch[1])
    if (extracted && !extracted.rest) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount: extracted.amount,
        paymentMethod: 'cash',
      }
    }
  }

  // "15 mil transferencia" → sale, transfer (no keyword prefix)
  const transferSuffixMatch = trimmed.match(
    /^(.+?)\s*(transferencia|transf|transfer)$/i
  )
  if (transferSuffixMatch) {
    const extracted = extractNumberFromStart(transferSuffixMatch[1])
    if (extracted && !extracted.rest) {
      return {
        type: 'transaction',
        transactionType: 'sale',
        amount: extracted.amount,
        paymentMethod: 'transfer',
      }
    }
  }

  // ── Inventory patterns ────────────────────────────────────────

  // "entrada/ent 5 novillo [nota]"
  const inMatch = trimmed.match(/^(entrada|ent)\s+(.+)$/i)
  if (inMatch) {
    const extracted = extractNumberFromStart(inMatch[2])
    if (extracted && extracted.rest) {
      const category = fuzzyMatchCategory(extracted.rest, categories)
      return {
        type: 'inventory',
        movementType: 'in',
        quantity: extracted.amount,
        categoryName: category?.name ?? extracted.rest,
        notes: category ? undefined : extracted.rest,
      }
    }
  }

  // "salida/sal 2 cerdo [nota]"
  const outMatch = trimmed.match(/^(salida|sal)\s+(.+)$/i)
  if (outMatch) {
    const extracted = extractNumberFromStart(outMatch[2])
    if (extracted && extracted.rest) {
      const category = fuzzyMatchCategory(extracted.rest, categories)
      return {
        type: 'inventory',
        movementType: 'out',
        quantity: extracted.amount,
        categoryName: category?.name ?? extracted.rest,
        notes: category ? undefined : extracted.rest,
      }
    }
  }

  return null
}
