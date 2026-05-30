/**
 * Servicios de exportación e importación de datos
 * @package @dayli-register/services
 */

export interface ExportedProduct {
  name: string
  price: number
  offerPrice?: number
  category?: string
}

interface ProductsExportFile {
  version: 1
  type: 'products'
  exportedAt: string
  sourceBranch: { name: string }
  products: ExportedProduct[]
}

const SUPPORTED_VERSIONS = [1]

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_')
}

function getDateString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Exporta productos como archivo JSON descargable
 */
export function exportProductsToFile(
  products: ExportedProduct[],
  branchName: string
): void {
  const data: ProductsExportFile = {
    version: 1,
    type: 'products',
    exportedAt: new Date().toISOString(),
    sourceBranch: { name: branchName },
    products: products.map(({ name, price, offerPrice, category }) => ({
      name,
      price,
      ...(offerPrice !== undefined && { offerPrice }),
      ...(category !== undefined && { category }),
    })),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `productos_${sanitizeFilename(branchName)}_${getDateString()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Valida que un objeto tenga la estructura de un producto exportado
 */
function isValidProduct(obj: unknown): obj is ExportedProduct {
  if (typeof obj !== 'object' || obj === null) return false
  const p = obj as Record<string, unknown>
  if (typeof p.name !== 'string' || p.name.trim().length === 0) return false
  if (typeof p.price !== 'number' || p.price < 0) return false
  if (
    p.offerPrice !== undefined &&
    (typeof p.offerPrice !== 'number' || p.offerPrice < 0)
  )
    return false
  if (p.category !== undefined && typeof p.category !== 'string') return false
  return true
}

/**
 * Valida la estructura completa del archivo de importación
 */
function validateImportData(
  data: unknown
):
  | { valid: true; products: ExportedProduct[] }
  | { valid: false; error: string } {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'El archivo no contiene datos válidos' }
  }

  const file = data as Record<string, unknown>

  if (!SUPPORTED_VERSIONS.includes(file.version as number)) {
    return {
      valid: false,
      error: `Versión de archivo no soportada: ${file.version}`,
    }
  }

  if (file.type !== 'products') {
    return {
      valid: false,
      error: `Tipo de archivo no soportado: "${file.type}". Se esperaba "products"`,
    }
  }

  if (!Array.isArray(file.products)) {
    return {
      valid: false,
      error: 'El archivo no contiene una lista de productos',
    }
  }

  if (file.products.length === 0) {
    return { valid: false, error: 'El archivo no contiene productos' }
  }

  const invalid = file.products.find((p) => !isValidProduct(p))
  if (invalid) {
    return {
      valid: false,
      error: `Producto inválido encontrado: "${(invalid as Record<string, unknown>)?.name ?? 'desconocido'}". Verificá que todos los productos tengan nombre y precio válidos.`,
    }
  }

  return { valid: true, products: file.products as ExportedProduct[] }
}

/**
 * Lee y valida un archivo JSON de importación de productos
 * @returns Lista de productos a importar
 */
export function parseImportFile(file: File): Promise<ExportedProduct[]> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.json')) {
      reject(new Error('El archivo debe tener extensión .json'))
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = event.target?.result
        if (typeof text !== 'string') {
          reject(new Error('No se pudo leer el archivo'))
          return
        }

        const data = JSON.parse(text)
        const result = validateImportData(data)

        if (!result.valid) {
          reject(new Error(result.error))
          return
        }

        resolve(result.products)
      } catch {
        reject(new Error('El archivo no es un JSON válido'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }

    reader.readAsText(file)
  })
}
