import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { CreateBranchDTO } from '../../types/dtos'
import { Button, Input } from '../ui'
import { formatPhoneForDisplay, parsePhoneToSave } from '../../lib/formatters'

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
    watch,
    setValue,
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

  const phoneValue = watch('phone', '')
  const [phoneDisplay, setPhoneDisplay] = useState(
    initialValues?.phone ? formatPhoneForDisplay(initialValues.phone) : ''
  )

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhoneDisplay(formatPhoneForDisplay(value))
    setValue('phone', value, { shouldValidate: true })
  }

  const handleFormSubmit = (data: BranchFormData) => {
    const dataToSubmit = {
      ...data,
      phone: data.phone ? parsePhoneToSave(data.phone) : undefined,
    }
    onSubmit(dataToSubmit)
  }

  useEffect(() => {
    if (!phoneValue && initialValues?.phone) {
      setPhoneDisplay(formatPhoneForDisplay(initialValues.phone))
    }
  }, [phoneValue, initialValues?.phone])

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
            autoComplete="organization"
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
          <Input
            id="address"
            autoComplete="street-address"
            placeholder="Dirección"
            {...register('address')}
          />
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
            autoComplete="tel"
            placeholder="+54 388 123 4567"
            value={phoneDisplay}
            onChange={handlePhoneChange}
          />
        </div>

        <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
          <input
            type="checkbox"
            id="isActive"
            autoComplete="off"
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
      </form>
    </div>
  )
}
