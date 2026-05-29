import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { CreateProductDTO } from '../../types/dtos'
import { Button, Input, MoneyInput } from '../ui'

const productSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'Máximo 200 caracteres'),
  price: z.number().positive('Debe ser un valor positivo'),
  offerPrice: z.number().optional(),
  category: z.string().max(100, 'Máximo 100 caracteres').optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  branchId: string
  initialValues?: Partial<CreateProductDTO>
  onSubmit: (data: CreateProductDTO) => void | Promise<void>
  isLoading?: boolean
  cancelTo: string
}

export const ProductForm = ({
  branchId,
  initialValues,
  onSubmit,
  isLoading = false,
  cancelTo,
}: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialValues?.name || '',
      price: initialValues?.price,
      offerPrice: initialValues?.offerPrice ?? undefined,
      category: initialValues?.category || '',
    },
  })

  const priceValue = watch('price')

  const handleFormSubmit = (data: ProductFormData) => {
    const payload: CreateProductDTO = {
      name: data.name,
      price: data.price,
      branchId,
      offerPrice: data.offerPrice,
      category: data.category || undefined,
    }
    onSubmit(payload)
  }

  return (
    <div>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div className="flex justify-between items-center mb-6 -mt-2">
          <Link
            to={cancelTo}
            className="text-sm text-content-600 dark:text-content-400 hover:text-content-900 dark:hover:text-content-100 transition-colors"
          >
            <ArrowLeft className="size-4 inline mr-1" />
            Cancelar
          </Link>
          <Button type="submit" loading={isLoading}>
            {initialValues?.name ? 'Guardar' : 'Crear'}
          </Button>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-content-700 dark:text-content-300"
          >
            Nombre
          </label>
          <Input
            id="name"
            autoComplete="off"
            placeholder="Nombre del producto"
            {...register('name')}
            className={
              errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''
            }
          />
          {errors.name && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="price"
            className="text-sm font-medium text-content-700 dark:text-content-300"
          >
            Precio
          </label>
          <MoneyInput
            id="price"
            autoComplete="off"
            value={priceValue}
            onChange={(v) =>
              setValue('price', v ?? 0, { shouldValidate: true })
            }
            className={
              errors.price ? 'border-red-500 focus-visible:ring-red-500' : ''
            }
          />
          {errors.price && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.price.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="offerPrice"
            className="text-sm font-medium text-content-700 dark:text-content-300"
          >
            Precio de oferta{' '}
            <span className="text-content-400">(opcional)</span>
          </label>
          <MoneyInput
            id="offerPrice"
            autoComplete="off"
            value={watch('offerPrice')}
            onChange={(v) =>
              setValue('offerPrice', v, { shouldValidate: true })
            }
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="category"
            className="text-sm font-medium text-content-700 dark:text-content-300"
          >
            Categoría <span className="text-content-400">(opcional)</span>
          </label>
          <Input
            id="category"
            autoComplete="off"
            placeholder="Ej: Lácteos, Bebidas, etc."
            {...register('category')}
          />
        </div>
      </form>
    </div>
  )
}
