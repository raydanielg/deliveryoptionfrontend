"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Route02Icon,
  Search01Icon,
  AlertCircleIcon,
  Download01Icon,
  MapIcon,
  TruckIcon,
  Train01Icon,
  Airplane01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { formatNumber, formatMoney } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"

const MODE_ICONS: Record<string, any> = {
  ROAD: TruckIcon,
  RAIL: Train01Icon,
  AIR: Airplane01Icon,
}

export default function PricingRoutesPage() {
  const [routes, setRoutes] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    async function load() {
      try {
        const result = await api.geography.listRoutes()
        setRoutes(result.data || [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = routes.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.name?.toLowerCase().includes(q) ||
      r.originCity?.toLowerCase().includes(q) ||
      r.destinationCity?.toLowerCase().includes(q) ||
      r.code?.toLowerCase().includes(q)
  })

  const totalDistance = routes.reduce((s, r) => s + Number(r.distanceKm || 0), 0)
  const activeCount = routes.filter((r) => r.isActive).length
  const modeCount = new Set(routes.map((r) => r.transportMode).filter(Boolean)).size

  function handleExportPDF() {
    exportToPDF({
      title: "Routes Report",
      subtitle: "All delivery routes with distances and transport modes",
      columns: [
        { header: "Route", key: "name" },
        { header: "Code", key: "code" },
        { header: "Origin", key: "origin" },
        { header: "Destination", key: "destination" },
        { header: "Distance (km)", key: "distance" },
        { header: "Transport", key: "mode" },
        { header: "Status", key: "status" },
      ],
      rows: filtered.map((r) => ({
        name: r.name || "—",
        code: r.code || "—",
        origin: r.originCity?.name || r.originCity || "—",
        destination: r.destinationCity?.name || r.destinationCity || "—",
        distance: String(r.distanceKm || 0),
        mode: r.transportMode || "—",
        status: r.isActive ? "Active" : "Inactive",
      })),
      meta: [
        { label: "Total Routes", value: String(routes.length) },
        { label: "Active", value: String(activeCount) },
        { label: "Total Distance", value: `${formatNumber(totalDistance)} km` },
      ],
    })
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pricing", href: "/dashboard/pricing" }, { label: "Routes" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="🛣️ Routes"
          description="Manage delivery routes, distances, and transport mode assignments."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Routes" value={formatNumber(routes.length)} icon={Route02Icon} hint="All configured" />
          <MetricCard label="Active" value={formatNumber(activeCount)} icon={CheckmarkCircle02Icon} hint="In use" />
          <MetricCard label="Total Distance" value={`${formatNumber(totalDistance)} km`} icon={MapIcon} hint="Combined" />
          <MetricCard label="Transport Modes" value={formatNumber(modeCount)} icon={TruckIcon} hint="ROAD, RAIL, AIR" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search route, origin, destination..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No routes found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Code</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Origin</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Destination</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Distance</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Mode</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{r.name || "—"}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{r.code || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.originCity?.name || r.originCity || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.destinationCity?.name || r.destinationCity || "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{formatNumber(r.distanceKm || 0)} km</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          {r.transportMode && MODE_ICONS[r.transportMode] && (
                            <HugeiconsIcon icon={MODE_ICONS[r.transportMode]} className="size-3.5" />
                          )}
                          {r.transportMode || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.isActive ? "ACTIVE" : "INACTIVE"} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
