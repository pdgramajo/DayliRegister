import {
  Pie,
  PieChart,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { DaySales } from '../../../services/ReportService'

interface PaymentMethodChartProps {
  data: DaySales[]
}

export const PaymentMethodChart = ({ data }: PaymentMethodChartProps) => {
  const totalCash = data.reduce((sum, d) => sum + d.cash, 0)
  const totalTransfer = data.reduce((sum, d) => sum + d.transfer, 0)
  const total = totalCash + totalTransfer

  const chartData = [
    { name: 'Efectivo', value: totalCash, color: '#10B981' },
    { name: 'Transferencia', value: totalTransfer, color: '#6366F1' },
  ].filter((d) => d.value > 0)

  if (total === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-content-400">
        Sin datos de pago
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface-800)',
              border: '1px solid var(--surface-700)',
              borderRadius: '8px',
              color: 'var(--content-100)',
            }}
            formatter={(value) => {
              const num = Number(value ?? 0)
              return [
                `$${num.toLocaleString('es-AR')} (${((num / total) * 100).toFixed(1)}%)`,
                'Total',
              ]
            }}
          />
          <Legend
            wrapperStyle={{ color: 'var(--content-500)', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
