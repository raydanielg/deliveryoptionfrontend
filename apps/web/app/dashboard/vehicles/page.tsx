"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  TruckIcon,
  Search01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  AlertCircleIcon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { formatNumber } from "@/lib/format"

const VEHICLE_EMOJI: Record<string, string> = {
  MOTORCYCLE: "🏍️",
  VAN: "🚐",
  TRUCK: "🚛",
  CAR: "🚗",
  PICKUP: "🛻",
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("ALL")

  React.useEffect(() => {
    async function load() {
      try {
        const result = await api.vehicles.list()
        setVehicles(result.data || [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = vehicles.filter((v) => {
    if (typeFilter !== "ALL" && v.type !== typeFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return v.registrationNo?.toLowerCase().includes(q) ||
      v.model?.toLowerCase().includes(q) ||
      v.carrier?.name?.toLowerCase().includes(q)
  })

  const active = vehicles.filter((v) => v.status === "ACTIVE").length
  const maintenance = vehicles.filter((v) => v.status === "MAINTENANCE").length
  const inactive = vehicles.filter((v) => v.status === "INACTIVE").length
  const totalCapacity = vehicles.reduce((s, v) => s + Number(v.capacityKg || 0), 0)

  const types = Array.from(new Set(vehicles.map((v) => v.type).filter(Boolean)))
  const TYPE_FILTERS = [
    { value: "ALL", label: "All Types" },
    ...types.map((t) => ({ value: t, label: `${VEHICLE_EMOJI[t] || "🚗"} ${t?.replace(/_/g, " ").toLowerCase()}` })),
  ]

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Fleet", href: "/dashboard/fleet" }, { label: "Vehicles" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="🚛 Vehicles"
          description="Fleet vehicle management — registration, capacity, carrier assignments, and status."
        />

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Vehicles" value={formatNumber(vehicles.length)} icon={TruckIcon} hint="All registered" />
          <MetricCard label="Active" value={formatNumber(active)} icon={CheckmarkCircle02Icon} hint="On the road" />
          <MetricCard label="Maintenance" value={formatNumber(maintenance)} icon={Clock01Icon} positiveIsGood={false} hint="Being serviced" />
          <MetricCard label="Total Capacity" value={`${formatNumber(totalCapacity)} kg`} icon={TruckIcon} hint="Combined fleet" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search registration, model, carrier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  typeFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
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
                  <Skeleton className="size-10 rounded-lg" />
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
            <p className="mt-2 text-sm text-muted-foreground">No vehicles found</p>
          </div>
        ) : (
          <>
            {/* Vehicle Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, 12).map((v) => (
                <div key={v.id} className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted/40 text-lg">
                        {VEHICLE_EMOJI[v.type] || "🚗"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{v.registrationNo || "—"}</p>
                        <p className="text-xs text-muted-foreground">{v.model || v.type?.replace(/_/g, " ").toLowerCase() || "—"}</p>
                      </div>
                    </div>
                    <StatusBadge status={v.status || "INACTIVE"} size="sm" />
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium">{v.type?.replace(/_/g, " ").toLowerCase() || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium tabular-nums">{formatNumber(v.capacityKg || 0)} kg</span>
                    </div>
                    {v.carrier && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Carrier</span>
                        <span className="font-medium">{v.carrier.name}</span>
                      </div>
                    )}
                    {v.driver && (
                      <div className="flex items-center justify-between border-t pt-1.5">
                        <span className="text-muted-foreground">Driver</span>
                        <span className="font-medium">{v.driver.user?.name || v.driver.name || "—"}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Full Table */}
            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Registration</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Model</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Carrier</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Driver</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Capacity</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((v) => (
                      <tr key={v.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{VEHICLE_EMOJI[v.type] || "🚗"}</span>
                            <span className="font-medium">{v.registrationNo || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{v.type?.replace(/_/g, " ").toLowerCase() || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.model || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.carrier?.name || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.driver?.user?.name || v.driver?.name || "—"}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">{formatNumber(v.capacityKg || 0)} kg</td>
                        <td className="px-4 py-3"><StatusBadge status={v.status || "INACTIVE"} size="sm" /></td>
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
