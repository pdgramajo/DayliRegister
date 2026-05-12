import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
}

export const BranchForm = ({
  initialValues,
  onSubmit,
  isLoading = false,
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
      <Input
        label="Nombre"
        placeholder="Ej: Sucursal Centro"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Dirección"
        placeholder="Ej: Av. Principal 123"
        error={errors.address?.message}
        {...register('address')}
      />

      <Input
        label="Teléfono"
        placeholder="Ej: +51 987 654 321"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <input
          type="checkbox"
          id="isActive"
          {...register('isActive')}
          className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-offset-2"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Sucursal activa
        </label>
      </div>

      <Button
        type="submit"
        loading={isLoading}
        className="w-full h-12 text-base font-semibold mt-4"
      >
        {initialValues?.name ? 'Guardar cambios' : 'Crear sucursal'}
      </Button>
    </form>
  )
}
