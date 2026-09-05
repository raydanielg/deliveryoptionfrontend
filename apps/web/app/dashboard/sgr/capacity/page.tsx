"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Train01Icon, Search01Icon, Alert01Icon, CheckmarkCircle02Icon, MapPinIcon, Package02Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { formatNumber } from "@/lib/format"
import { toast } from "sonner"

export default function SGRCapacityPage() {
  const [stations, setStations] = React.useState<any[]>([])
  const [alerts, setAlerts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [stRes, alRes] = await Promise.all([
        api.capacity.stations(),
        api.capacity.alerts(),
      ])
      const allStations = Array.isArray(stRes) ? stRes : (stRes.data || [])
      const sgrStations = allStations.filter((st: any) => st.type === "SGR_STATION")
      setStations(sgrStations)
      setAlerts(Array.isArray(alRes) ? alRes : (alRes.data || []))
    } catch (err: any) {
      toast.error(err.message || "Failed to load capacity data")
    } finally {
      setLoading(false)
    }
  }

  const filtered = stations.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.name?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q)
  })

  const totalCapacity = stations.reduce((sum, s) => sum + (s.capacityKg || 0), 0)
  const totalUtilized = stations.reduce((sum, s) => sum + (s.utilizedKg || 0), 0)
  const utilizationPercent = totalCapacity > 0 ? Math.round((totalUtilized / totalCapacity) * 100) : 0
  const overCapacity = stations.filter(s => s.utilizationPercent > 80).length

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "SGR Parcel Service", href: "/dashboard/sgr" }, { label: "Capacity" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Capacity"
          description="Station capacity utilization and alerts for SGR parcels"
          actions={
            <Button variant="outline" onClick={() => loadData()}>
              <HugeiconsIcon icon={Train01Icon} className="size-4" />
              Refresh
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Capacity"
            value={`${formatNumber(totalCapacity)} kg`}
            icon={Package02Icon}
            loading={loading}
            hint="Across all stations"
          />
          <MetricCard
            label="Utilized"
            value={`${formatNumber(totalUtilized)} kg`}
            icon={Train01Icon}
            loading={loading}
            hint={`${utilizationPercent}% of total`}
          />
          <MetricCard
            label="Available"
            value={`${formatNumber(totalCapacity - totalUtilized)} kg`}
            icon={CheckmarkCircle02Icon}
            loading={loading}
            hint="Free capacity"
          />
          <MetricCard
            label="High Utilization"
            value={formatNumber(overCapacity)}
            icon={Alert01Icon}
            loading={loading}
            hint="Stations over 80%"
          />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20 p-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Alert01Icon} className="size-5 text-orange-600" />
              <h2 className="text-sm font-semibold">Capacity Alerts</h2>
            </div>
            <div className="mt-3 space-y-2">
              {alerts.map((alert: any, i: number) => (
                <div key={alert.id || i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{alert.stationName || alert.message}</span>
                  <Badge variant="destructive">{alert.utilizationPercent || alert.severity}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search station name, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Station Capacity Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full rounded-lg border p-12 text-center">
              <HugeiconsIcon icon={Train01Icon} className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No SGR stations found</p>
            </div>
          ) : (
            filtered.map((st: any, i: number) => (
              <div key={st.id || i} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={MapPinIcon} className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{st.name}</span>
                  </div>
                  <Badge variant={st.utilizationPercent > 80 ? "destructive" : st.utilizationPercent > 50 ? "secondary" : "outline"}>
                    {st.utilizationPercent || 0}%
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-3">{st.city}</div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{st.utilizedKg || 0} / {st.capacityKg || 0} kg</span>
                  <span className="text-xs text-muted-foreground">{(st.capacityKg || 0) - (st.utilizedKg || 0)} kg free</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${st.utilizationPercent > 80 ? "bg-red-500" : st.utilizationPercent > 50 ? "bg-orange-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(st.utilizationPercent || 0, 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
