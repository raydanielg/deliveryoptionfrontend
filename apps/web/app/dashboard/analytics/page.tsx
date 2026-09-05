"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { ShipmentVolumeChart, type Range } from "@/components/charts/shipment-volume-chart"
import { RoutePerformanceChart } from "@/components/charts/route-performance-chart"
import { StatusBreakdownDonut } from "@/components/charts/status-breakdown-donut"
import { OrdersOverviewChart } from "@/components/charts/orders-overview-chart"
import { UserDistributionDonut } from "@/components/charts/user-distribution-donut"
import {
  useShipmentStats,
  useShipmentVolume,
  useRoutePerformance,
  useUserStats,
  useOrderStats,
  useExceptionStats,
  useCapacityOverview,
} from "@/lib/use-dashboard"
import { formatNumber } from "@/lib/format"

export default function AnalyticsPage() {
  const [range, setRange] = React.useState<Range>("30d")
  const stats = useShipmentStats()
  const volume = useShipmentVolume(range)
  const routes = useRoutePerformance()
  const userStats = useUserStats()
  const orderStats = useOrderStats()
  const exceptionStats = useExceptionStats()
  const capacity = useCapacityOverview()

  const statusData = React.useMemo(() => {
    if (!stats.data) return []
    return [
      { status: "DELIVERED", count: stats.data.delivered },
      { status: "IN_TRANSIT", count: stats.data.inTransit },
      { status: "ACTIVE", count: stats.data.active },
      { status: "CANCELLED", count: stats.data.cancelled },
      { status: "SCHEDULED", count: stats.data.scheduled },
    ].filter((d) => d.count > 0)
  }, [stats.data])

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Analytics" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Analytics"
          description="Platform performance metrics and delivery insights."
          actions={
            <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Back to dashboard
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
            </Link>
          }
        />

        {/* Hero chart — shipment volume */}
        <ShipmentVolumeChart
          data={volume.data}
          isLoading={volume.isLoading}
          error={volume.error}
          range={range}
          onRangeChange={setRange}
          title="Shipment volume"
          description="Shipments created and delivered over time."
        />

        {/* Status donut + Orders bar chart */}
        <div className="grid gap-4 xl:grid-cols-2">
          <StatusBreakdownDonut data={statusData} isLoading={stats.isLoading} />
          <OrdersOverviewChart data={orderStats.data} isLoading={orderStats.isLoading} />
        </div>

        {/* Route performance + User distribution */}
        <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
          <RoutePerformanceChart data={routes.data} isLoading={routes.isLoading} />
          <UserDistributionDonut data={userStats.data} isLoading={userStats.isLoading} />
        </div>

        {/* Exceptions summary + Capacity overview */}
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="gap-0 p-5">
            <h2 className="text-base font-semibold tracking-tight">Exceptions summary</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Open and resolved exception counts</p>
            {exceptionStats.isLoading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-muted/30" />)}
              </div>
            ) : exceptionStats.data ? (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums">{formatNumber(exceptionStats.data.total)}</p>
                  </div>
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                    <p className="text-xs text-muted-foreground">Open</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">{formatNumber(exceptionStats.data.open)}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <p className="text-xs text-muted-foreground">Resolved</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatNumber(exceptionStats.data.resolved)}</p>
                  </div>
                </div>
                {exceptionStats.data.byType && exceptionStats.data.byType.length > 0 && (
                  <div className="space-y-2 border-t border-border/60 pt-4">
                    <p className="text-xs font-medium text-muted-foreground">By type</p>
                    {exceptionStats.data.byType.slice(0, 5).map((item) => (
                      <div key={item.type} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.type.replace(/_/g, " ").toLowerCase()}</span>
                        <span className="font-medium tabular-nums">{item._count.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">No exception data</p>
            )}
          </Card>

          <Card className="gap-0 p-5">
            <h2 className="text-base font-semibold tracking-tight">Capacity overview</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Block space utilization across manifests</p>
            {capacity.isLoading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-muted/30" />)}
              </div>
            ) : capacity.data ? (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total manifests</p>
                    <p className="text-lg font-semibold tabular-nums">{capacity.data.summary.totalManifests}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Utilization</p>
                    <p className="text-lg font-semibold tabular-nums">{capacity.data.summary.overallUtilization.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reserved</p>
                    <p className="text-sm font-medium tabular-nums">{formatNumber(capacity.data.summary.totalReservedKg)} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-sm font-medium tabular-nums">{formatNumber(capacity.data.summary.totalRemainingKg)} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {capacity.data.summary.overCapacityCount > 0 && (
                    <Badge className="bg-red-100 text-red-700">{capacity.data.summary.overCapacityCount} over</Badge>
                  )}
                  {capacity.data.summary.nearCapacityCount > 0 && (
                    <Badge className="bg-amber-100 text-amber-700">{capacity.data.summary.nearCapacityCount} near</Badge>
                  )}
                  {capacity.data.summary.overCapacityCount === 0 && capacity.data.summary.nearCapacityCount === 0 && (
                    <Badge className="bg-emerald-100 text-emerald-700">All within limits</Badge>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">No active manifests</p>
            )}
          </Card>
        </div>

        {/* Route breakdown table */}
        {!routes.isLoading && routes.data.length > 0 && (
          <Card className="gap-0 overflow-hidden p-0">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
              <h2 className="text-base font-semibold tracking-tight">Route breakdown</h2>
              <span className="text-sm text-muted-foreground">{routes.data.length} routes</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-5 py-3 font-medium text-muted-foreground">Route</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground text-right">Shipments</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground text-right">Avg time</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground text-right">Success rate</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.data.map((r) => (
                    <tr key={r.route} className="border-b last:border-0 transition-colors hover:bg-muted/40">
                      <td className="px-5 py-3 font-medium">{r.route}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{r.shipments}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                        {r.avgTimeHours > 0 ? `${r.avgTimeHours.toFixed(1)}h` : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={
                          r.successRate >= 95
                            ? "font-medium text-emerald-600 tabular-nums"
                            : r.successRate >= 85
                              ? "font-medium text-amber-600 tabular-nums"
                              : "font-medium text-red-600 tabular-nums"
                        }>
                          {r.successRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
