import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { CreateBranchDTO } from '../../types/dtos'
import { Button, Input } from '../ui'

const branchSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres'),
  address: z.string().max(200, 'Máximo 200 caracteres').optional(),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional(),
  isActive: z.boolean(),
})

type BranchFormData = z.infer<typeof branchSchema>

interface BranchFormProps {
  initialValues?: Partial<CreateBranchDTO>
  onSubmit: (data: CreateBranchDTO) => void | Promise<void>
  isLoading?: boolean
  cancelTo?: string
}

export const BranchForm = ({
  initialValues,
  onSubmit,
  isLoading = false,
  cancelTo = '/branches',
}: BranchFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      isActive: true,
      ...initialValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium text-content-700 dark:text-content-300"
        >
          Nombre
        </label>
        <Input
          id="name"
          placeholder="Nombre de la sucursal"
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
          htmlFor="address"
          className="text-sm font-medium text-content-700 dark:text-content-300"
        >
          Dirección
        </label>
        <Input id="address" placeholder="Dirección" {...register('address')} />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="phone"
          className="text-sm font-medium text-content-700 dark:text-content-300"
        >
          Teléfono
        </label>
        <Input
          id="phone"
          placeholder="+54 388 123 4567"
          {...register('phone')}
        />
      </div>

      <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
        <input
          type="checkbox"
          id="isActive"
          {...register('isActive')}
          className="size-5 rounded border-surface-300 text-brand-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          htmlFor="isActive"
          className="text-sm font-medium text-content-700 dark:text-content-200"
        >
          Sucursal activa
        </label>
      </div>

      <div className="flex gap-3">
        <Link to={cancelTo} className="flex-1">
          <Button type="button" variant="outline" className="w-full">
            <ArrowLeft className="size-4" />
            Cancelar
          </Button>
        </Link>
        <Button type="submit" loading={isLoading} className="flex-1">
          {initialValues?.name ? 'Guardar' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}
