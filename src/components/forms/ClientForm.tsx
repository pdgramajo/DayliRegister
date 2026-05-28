import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { CreateClientDTO } from '../../types/dtos'
import { Button, Input } from '../ui'
import { formatPhoneForDisplay, parsePhoneToSave } from '../../lib/formatters'

const clientSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'Máximo 100 caracteres'),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional(),
  notes: z.string().max(200, 'Máximo 200 caracteres').optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  branchId: string
  initialValues?: Partial<CreateClientDTO>
  onSubmit: (data: CreateClientDTO) => void | Promise<void>
  isLoading?: boolean
  cancelTo: string
}

export const ClientForm = ({
  branchId,
  initialValues,
  onSubmit,
  isLoading = false,
  cancelTo,
}: ClientFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      name: initialValues?.name || '',
      phone: initialValues?.phone || '',
      notes: initialValues?.notes || '',
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

  const handleFormSubmit = (data: ClientFormData) => {
    const payload: CreateClientDTO = {
      name: data.name,
      phone: data.phone ? parsePhoneToSave(data.phone) : '',
      branchId,
    }
    if (data.notes) {
      payload.notes = data.notes
    }
    onSubmit(payload)
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
            autoComplete="off"
            placeholder="Nombre del cliente"
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

        <div className="space-y-2">
          <label
            htmlFor="notes"
            className="text-sm font-medium text-content-700 dark:text-content-300"
          >
            Notas <span className="text-content-400">(opcional)</span>
          </label>
          <Input
            id="notes"
            autoComplete="off"
            placeholder="Referencias, dirección, etc."
            {...register('notes')}
          />
        </div>
      </form>
    </div>
  )
}
