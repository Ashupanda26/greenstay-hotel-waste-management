import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatPercent, type ClassificationSummary, type TrendSeries } from '../../lib/analytics'
import { chartColors } from './chartColors'

const axisTick = { fill: chartColors.muted, fontSize: 12 }

export function TrendChart({ series }: { series: TrendSeries }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={series.points} margin={{ top: 16, right: 8, left: -16, bottom: 0 }} accessibilityLayer={false}>
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis dataKey="label" tick={axisTick} interval="preserveStartEnd" minTickGap={16} tickLine={false} />
        <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: chartColors.grid }}
          formatter={(value) => [value, 'Requests']}
          labelFormatter={(label) => (series.grouping === 'week' ? `Week commencing ${String(label).slice(4)}` : label)}
        />
        <Bar dataKey="count" name="Requests" fill={chartColors.brand} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

type HorizontalBarsProps = {
  rows: { name: string; count: number; valueLabel: string; color?: string }[]
  color?: string
}

/** Horizontal bars with the value written at the end of each bar. */
export function HorizontalBars({ rows, color = chartColors.brand }: HorizontalBarsProps) {
  const longestName = Math.max(...rows.map((r) => r.name.length), 4)
  const longestValue = Math.max(...rows.map((r) => r.valueLabel.length), 1)
  return (
    <ResponsiveContainer width="100%" height={rows.length * 38 + 16}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: longestValue * 8 + 12, left: 0, bottom: 0 }} accessibilityLayer={false}>
        <XAxis type="number" hide allowDecimals={false} domain={[0, 'dataMax']} />
        <YAxis
          type="category"
          dataKey="name"
          width={Math.min(longestName * 7.5 + 8, 140)}
          tick={axisTick}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={{ fill: chartColors.grid }} formatter={(value) => [value, 'Requests']} />
        <Bar dataKey="count" name="Requests" fill={color} radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
          {rows.map((row) => (
            <Cell key={row.name} fill={row.color ?? color} />
          ))}
          <LabelList dataKey="valueLabel" position="right" style={{ fill: chartColors.ink, fontSize: 12, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

const classificationColors = { Recyclable: chartColors.brand, 'Non-Recyclable': chartColors.warning }

/** Donut with a text legend giving each category's count and percentage. */
export function ClassificationDonut({ summary }: { summary: ClassificationSummary[] }) {
  const total = summary.reduce((sum, s) => sum + s.count, 0)
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <div className="relative size-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer={false}>
            <Pie
              data={summary}
              dataKey="count"
              nameKey="classification"
              innerRadius="62%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="#fff"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {summary.map((s) => (
                <Cell key={s.classification} fill={classificationColors[s.classification]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold">{total}</span>
          <span className="text-xs text-muted">requests</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {summary.map((s) => (
          <li key={s.classification} className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-sm" style={{ background: classificationColors[s.classification] }} />
            <span className="font-semibold">{s.classification}</span>
            <span className="text-muted">
              {s.count} ({formatPercent(s.percent)})
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
