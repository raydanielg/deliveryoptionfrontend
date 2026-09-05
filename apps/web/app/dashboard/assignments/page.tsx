"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { MetricCard } from "@/components/shared/metric-card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Route02Icon, Search01Icon, TruckIcon, UserIcon, CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { formatDate } from "@/lib/format"

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "DRIVER_ASSIGNED", label: "Driver Assigned" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
]

export default function AssignmentsPage() {
  const [shipments, setShipments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")

  React.useEffect(() => { load() }, [statusFilter])

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      const result = await api.shipments.list(params.toString())
      const rawShipments = result.data?.shipments || result.data
      const allShipments = Array.isArray(rawShipments) ? rawShipments : []
      const assigned = allShipments.filter((s: any) => s.driverId || s.driver)
      setShipments(assigned)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = shipments.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.trackingNumber?.toLowerCase().includes(q) ||
      s.driver?.user?.name?.toLowerCase().includes(q) ||
      s.fromAddress?.city?.toLowerCase().includes(q) ||
      s.toAddress?.city?.toLowerCase().includes(q)
  })

  const stats = React.useMemo(() => {
    const assigned = shipments.length
    const inTransit = shipments.filter(s => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY").length
    const delivered = shipments.filter(s => s.status === "DELIVERED").length
    const pending = shipments.filter(s => s.status === "DRIVER_ASSIGNED" || s.status === "PICKED_UP").length
    return { assigned, inTransit, delivered, pending }
  }, [shipments])

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Assignments" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Assignments"
          description="Driver and vehicle assignments"
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Assigned"
            value={String(stats.assigned)}
            icon={Route02Icon}
            loading={loading}
            hint="All assignments"
          />
          <MetricCard
            label="Pending Pickup"
            value={String(stats.pending)}
            icon={Clock01Icon}
            loading={loading}
            hint="Awaiting pickup"
          />
          <MetricCard
            label="In Transit"
            value={String(stats.inTransit)}
            icon={TruckIcon}
            loading={loading}
            hint="Currently moving"
          />
          <MetricCard
            label="Delivered"
            value={String(stats.delivered)}
            icon={CheckmarkCircle02Icon}
            loading={loading}
            hint="Completed deliveries"
          />
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tracking #, driver, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => load()} className="sm:ml-auto">
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
            Search
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Driver</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Vehicle</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-28" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-40" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Route02Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No assignments found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/shipments/${s.id}`} className="font-medium text-primary hover:underline">
                          {s.trackingNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={UserIcon} className="size-3.5 text-muted-foreground" />
                          <span>{s.driver?.user?.name || s.driver?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.fromAddress?.city || "—"} <span className="text-muted-foreground/50">→</span> {s.toAddress?.city || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.vehicle?.plateNumber || s.vehicle?.model || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(s.updatedAt || s.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
