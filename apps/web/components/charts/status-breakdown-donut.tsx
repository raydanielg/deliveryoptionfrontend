"use client"

import * as React from "react"
import { Cell, Pie, PieChart } from "recharts"
import { Card } from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { EmptyState } from "@/components/shared/states"

export interface StatusBreakdownData {
  status: string
  count: number
}

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: "var(--chart-2)",
  IN_TRANSIT: "var(--chart-1)",
  OUT_FOR_DELIVERY: "var(--chart-3)",
  PICKED_UP: "var(--chart-4)",
  BOOKED: "var(--chart-5)",
  CANCELLED: "var(--destructive)",
  PENDING: "var(--chart-3)",
  DRIVER_ASSIGNED: "var(--chart-4)",
  FAILED: "var(--destructive)",
}

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

function humanise(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}

export function StatusBreakdownDonut({
  data,
  isLoading,
}: {
  data?: StatusBreakdownData[]
  isLoading?: boolean
}) {
  const chartData = React.useMemo(
    () =>
      (data ?? [])
        .filter((d) => d.count > 0)
        .map((d) => ({
          name: humanise(d.status),
          value: d.count,
          status: d.status,
        })),
    [data],
  )

  const config: ChartConfig = React.useMemo(() => {
    const cfg: ChartConfig = {}
    chartData.forEach((d) => {
      cfg[d.name] = {
        label: d.name,
        color: STATUS_COLORS[d.status] ?? DEFAULT_COLORS[0],
      }
    })
    return cfg
  }, [chartData])

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  if (isLoading) {
    return (
      <Card className="gap-0 p-5">
        <h2 className="text-base font-semibold tracking-tight">Status breakdown</h2>
        <Skeleton className="mt-5 h-[200px] w-full" />
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="gap-0 p-5">
        <h2 className="text-base font-semibold tracking-tight">Status breakdown</h2>
        <EmptyState title="No shipment data" className="mt-5 h-[200px] py-0" />
      </Card>
    )
  }

  return (
    <Card className="gap-0 p-5">
      <h2 className="text-base font-semibold tracking-tight">Status breakdown</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Distribution of shipments by current status.
      </p>

      <div className="mt-5 flex items-center gap-6">
        <div className="relative shrink-0">
          <ChartContainer config={config} className="aspect-square h-[180px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={78}
                strokeWidth={2}
                paddingAngle={2}
                animationDuration={800}
              >
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={STATUS_COLORS[d.status] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums">{total}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {chartData.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    backgroundColor: STATUS_COLORS[d.status] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                  }}
                />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
              <span className="font-medium tabular-nums">
                {d.value}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({((d.value / total) * 100).toFixed(1)}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
