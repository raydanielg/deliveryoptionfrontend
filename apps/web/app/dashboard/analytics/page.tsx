"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Package02Icon,
  TruckIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Clock01Icon,
  ArrowRight01Icon,
  UserGroupIcon,
  Globe02Icon,
  CoinsIcon,
  AlertCircleIcon,
  ReceiptIcon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { ShipmentVolumeChart, type Range } from "@/components/charts/shipment-volume-chart"
import { RoutePerformanceChart } from "@/components/charts/route-performance-chart"
import { StatusBreakdownDonut } from "@/components/charts/status-breakdown-donut"
import {
  useShipmentStats,
  useShipmentVolume,
  useRoutePerformance,
  useUserStats,
  useOrderStats,
  useExceptionStats,
  useCapacityOverview,
} from "@/lib/use-dashboard"
import { formatMoney, formatNumber, formatPercent } from "@/lib/format"

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

  const successRate = stats.data && stats.data.total > 0
    ? (stats.data.delivered / stats.data.total) * 100
    : 0
  const cancellationRate = stats.data && stats.data.total > 0
    ? (stats.data.cancelled / stats.data.total) * 100
    : 0

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

        {/* Primary KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total shipments"
            value={formatNumber(stats.data?.total)}
            icon={Package02Icon}
            loading={stats.isLoading}
          />
          <MetricCard
            label="Success rate"
            value={formatPercent(successRate)}
            icon={CheckmarkCircle02Icon}
            loading={stats.isLoading}
            hint="Delivered / total"
          />
          <MetricCard
            label="Cancellation rate"
            value={formatPercent(cancellationRate)}
            icon={Cancel01Icon}
            loading={stats.isLoading}
            positiveIsGood={false}
          />
          <MetricCard
            label="Active now"
            value={formatNumber(stats.data?.active)}
            icon={TruckIcon}
            loading={stats.isLoading}
            hint="In transit and processing"
          />
        </div>

        {/* Revenue + exceptions KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total revenue"
            value={formatMoney(orderStats.data?.totalRevenue, "TZS", { compact: true })}
            icon={CoinsIcon}
            loading={orderStats.isLoading}
            hint="From paid orders"
          />
          <MetricCard
            label="Pending orders"
            value={formatNumber(orderStats.data?.pending)}
            icon={ReceiptIcon}
            loading={orderStats.isLoading}
            hint="Awaiting confirmation"
          />
          <MetricCard
            label="Open exceptions"
            value={formatNumber(exceptionStats.data?.open)}
            icon={AlertCircleIcon}
            loading={exceptionStats.isLoading}
            hint="Needs attention"
          />
          <MetricCard
            label="Resolved exceptions"
            value={formatNumber(exceptionStats.data?.resolved)}
            icon={CheckmarkCircle02Icon}
            loading={exceptionStats.isLoading}
          />
        </div>

        {/* Volume chart */}
        <ShipmentVolumeChart
          data={volume.data}
          isLoading={volume.isLoading}
          error={volume.error}
          range={range}
          onRangeChange={setRange}
          title="Shipment volume"
          description="Shipments created and delivered over time."
        />

        {/* Status donut + Route performance */}
        <div className="grid gap-4 xl:grid-cols-[2fr_3fr]">
          <StatusBreakdownDonut
            data={statusData}
            isLoading={stats.isLoading}
          />
          <RoutePerformanceChart
            data={routes.data}
            isLoading={routes.isLoading}
          />
        </div>

        {/* Shipment status breakdown KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Delivered"
            value={formatNumber(stats.data?.delivered)}
            icon={CheckmarkCircle02Icon}
            loading={stats.isLoading}
            hint="Successfully completed"
          />
          <MetricCard
            label="In transit"
            value={formatNumber(stats.data?.inTransit)}
            icon={Clock01Icon}
            loading={stats.isLoading}
            hint="Currently on the move"
          />
          <MetricCard
            label="Scheduled"
            value={formatNumber(stats.data?.scheduled)}
            icon={Clock01Icon}
            loading={stats.isLoading}
            hint="Awaiting pickup"
          />
          <MetricCard
            label="Cancelled"
            value={formatNumber(stats.data?.cancelled)}
            icon={Cancel01Icon}
            loading={stats.isLoading}
            positiveIsGood={false}
          />
        </div>

        {/* User stats + Capacity overview */}
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="gap-0 p-5">
            <h2 className="text-base font-semibold tracking-tight">User breakdown</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Platform users by role</p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={UserGroupIcon} className="size-4 text-primary" />
                  <span className="font-medium">Total users</span>
                </div>
                <span className="font-semibold tabular-nums">{formatNumber(userStats.data?.total)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-600" />
                  <span className="font-medium">Active</span>
                </div>
                <span className="font-semibold tabular-nums">{formatNumber(userStats.data?.active)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={TruckIcon} className="size-4 text-blue-600" />
                  <span className="font-medium">Drivers</span>
                </div>
                <span className="font-semibold tabular-nums">{formatNumber(userStats.data?.drivers)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Globe02Icon} className="size-4 text-purple-600" />
                  <span className="font-medium">Customers</span>
                </div>
                <span className="font-semibold tabular-nums">{formatNumber(userStats.data?.customers)}</span>
              </div>
            </div>
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

        {/* Route performance table */}
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
