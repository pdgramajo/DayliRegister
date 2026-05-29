import { Wallet, ArrowUpRight, TrendingUp, PiggyBank } from 'lucide-react'
import { toast } from '../../components/ui'
import { formatMoney } from '../../lib/formatters'

interface SummaryCardsProps {
  cashSales: number
  transferSales: number
  totalSales: number
  cashInBox: number
}

const Card = ({
  icon,
  iconColor,
  label,
  value,
  valueColor = 'text-content-900',
  onCopy,
}: {
  icon: React.ReactNode
  iconColor: string
  label: string
  value: number
  valueColor?: string
  onCopy?: () => void
}) => (
  <button
    onClick={onCopy}
    title="Clic para copiar"
    className="w-full p-1.5 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 text-center hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer"
  >
    <div className="flex items-center justify-center gap-1 mb-0.5">
      <span className={`size-3 ${iconColor}`}>{icon}</span>
      <span className={`text-md ${valueColor}`}>{label}</span>
    </div>
    <p className={`text-xl font-semibold ${valueColor}`}>
      {formatMoney(value)}
    </p>
  </button>
)

export const SummaryCards = ({
  cashSales,
  transferSales,
  totalSales,
  cashInBox,
}: SummaryCardsProps) => {
  const handleCopy = (value: number) => {
    navigator.clipboard.writeText(value.toString())
    toast.success('Copiado')
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      <Card
        icon={<Wallet width={14} height={14} />}
        iconColor="text-green-600"
        label="Efectivo"
        value={cashSales}
        valueColor="text-green-600"
        onCopy={() => handleCopy(cashSales)}
      />
      <Card
        icon={<ArrowUpRight width={14} height={14} />}
        iconColor="text-blue-500"
        label="Transferencias"
        value={transferSales}
        valueColor="text-blue-600"
        onCopy={() => handleCopy(transferSales)}
      />
      <Card
        icon={<TrendingUp width={14} height={14} />}
        iconColor="text-grey-100"
        label="Total Ventas"
        value={totalSales}
        valueColor="text-grey-100"
        onCopy={() => handleCopy(totalSales)}
      />
      <Card
        icon={<PiggyBank width={14} height={14} />}
        iconColor="text-grey-100"
        label="Dinero Caja"
        value={cashInBox}
        valueColor="text-grey-100"
        onCopy={() => handleCopy(cashInBox)}
      />
    </div>
  )
}
