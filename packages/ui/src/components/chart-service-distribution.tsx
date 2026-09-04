"use client"

import { Cell, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"

interface ServiceDistribution {
  service: string
  count: number
  percentage: number
}

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

const mockData: ServiceDistribution[] = [
  { service: "Boda Boda", count: 1420, percentage: 49.9 },
  { service: "Van / Kirikuu", count: 842, percentage: 29.6 },
  { service: "Truck / Lori", count: 284, percentage: 10.0 },
  { service: "SGR Parcel", count: 168, percentage: 5.9 },
  { service: "Air Cargo", count: 133, percentage: 4.7 },
]

export function ServiceDistributionDonut({ data }: { data?: ServiceDistribution[] }) {
  const chartData = (data || mockData).map((d) => ({ name: d.service, value: d.percentage, count: d.count }))
  const config: ChartConfig = {}
  chartData.forEach((d, i) => {
    config[d.name] = { label: d.name, color: COLORS[i % COLORS.length] }
  })

  return (
    <div className="flex items-center gap-4">
      <ChartContainer config={config} className="mx-auto aspect-square h-[140px]">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={42}
            outerRadius={64}
            strokeWidth={2}
            paddingAngle={2}
            animationDuration={800}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="flex-1 space-y-2">
        {chartData.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-muted-foreground">{d.name}</span>
            </div>
            <span className="font-medium tabular-nums">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
