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
import { StatusBadge } from "@/components/shared/status-badge"

export interface RoutePerformanceData {
  route: string
  shipments: number
  avgTimeHours: number
  successRate: number
}

const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const config = {
  shipments: { label: "Shipments" },
} satisfies ChartConfig

function formatNumber(n: number) {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function RoutePerformanceChart({
  data,
  isLoading,
}: {
  data?: RoutePerformanceData[]
  isLoading?: boolean
}) {
  const rows = React.useMemo(
    () =>
      (data ?? [])
        .slice()
        .sort((a, b) => b.shipments - a.shipments)
        .slice(0, 8)
        .map((item, index) => ({
          name: item.route,
          shipments: item.shipments,
          avgTime: item.avgTimeHours,
          successRate: item.successRate,
          fill: SERIES_COLORS[index % SERIES_COLORS.length],
        })),
    [data],
  )

  return (
    <Card className="gap-0 p-5">
      <h2 className="text-base font-semibold tracking-tight">Route performance</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Shipment volume per route, with delivery success rate.
      </p>

      <div className="mt-5">
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No route activity yet"
            className="h-[220px] py-0"
          />
        ) : (
          <>
            <ChartContainer config={config} className="h-[220px] w-full">
              <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="3 3"
                  className="stroke-border/50"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tickFormatter={(value: number) => formatNumber(value)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  className="text-xs"
                />
                <ChartTooltip
                  cursor={{ className: "fill-muted/40" }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `${formatNumber(Number(value))} shipments`}
                    />
                  }
                />
                <Bar dataKey="shipments" radius={4} barSize={18} />
              </BarChart>
            </ChartContainer>

            <ul className="mt-4 space-y-2 border-t border-border/60 pt-4">
              {rows.map((row) => (
                <li key={row.name} className="flex items-center gap-3 text-sm">
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-[3px]"
                    style={{ backgroundColor: row.fill }}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">{row.name}</span>
                  <span className="hidden text-muted-foreground tabular-nums sm:inline">
                    {row.avgTime.toFixed(1)}h avg
                  </span>
                  <StatusBadge
                    size="sm"
                    status={
                      row.successRate >= 95
                        ? "DELIVERED"
                        : row.successRate >= 85
                          ? "PENDING"
                          : "FAILED"
                    }
                    className="hidden md:inline-flex"
                  />
                  <span className="w-14 text-right font-medium tabular-nums">
                    {row.successRate.toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Card>
  )
}
