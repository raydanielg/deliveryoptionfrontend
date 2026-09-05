"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card } from "@workspace/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"

import { EmptyState, ErrorState } from "@/components/shared/states"

export type Range = "7d" | "30d" | "90d"

const RANGES = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
] as const

export interface ShipmentVolumePoint {
  date: string
  shipments: number
  delivered: number
}

const config = {
  shipments: { label: "Shipments", color: "var(--chart-1)" },
  delivered: { label: "Delivered", color: "var(--chart-2)" },
} satisfies ChartConfig

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function ShipmentVolumeChart({
  data,
  isLoading,
  error,
  range,
  onRangeChange,
  title = "Shipment volume",
  description,
}: {
  data?: ShipmentVolumePoint[]
  isLoading?: boolean
  error?: { status?: number; message?: string } | null
  range: Range
  onRangeChange: (range: Range) => void
  title?: string
  description?: string
}) {
  const points = React.useMemo(
    () =>
      (data ?? []).map((p) => ({
        ...p,
        label: new Date(p.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
      })),
    [data],
  )

  return (
    <Card className="gap-0 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <ToggleGroup
          value={[range]}
          onValueChange={(value) => value[0] && onRangeChange(value[0] as Range)}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          {RANGES.map((item) => (
            <ToggleGroupItem key={item.value} value={item.value} className="px-3 text-xs">
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : error ? (
          <ErrorState status={error.status} message={error.message} className="h-[260px]" />
        ) : points.length === 0 ? (
          <EmptyState
            title="No shipments in this period"
            description="Once shipments start coming in, the trend appears here."
            className="h-[260px] py-0"
          />
        ) : (
          <ChartContainer config={config} className="h-[260px] w-full">
            <AreaChart data={points} margin={{ left: 4, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="xe-shipments-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-shipments)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-shipments)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="xe-delivered-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-delivered)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--color-delivered)" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={28}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tickMargin={8}
                className="text-xs"
                tickFormatter={(value: number) => formatNumber(value)}
              />

              <ChartTooltip
                cursor={{ strokeDasharray: "4 4" }}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) => formatNumber(Number(value))}
                  />
                }
              />

              <Area
                dataKey="shipments"
                type="monotone"
                stroke="var(--color-shipments)"
                strokeWidth={2}
                fill="url(#xe-shipments-fill)"
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
              <Area
                dataKey="delivered"
                type="monotone"
                stroke="var(--color-delivered)"
                strokeWidth={2}
                fill="url(#xe-delivered-fill)"
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </Card>
  )
}
