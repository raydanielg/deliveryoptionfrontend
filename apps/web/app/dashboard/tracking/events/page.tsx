"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  Package02Icon,
  TruckIcon,
  Train01Icon,
  Airplane01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Search01Icon,
  MapIcon,
  SendIcon,
  WarehouseIcon,
  PackageReceiveIcon,
  ContainerIcon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { formatNumber, formatDate } from "@/lib/format"

const EVENT_ICONS: Record<string, any> = {
  BOOKED: Package02Icon,
  ASSIGNED: TruckIcon,
  PICKED_UP: PackageReceiveIcon,
  IN_TRANSIT: TruckIcon,
  OUT_FOR_DELIVERY: SendIcon,
  DELIVERED: CheckmarkCircle02Icon,
  CANCELLED: CancelCircleIcon,
  RECEIVED_AT_STATION: WarehouseIcon,
  WEIGHED: CheckmarkCircle02Icon,
  CONSOLIDATED: ContainerIcon,
  LOADED: TruckIcon,
  ARRIVED_AT_DESTINATION: WarehouseIcon,
  ARRIVED_AT_AIRPORT: WarehouseIcon,
  CARGO_ACCEPTED: PackageReceiveIcon,
}

const MODE_ICONS: Record<string, any> = {
  ROAD: TruckIcon,
  RAIL: Train01Icon,
  AIR: Airplane01Icon,
}

export default function TrackingEventsPage() {
  const [shipments, setShipments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [modeFilter, setModeFilter] = React.useState("ALL")

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await api.shipments.list("?page=1&limit=200")
        const data = res.data?.shipments || res.data || []
        setShipments(Array.isArray(data) ? data : [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Build events from shipment timelines
  const allEvents = React.useMemo(() => {
    const events: any[] = []
    for (const s of shipments) {
      if (s.timeline && Array.isArray(s.timeline)) {
        for (const t of s.timeline) {
          events.push({
            id: `${s.id}-${t.id || events.length}`,
            shipmentId: s.id,
            trackingNumber: s.trackingNumber,
            status: t.status || s.status,
            description: t.notes || `Status changed to ${(t.status || s.status)?.replace(/_/g, " ").toLowerCase()}`,
            location: t.location || s.fromAddress?.city,
            transportMode: s.transportMode,
            fromCity: s.fromAddress?.city,
            toCity: s.toAddress?.city,
            createdAt: t.createdAt || s.createdAt,
          })
        }
      } else if (s.status) {
        events.push({
          id: `${s.id}-current`,
          shipmentId: s.id,
          trackingNumber: s.trackingNumber,
          status: s.status,
          description: `Status: ${s.status?.replace(/_/g, " ").toLowerCase()}`,
          location: s.fromAddress?.city,
          transportMode: s.transportMode,
          fromCity: s.fromAddress?.city,
          toCity: s.toAddress?.city,
          createdAt: s.createdAt,
        })
      }
    }
    return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [shipments])

  const filtered = allEvents.filter((e) => {
    if (modeFilter !== "ALL" && e.transportMode !== modeFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return e.trackingNumber?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q)
  })

  const todayCount = allEvents.filter((e) => {
    const d = new Date(e.createdAt)
    const now = new Date()
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const deliveredCount = allEvents.filter((e) => e.status === "DELIVERED").length
  const transitCount = allEvents.filter((e) => ["IN_TRANSIT", "OUT_FOR_DELIVERY", "PICKED_UP", "ONGOING"].includes(e.status)).length

  const MODE_FILTERS = [
    { value: "ALL", label: "All Modes" },
    { value: "ROAD", label: "🚚 Road" },
    { value: "RAIL", label: "🚆 SGR Rail" },
    { value: "AIR", label: "✈️ Air Cargo" },
  ]

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tracking", href: "/dashboard/tracking" }, { label: "Events" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="📋 Tracking Events"
          description="All tracking events across shipments — status changes, locations, and delivery milestones."
        />

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Events" value={formatNumber(allEvents.length)} icon={Package02Icon} hint="All time" />
          <MetricCard label="Today" value={formatNumber(todayCount)} icon={Clock01Icon} hint="Events today" />
          <MetricCard label="In Transit" value={formatNumber(transitCount)} icon={TruckIcon} hint="Active movements" />
          <MetricCard label="Delivered" value={formatNumber(deliveredCount)} icon={CheckmarkCircle02Icon} hint="Completed deliveries" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tracking #, description, location..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1">
            {MODE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setModeFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  modeFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Timeline */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Event</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Shipment</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Mode</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Location</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
                        <p className="mt-2 text-sm text-muted-foreground">No tracking events found</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.slice(0, 50).map((e) => {
                      const eventIcon = EVENT_ICONS[e.status] || Package02Icon
                      const modeIcon = MODE_ICONS[e.transportMode] || TruckIcon
                      return (
                        <tr key={e.id} className="transition-colors hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex size-7 items-center justify-center rounded-lg bg-muted/40">
                                <HugeiconsIcon icon={eventIcon} className="size-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-xs font-medium">{e.description}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">{e.trackingNumber || "—"}</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <HugeiconsIcon icon={modeIcon} className="size-3.5" />
                              {e.transportMode || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={e.status} size="sm" /></td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {e.location && (
                              <span className="flex items-center gap-1">
                                <HugeiconsIcon icon={MapIcon} className="size-3" />
                                {e.location}
                              </span>
                            ) || "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{e.fromCity || "—"} → {e.toCity || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{e.createdAt ? formatDate(e.createdAt) : "—"}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 50 && (
              <div className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
                Showing 50 of {filtered.length} events
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
