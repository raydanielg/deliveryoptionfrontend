"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowRight01Icon,
  Alert01Icon,
  ClockIcon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  MapIcon,
  TruckIcon,
  Package02Icon,
  Route02Icon,
  UserGroupIcon,
  CoinsIcon,
  CustomerService01Icon,
  Globe02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

/* ---------- Summary Card ---------- */
export function SummaryCard({
  label,
  value,
  change,
  positive,
  subtitle,
  icon,
}: {
  label: string
  value: string
  change?: string
  positive?: boolean
  subtitle?: string
  icon?: any
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        {icon && (
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <HugeiconsIcon icon={icon} className="size-4 text-primary" />
          </div>
        )}
      </div>
      <p className="text-xl font-semibold tabular-nums mt-1">{value}</p>
      {change && (
        <div className="flex items-center gap-1 mt-1 text-xs">
          {positive !== undefined && (
            <HugeiconsIcon icon={positive ? TrendingUpIcon : TrendingDownIcon} className={cn("size-3", positive ? "text-emerald-600" : "text-red-600")} />
          )}
          <span className={positive === false ? "text-red-600" : "text-emerald-600"}>{change}</span>
        </div>
      )}
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  )
}

/* ---------- Shipment Status Breakdown ---------- */
export function ShipmentStatusSection({ data }: { data: { status: string; count: number; percentage: number }[] }) {
  const statusColors: Record<string, string> = {
    DELIVERED: "bg-emerald-500",
    IN_TRANSIT: "bg-blue-500",
    PICKED_UP: "bg-amber-500",
    CANCELLED: "bg-red-500",
    BOOKED: "bg-gray-400",
    DRIVER_ASSIGNED: "bg-purple-500",
    OUT_FOR_DELIVERY: "bg-cyan-500",
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Shipment Status</h3>
      <div className="space-y-3">
        {data.map((s) => (
          <a
            key={s.status}
            href={`/dashboard/shipments?status=${s.status}`}
            className="flex items-center justify-between hover:bg-muted/30 -mx-2 px-2 py-1 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={cn("size-2.5 rounded-full", statusColors[s.status] || "bg-gray-400")} />
              <span className="text-sm text-muted-foreground">{s.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
            </div>
            <span className="text-sm font-medium tabular-nums">{s.percentage}%</span>
          </a>
        ))}
      </div>
    </div>
  )
}

/* ---------- Live Operations ---------- */
export function LiveOperationsSection({ deliveries }: { deliveries: { tracking: string; driver: string; route: string; progress: number; eta: string }[] }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Live Shipments</h3>
        <Badge variant="secondary" className="gap-1">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          {deliveries.length} active
        </Badge>
      </div>
      <div className="space-y-3">
        {deliveries.map((d) => (
          <div key={d.tracking} className="flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{d.tracking}</span>
              <Badge variant="secondary" className="gap-1">
                <HugeiconsIcon icon={ClockIcon} className="size-3" />
                {d.eta}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HugeiconsIcon icon={TruckIcon} className="size-3.5" />
              {d.driver}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HugeiconsIcon icon={MapIcon} className="size-3.5" />
              {d.route}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${d.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Operational Alerts ---------- */
export function OperationalAlertsSection({ alerts }: { alerts: { id: string; title: string; description: string; severity: string; timeAgo: string; link: string }[] }) {
  const severityColors: Record<string, string> = {
    HIGH: "text-red-600 bg-red-50 dark:bg-red-950/50",
    MEDIUM: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
    LOW: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Operational Alerts</h3>
        {alerts.length > 0 && <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950/50">{alerts.length}</span>}
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
            <div className="flex items-start gap-2">
              <div className={cn("mt-0.5 flex size-6 items-center justify-center rounded", severityColors[alert.severity])}>
                <HugeiconsIcon icon={Alert01Icon} className="size-3.5" />
              </div>
              <div>
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.timeAgo}</p>
              </div>
            </div>
            <a href={alert.link}>
              <Button variant="outline" size="sm" className="h-7">View</Button>
            </a>
          </div>
        ))}
        {alerts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>}
      </div>
    </div>
  )
}

/* ---------- Revenue Overview ---------- */
export function RevenueOverviewSection({ data }: { data?: { grossRevenue: number; refunds: number; netRevenue: number; currency: string } }) {
  const r = data || { grossRevenue: 84200000, refunds: 1200000, netRevenue: 83000000, currency: "TZS" }
  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString()

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Revenue Overview</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Gross Revenue</span>
          <span className="text-sm font-medium tabular-nums">{r.currency} {fmt(r.grossRevenue)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Refunds</span>
          <span className="text-sm font-medium tabular-nums text-red-600">-{r.currency} {fmt(r.refunds)}</span>
        </div>
        <div className="border-t pt-2 flex items-center justify-between">
          <span className="text-sm font-medium">Net Revenue</span>
          <span className="text-sm font-semibold tabular-nums text-emerald-600">{r.currency} {fmt(r.netRevenue)}</span>
        </div>
      </div>
    </div>
  )
}

/* ---------- Route Performance ---------- */
export function RoutePerformanceSection({ routes }: { routes: { route: string; shipments: number; avgTime: string; successRate: number }[] }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Top Routes</h3>
      <div className="space-y-3">
        {routes.map((r) => (
          <div key={r.route} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Route02Icon} className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{r.route}</p>
                <p className="text-xs text-muted-foreground">{r.shipments} shipments · avg {r.avgTime}</p>
              </div>
            </div>
            <span className={cn("text-sm font-medium tabular-nums", r.successRate >= 95 ? "text-emerald-600" : r.successRate >= 85 ? "text-amber-600" : "text-red-600")}>
              {r.successRate}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Driver Overview ---------- */
export function DriverOverviewSection({ data }: { data?: { total: number; active: number; available: number; onBreak: number } }) {
  const d = data || { total: 38, active: 24, available: 12, onBreak: 2 }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Drivers</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Total Drivers</p>
          <p className="text-lg font-semibold tabular-nums">{d.total}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-lg font-semibold tabular-nums text-emerald-600">{d.active}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="text-lg font-semibold tabular-nums text-blue-600">{d.available}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">On Break</p>
          <p className="text-lg font-semibold tabular-nums text-amber-600">{d.onBreak}</p>
        </div>
      </div>
      <a href="/dashboard/drivers" className="block mt-4">
        <Button variant="outline" size="sm" className="w-full">View Drivers</Button>
      </a>
    </div>
  )
}

/* ---------- Service Overview ---------- */
export function ServiceOverviewSection({ data }: { data?: { domestic: number; international: number; freight: number; parcel: number } }) {
  const s = data || { domestic: 1842, international: 428, freight: 156, parcel: 421 }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Service Breakdown</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Domestic</p>
          <p className="text-lg font-semibold tabular-nums">{s.domestic}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">International</p>
          <p className="text-lg font-semibold tabular-nums">{s.international}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Freight</p>
          <p className="text-lg font-semibold tabular-nums">{s.freight}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Parcel</p>
          <p className="text-lg font-semibold tabular-nums">{s.parcel}</p>
        </div>
      </div>
    </div>
  )
}

/* ---------- Delivery Performance ---------- */
export function DeliveryPerformanceSection({ data }: { data?: { successRate: number; avgDeliveryTime: string; cancellationRate: number; onTimeRate: number } }) {
  const d = data || { successRate: 96.8, avgDeliveryTime: "4.2 hr", cancellationRate: 3.2, onTimeRate: 94.5 }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Delivery Performance</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-emerald-600" />
            <span className="text-sm text-muted-foreground">Success Rate</span>
          </div>
          <span className="text-sm font-semibold tabular-nums text-emerald-600">{d.successRate}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={ClockIcon} className="size-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">Avg Delivery Time</span>
          </div>
          <span className="text-sm font-medium tabular-nums">{d.avgDeliveryTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={CancelCircleIcon} className="size-4 text-red-600" />
            <span className="text-sm text-muted-foreground">Cancellation Rate</span>
          </div>
          <span className="text-sm font-medium tabular-nums text-red-600">{d.cancellationRate}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={TrendingUpIcon} className="size-4 text-emerald-600" />
            <span className="text-sm text-muted-foreground">On-Time Rate</span>
          </div>
          <span className="text-sm font-medium tabular-nums text-emerald-600">{d.onTimeRate}%</span>
        </div>
      </div>
    </div>
  )
}

/* ---------- Recent Activity ---------- */
export function RecentActivitySection({ activities }: { activities: { id: string; user: string; action: string; timeAgo: string }[] }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((a) => (
          <div key={a.id} className="flex items-start gap-3">
            <div className="mt-1 size-1.5 rounded-full bg-muted-foreground/40" />
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{a.user}</span>{" "}
                <span className="text-muted-foreground">{a.action}</span>
              </p>
              <p className="text-xs text-muted-foreground">{a.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
