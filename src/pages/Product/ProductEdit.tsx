import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchProductById,
  updateProduct,
  clearCurrentProduct,
} from '../../store/productSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import type { CreateProductDTO } from '../../types/dtos'
import { ProductForm, toast } from '../../components/ui'
import { ROUTES, buildRoute } from '../../constants/routes'

export const ProductEdit = () => {
  const { id: branchId, productId } = useParams<{
    id: string
    productId: string
  }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentProduct, isLoading } = useAppSelector(
    (state: RootState) => state.products
  )

  useEffect(() => {
    if (productId && !currentProduct) {
      dispatch(fetchProductById(productId))
    }
    return () => {
      dispatch(clearCurrentProduct())
    }
  }, [dispatch, productId])

  const handleSubmit = (data: CreateProductDTO) => {
    if (!productId) return
    const { branchId: _, ...updateData } = data
    dispatch(updateProduct({ id: productId, data: updateData }))
      .unwrap()
      .then(() =>
        navigate(buildRoute(ROUTES.BRANCH_PRODUCTS, { id: branchId }))
      )
      .catch((error) => {
        toast.error(error || 'Error al actualizar el producto')
      })
  }

  if (!currentProduct && !isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 px-4 py-6">
        <p className="text-content-500 text-center">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-content-900 dark:text-white tracking-tight">
            Editar Producto
          </h1>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
          {currentProduct && (
            <ProductForm
              branchId={branchId!}
              initialValues={{
                name: currentProduct.name,
                price: currentProduct.price,
                offerPrice: currentProduct.offerPrice,
                category: currentProduct.category,
              }}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              cancelTo={`/branches/${branchId}/products`}
            />
          )}
        </div>
      </div>
    </div>
  )
}
