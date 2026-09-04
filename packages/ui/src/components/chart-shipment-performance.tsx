"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"

interface ChartPoint {
  date: string
  shipments: number
  delivered: number
  revenue: number
  failed: number
}

const chartConfig = {
  shipments: { label: "Shipments", color: "var(--primary)" },
  delivered: { label: "Delivered", color: "var(--chart-2)" },
  revenue: { label: "Revenue", color: "var(--chart-3)" },
} satisfies ChartConfig

type Metric = "shipments" | "delivered" | "revenue"

const mockData: ChartPoint[] = [
  { date: "2026-08-22", shipments: 1820, delivered: 1760, revenue: 2780000, failed: 60 },
  { date: "2026-08-23", shipments: 2100, delivered: 2035, revenue: 3300000, failed: 65 },
  { date: "2026-08-24", shipments: 1750, delivered: 1695, revenue: 2920000, failed: 55 },
  { date: "2026-08-25", shipments: 2480, delivered: 2400, revenue: 4020000, failed: 80 },
  { date: "2026-08-26", shipments: 2890, delivered: 2800, revenue: 4680000, failed: 90 },
  { date: "2026-08-27", shipments: 2650, delivered: 2565, revenue: 4260000, failed: 85 },
  { date: "2026-08-28", shipments: 2780, delivered: 2690, revenue: 4470000, failed: 90 },
]

export function ShipmentPerformanceChart({ data }: { data?: ChartPoint[] }) {
  const [metric, setMetric] = React.useState<Metric>("shipments")
  const [range, setRange] = React.useState("7d")
  const chartData = data || mockData

  const formatValue = (v: number) => {
    if (metric === "revenue") return `${(v / 1000000).toFixed(0)}M`
    return v.toLocaleString()
  }

  const colorVar = metric === "shipments" ? "var(--color-shipments)" : metric === "delivered" ? "var(--color-delivered)" : "var(--color-revenue)"

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Shipment Performance</CardTitle>
        <CardDescription>Delivery activity over time</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <ToggleGroup
              multiple={false}
              value={[metric]}
              onValueChange={(v) => { if (v[0]) setMetric(v[0] as Metric) }}
              variant="outline"
              className="hidden @[540px]/card:flex"
            >
              <ToggleGroupItem value="shipments">Shipments</ToggleGroupItem>
              <ToggleGroupItem value="delivered">Delivered</ToggleGroupItem>
              <ToggleGroupItem value="revenue">Revenue</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup
              multiple={false}
              value={[range]}
              onValueChange={(v) => { if (v[0]) setRange(v[0]) }}
              variant="outline"
              className="hidden @[540px]/card:flex"
            >
              <ToggleGroupItem value="today">Today</ToggleGroupItem>
              <ToggleGroupItem value="7d">7 Days</ToggleGroupItem>
              <ToggleGroupItem value="30d">30 Days</ToggleGroupItem>
              <ToggleGroupItem value="90d">90 Days</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorVar} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colorVar} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", { weekday: "short" })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatValue}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey={metric}
              type="natural"
              fill="url(#fillMetric)"
              stroke={colorVar}
              strokeWidth={2}
              animationDuration={800}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
