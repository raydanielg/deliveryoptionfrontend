"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card } from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { EmptyState } from "@/components/shared/states"

export interface OrdersOverviewData {
  total: number
  pending: number
  confirmed: number
  cancelled: number
  totalRevenue: number
}

const config = {
  count: { label: "Orders", color: "var(--chart-1)" },
} satisfies ChartConfig

export function OrdersOverviewChart({
  data,
  isLoading,
}: {
  data?: OrdersOverviewData | null
  isLoading?: boolean
}) {
  const chartData = React.useMemo(() => {
    if (!data) return []
    return [
      { name: "Pending", value: data.pending, fill: "var(--chart-3)" },
      { name: "Confirmed", value: data.confirmed, fill: "var(--chart-2)" },
      { name: "Cancelled", value: data.cancelled, fill: "var(--destructive)" },
    ].filter((d) => d.value > 0)
  }, [data])

  return (
    <Card className="gap-0 p-5">
      <h2 className="text-base font-semibold tracking-tight">Orders overview</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">Distribution of orders by status</p>

      <div className="mt-5">
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : chartData.length === 0 ? (
          <EmptyState title="No order data" className="h-[220px] py-0" />
        ) : (
          <ChartContainer config={config} className="h-[220px] w-full">
            <BarChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickMargin={8}
                className="text-xs"
              />
              <ChartTooltip
                cursor={{ className: "fill-muted/40" }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48} />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </Card>
  )
}
