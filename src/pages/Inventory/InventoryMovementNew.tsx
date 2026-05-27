import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'
import { Button, toast } from '../../components/ui'
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

const getTitle = (type: InventoryMovementType): string => {
  const titles: Record<InventoryMovementType, string> = {
    [Entities.InventoryMovementTypes.IN]: 'Nueva Entrada',
    [Entities.InventoryMovementTypes.OUT]: 'Nueva Salida',
  }
  return titles[type] || 'Nuevo Movimiento'
}

const getDescriptionPlaceholder = (type: InventoryMovementType): string => {
  return type === Entities.InventoryMovementTypes.IN
    ? '¿Qué entra?'
    : '¿Qué sale?'
}

interface CategorySelectorProps {
  categories: { id: string; name: string }[]
  selectedId: string
  onSelect: (id: string) => void
  showNew: boolean
  onToggleNew: () => void
  newName: string
  onNewNameChange: (name: string) => void
  onCreate: () => void
  error?: string
}

const CategorySelector = ({
  categories,
  selectedId,
  onSelect,
  showNew,
  onToggleNew,
  newName,
  onNewNameChange,
  onCreate,
  error,
}: CategorySelectorProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-content-700 dark:text-content-300">
        Categoría *
      </span>
      <button
        type="button"
        onClick={onToggleNew}
        className="text-xs text-green-600 dark:text-green-400 hover:underline"
      >
        {showNew ? 'Ver categorías' : '+ Nueva'}
      </button>
    </div>

    {!showNew ? (
      <div className="flex flex-wrap gap-2">
        {categories.length === 0 ? (
          <p className="text-sm text-content-500">No hay categorías</p>
        ) : (
          categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                selectedId === cat.id
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
          value={newName}
          onChange={(e) => onNewNameChange(e.target.value)}
          placeholder="Nueva categoría"
          className="flex-1 h-10 rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-surface-700 dark:bg-surface-800 dark:text-content-100"
        />
        <Button type="button" size="sm" onClick={onCreate}>
          Crear
        </Button>
      </div>
    )}

    {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
  </div>
)

const QuantityInput = ({
  register,
  errors,
  quickValues,
  onQuickValue,
}: {
  register: any
  errors: any
  quickValues: number[]
  onQuickValue: (value: number) => void
}) => (
  <>
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
        autoComplete="off"
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
      <span className="text-sm font-medium text-content-700 dark:text-content-300">
        Cantidades rápidas
      </span>
      <div className="flex flex-wrap gap-2">
        {quickValues.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onQuickValue(value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-100 dark:bg-surface-700 text-content-600 dark:text-content-300 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  </>
)

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
  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  useEffect(() => {
    dispatch(fetchInventoryCategories())
  }, [dispatch])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      const { InventoryCategoryService } =
        await import('../../services/InventoryCategoryService')
      await InventoryCategoryService.createCategory(newCategoryName.trim())
      dispatch(fetchInventoryCategories())
      setNewCategoryName('')
      setShowNewCategory(false)
    } catch (error) {
      toast.error('Error al crear la categoría')
    }
  }

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<InventoryMovementFormData>({
    defaultValues: { quantity: 0, description: '' },
  })

  const handleQuickValue = (value: number) => {
    setValue('quantity', value, { shouldValidate: true })
  }

  const onSubmit = async (data: InventoryMovementFormData) => {
    if (!sessionId || !branchId || !data.quantity || !selectedCategoryId) return

    try {
      await dispatch(
        createInventoryMovement({
          sessionId,
          branchId,
          inventoryCategoryId: selectedCategoryId,
          type,
          quantity: data.quantity,
          description: data.description,
        })
      ).unwrap()

      navigate(`/branches/${branchId}/sessions/${sessionId}`)
    } catch (error) {
      toast.error((error as string) || 'Error al crear el movimiento')
    }
  }

  const showCategoryError =
    !selectedCategoryId && !showNewCategory && inventoryCategories.length > 0

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-content-900 dark:text-white tracking-tight">
            {getTitle(type)}
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
            <CategorySelector
              categories={inventoryCategories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
              showNew={showNewCategory}
              onToggleNew={() => setShowNewCategory(!showNewCategory)}
              newName={newCategoryName}
              onNewNameChange={setNewCategoryName}
              onCreate={handleCreateCategory}
              error={showCategoryError ? 'Selecciona una categoría' : undefined}
            />

            <QuantityInput
              register={register}
              errors={errors}
              quickValues={QUICK_VALUES}
              onQuickValue={handleQuickValue}
            />

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-content-700 dark:text-content-300"
              >
                Descripción (opcional)
              </label>
              <input
                id="description"
                autoComplete="off"
                placeholder={getDescriptionPlaceholder(type)}
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
