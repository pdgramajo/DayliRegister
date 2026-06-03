/**
 * Servicio de backup y restauración completa de la base de datos
 * y localStorage de DayliRegister.
 *
 * Formato de backup: JSON versionado con todas las tablas de IndexedDB
 * más las claves de localStorage con prefijo DayliRegister_.
 *
 * @package @dayli-register/services
 */

import { db } from '../db'
import { STORAGE_NAMESPACE } from '../constants/storage'
import type {
  Branch,
  CashSession,
  Transaction,
  InventoryCategory,
  InventoryMovement,
  Product,
  Client,
  DebtEntry,
  LogEntry,
} from '../db'

/* =========================================================
 * TIPOS
 * ========================================================= */

/**
 * Datos completos exportados desde IndexedDB
 */
interface DatabaseSnapshot {
  branches: Branch[]
  cashSessions: CashSession[]
  transactions: Transaction[]
  inventoryCategories: InventoryCategory[]
  inventoryMovements: InventoryMovement[]
  products: Product[]
  clients: Client[]
  debtEntries: DebtEntry[]
  logs: LogEntry[]
}

/**
 * Estructura raíz del archivo de backup
 */
export interface BackupData {
  version: 1
  exportedAt: string
  data: DatabaseSnapshot
  localStorage: Record<string, string | null>
}

/**
 * Resumen de registros por tabla para mostrar en la UI
 */
export interface RestoreSummary {
  totalRecords: number
  tables: Array<{ name: string; count: number }>
  exportedAt: string
}

/* =========================================================
 * CONSTANTES
 * ========================================================= */

const BACKUP_VERSION = 1 as const
const SUPPORTED_VERSIONS = [1]
const LAST_BACKUP_KEY = `${STORAGE_NAMESPACE}lastBackupDate`
const SUGGEST_BACKUP_DAYS = 7

/** Nombre human-readable de cada tabla para la UI */
const TABLE_LABELS: Record<keyof DatabaseSnapshot, string> = {
  branches: 'Sucursales',
  cashSessions: 'Sesiones de caja',
  transactions: 'Transacciones',
  inventoryCategories: 'Categorías de inventario',
  inventoryMovements: 'Movimientos de inventario',
  products: 'Productos',
  clients: 'Clientes',
  debtEntries: 'Movimientos de deuda',
  logs: 'Registros de actividad',
}

/* =========================================================
 * HELPERS
 * ========================================================= */

function getDateString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.json')) {
      reject(new Error('El archivo debe tener extensión .json'))
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text !== 'string') {
        reject(new Error('No se pudo leer el archivo'))
        return
      }
      resolve(text)
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsText(file)
  })
}

/* =========================================================
 * VALIDACIÓN
 * ========================================================= */

function isValidBackupData(data: unknown): data is BackupData {
  if (typeof data !== 'object' || data === null) return false

  const d = data as Record<string, unknown>

  // Validar versión
  if (!SUPPORTED_VERSIONS.includes(d.version as number)) return false

  // Validar estructura de data
  if (typeof d.data !== 'object' || d.data === null) return false
  if (typeof d.exportedAt !== 'string') return false
  if (typeof d.localStorage !== 'object' || d.localStorage === null)
    return false

  const snapshot = d.data as Record<string, unknown>
  const requiredTables: Array<keyof DatabaseSnapshot> = [
    'branches',
    'cashSessions',
    'transactions',
    'inventoryCategories',
    'inventoryMovements',
    'products',
    'clients',
    'debtEntries',
    'logs',
  ]

  for (const table of requiredTables) {
    if (!Array.isArray(snapshot[table])) return false
  }

  return true
}

/* =========================================================
 * SERVICIO
 * ========================================================= */

export const BackupRestoreService = {
  /**
   * Genera los datos del backup y devuelve el Blob y el nombre de archivo.
   * Quien llama decide si descargar, compartir, o lo que corresponda.
   * Además registra la fecha del último backup para recordatorios.
   */
  async exportFullBackup(): Promise<{ blob: Blob; filename: string }> {
    // Leer todas las tablas de IndexedDB en paralelo (async-parallel)
    const [
      branches,
      cashSessions,
      transactions,
      inventoryCategories,
      inventoryMovements,
      products,
      clients,
      debtEntries,
      logs,
    ] = await Promise.all([
      db.branches.toArray(),
      db.cashSessions.toArray(),
      db.transactions.toArray(),
      db.inventoryCategories.toArray(),
      db.inventoryMovements.toArray(),
      db.products.toArray(),
      db.clients.toArray(),
      db.debtEntries.toArray(),
      db.logs.toArray(),
    ])

    // Recolectar todas las claves de localStorage con el namespace del proyecto
    const localStorageData: Record<string, string | null> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_NAMESPACE)) {
        localStorageData[key] = localStorage.getItem(key)
      }
    }

    const backup: BackupData = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        branches,
        cashSessions,
        transactions,
        inventoryCategories,
        inventoryMovements,
        products,
        clients,
        debtEntries,
        logs,
      },
      localStorage: localStorageData,
    }

    const filename = `backup_dayliregister_${getDateString()}.json`
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })

    // Registrar fecha del backup para recordatorios
    localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString())

    return { blob, filename }
  },

  /**
   * Descarga un Blob como archivo en el navegador (fallback cuando
   * la Web Share API no está disponible).
   */
  downloadAsFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  /**
   * Lee y valida un archivo de backup.
   * @returns Los datos parseados del backup
   * @throws Error si el archivo no es válido
   */
  async importFullBackup(file: File): Promise<BackupData> {
    // js-early-exit: validar extensión antes de leer
    if (!file.name.endsWith('.json')) {
      throw new Error('El archivo debe tener extensión .json')
    }

    const text = await readFileAsText(file)
    let data: unknown

    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('El archivo no es un JSON válido')
    }

    if (!isValidBackupData(data)) {
      throw new Error(
        'El archivo no tiene el formato de backup válido. Verificá que sea un archivo generado por DayliRegister.'
      )
    }

    return data
  },

  /**
   * Genera un resumen de los datos a restaurar para mostrar en la UI.
   */
  getRestoreSummary(data: BackupData): RestoreSummary {
    const tables: Array<{ name: string; count: number }> = []
    let totalRecords = 0

    const entries = Object.entries(data.data) as Array<
      [keyof DatabaseSnapshot, unknown[]]
    >

    for (const [key, records] of entries) {
      const label = TABLE_LABELS[key]
      const count = records.length
      tables.push({ name: label, count })
      totalRecords += count
    }

    return {
      totalRecords,
      tables,
      exportedAt: data.exportedAt,
    }
  },

  /**
   * Aplica una restauración completa: limpia IndexedDB y lo repuebla
   * con los datos del backup, luego restaura localStorage.
   *
   * ATENCIÓN: Esta operación es destructiva. Reemplaza TODOS los datos
   * actuales por los del backup.
   */
  async applyRestore(data: BackupData): Promise<void> {
    const snapshot = data.data

    // 1. Limpiar todas las tablas (el orden no importa en Dexie)
    await Promise.all([
      db.branches.clear(),
      db.cashSessions.clear(),
      db.transactions.clear(),
      db.inventoryCategories.clear(),
      db.inventoryMovements.clear(),
      db.products.clear(),
      db.clients.clear(),
      db.debtEntries.clear(),
      db.logs.clear(),
    ])

    // 2. Poblar con los datos del backup en paralelo
    await Promise.all([
      snapshot.branches.length > 0 && db.branches.bulkAdd(snapshot.branches),
      snapshot.cashSessions.length > 0 &&
        db.cashSessions.bulkAdd(snapshot.cashSessions),
      snapshot.transactions.length > 0 &&
        db.transactions.bulkAdd(snapshot.transactions),
      snapshot.inventoryCategories.length > 0 &&
        db.inventoryCategories.bulkAdd(snapshot.inventoryCategories),
      snapshot.inventoryMovements.length > 0 &&
        db.inventoryMovements.bulkAdd(snapshot.inventoryMovements),
      snapshot.products.length > 0 && db.products.bulkAdd(snapshot.products),
      snapshot.clients.length > 0 && db.clients.bulkAdd(snapshot.clients),
      snapshot.debtEntries.length > 0 &&
        db.debtEntries.bulkAdd(snapshot.debtEntries),
      snapshot.logs.length > 0 && db.logs.bulkAdd(snapshot.logs),
    ])

    // 3. Restaurar localStorage (solo claves del namespace)
    const lsData = data.localStorage
    if (lsData) {
      // Remover claves actuales del namespace para evitar residuos
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(STORAGE_NAMESPACE)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      // Escribir las del backup
      for (const [key, value] of Object.entries(lsData)) {
        if (value !== null && value !== undefined) {
          localStorage.setItem(key, value)
        }
      }
    }
  },

  /**
   * Obtiene la fecha ISO del último backup (o null si nunca se hizo).
   */
  getLastBackupDate(): string | null {
    return localStorage.getItem(LAST_BACKUP_KEY)
  },

  /**
   * Verifica si han pasado más de `SUGGEST_BACKUP_DAYS` días desde el
   * último backup.
   */
  shouldSuggestBackup(): boolean {
    const lastDate = this.getLastBackupDate()
    if (!lastDate) return true // nunca se hizo backup

    const last = new Date(lastDate)
    const now = new Date()
    const diffMs = now.getTime() - last.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays >= SUGGEST_BACKUP_DAYS
  },

  /** Días que deben pasar para sugerir un backup */
  get SUGGEST_BACKUP_DAYS(): number {
    return SUGGEST_BACKUP_DAYS
  },
}
