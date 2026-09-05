"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Package02Icon,
  TruckIcon,
  MapIcon,
  CoinsIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  UserGroupIcon,
  Globe02Icon,
  WarehouseIcon,
  Train01Icon,
  Airplane01Icon,
  ArrowRight01Icon,
  CustomerService01Icon,
  File02Icon,
  AlertCircleIcon,
  PackageReceiveIcon,
  Route02Icon,
  ChartIcon,
  Download01Icon,
  Cancel01Icon,
  DashboardSquare02Icon,
  ReceiptIcon,
  SendIcon,
  DeliverySent01Icon,
} from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { ShipmentVolumeChart, type Range } from "@/components/charts/shipment-volume-chart"
import { RoutePerformanceChart } from "@/components/charts/route-performance-chart"
import { StatusBreakdownDonut } from "@/components/charts/status-breakdown-donut"
import {
  useShipmentStats,
  useShipmentVolume,
  useRoutePerformance,
  useRecentShipments,
  useUserStats,
  useOrderStats,
  useExceptionStats,
  useCapacityOverview,
} from "@/lib/use-dashboard"
import { formatMoney, formatNumber, formatPercent, formatRelative } from "@/lib/format"

/* ---------- Shared Components ---------- */
function RoleHeader({ title, description, actions }: {
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

function ActionCard({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {children}
      </CardContent>
    </Card>
  )
}

function ActionLink({ href, icon, label, variant = "outline" }: {
  href: string
  icon: any
  label: string
  variant?: "default" | "outline" | "ghost"
}) {
  return (
    <Link href={href} className={buttonVariants({ variant, size: "sm" })}>
      <HugeiconsIcon icon={icon} className="size-4" />
      {label}
    </Link>
  )
}

function EmptyRow({ icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <HugeiconsIcon icon={icon} className="size-10 text-muted-foreground/40" />
      <p className="mt-2 text-sm font-medium text-muted-foreground">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground/70">{subtitle}</p>}
    </div>
  )
}

/* ---------- Super Admin / Operations Manager Dashboard ---------- */
export function AdminDashboard() {
  const [range, setRange] = React.useState<Range>("30d")
  const stats = useShipmentStats()
  const volume = useShipmentVolume(range)
  const routes = useRoutePerformance()
  const userStats = useUserStats()
  const orderStats = useOrderStats()
  const exceptionStats = useExceptionStats()
  const capacity = useCapacityOverview()
  const recent = useRecentShipments(8)

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

  const alerts = React.useMemo(() => {
    const items: Array<{ title: string; description: string; severity: "HIGH" | "MEDIUM" | "LOW"; link: string }> = []
    if (exceptionStats.data && exceptionStats.data.open > 0) {
      items.push({
        title: `${exceptionStats.data.open} open exceptions`,
        description: "Shipments with issues requiring attention",
        severity: exceptionStats.data.open > 5 ? "HIGH" : "MEDIUM",
        link: "/dashboard/exceptions",
      })
    }
    if (capacity.data && capacity.data.summary.overCapacityCount > 0) {
      items.push({
        title: `${capacity.data.summary.overCapacityCount} manifests over capacity`,
        description: "Block space exceeded — review allocations",
        severity: "HIGH",
        link: "/dashboard/manifests",
      })
    }
    if (capacity.data && capacity.data.summary.nearCapacityCount > 0) {
      items.push({
        title: `${capacity.data.summary.nearCapacityCount} manifests near capacity`,
        description: "Approaching block space limits",
        severity: "MEDIUM",
        link: "/dashboard/manifests",
      })
    }
    if (orderStats.data && orderStats.data.pending > 0) {
      items.push({
        title: `${orderStats.data.pending} pending orders`,
        description: "Orders awaiting confirmation",
        severity: "LOW",
        link: "/dashboard/orders",
      })
    }
    return items
  }, [exceptionStats.data, capacity.data, orderStats.data])

  const alertStyle: Record<string, string> = {
    HIGH: "border-red-500/30 bg-red-500/5",
    MEDIUM: "border-amber-500/30 bg-amber-500/5",
    LOW: "border-sky-500/30 bg-sky-500/5",
  }
  const alertIconColor: Record<string, string> = {
    HIGH: "text-red-600 dark:text-red-400",
    MEDIUM: "text-amber-600 dark:text-amber-400",
    LOW: "text-sky-600 dark:text-sky-400",
  }

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title="Operations Command Center"
        description="Full platform overview — shipments, revenue, users, and performance."
        actions={
          <>
            <Link href="/dashboard/analytics" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <HugeiconsIcon icon={ChartIcon} className="size-4" />
              Analytics
            </Link>
            <Link href="/dashboard/shipments/new" className={buttonVariants({ size: "sm" })}>
              <HugeiconsIcon icon={Package02Icon} className="size-4" />
              New Shipment
            </Link>
          </>
        }
      />

      {/* Operational alerts */}
      {alerts.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {alerts.slice(0, 4).map((alert, i) => (
            <Card key={i} className={`flex-row items-start gap-3 p-4 ${alertStyle[alert.severity]}`}>
              <HugeiconsIcon icon={AlertCircleIcon} className={`mt-0.5 size-5 shrink-0 ${alertIconColor[alert.severity]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{alert.description}</p>
                <Link href={alert.link} className={buttonVariants({ variant: "ghost", size: "sm" }) + " mt-2 h-7 px-2 text-xs"}>
                  View
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total shipments" value={formatNumber(stats.data?.total)} icon={Package02Icon} loading={stats.isLoading} />
        <MetricCard label="Active" value={formatNumber(stats.data?.active)} icon={TruckIcon} loading={stats.isLoading} hint="In transit" />
        <MetricCard label="Delivered" value={formatNumber(stats.data?.delivered)} icon={CheckmarkCircle02Icon} loading={stats.isLoading} />
        <MetricCard label="Cancelled" value={formatNumber(stats.data?.cancelled)} icon={Cancel01Icon} loading={stats.isLoading} positiveIsGood={false} />
      </div>

      {/* Revenue + performance KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total revenue" value={formatMoney(orderStats.data?.totalRevenue, "TZS", { compact: true })} icon={CoinsIcon} loading={orderStats.isLoading} hint="From paid orders" />
        <MetricCard label="Success rate" value={formatPercent(successRate)} icon={CheckmarkCircle02Icon} loading={stats.isLoading} hint="Delivered / total" />
        <MetricCard label="Cancellation rate" value={formatPercent(cancellationRate)} icon={Cancel01Icon} loading={stats.isLoading} positiveIsGood={false} />
        <MetricCard label="Open exceptions" value={formatNumber(exceptionStats.data?.open)} icon={AlertCircleIcon} loading={exceptionStats.isLoading} hint="Needs attention" />
      </div>

      {/* Charts: volume + status donut */}
      <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        <ShipmentVolumeChart
          data={volume.data}
          isLoading={volume.isLoading}
          error={volume.error}
          range={range}
          onRangeChange={setRange}
          title="Shipment volume"
          description="Created vs delivered over time."
        />
        <StatusBreakdownDonut data={statusData} isLoading={stats.isLoading} />
      </div>

      {/* Route performance + System status */}
      <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        <RoutePerformanceChart data={routes.data} isLoading={routes.isLoading} />
        <Card className="gap-0 p-5">
          <h2 className="text-base font-semibold tracking-tight">System status</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">API</span>
              <Badge className="bg-emerald-100 text-emerald-700">Operational</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total users</span>
              <span className="font-medium tabular-nums">{formatNumber(userStats.data?.total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Drivers</span>
              <span className="font-medium tabular-nums">{formatNumber(userStats.data?.drivers)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Customers</span>
              <span className="font-medium tabular-nums">{formatNumber(userStats.data?.customers)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Capacity utilization</span>
              <span className="font-medium tabular-nums">
                {capacity.data ? `${capacity.data.summary.overallUtilization.toFixed(1)}%` : "—"}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionLink href="/dashboard/users" icon={UserGroupIcon} label="Users" />
            <ActionLink href="/dashboard/settings" icon={DashboardSquare02Icon} label="Settings" />
            <ActionLink href="/dashboard/tracking/map" icon={MapIcon} label="Live Map" />
          </div>
        </Card>
      </div>

      {/* Recent shipments + Capacity overview */}
      <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        <Card className="gap-0 overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Latest shipments</h2>
              <p className="text-xs text-muted-foreground">Most recently created shipments</p>
            </div>
            <Link href="/dashboard/shipments" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View all
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
            </Link>
          </div>
          {recent.isLoading ? (
            <div className="divide-y divide-border/60">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 animate-pulse bg-muted/30" />)}
            </div>
          ) : recent.data.length === 0 ? (
            <EmptyRow icon={Package02Icon} title="No shipments yet" subtitle="Create your first shipment to get started" />
          ) : (
            <ul className="divide-y divide-border/60">
              {recent.data.map((ship) => (
                <li key={ship.id}>
                  <Link
                    href={`/dashboard/shipments/${ship.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{ship.trackingNumber}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{ship.fromCity} → {ship.toCity}</p>
                    </div>
                    <span className="hidden text-sm text-muted-foreground md:block">{ship.customerName}</span>
                    <StatusBadge status={ship.status} size="sm" />
                    <div className="text-right">
                      <p className="text-sm font-medium tabular-nums">{formatMoney(ship.totalAmount, ship.currency, { compact: true })}</p>
                      <p className="text-xs text-muted-foreground">{formatRelative(ship.createdAt)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
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
              {capacity.data.summary.overCapacityCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge className="bg-red-100 text-red-700">{capacity.data.summary.overCapacityCount} over</Badge>
                </div>
              )}
              {capacity.data.summary.nearCapacityCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge className="bg-amber-100 text-amber-700">{capacity.data.summary.nearCapacityCount} near</Badge>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <ActionLink href="/dashboard/manifests" icon={Route02Icon} label="Manifests" />
                <ActionLink href="/dashboard/operations" icon={DashboardSquare02Icon} label="Operations" />
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <EmptyRow icon={DashboardSquare02Icon} title="No capacity data" subtitle="No active manifests found" />
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions bar */}
      <div className="flex flex-wrap items-center gap-2">
        <ActionLink href="/dashboard/shipments" icon={Package02Icon} label="Shipments" variant="default" />
        <ActionLink href="/dashboard/orders" icon={ReceiptIcon} label="Orders" />
        <ActionLink href="/dashboard/users" icon={UserGroupIcon} label="Users" />
        <ActionLink href="/dashboard/exceptions" icon={AlertCircleIcon} label="Exceptions" />
        <ActionLink href="/dashboard/manifests" icon={Route02Icon} label="Manifests" />
        <ActionLink href="/dashboard/tracking/map" icon={MapIcon} label="Live Map" />
        <ActionLink href="/dashboard/settings" icon={DashboardSquare02Icon} label="Settings" />
        <ActionLink href="/dashboard/analytics" icon={ChartIcon} label="Analytics" />
      </div>
    </div>
  )
}

/* ---------- Dispatcher Dashboard ---------- */
export function DispatcherDashboard() {
  const [range, setRange] = React.useState<Range>("7d")
  const stats = useShipmentStats()
  const volume = useShipmentVolume(range)
  const recent = useRecentShipments(10)

  const dispatchQueue = recent.data.filter((s) =>
    ["BOOKED", "PENDING", "DRIVER_ASSIGNED", "ACCEPTED"].includes(s.status)
  )
  const inTransit = recent.data.filter((s) =>
    ["IN_TRANSIT", "OUT_FOR_DELIVERY", "PICKED_UP", "ONGOING"].includes(s.status)
  )

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title="Dispatch Center"
        description="Manage shipment assignments across all transport modes."
        actions={
          <>
            <ActionLink href="/dashboard/shipments" icon={Package02Icon} label="All Shipments" />
            <ActionLink href="/dashboard/control-tower" icon={MapIcon} label="Control Tower" />
            <ActionLink href="/dashboard/manifests" icon={Route02Icon} label="Manifests" variant="default" />
          </>
        }
      />

      {/* KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Awaiting assignment" value={formatNumber(dispatchQueue.length)} icon={Package02Icon} loading={recent.isLoading} hint="Needs driver" />
        <MetricCard label="In transit" value={formatNumber(stats.data?.inTransit)} icon={TruckIcon} loading={stats.isLoading} hint="On the move" />
        <MetricCard label="Active" value={formatNumber(stats.data?.active)} icon={DeliverySent01Icon} loading={stats.isLoading} />
        <MetricCard label="Delivered" value={formatNumber(stats.data?.delivered)} icon={CheckmarkCircle02Icon} loading={stats.isLoading} />
      </div>

      {/* Volume chart */}
      <ShipmentVolumeChart
        data={volume.data}
        isLoading={volume.isLoading}
        error={volume.error}
        range={range}
        onRangeChange={setRange}
        title="Dispatch volume"
        description="Shipments flowing through the dispatch queue."
      />

      {/* Dispatch queue + In transit */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="gap-0 overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Dispatch queue</h2>
              <p className="text-xs text-muted-foreground">Shipments needing driver assignment</p>
            </div>
            <Badge variant="secondary">{dispatchQueue.length}</Badge>
          </div>
          {recent.isLoading ? (
            <div className="divide-y divide-border/60">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 animate-pulse bg-muted/30" />)}
            </div>
          ) : dispatchQueue.length === 0 ? (
            <EmptyRow icon={Package02Icon} title="Queue is clear" subtitle="All shipments have been assigned" />
          ) : (
            <ul className="divide-y divide-border/60">
              {dispatchQueue.map((ship) => (
                <li key={ship.id}>
                  <Link href={`/dashboard/shipments/${ship.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{ship.trackingNumber}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{ship.fromCity} → {ship.toCity}</p>
                    </div>
                    <StatusBadge status={ship.status} size="sm" />
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="gap-0 overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">In transit</h2>
              <p className="text-xs text-muted-foreground">Currently being delivered</p>
            </div>
            <Badge variant="secondary">{inTransit.length}</Badge>
          </div>
          {recent.isLoading ? (
            <div className="divide-y divide-border/60">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 animate-pulse bg-muted/30" />)}
            </div>
          ) : inTransit.length === 0 ? (
            <EmptyRow icon={TruckIcon} title="Nothing in transit" subtitle="No active deliveries right now" />
          ) : (
            <ul className="divide-y divide-border/60">
              {inTransit.map((ship) => (
                <li key={ship.id}>
                  <Link href={`/dashboard/shipments/${ship.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{ship.trackingNumber}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{ship.fromCity} → {ship.toCity}</p>
                    </div>
                    <StatusBadge status={ship.status} size="sm" />
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Mode overview */}
      <ActionCard title="Transport modes" description="Quick access to mode-specific operations">
        <ActionLink href="/dashboard/shipments" icon={TruckIcon} label="Road" />
        <ActionLink href="/dashboard/sgr" icon={Train01Icon} label="SGR Rail" />
        <ActionLink href="/dashboard/air-cargo" icon={Airplane01Icon} label="Air Cargo" />
        <ActionLink href="/dashboard/exceptions" icon={AlertCircleIcon} label="Exceptions" />
      </ActionCard>
    </div>
  )
}

/* ---------- Driver Dashboard ---------- */
export function DriverDashboard() {
  const { user } = useAuth()
  const [assignments, setAssignments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    api.shipments.list("assignedToMe=true&status=ASSIGNED,OUT_FOR_DELIVERY,PICKED_UP,ACCEPTED,OUT_FOR_PICKUP,ONGOING")
      .then((res) => { setAssignments(res.data?.shipments || res.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const active = assignments.filter((s) => ["OUT_FOR_DELIVERY", "PICKED_UP", "ONGOING", "OUT_FOR_PICKUP"].includes(s.status))
  const pending = assignments.filter((s) => ["ASSIGNED", "ACCEPTED", "PENDING"].includes(s.status))

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title="Driver Dashboard"
        description={`Welcome back, ${user?.name?.split(" ")[0] || "Driver"}. Your deliveries and assignments.`}
        actions={
          <ActionLink href="/dashboard/tracking" icon={MapIcon} label="Live Tracking" variant="default" />
        }
      />

      {/* KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active deliveries" value={formatNumber(active.length)} icon={TruckIcon} loading={loading} hint="In progress" />
        <MetricCard label="Pending pickup" value={formatNumber(pending.length)} icon={PackageReceiveIcon} loading={loading} hint="Awaiting pickup" />
        <MetricCard label="Total assigned" value={formatNumber(assignments.length)} icon={Package02Icon} loading={loading} />
        <MetricCard label="Completed" value="—" icon={CheckmarkCircle02Icon} loading={loading} hint="This week" />
      </div>

      {/* Assignments table */}
      <Card className="gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">My assignments</h2>
            <p className="text-xs text-muted-foreground">Shipments assigned to you</p>
          </div>
          <Badge variant="secondary">{assignments.length}</Badge>
        </div>
        {loading ? (
          <div className="divide-y divide-border/60">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 animate-pulse bg-muted/30" />)}
          </div>
        ) : assignments.length === 0 ? (
          <EmptyRow icon={Package02Icon} title="No active assignments" subtitle="Check back later for new deliveries" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-5 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((ship) => (
                  <tr key={ship.id} className="border-b last:border-0 transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3 font-medium">{ship.trackingNumber}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {ship.fromAddress?.city} → {ship.toAddress?.city}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {ship.customer?.name || ship.customer?.user?.name || "—"}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={ship.status} size="sm" /></td>
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/shipments/${ship.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                        View
                        <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <ActionCard title="Quick actions" description="Driver tools and resources">
        <ActionLink href="/dashboard/shipments" icon={Package02Icon} label="All Shipments" />
        <ActionLink href="/dashboard/tracking/map" icon={MapIcon} label="Map View" />
      </ActionCard>
    </div>
  )
}

/* ---------- Warehouse Manager Dashboard ---------- */
export function WarehouseDashboard() {
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    api.warehouse.stats().then((res) => { setStats(res.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title="Warehouse Operations"
        description="Inventory, receiving, and dispatch management."
        actions={
          <>
            <ActionLink href="/dashboard/warehouse" icon={WarehouseIcon} label="Inventory" variant="default" />
            <ActionLink href="/dashboard/warehouse/receiving" icon={PackageReceiveIcon} label="Receiving" />
          </>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Items in storage" value={formatNumber(stats?.totalItems)} icon={WarehouseIcon} loading={loading} />
        <MetricCard label="Pending receiving" value={formatNumber(stats?.pendingReceiving)} icon={PackageReceiveIcon} loading={loading} hint="Awaiting check-in" />
        <MetricCard label="Ready for dispatch" value={formatNumber(stats?.readyForDispatch)} icon={TruckIcon} loading={loading} />
        <MetricCard label="Consolidations" value={formatNumber(stats?.consolidations)} icon={Package02Icon} loading={loading} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="gap-0 p-5">
          <h2 className="text-base font-semibold tracking-tight">Recent activity</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Packages received today</span>
              <Badge variant="secondary">{stats?.receivedToday || 0}</Badge>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Packages dispatched today</span>
              <Badge variant="secondary">{stats?.dispatchedToday || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total weight handled</span>
              <span className="font-medium tabular-nums">{stats?.totalWeightKg ? `${stats.totalWeightKg} kg` : "0 kg"}</span>
            </div>
          </div>
        </Card>

        <ActionCard title="Warehouse actions" description="Manage inventory and dispatch">
          <ActionLink href="/dashboard/warehouse" icon={WarehouseIcon} label="Inventory" />
          <ActionLink href="/dashboard/warehouse/receiving" icon={PackageReceiveIcon} label="Receiving" />
          <ActionLink href="/dashboard/warehouse/consolidation" icon={Package02Icon} label="Consolidation" />
          <ActionLink href="/dashboard/tracking" icon={MapIcon} label="Tracking" />
        </ActionCard>
      </div>
    </div>
  )
}

/* ---------- Finance Dashboard ---------- */
export function FinanceDashboard() {
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.allSettled([
      api.orders.stats(),
      api.payments.list(),
    ]).then(([orderRes, payRes]) => {
      setStats({
        orders: orderRes.status === "fulfilled" ? orderRes.value.data : null,
        payments: payRes.status === "fulfilled" ? payRes.value.data : null,
      })
      setLoading(false)
    })
  }, [])

  const totalRevenue = stats?.orders?.totalRevenue || 0
  const pendingPayments = stats?.orders?.pendingPayments || 0

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title="Finance Overview"
        description="Revenue, payments, and pricing management."
        actions={
          <>
            <ActionLink href="/dashboard/pricing/rules" icon={CoinsIcon} label="Pricing Rules" />
            <ActionLink href="/dashboard/payments/transactions" icon={File02Icon} label="Transactions" variant="default" />
          </>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total revenue" value={formatMoney(totalRevenue, "TZS", { compact: true })} icon={CoinsIcon} loading={loading} />
        <MetricCard label="Pending payments" value={formatMoney(pendingPayments, "TZS", { compact: true })} icon={File02Icon} loading={loading} hint="Awaiting payment" />
        <MetricCard label="Transactions" value={formatNumber(stats?.payments?.length || 0)} icon={ReceiptIcon} loading={loading} />
        <MetricCard label="Refunds" value="0" icon={Cancel01Icon} loading={loading} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="gap-0 p-5">
          <h2 className="text-base font-semibold tracking-tight">Revenue by mode</h2>
          <div className="mt-4 space-y-3 text-sm">
            {[
              { mode: "Road", icon: TruckIcon, revenue: stats?.orders?.revenueByMode?.ROAD || 0 },
              { mode: "Rail (SGR)", icon: Train01Icon, revenue: stats?.orders?.revenueByMode?.RAIL || 0 },
              { mode: "Air Cargo", icon: Airplane01Icon, revenue: stats?.orders?.revenueByMode?.AIR || 0 },
            ].map((m) => (
              <div key={m.mode} className="flex items-center justify-between border-b border-border/60 last:border-0 pb-3">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={m.icon} className="size-4 text-primary" />
                  <span className="font-medium">{m.mode}</span>
                </div>
                <span className="font-semibold tabular-nums">{formatMoney(m.revenue, "TZS", { compact: true })}</span>
              </div>
            ))}
          </div>
        </Card>

        <ActionCard title="Finance actions" description="Manage pricing and payments">
          <ActionLink href="/dashboard/pricing/rules" icon={CoinsIcon} label="Pricing Rules" />
          <ActionLink href="/dashboard/payments/transactions" icon={File02Icon} label="Transactions" />
          <ActionLink href="/dashboard/payments/invoices" icon={ReceiptIcon} label="Invoices" />
          <ActionLink href="/dashboard/payment-gateways" icon={CoinsIcon} label="Gateways" />
        </ActionCard>
      </div>
    </div>
  )
}

/* ---------- Customer Support Dashboard ---------- */
export function CustomerSupportDashboard() {
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.allSettled([
      api.exceptions.stats(),
      api.shipments.stats(),
    ]).then(([excRes, shipRes]) => {
      setStats({
        exceptions: excRes.status === "fulfilled" ? excRes.value.data : null,
        shipments: shipRes.status === "fulfilled" ? shipRes.value.data : null,
      })
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title="Support Center"
        description="Handle exceptions, tickets, and customer issues."
        actions={
          <>
            <ActionLink href="/dashboard/exceptions" icon={AlertCircleIcon} label="Exceptions" variant="default" />
            <ActionLink href="/dashboard/support/tickets" icon={CustomerService01Icon} label="Tickets" />
          </>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open exceptions" value={formatNumber(stats?.exceptions?.open)} icon={AlertCircleIcon} loading={loading} hint="Needs attention" />
        <MetricCard label="Resolved today" value={formatNumber(stats?.exceptions?.resolvedToday)} icon={CheckmarkCircle02Icon} loading={loading} />
        <MetricCard label="Active shipments" value={formatNumber(stats?.shipments?.inTransit)} icon={TruckIcon} loading={loading} />
        <MetricCard label="Returns" value={formatNumber(stats?.exceptions?.returns)} icon={Cancel01Icon} loading={loading} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="gap-0 p-5">
          <h2 className="text-base font-semibold tracking-tight">Exception breakdown</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-muted-foreground">High priority</span>
              <Badge className="bg-red-100 text-red-700">{stats?.exceptions?.highPriority || 0}</Badge>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-muted-foreground">Medium priority</span>
              <Badge className="bg-amber-100 text-amber-700">{stats?.exceptions?.mediumPriority || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Low priority</span>
              <Badge variant="secondary">{stats?.exceptions?.lowPriority || 0}</Badge>
            </div>
          </div>
        </Card>

        <ActionCard title="Support actions" description="Handle customer issues">
          <ActionLink href="/dashboard/exceptions" icon={AlertCircleIcon} label="Exceptions" />
          <ActionLink href="/dashboard/support/tickets" icon={CustomerService01Icon} label="Tickets" />
          <ActionLink href="/dashboard/shipments" icon={Package02Icon} label="Shipments" />
          <ActionLink href="/dashboard/tracking" icon={MapIcon} label="Tracking" />
        </ActionCard>
      </div>
    </div>
  )
}

/* ---------- Customs Officer Dashboard ---------- */
export function CustomsDashboard() {
  const [shipments, setShipments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    api.shipments.list("category=INTERNATIONAL&status=CUSTOMS_REVIEW,CUSTOMS_HOLD")
      .then((res) => { setShipments(res.data?.shipments || res.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title="Customs Clearance"
        description="International shipments requiring customs processing."
        actions={
          <ActionLink href="/dashboard/international/customs" icon={Globe02Icon} label="Customs Portal" variant="default" />
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Customs review" value={formatNumber(shipments.length)} icon={Globe02Icon} loading={loading} hint="Awaiting clearance" />
        <MetricCard label="Cleared today" value="0" icon={CheckmarkCircle02Icon} loading={loading} />
        <MetricCard label="On hold" value="0" icon={AlertCircleIcon} loading={loading} />
        <MetricCard label="Documents pending" value="0" icon={File02Icon} loading={loading} />
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">International shipments</h2>
            <p className="text-xs text-muted-foreground">Shipments requiring customs processing</p>
          </div>
          <Badge variant="secondary">{shipments.length}</Badge>
        </div>
        {loading ? (
          <div className="divide-y divide-border/60">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 animate-pulse bg-muted/30" />)}
          </div>
        ) : shipments.length === 0 ? (
          <EmptyRow icon={Globe02Icon} title="No shipments awaiting customs" subtitle="All international shipments are cleared" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-5 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((ship: any) => (
                  <tr key={ship.id} className="border-b last:border-0 transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3 font-medium">{ship.trackingNumber}</td>
                    <td className="px-5 py-3 text-muted-foreground">{ship.fromAddress?.country} → {ship.toAddress?.country}</td>
                    <td className="px-5 py-3"><StatusBadge status={ship.status} size="sm" /></td>
                    <td className="px-5 py-3">
                      <Link href="/dashboard/international/customs" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                        Review
                        <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

/* ---------- Report Viewer Dashboard ---------- */
export function ReportViewerDashboard() {
  const stats = useShipmentStats()
  const routes = useRoutePerformance()

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title="Reports & Analytics"
        description="View and download operational reports."
        actions={
          <>
            <ActionLink href="/dashboard/analytics" icon={ChartIcon} label="Analytics" />
            <ActionLink href="/dashboard/reports" icon={Download01Icon} label="Export" variant="default" />
          </>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total shipments" value={formatNumber(stats.data?.total)} icon={Package02Icon} loading={stats.isLoading} />
        <MetricCard label="Delivered" value={formatNumber(stats.data?.delivered)} icon={CheckmarkCircle02Icon} loading={stats.isLoading} />
        <MetricCard label="In transit" value={formatNumber(stats.data?.inTransit)} icon={Clock01Icon} loading={stats.isLoading} />
        <MetricCard label="Cancelled" value={formatNumber(stats.data?.cancelled)} icon={Cancel01Icon} loading={stats.isLoading} positiveIsGood={false} />
      </div>

      <RoutePerformanceChart data={routes.data} isLoading={routes.isLoading} />

      <ActionCard title="Reports" description="View and download operational reports">
        <ActionLink href="/dashboard/reports" icon={ChartIcon} label="View Reports" />
        <ActionLink href="/dashboard/analytics" icon={ChartIcon} label="Analytics" />
      </ActionCard>
    </div>
  )
}

/* ---------- Customer Dashboard ---------- */
export function CustomerDashboard() {
  const { user } = useAuth()
  const recent = useRecentShipments(10)

  const shipments = recent.data
  const active = shipments.filter((s) => !["DELIVERED", "CANCELLED"].includes(s.status))
  const delivered = shipments.filter((s) => s.status === "DELIVERED")
  const pending = shipments.filter((s) => s.status === "BOOKED" || s.status === "PENDING")

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title={`Welcome, ${user?.name?.split(" ")[0] || "there"}`}
        description="Track your shipments and create new ones."
        actions={
          <ActionLink href="/dashboard/shipments/new" icon={SendIcon} label="New Shipment" variant="default" />
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active" value={formatNumber(active.length)} icon={TruckIcon} loading={recent.isLoading} hint="In progress" />
        <MetricCard label="Delivered" value={formatNumber(delivered.length)} icon={CheckmarkCircle02Icon} loading={recent.isLoading} />
        <MetricCard label="Total" value={formatNumber(shipments.length)} icon={Package02Icon} loading={recent.isLoading} />
        <MetricCard label="Pending" value={formatNumber(pending.length)} icon={Clock01Icon} loading={recent.isLoading} hint="Waiting" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ActionLink href="/dashboard/shipments/new" icon={SendIcon} label="New Shipment" variant="default" />
        <ActionLink href="/dashboard/tracking" icon={MapIcon} label="Track Package" />
        <ActionLink href="/dashboard/shipments" icon={Package02Icon} label="My Shipments" />
        <ActionLink href="/dashboard/orders" icon={ReceiptIcon} label="My Orders" />
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Recent shipments</h2>
            <p className="text-xs text-muted-foreground">Your latest shipment activity</p>
          </div>
          <Link href="/dashboard/shipments" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            View all
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </Link>
        </div>
        {recent.isLoading ? (
          <div className="divide-y divide-border/60">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 animate-pulse bg-muted/30" />)}
          </div>
        ) : shipments.length === 0 ? (
          <EmptyRow icon={Package02Icon} title="No shipments yet" subtitle="Create your first shipment to get started" />
        ) : (
          <ul className="divide-y divide-border/60">
            {shipments.map((ship) => (
              <li key={ship.id}>
                <Link
                  href={`/dashboard/shipments/${ship.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{ship.trackingNumber}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{ship.fromCity} → {ship.toCity}</p>
                  </div>
                  <StatusBadge status={ship.status} size="sm" />
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums">
                      {formatMoney(ship.totalAmount, ship.currency, { compact: true })}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatRelative(ship.createdAt)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

/* ---------- Main Role Dashboard Router ---------- */
export function RoleDashboard() {
  const { user } = useAuth()
  const role = user?.role || "CUSTOMER"

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {role === "SUPER_ADMIN" && <AdminDashboard />}
      {role === "OPERATIONS_MANAGER" && <AdminDashboard />}
      {role === "DISPATCHER" && <DispatcherDashboard />}
      {role === "DRIVER" && <DriverDashboard />}
      {role === "WAREHOUSE_MANAGER" && <WarehouseDashboard />}
      {role === "FINANCE" && <FinanceDashboard />}
      {role === "CUSTOMER_SUPPORT" && <CustomerSupportDashboard />}
      {role === "CUSTOMS_OFFICER" && <CustomsDashboard />}
      {role === "REPORT_VIEWER" && <ReportViewerDashboard />}
      {role === "CUSTOMER" && <CustomerDashboard />}
    </div>
  )
}
