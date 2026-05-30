import { useNavigate, useParams } from 'react-router-dom'
import { ProductService } from '../../services/ProductService'
import type { CreateProductDTO } from '../../types/dtos'
import { ProductForm } from '../../components/forms/ProductForm'
import { toast } from '../../components/ui'
import { ROUTES, buildRoute } from '../../constants/routes'

export const ProductNew = () => {
  const { id: branchId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const handleSubmit = async (data: CreateProductDTO) => {
    if (!branchId) return
    try {
      await ProductService.createProduct(data)
      navigate(buildRoute(ROUTES.BRANCH_PRODUCTS, { id: branchId }))
    } catch (error) {
      toast.error('Error al crear el producto')
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-content-900 dark:text-white tracking-tight">
            Nuevo Producto
          </h1>
          <p className="mt-1 text-sm text-content-500 dark:text-content-400">
            Agregá un producto con su precio
          </p>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
          <ProductForm
            branchId={branchId!}
            onSubmit={handleSubmit}
            cancelTo={`/branches/${branchId}/products`}
          />
        </div>
      </div>
    </div>
  )
}
