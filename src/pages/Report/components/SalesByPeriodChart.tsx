import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DaySales } from '../../../services/ReportService'

interface SalesByPeriodChartProps {
  data: DaySales[]
}

export const SalesByPeriodChart = ({ data }: SalesByPeriodChartProps) => {
  const chartData = data.map((d) => ({
    name: `${d.dayName.slice(0, 3)} ${d.dayNumber}`,
    Ventas: d.total,
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-surface-200 dark:stroke-surface-700"
          />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--content-500)', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--content-500)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface-800)',
              border: '1px solid var(--surface-700)',
              borderRadius: '8px',
              color: 'var(--content-100)',
            }}
            formatter={(value) => {
              const num = Number(value ?? 0)
              return [`$${num.toLocaleString('es-AR')}`, 'Ventas']
            }}
          />
          <Bar dataKey="Ventas" fill="#6366F1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
