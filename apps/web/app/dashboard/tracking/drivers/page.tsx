"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  Search01Icon,
  TruckIcon,
  BikeIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  MapIcon,
  CallIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { formatNumber, formatDate } from "@/lib/format"

const VEHICLE_EMOJI: Record<string, string> = {
  MOTORCYCLE: "🏍️",
  VAN: "🚐",
  TRUCK: "🚛",
  CAR: "🚗",
}

export default function DriverLocationsPage() {
  const [drivers, setDrivers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await api.users.list("?role=DRIVER&page=1&limit=200")
        const data = res.data?.users || res.data || []
        setDrivers(Array.isArray(data) ? data : [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filtered = drivers.filter((d) => {
    if (statusFilter !== "ALL") {
      if (statusFilter === "ACTIVE" && !d.isActive) return false
      if (statusFilter === "INACTIVE" && d.isActive) return false
    }
    if (!search) return true
    const q = search.toLowerCase()
    return d.name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.phone?.toLowerCase().includes(q)
  })

  const activeCount = drivers.filter((d) => d.isActive).length
  const inactiveCount = drivers.filter((d) => !d.isActive).length

  const STATUS_FILTERS = [
    { value: "ALL", label: "All Drivers" },
    { value: "ACTIVE", label: "🟢 Active" },
    { value: "INACTIVE", label: "🔴 Offline" },
  ]

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tracking", href: "/dashboard/tracking" }, { label: "Driver Locations" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="🚗 Driver Locations"
          description="Live GPS tracking and status of all delivery drivers in the fleet."
        />

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Drivers" value={formatNumber(drivers.length)} icon={UserGroupIcon} hint="All registered" />
          <MetricCard label="Active" value={formatNumber(activeCount)} icon={CheckmarkCircle02Icon} hint="Online now" />
          <MetricCard label="Offline" value={formatNumber(inactiveCount)} icon={Clock01Icon} positiveIsGood={false} hint="Not available" />
          <MetricCard label="Vehicles" value={formatNumber(drivers.filter((d) => d.vehicleType).length)} icon={TruckIcon} hint="Assigned vehicles" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  statusFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Driver Cards Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="mt-3 h-16 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No drivers found</p>
          </div>
        ) : (
          <>
            {/* Driver Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, 12).map((d) => (
                <div key={d.id} className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted/40 text-lg">
                        {d.vehicleType ? VEHICLE_EMOJI[d.vehicleType] || "🚗" : "👤"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{d.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{d.email || "—"}</p>
                      </div>
                    </div>
                    <StatusBadge status={d.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    {d.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{d.phone}</span>
                      </div>
                    )}
                    {d.vehicleType && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Vehicle</span>
                        <span className="font-medium">{VEHICLE_EMOJI[d.vehicleType] || "🚗"} {d.vehicleType?.replace(/_/g, " ").toLowerCase()}</span>
                      </div>
                    )}
                    {d.plateNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Plate</span>
                        <span className="font-mono font-medium">{d.plateNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t pt-1.5">
                      <span className="text-muted-foreground">Joined</span>
                      <span className="font-medium">{d.createdAt ? formatDate(d.createdAt) : "—"}</span>
                    </div>
                  </div>

                  {d.phone && (
                    <a
                      href={`tel:${d.phone}`}
                      className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/30"
                    >
                      <HugeiconsIcon icon={CallIcon} className="size-3.5" />
                      Call Driver
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Full Table */}
            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Driver</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Phone</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Vehicle</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d) => (
                      <tr key={d.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{d.vehicleType ? VEHICLE_EMOJI[d.vehicleType] || "🚗" : "👤"}</span>
                            <div>
                              <p className="font-medium">{d.name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{d.email || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{d.phone || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {d.vehicleType ? `${VEHICLE_EMOJI[d.vehicleType] || "🚗"} ${d.vehicleType?.replace(/_/g, " ").toLowerCase()}` : "—"}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={d.isActive ? "ACTIVE" : "INACTIVE"} size="sm" /></td>
                        <td className="px-4 py-3 text-muted-foreground">{d.createdAt ? formatDate(d.createdAt) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
