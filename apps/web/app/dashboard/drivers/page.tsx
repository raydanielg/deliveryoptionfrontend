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
  CheckmarkCircle02Icon,
  Clock01Icon,
  CallIcon,
  AlertCircleIcon,
  IdCardIcon,
  Package02Icon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { formatNumber, formatDate } from "@/lib/format"

export default function DriversPage() {
  const [drivers, setDrivers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")

  React.useEffect(() => {
    async function load() {
      try {
        const result = await api.drivers.list()
        setDrivers(result.data || [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = drivers.filter((d) => {
    if (statusFilter !== "ALL" && d.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return d.user?.name?.toLowerCase().includes(q) ||
      d.user?.phone?.toLowerCase().includes(q) ||
      d.user?.email?.toLowerCase().includes(q) ||
      d.licenseNumber?.toLowerCase().includes(q)
  })

  const available = drivers.filter((d) => d.status === "AVAILABLE").length
  const onTrip = drivers.filter((d) => d.status === "ON_TRIP").length
  const offline = drivers.filter((d) => d.status === "OFFLINE").length
  const totalDeliveries = drivers.reduce((s, d) => s + (d.totalDeliveries || 0), 0)

  const STATUS_FILTERS = [
    { value: "ALL", label: "All Drivers" },
    { value: "AVAILABLE", label: "🟢 Available" },
    { value: "ON_TRIP", label: "🚚 On Trip" },
    { value: "OFFLINE", label: "🔴 Offline" },
  ]

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Fleet", href: "/dashboard/fleet" }, { label: "Drivers" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="🧑‍✈️ Drivers"
          description="Manage all registered drivers — status, assignments, license info, and performance."
        />

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Drivers" value={formatNumber(drivers.length)} icon={UserGroupIcon} hint="All registered" />
          <MetricCard label="Available" value={formatNumber(available)} icon={CheckmarkCircle02Icon} hint="Ready for dispatch" />
          <MetricCard label="On Trip" value={formatNumber(onTrip)} icon={TruckIcon} hint="Currently delivering" />
          <MetricCard label="Total Deliveries" value={formatNumber(totalDeliveries)} icon={Package02Icon} hint="All time" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, phone, license..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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

        {/* Content */}
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
                        🧑‍✈️
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{d.user?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{d.user?.phone || "—"}</p>
                      </div>
                    </div>
                    <StatusBadge status={d.status || "OFFLINE"} size="sm" />
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    {d.licenseNumber && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <HugeiconsIcon icon={IdCardIcon} className="size-3" />
                          License
                        </span>
                        <span className="font-mono font-medium">{d.licenseNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Deliveries</span>
                      <span className="font-medium tabular-nums">{d.totalDeliveries || 0}</span>
                    </div>
                    {d.carrier && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Carrier</span>
                        <span className="font-medium">{d.carrier.name}</span>
                      </div>
                    )}
                    {d.user?.createdAt && (
                      <div className="flex items-center justify-between border-t pt-1.5">
                        <span className="text-muted-foreground">Joined</span>
                        <span className="font-medium">{formatDate(d.user.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  {d.user?.phone && (
                    <a
                      href={`tel:${d.user.phone}`}
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
                      <th className="px-4 py-3 font-medium text-muted-foreground">License</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Carrier</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Deliveries</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d) => (
                      <tr key={d.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🧑‍✈️</span>
                            <div>
                              <p className="font-medium">{d.user?.name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{d.user?.email || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{d.user?.phone || "—"}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{d.licenseNumber || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{d.carrier?.name || "—"}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">{d.totalDeliveries || 0}</td>
                        <td className="px-4 py-3"><StatusBadge status={d.status || "OFFLINE"} size="sm" /></td>
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
