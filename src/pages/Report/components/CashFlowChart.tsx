import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DaySales } from '../../../services/ReportService'

interface CashFlowChartProps {
  data: DaySales[]
}

export const CashFlowChart = ({ data }: CashFlowChartProps) => {
  const chartData = data.map((d) => ({
    name: `${d.dayName.slice(0, 3)} ${d.dayNumber}`,
    Balance: d.total,
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
              return [`$${num.toLocaleString('es-AR')}`, 'Balance']
            }}
          />
          <Line
            type="monotone"
            dataKey="Balance"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
