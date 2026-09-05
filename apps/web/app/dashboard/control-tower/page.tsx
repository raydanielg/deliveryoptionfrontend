"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Radar02Icon,
  TruckIcon,
  Train01Icon,
  Airplane01Icon,
  WarehouseIcon,
  AlertCircleIcon,
  Dollar01Icon,
  Clock01Icon,
  TrendingUpIcon,
  AlertTriangle,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  Package02Icon,
} from "@hugeicons/core-free-icons"
import { formatNumber, formatMoney } from "@/lib/format"
import { toast } from "sonner"

export default function ControlTowerPage() {
  const [capacity, setCapacity] = React.useState<any>(null)
  const [alerts, setAlerts] = React.useState<any[]>([])
  const [sgrStats, setSgrStats] = React.useState<any>(null)
  const [airCargoStats, setAirCargoStats] = React.useState<any>(null)
  const [warehouseStats, setWarehouseStats] = React.useState<any>(null)
  const [shipmentStats, setShipmentStats] = React.useState<any>(null)
  const [exceptionStats, setExceptionStats] = React.useState<any>(null)
  const [exceptions, setExceptions] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [modeFilter, setModeFilter] = React.useState<string>("ALL")

  React.useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [capRes, alertsRes, sgrRes, airRes, whRes, shipRes, excRes, excListRes] = await Promise.all([
        api.capacity.overview(),
        api.capacity.alerts(),
        api.sgr.stats(),
        api.airCargo.stats(),
        api.warehouse.stats(),
        api.shipments.stats(),
        api.exceptions.stats(),
        api.exceptions.list("?limit=10"),
      ])
      setCapacity(capRes.data)
      const rawAlerts = alertsRes.data?.alerts || alertsRes.data
      setAlerts(Array.isArray(rawAlerts) ? rawAlerts : [])
      setSgrStats(sgrRes.data)
      setAirCargoStats(airRes.data)
      setWarehouseStats(whRes.data)
      setShipmentStats(shipRes.data)
      setExceptionStats(excRes.data)
      const rawExceptions = excListRes.data?.exceptions || excListRes.data
      setExceptions(Array.isArray(rawExceptions) ? rawExceptions : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load control tower data")
    } finally {
      setLoading(false)
    }
  }

  const filteredExceptions = modeFilter === "ALL" ? exceptions : exceptions.filter((e: any) => e.transportMode === modeFilter)

  const totalDelayed = (shipmentStats?.delayed ?? 0) + (sgrStats?.delayed ?? 0) + (airCargoStats?.delayed ?? 0)

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Control Tower" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Control Tower"
          description="Unified multimodal operations overview"
          actions={
            <Button variant="outline" onClick={() => loadData()}>
              <HugeiconsIcon icon={Radar02Icon} className="size-4" />
              Refresh
            </Button>
          }
        />

        {/* Mode Filter */}
        <div className="flex gap-2 flex-wrap">
          {["ALL", "ROAD", "RAIL", "AIR"].map((m) => (
            <Button
              key={m}
              variant={modeFilter === m ? "default" : "outline"}
              size="sm"
              onClick={() => setModeFilter(m)}
            >
              {m === "ALL" ? "All Modes" : m === "ROAD" ? "Road" : m === "RAIL" ? "SGR Rail" : "Air Cargo"}
            </Button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Road Active"
            value={formatNumber(capacity?.road?.active ?? 0)}
            icon={TruckIcon}
            loading={loading}
            hint={`${formatNumber(capacity?.road?.delivered ?? 0)} delivered`}
          />
          <MetricCard
            label="SGR Shipments"
            value={formatNumber(sgrStats?.total ?? 0)}
            icon={Train01Icon}
            loading={loading}
            hint={`${formatNumber(sgrStats?.inTransit ?? 0)} in transit`}
          />
          <MetricCard
            label="Air Cargo"
            value={formatNumber(airCargoStats?.total ?? 0)}
            icon={Airplane01Icon}
            loading={loading}
            hint={`${formatNumber(airCargoStats?.inTransit ?? 0)} in transit`}
          />
          <MetricCard
            label="Warehouse Items"
            value={formatNumber(warehouseStats?.totalItems ?? warehouseStats?.total ?? 0)}
            icon={WarehouseIcon}
            loading={loading}
            hint={`${formatNumber(warehouseStats?.receivedToday ?? 0)} received today`}
          />
        </div>

        {/* Alerts + Capacity */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Alerts */}
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-orange-500" />
                <h2 className="text-base font-semibold">Operations Alerts</h2>
              </div>
              {alerts.length > 0 && <Badge variant="secondary">{alerts.length}</Badge>}
            </div>
            <div className="divide-y">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <Skeleton className="size-9 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))
              ) : alerts.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No active alerts — all systems normal</p>
                </div>
              ) : (
                alerts.map((alert: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30">
                    <div className={`flex size-9 items-center justify-center rounded-lg ${alert.severity === "critical" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"}`}>
                      <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{alert.title || alert.message}</p>
                      <p className="truncate text-xs text-muted-foreground">{alert.type} — {alert.station || alert.manifest || ""}</p>
                    </div>
                    <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Station Capacity */}
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={WarehouseIcon} className="size-5 text-muted-foreground" />
                <h2 className="text-base font-semibold">Station Capacity</h2>
              </div>
              <Link href="/dashboard/stations" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                View all
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </Link>
            </div>
            <div className="divide-y">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))
              ) : capacity?.stations && Array.isArray(capacity.stations) && capacity.stations.length > 0 ? (
                capacity.stations.map((st: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/30">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{st.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{st.type} — {st.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums">{formatNumber(st.utilizedKg || 0)} / {formatNumber(st.capacityKg || 0)} kg</p>
                      <p className="text-xs text-muted-foreground">{st.utilizationPercent || 0}%</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-10 text-center">
                  <HugeiconsIcon icon={WarehouseIcon} className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No station data</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <HugeiconsIcon icon={Dollar01Icon} className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Revenue</p>
                <p className="text-xs text-muted-foreground">All modes</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold tabular-nums">{formatMoney(Number(shipmentStats?.totalRevenue || 0), "TZS", { compact: true })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Road</span>
                <span className="font-medium tabular-nums">{formatMoney(Number(shipmentStats?.roadRevenue || 0), "TZS", { compact: true })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SGR</span>
                <span className="font-medium tabular-nums">{formatMoney(Number(sgrStats?.totalRevenue || 0), "TZS", { compact: true })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Air</span>
                <span className="font-medium tabular-nums">{formatMoney(Number(airCargoStats?.totalRevenue || 0), "TZS", { compact: true })}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                <HugeiconsIcon icon={TrendingUpIcon} className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">On-Time Rate</p>
                <p className="text-xs text-muted-foreground">Performance</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Road</span>
                <span className="font-bold text-emerald-600">{shipmentStats?.onTimeRate ?? "—"}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SGR</span>
                <span className="font-bold text-emerald-600">{sgrStats?.onTimeRate ?? "—"}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Air</span>
                <span className="font-bold text-emerald-600">{airCargoStats?.onTimeRate ?? "—"}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall</span>
                <span className="font-bold">{shipmentStats?.overallOnTimeRate ?? "—"}%</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                <HugeiconsIcon icon={Clock01Icon} className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Delays</p>
                <p className="text-xs text-muted-foreground">By mode</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Road</span>
                <span className="font-bold text-amber-600">{formatNumber(shipmentStats?.delayed ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SGR</span>
                <span className="font-bold text-amber-600">{formatNumber(sgrStats?.delayed ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Air</span>
                <span className="font-bold text-amber-600">{formatNumber(airCargoStats?.delayed ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">{formatNumber(totalDelayed)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
                <HugeiconsIcon icon={AlertTriangle} className="size-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">Exceptions</p>
                <p className="text-xs text-muted-foreground">Status breakdown</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Open</span>
                <span className="font-bold text-red-600">{formatNumber(exceptionStats?.open ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Escalated</span>
                <span className="font-bold text-red-600">{formatNumber(exceptionStats?.escalated ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Resolved</span>
                <span className="font-bold text-emerald-600">{formatNumber(exceptionStats?.resolved ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">{formatNumber(exceptionStats?.total ?? 0)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Exceptions */}
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={AlertTriangle} className="size-5 text-red-500" />
              <h2 className="text-base font-semibold">Recent Exceptions {modeFilter !== "ALL" && `(${modeFilter})`}</h2>
            </div>
            <Link href="/dashboard/exceptions" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))
            ) : filteredExceptions.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <HugeiconsIcon icon={Package02Icon} className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No exceptions recorded</p>
              </div>
            ) : (
              filteredExceptions.map((exc: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30">
                  <div className={`flex size-9 items-center justify-center rounded-lg ${exc.status === "RESOLVED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : exc.status === "ESCALATED" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                    <HugeiconsIcon icon={exc.status === "RESOLVED" ? CheckmarkCircle02Icon : AlertTriangle} className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{exc.type?.replace(/_/g, " ") || exc.description || "Exception"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {exc.trackingNumber && <span>{exc.trackingNumber} — </span>}
                      {exc.transportMode && <span>{exc.transportMode}</span>}
                    </p>
                  </div>
                  <StatusBadge status={exc.status} size="sm" />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
