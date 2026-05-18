import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '../../components/ui'
import {
  createInventoryMovement,
  fetchInventoryCategories,
} from '../../store/transactionSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import { Entities } from '../../types/entities'
import type { InventoryMovementType } from '../../types/entities'

const QUICK_VALUES = [1, 2, 5, 10, 20, 50]

interface InventoryMovementFormData {
  quantity: number
  description: string
}

export const InventoryMovementNew = () => {
  const { id: branchId, sessionId } = useParams<{
    id: string
    sessionId: string
  }>()
  const [searchParams] = useSearchParams()
  const type =
    (searchParams.get('type') as InventoryMovementType) ||
    Entities.InventoryMovementTypes.IN

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading, inventoryCategories } = useAppSelector(
    (state: RootState) => state.transactions
  )
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    dispatch(fetchInventoryCategories())
  }, [dispatch])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    const { InventoryCategoryService } =
      await import('../../services/InventoryCategoryService')
    await InventoryCategoryService.createCategory(newCategoryName.trim())
    dispatch(fetchInventoryCategories())
    setNewCategoryName('')
    setShowNewCategory(false)
  }

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InventoryMovementFormData>({
    defaultValues: {
      quantity: 0,
      description: '',
    },
  })

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  const quantity = watch('quantity')

  const handleQuickValue = (value: number) => {
    setValue('quantity', value, { shouldValidate: true })
  }

  const onSubmit = async (data: InventoryMovementFormData) => {
    if (!sessionId || !branchId || !data.quantity || !selectedCategoryId) return

    await dispatch(
      createInventoryMovement({
        sessionId,
        branchId,
        inventoryCategoryId: selectedCategoryId,
        type,
        quantity: data.quantity,
        description: data.description,
      })
    )

    navigate(`/branches/${branchId}/sessions/${sessionId}`)
  }

  const getTitle = () => {
    if (type === Entities.InventoryMovementTypes.IN) return 'Nueva Entrada'
    if (type === Entities.InventoryMovementTypes.OUT) return 'Nueva Salida'
    return 'Nuevo Movimiento'
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-content-900 dark:text-white tracking-tight">
            {getTitle()}
          </h1>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
          <div className="flex justify-between items-center mb-6 -mt-2">
            <button
              onClick={() =>
                navigate(`/branches/${branchId}/sessions/${sessionId}`)
              }
              className="text-sm text-content-600 dark:text-content-400 hover:text-content-900 dark:hover:text-content-100 transition-colors"
            >
              <ArrowLeft className="size-4 inline mr-1" />
              Cancelar
            </button>
            <Button type="submit" form="inventory-form" loading={isLoading}>
              Guardar
            </Button>
          </div>

          <form
            id="inventory-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-content-700 dark:text-content-300">
                  Categoría *
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="text-xs text-green-600 dark:text-green-400 hover:underline"
                >
                  {showNewCategory ? 'Ver categorías' : '+ Nueva'}
                </button>
              </div>
              {!showNewCategory ? (
                <div className="flex flex-wrap gap-2">
                  {inventoryCategories.length === 0 ? (
                    <p className="text-sm text-content-500">
                      No hay categorías
                    </p>
                  ) : (
                    inventoryCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                          selectedCategoryId === cat.id
                            ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30'
                            : 'bg-white dark:bg-surface-800 text-content-600 dark:text-content-400 border-surface-200 dark:border-surface-700 hover:border-green-400'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nueva categoría"
                    className="flex-1 h-10 rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-surface-700 dark:bg-surface-800 dark:text-content-100"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCategory}
                  >
                    Crear
                  </Button>
                </div>
              )}
              {!selectedCategoryId &&
                !showNewCategory &&
                inventoryCategories.length > 0 && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    Selecciona una categoría
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="quantity"
                className="text-sm font-medium text-content-700 dark:text-content-300"
              >
                Cantidad *
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                placeholder="0"
                {...register('quantity', {
                  required: 'La cantidad es requerida',
                  min: 1,
                })}
                className="flex h-10 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-content-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-content-100 dark:placeholder:text-content-500 dark:focus-visible:ring-offset-surface-900"
              />
              {errors.quantity && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-content-700 dark:text-content-300">
                Cantidades rápidas
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_VALUES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleQuickValue(value)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-100 dark:bg-surface-700 text-content-600 dark:text-content-300 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-content-700 dark:text-content-300"
              >
                Descripción (opcional)
              </label>
              <input
                id="description"
                placeholder={
                  type === Entities.InventoryMovementTypes.IN
                    ? '¿Qué entra?'
                    : '¿Qué sale?'
                }
                {...register('description')}
                className="flex h-10 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-content-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-content-100 dark:placeholder:text-content-500 dark:focus-visible:ring-offset-surface-900"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
