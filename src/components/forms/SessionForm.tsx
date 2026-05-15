import { useForm, Controller } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button, MoneyInput } from '../ui'

interface SessionFormData {
  name: string
  initialAmount?: number
  notes?: string
}

interface SessionFormProps {
  initialValues?: Partial<SessionFormData>
  onSubmit: (data: SessionFormData) => void | Promise<void>
  isLoading?: boolean
  cancelTo?: string
  submitText?: string
}

export const SessionForm = ({
  initialValues,
  onSubmit,
  isLoading = false,
  cancelTo = '/branches',
  submitText,
}: SessionFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SessionFormData>({
    defaultValues: {
      name: '',
      initialAmount: undefined,
      notes: '',
      ...initialValues,
    },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6 -mt-2">
        <Link
          to={cancelTo}
          className="text-sm text-content-600 dark:text-content-400 hover:text-content-900 dark:hover:text-content-100 transition-colors"
        >
          <ArrowLeft className="size-4 inline mr-1" />
          Cancelar
        </Link>
        <Button
          type="submit"
          loading={isLoading}
          onClick={handleSubmit(onSubmit)}
        >
          {submitText || (initialValues?.name ? 'Guardar' : 'Abrir sesión')}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-content-700 dark:text-content-300"
          >
            Nombre *
          </label>
          <input
            id="name"
            placeholder="Ej: Mañana - 13/05/2026"
            {...register('name', { required: 'El nombre es requerido' })}
            className="flex h-10 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-content-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-content-100 dark:placeholder:text-content-500 dark:focus-visible:ring-offset-surface-900"
          />
          {errors.name && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="initialAmount"
            className="text-sm font-medium text-content-700 dark:text-content-300"
          >
            Monto inicial
          </label>
          <Controller
            name="initialAmount"
            control={control}
            render={({ field }) => (
              <MoneyInput
                {...field}
                value={field.value}
                onChange={field.onChange}
                className={
                  errors.initialAmount
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }
              />
            )}
          />
          {errors.initialAmount && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.initialAmount.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="notes"
            className="text-sm font-medium text-content-700 dark:text-content-300"
          >
            Notas
          </label>
          <textarea
            id="notes"
            placeholder="Observaciones adicionales..."
            {...register('notes')}
            rows={3}
            className="flex w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-content-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-content-100 dark:placeholder:text-content-500 dark:focus-visible:ring-offset-surface-900"
          />
          {errors.notes && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.notes.message}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export type { SessionFormData }
