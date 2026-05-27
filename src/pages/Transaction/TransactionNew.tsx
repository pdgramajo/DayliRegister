import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'
import {
  Button,
  MoneyInput,
  QuickValuesEditor,
  toast,
} from '../../components/ui'
import { createTransaction } from '../../store/transactionSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore'
import type { RootState } from '../../store'
import { Entities } from '../../types/entities'
import type { TransactionType, PaymentMethod } from '../../types/entities'
import { formatMoney } from '../../lib/formatters'

interface TransactionFormData {
  amount?: number
  description: string
  paymentMethod?: PaymentMethod
}

export const TransactionNew = () => {
  const { id: branchId, sessionId } = useParams<{
    id: string
    sessionId: string
  }>()
  const [searchParams] = useSearchParams()
  const type =
    (searchParams.get('type') as TransactionType) ||
    Entities.TransactionTypes.SALE

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector((state: RootState) => state.transactions)

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    PaymentMethod | undefined
  >(
    type === Entities.TransactionTypes.SALE
      ? Entities.PaymentMethods.CASH
      : undefined
  )

  const {
    handleSubmit,
    control,
    register,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    defaultValues: {
      amount: undefined,
      description: '',
      paymentMethod: selectedPaymentMethod,
    },
  })

  const onSubmit = async (data: TransactionFormData) => {
    if (!sessionId || !branchId || !data.amount) return

    try {
      await dispatch(
        createTransaction({
          sessionId,
          branchId,
          type,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          description: data.description,
        })
      ).unwrap()

      navigate(`/branches/${branchId}/sessions/${sessionId}`)
    } catch (error) {
      toast.error((error as string) || 'Error al crear la transacción')
    }
  }

  const titles = {
    [Entities.TransactionTypes.SALE]: 'Nueva Venta',
    [Entities.TransactionTypes.EXPENSE]: 'Nuevo Gasto',
    [Entities.TransactionTypes.WITHDRAWAL]: 'Nuevo Retiro',
    [Entities.TransactionTypes.INCOME]: 'Nuevo Ingreso',
  }

  const title = titles[type] || 'Nueva Transacción'

  const getPaymentMethodSelector = () => (
    <div className="space-y-2">
      <span className="text-sm font-medium text-content-700 dark:text-content-300">
        Método de pago
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectedPaymentMethod(Entities.PaymentMethods.CASH)
            setValue('paymentMethod', Entities.PaymentMethods.CASH)
          }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
            selectedPaymentMethod === Entities.PaymentMethods.CASH
              ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30'
              : 'bg-white dark:bg-surface-800 text-content-600 dark:text-content-400 border-surface-200 dark:border-surface-700 hover:border-green-400'
          }`}
        >
          Efectivo
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedPaymentMethod(Entities.PaymentMethods.TRANSFER)
            setValue('paymentMethod', Entities.PaymentMethods.TRANSFER)
          }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
            selectedPaymentMethod === Entities.PaymentMethods.TRANSFER
              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
              : 'bg-white dark:bg-surface-800 text-content-600 dark:text-content-400 border-surface-200 dark:border-surface-700 hover:border-blue-400'
          }`}
        >
          Transferencia
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-content-900 dark:text-white tracking-tight">
            {title}
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
            <Button type="submit" form="transaction-form" loading={isLoading}>
              Guardar
            </Button>
          </div>

          <form
            id="transaction-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {type === Entities.TransactionTypes.SALE &&
              getPaymentMethodSelector()}

            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium text-content-700 dark:text-content-300"
              >
                Monto *
              </label>
              <Controller
                name="amount"
                control={control}
                rules={{ required: 'El monto es requerido' }}
                render={({ field }) => (
                  <MoneyInput
                    id="amount"
                    autoComplete="off"
                    {...field}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="0"
                    className={
                      errors.amount
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : ''
                    }
                  />
                )}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <QuickValuesEditor
              storageKey={type}
              onSelect={(v) => setValue('amount', v)}
              formatValue={formatMoney}
            />

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-content-700 dark:text-content-300"
              >
                Notas (opcional)
              </label>
              <input
                id="description"
                autoComplete="off"
                placeholder={
                  type === Entities.TransactionTypes.SALE
                    ? 'Ej: cobré menos porque no había cambio'
                    : type === Entities.TransactionTypes.EXPENSE
                      ? 'Ej: pagué con tarjeta'
                      : type === Entities.TransactionTypes.WITHDRAWAL
                        ? '¿Quién hizo el retiro?'
                        : 'Ej: devolución de cliente'
                }
                {...register('description')}
                className="flex h-10 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-content-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-content-100 dark:placeholder:text-content-500 dark:focus-visible:ring-offset-surface-900"
              />
            </div>

            <input
              type="hidden"
              {...register('paymentMethod')}
              value={selectedPaymentMethod || ''}
            />
          </form>
        </div>
      </div>
    </div>
  )
}
