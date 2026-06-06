import { describe, it, expect } from 'vitest'
import { parseVoiceInput } from '../voiceParser'
import type { ParsedMovement } from '../voiceParser'

const dummyCategories = [
  { id: '1', name: 'Novillo' },
  { id: '2', name: 'Cerdo' },
  { id: '3', name: 'Pollo' },
]

describe('parseVoiceInput', () => {
  // ── "efectivo X" → sale, cash ──────────────────────────────

  it('parses "efectivo 500" as sale cash', () => {
    const result = parseVoiceInput('efectivo 500', dummyCategories)
    expect(result).toEqual<ParsedMovement>({
      type: 'transaction',
      transactionType: 'sale',
      amount: 500,
      paymentMethod: 'cash',
    })
  })

  it('parses "efect 500" as sale cash', () => {
    const result = parseVoiceInput('efect 500', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'sale',
      paymentMethod: 'cash',
      amount: 500,
    })
  })

  it('parses "ef 1500" as sale cash', () => {
    const result = parseVoiceInput('ef 1500', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'sale',
      paymentMethod: 'cash',
      amount: 1500,
    })
  })

  // ── "transferencia X" → sale, transfer ─────────────────────

  it('parses "transferencia 490" as sale transfer', () => {
    const result = parseVoiceInput('transferencia 490', dummyCategories)
    expect(result).toEqual<ParsedMovement>({
      type: 'transaction',
      transactionType: 'sale',
      amount: 490,
      paymentMethod: 'transfer',
    })
  })

  it('parses "transf 490" as sale transfer', () => {
    const result = parseVoiceInput('transf 490', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'sale',
      paymentMethod: 'transfer',
      amount: 490,
    })
  })

  it('parses "transfer 1000" as sale transfer', () => {
    const result = parseVoiceInput('transfer 1000', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'sale',
      paymentMethod: 'transfer',
      amount: 1000,
    })
  })

  // ── "venta X efectivo" ─────────────────────────────────────

  it('parses "venta 500 efectivo" as sale cash', () => {
    const result = parseVoiceInput('venta 500 efectivo', dummyCategories)
    expect(result).toEqual<ParsedMovement>({
      type: 'transaction',
      transactionType: 'sale',
      amount: 500,
      paymentMethod: 'cash',
    })
  })

  it('parses "vta 300 efectivo" as sale cash', () => {
    const result = parseVoiceInput('vta 300 efectivo', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'sale',
      paymentMethod: 'cash',
      amount: 300,
    })
  })

  // ── "venta X transferencia" ────────────────────────────────

  it('parses "venta 490 transferencia" as sale transfer', () => {
    const result = parseVoiceInput('venta 490 transferencia', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'sale',
      paymentMethod: 'transfer',
      amount: 490,
    })
  })

  it('parses "vta 100 transfer" as sale transfer', () => {
    const result = parseVoiceInput('vta 100 transfer', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'sale',
      paymentMethod: 'transfer',
      amount: 100,
    })
  })

  // ── "venta X" (plain, defaults to cash) ────────────────────

  it('parses "venta 500" as sale default cash', () => {
    const result = parseVoiceInput('venta 500', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'sale',
      paymentMethod: 'cash',
      amount: 500,
    })
  })

  it('parses "vta 2500" as sale default cash', () => {
    const result = parseVoiceInput('vta 2500', dummyCategories)
    expect(result).toMatchObject({ transactionType: 'sale', amount: 2500 })
  })

  // ── gasto ──────────────────────────────────────────────────

  it('parses "gasto 5000" without description', () => {
    const result = parseVoiceInput('gasto 5000', dummyCategories)
    expect(result).toEqual<ParsedMovement>({
      type: 'transaction',
      transactionType: 'expense',
      amount: 5000,
    })
  })

  it('parses "gasto 5 desayuno" with description', () => {
    const result = parseVoiceInput('gasto 5 desayuno', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'expense',
      amount: 5,
      description: 'desayuno',
    })
  })

  it('parses "gto 2000 alquiler" with description', () => {
    const result = parseVoiceInput('gto 2000 alquiler', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'expense',
      amount: 2000,
      description: 'alquiler',
    })
  })

  it('parses "gasto 5000 desayuno para los chicos" with multi-word description', () => {
    const result = parseVoiceInput(
      'gasto 5000 desayuno para los chicos',
      dummyCategories
    )
    expect(result).toMatchObject({
      transactionType: 'expense',
      amount: 5000,
      description: 'desayuno para los chicos',
    })
  })

  // ── retiro ─────────────────────────────────────────────────

  it('parses "retiro 5000" without description', () => {
    const result = parseVoiceInput('retiro 5000', dummyCategories)
    expect(result).toEqual<ParsedMovement>({
      type: 'transaction',
      transactionType: 'withdrawal',
      amount: 5000,
    })
  })

  it('parses "retiro 5000 juan" with description', () => {
    const result = parseVoiceInput('retiro 5000 juan', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'withdrawal',
      amount: 5000,
      description: 'juan',
    })
  })

  it('parses "ret 10000 maria" with description', () => {
    const result = parseVoiceInput('ret 10000 maria', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'withdrawal',
      amount: 10000,
      description: 'maria',
    })
  })

  // ── ingreso ────────────────────────────────────────────────

  it('parses "ingreso 3000" without description', () => {
    const result = parseVoiceInput('ingreso 3000', dummyCategories)
    expect(result).toEqual<ParsedMovement>({
      type: 'transaction',
      transactionType: 'income',
      amount: 3000,
    })
  })

  it('parses "ingreso 5000 alquiler" with description', () => {
    const result = parseVoiceInput('ingreso 5000 alquiler', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'income',
      amount: 5000,
      description: 'alquiler',
    })
  })

  it('parses "ing 3000 viaticos" with description', () => {
    const result = parseVoiceInput('ing 3000 viaticos', dummyCategories)
    expect(result).toMatchObject({
      transactionType: 'income',
      amount: 3000,
      description: 'viaticos',
    })
  })

  // ── entrada (inventory in) ─────────────────────────────────

  it('parses "entrada 5 novillo" as inventory in', () => {
    const result = parseVoiceInput('entrada 5 novillo', dummyCategories)
    expect(result).toEqual<ParsedMovement>({
      type: 'inventory',
      movementType: 'in',
      quantity: 5,
      categoryName: 'Novillo',
    })
  })

  it('parses "ent 10 cerdo" as inventory in', () => {
    const result = parseVoiceInput('ent 10 cerdo', dummyCategories)
    expect(result).toMatchObject({
      type: 'inventory',
      movementType: 'in',
      quantity: 10,
      categoryName: 'Cerdo',
    })
  })

  it('falls back to raw text when category does not match', () => {
    const result = parseVoiceInput('entrada 3 llama', dummyCategories)
    expect(result).toMatchObject({
      type: 'inventory',
      movementType: 'in',
      quantity: 3,
      categoryName: 'llama',
    })
  })

  // ── salida (inventory out) ─────────────────────────────────

  it('parses "salida 2 cerdo" as inventory out', () => {
    const result = parseVoiceInput('salida 2 cerdo', dummyCategories)
    expect(result).toEqual<ParsedMovement>({
      type: 'inventory',
      movementType: 'out',
      quantity: 2,
      categoryName: 'Cerdo',
    })
  })

  it('parses "sal 1 pollo" as inventory out', () => {
    const result = parseVoiceInput('sal 1 pollo', dummyCategories)
    expect(result).toMatchObject({
      type: 'inventory',
      movementType: 'out',
      quantity: 1,
      categoryName: 'Pollo',
    })
  })

  // ── no match ───────────────────────────────────────────────

  it('returns null for unrecognized input', () => {
    expect(parseVoiceInput('hola mundo', dummyCategories)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseVoiceInput('', dummyCategories)).toBeNull()
  })

  it('returns null for gibberish', () => {
    expect(parseVoiceInput('abcdef 123 xyz', dummyCategories)).toBeNull()
  })
})
