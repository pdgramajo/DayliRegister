import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchProductsByBranch,
  deleteProduct,
  clearCurrentProduct,
} from '../../store/productSlice'
import { fetchBranchById, clearCurrentBranch } from '../../store/branchSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import { Button, Modal, toast } from '../../components/ui'
import { ProductCard } from './ProductCard'
import { Copy, Check, Package, Download, Upload, Search } from 'lucide-react'
import { formatMoney } from '../../lib/formatters'
import { ROUTES, buildRoute } from '../../constants/routes'
import { ProductService } from '../../services/ProductService'
import {
  exportProductsToFile,
  parseImportFile,
  type ExportedProduct,
} from '../../services/ExportImportService'

export const ProductList = () => {
  const { id: branchId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { products, isLoading } = useAppSelector(
    (state: RootState) => state.products
  )
  const { currentBranch } = useAppSelector((state: RootState) => state.branches)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [importProducts, setImportProducts] = useState<
    ExportedProduct[] | null
  >(null)
  const [isImporting, setIsImporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const q = searchQuery.toLowerCase().trim()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
    )
  }, [products, searchQuery])

  useEffect(() => {
    if (branchId) {
      dispatch(fetchBranchById(branchId))
      dispatch(fetchProductsByBranch(branchId))
    }
    return () => {
      dispatch(clearCurrentBranch())
      dispatch(clearCurrentProduct())
    }
  }, [dispatch, branchId])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const copyToClipboard = useCallback(
    (items: { name: string; price: number }[]) => {
      const text = items
        .map((item) => `${item.name}: $${formatMoney(item.price)}`)
        .join('\n')
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        toast.success('Copiado al portapapeles')
        setTimeout(() => setCopied(false), 2000)
      })
    },
    []
  )

  const handleCopySelected = () => {
    const selected = products.filter((p) => selectedIds.has(p.id))
    copyToClipboard(selected)
  }

  const handleCopyAll = () => {
    copyToClipboard(products)
  }

  const handleExport = useCallback(() => {
    if (!currentBranch) return
    exportProductsToFile(products, currentBranch.name)
    toast.success('Productos exportados correctamente')
  }, [products, currentBranch])

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const parsed = await parseImportFile(file)
        setImportProducts(parsed)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Error al leer el archivo'
        )
      }

      // Reset input so the same file can be selected again
      e.target.value = ''
    },
    []
  )

  const handleConfirmImport = useCallback(async () => {
    if (!importProducts || !branchId) return

    setIsImporting(true)
    try {
      await ProductService.bulkCreate(branchId, importProducts)
      toast.success(
        `${importProducts.length} producto${importProducts.length !== 1 ? 's' : ''} importado${importProducts.length !== 1 ? 's' : ''} correctamente`
      )
      setImportProducts(null)
      dispatch(fetchProductsByBranch(branchId))
    } catch (error) {
      toast.error('Error al importar los productos')
    } finally {
      setIsImporting(false)
    }
  }, [importProducts, branchId, dispatch])

  const handleDeleteProduct = () => {
    if (!deleteProductId) return
    dispatch(deleteProduct(deleteProductId))
      .unwrap()
      .then(() => {
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(deleteProductId)
          return next
        })
        toast.success('Producto eliminado')
        setDeleteProductId(null)
      })
      .catch((error) => toast.error(error || 'Error al eliminar'))
  }

  if (isLoading || !currentBranch) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-surface-50 dark:bg-surface-900">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 min-h-0">
        <div className="shrink-0 px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() =>
                navigate(buildRoute(ROUTES.BRANCH_SESSIONS, { id: branchId }))
              }
              className="text-sm text-content-500 hover:text-content-700 dark:hover:text-content-300 transition-colors mb-4 block"
            >
              ← Volver a {currentBranch.name}
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-content-900 dark:text-white tracking-tight">
                  Productos
                </h1>
                <p className="mt-1 text-sm text-content-500 dark:text-content-400">
                  {searchQuery.trim()
                    ? `${filteredProducts.length} de ${products.length} producto${products.length !== 1 ? 's' : ''}`
                    : `${products.length} producto${products.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <Button
                onClick={() =>
                  navigate(
                    buildRoute(ROUTES.BRANCH_PRODUCT_NEW, { id: branchId })
                  )
                }
              >
                + Nuevo
              </Button>
            </div>
          </div>

          {products.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-1.5 flex-1"
                >
                  <Download className="size-4" />
                  Exportar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportClick}
                  className="gap-1.5 flex-1"
                >
                  <Upload className="size-4" />
                  Importar
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAll}
                  className="gap-1.5"
                >
                  <Copy className="size-4" />
                  Copiar todo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySelected}
                  disabled={selectedIds.size === 0}
                  className="gap-1.5"
                >
                  {copied ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  Copiar seleccionados ({selectedIds.size})
                </Button>
              </div>
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-content-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-sm placeholder-content-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-surface-700 dark:bg-surface-800 dark:text-content-100 dark:placeholder:text-content-500 dark:focus-visible:ring-offset-surface-900"
                />
              </div>
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 sm:px-6 lg:px-8 text-center">
            <Package className="size-12 text-content-300 dark:text-content-600 mb-4" />
            <p className="text-content-500 dark:text-content-400 mb-2">
              No hay productos registrados
            </p>
            <p className="text-sm text-content-400 dark:text-content-500 mb-6">
              Agregá productos para poder consultar precios rápidamente
            </p>
            <Button
              variant="outline"
              onClick={() =>
                navigate(
                  buildRoute(ROUTES.BRANCH_PRODUCT_NEW, { id: branchId })
                )
              }
            >
              + Agregar producto
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 sm:px-6 lg:px-8 text-center">
            <Search className="size-12 text-content-300 dark:text-content-600 mb-4" />
            <p className="text-content-500 dark:text-content-400 mb-2">
              No se encontraron productos
            </p>
            <p className="text-sm text-content-400 dark:text-content-500 mb-6">
              Probá con otro término de búsqueda
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0 space-y-2 px-4 pb-8 sm:px-6 lg:px-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={selectedIds.has(product.id)}
                onToggleSelect={toggleSelect}
                onEdit={(id) =>
                  navigate(
                    buildRoute(ROUTES.BRANCH_PRODUCT_EDIT, {
                      id: branchId,
                      productId: id,
                    })
                  )
                }
                onDelete={(id) => setDeleteProductId(id)}
              />
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelected}
          className="hidden"
        />

        <Modal
          open={!!deleteProductId}
          onClose={() => setDeleteProductId(null)}
          title="Eliminar producto"
        >
          <p className="text-sm text-content-500 mb-6">
            ¿Estás seguro de eliminar este producto?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteProductId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Eliminar
            </Button>
          </div>
        </Modal>

        <Modal
          open={importProducts !== null}
          onClose={() => !isImporting && setImportProducts(null)}
          title="Importar productos"
        >
          <p className="text-sm text-content-500 mb-2">
            Se van a importar{' '}
            <strong className="text-content-900 dark:text-white">
              {importProducts?.length ?? 0} producto
              {(importProducts?.length ?? 0) !== 1 ? 's' : ''}
            </strong>{' '}
            a{' '}
            <strong className="text-content-900 dark:text-white">
              {currentBranch?.name}
            </strong>
            .
          </p>
          <p className="text-sm text-content-400 mb-6">
            Los productos importados se agregarán a los existentes. Los IDs se
            generarán automáticamente.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setImportProducts(null)}
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmImport} disabled={isImporting}>
              {isImporting ? 'Importando...' : 'Importar'}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
