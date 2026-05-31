import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportProductsToFile, parseImportFile } from '../ExportImportService'

describe('ExportImportService', () => {
  let appendChildSpy: ReturnType<typeof vi.spyOn>
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock-url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((el) => {
        if (el instanceof HTMLAnchorElement) {
          vi.spyOn(el, 'click').mockImplementation(() => {})
        }
        return el
      })
    vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el)
  })

  describe('exportProductsToFile', () => {
    it('should create a downloadable anchor element', () => {
      const products = [
        { name: 'Café', price: 1500 },
        {
          name: 'Medialuna',
          price: 800,
          offerPrice: 600,
          category: 'Facturas',
        },
      ]

      exportProductsToFile(products, 'Sucursal Centro')

      expect(createObjectURLSpy).toHaveBeenCalledTimes(1)
      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob
      expect(blobArg).toBeInstanceOf(Blob)
      expect(blobArg.type).toBe('application/json')

      expect(appendChildSpy).toHaveBeenCalledTimes(1)
      const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement
      expect(anchor.tagName).toBe('A')
      expect(anchor.download).toContain('productos_Sucursal_Centro_')
      expect(anchor.download).toMatch(/\.json$/)
      expect(anchor.href).toBe('blob:mock-url')

      expect(document.body.removeChild).toHaveBeenCalledTimes(1)
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')

      // Verify blob content
      return blobArg.text().then((text) => {
        const content = JSON.parse(text)
        expect(content.version).toBe(1)
        expect(content.type).toBe('products')
        expect(content.sourceBranch).toEqual({ name: 'Sucursal Centro' })
        expect(content.products).toHaveLength(2)
        expect(content.products[0]).toEqual({ name: 'Café', price: 1500 })
        expect(content.products[1]).toEqual({
          name: 'Medialuna',
          price: 800,
          offerPrice: 600,
          category: 'Facturas',
        })
        // Ensure no entity metadata is leaked
        expect(content.products[0].id).toBeUndefined()
        expect(content.products[0].branchId).toBeUndefined()
        expect(content.products[0].createdAt).toBeUndefined()
        expect(content.products[0].updatedAt).toBeUndefined()
      })
    })

    it('should strip undefined optional fields', () => {
      const products = [
        {
          name: 'Simple',
          price: 100,
          offerPrice: undefined,
          category: undefined,
        },
      ]

      exportProductsToFile(products, 'Test')

      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob
      return blobArg.text().then((text) => {
        const content = JSON.parse(text)
        expect(content.products[0]).toEqual({ name: 'Simple', price: 100 })
      })
    })

    it('should sanitize branch name in filename', () => {
      exportProductsToFile([{ name: 'X', price: 1 }], 'Sucursal #1 (Centro)!')

      const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement
      expect(anchor.download).toBe(
        'productos_Sucursal_1_Centro__2026-05-30.json'
      )
    })
  })

  describe('parseImportFile', () => {
    function createJsonFile(
      content: unknown,
      filename = 'productos.json'
    ): File {
      const blob = new Blob([JSON.stringify(content)], {
        type: 'application/json',
      })
      return new File([blob], filename, { type: 'application/json' })
    }

    it('should parse a valid products file', async () => {
      const file = createJsonFile({
        version: 1,
        type: 'products',
        exportedAt: '2026-01-01T00:00:00.000Z',
        sourceBranch: { name: 'Test Branch' },
        products: [
          { name: 'Café', price: 1500 },
          {
            name: 'Medialuna',
            price: 800,
            offerPrice: 600,
            category: 'Facturas',
          },
        ],
      })

      const products = await parseImportFile(file)

      expect(products).toHaveLength(2)
      expect(products[0]).toEqual({ name: 'Café', price: 1500 })
      expect(products[1]).toEqual({
        name: 'Medialuna',
        price: 800,
        offerPrice: 600,
        category: 'Facturas',
      })
    })

    it('should reject non-JSON file extension', async () => {
      const blob = new Blob(['{}'], { type: 'text/plain' })
      const file = new File([blob], 'data.csv', { type: 'text/plain' })

      await expect(parseImportFile(file)).rejects.toThrow(
        'El archivo debe tener extensión .json'
      )
    })

    it('should reject invalid JSON content', async () => {
      const blob = new Blob(['not json'], { type: 'application/json' })
      const file = new File([blob], 'data.json', { type: 'application/json' })

      await expect(parseImportFile(file)).rejects.toThrow(
        'El archivo no es un JSON válido'
      )
    })

    it('should reject non-object root', async () => {
      const file = createJsonFile('string instead of object')

      await expect(parseImportFile(file)).rejects.toThrow(
        'El archivo no contiene datos válidos'
      )
    })

    it('should reject unsupported version', async () => {
      const file = createJsonFile({
        version: 99,
        type: 'products',
        products: [],
      })

      await expect(parseImportFile(file)).rejects.toThrow(
        'Versión de archivo no soportada: 99'
      )
    })

    it('should reject unsupported type', async () => {
      const file = createJsonFile({
        version: 1,
        type: 'clients',
        products: [],
      })

      await expect(parseImportFile(file)).rejects.toThrow(
        'Tipo de archivo no soportado: "clients"'
      )
    })

    it('should reject when products is not an array', async () => {
      const file = createJsonFile({
        version: 1,
        type: 'products',
        products: 'not an array',
      })

      await expect(parseImportFile(file)).rejects.toThrow(
        'El archivo no contiene una lista de productos'
      )
    })

    it('should reject when products array is empty', async () => {
      const file = createJsonFile({
        version: 1,
        type: 'products',
        products: [],
      })

      await expect(parseImportFile(file)).rejects.toThrow(
        'El archivo no contiene productos'
      )
    })

    it('should reject product with missing name', async () => {
      const file = createJsonFile({
        version: 1,
        type: 'products',
        products: [{ price: 100 }],
      })

      await expect(parseImportFile(file)).rejects.toThrow(
        'Producto inválido encontrado'
      )
    })

    it('should reject product with empty name', async () => {
      const file = createJsonFile({
        version: 1,
        type: 'products',
        products: [{ name: '  ', price: 100 }],
      })

      await expect(parseImportFile(file)).rejects.toThrow(
        'Producto inválido encontrado'
      )
    })

    it('should reject product with non-numeric price', async () => {
      const file = createJsonFile({
        version: 1,
        type: 'products',
        products: [{ name: 'Test', price: 'free' }],
      })

      await expect(parseImportFile(file)).rejects.toThrow(
        'Producto inválido encontrado'
      )
    })

    it('should reject product with negative price', async () => {
      const file = createJsonFile({
        version: 1,
        type: 'products',
        products: [{ name: 'Test', price: -10 }],
      })

      await expect(parseImportFile(file)).rejects.toThrow(
        'Producto inválido encontrado'
      )
    })

    it('should reject product with negative offerPrice', async () => {
      const file = createJsonFile({
        version: 1,
        type: 'products',
        products: [{ name: 'Test', price: 100, offerPrice: -5 }],
      })

      await expect(parseImportFile(file)).rejects.toThrow(
        'Producto inválido encontrado'
      )
    })

    it('should reject product with non-string category', async () => {
      const file = createJsonFile({
        version: 1,
        type: 'products',
        products: [{ name: 'Test', price: 100, category: 123 }],
      })

      await expect(parseImportFile(file)).rejects.toThrow(
        'Producto inválido encontrado'
      )
    })
  })
})
