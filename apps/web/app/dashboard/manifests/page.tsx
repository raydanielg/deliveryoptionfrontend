"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Package02Icon,
  PlusIcon,
  Search01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  TruckIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { formatNumber, formatDate } from "@/lib/format"

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "CREATED", label: "Created" },
  { value: "LOADING", label: "Loading" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

export default function ManifestsPage() {
  const router = useRouter()
  const [manifests, setManifests] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const limit = 20

  React.useEffect(() => { load() }, [page, statusFilter])

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(limit))
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      const result = await api.manifests.list(params.toString())
      setManifests(result.data || [])
      setTotal(result.pagination?.total || result.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = manifests.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return m.manifestNumber?.toLowerCase().includes(q) ||
      m.originStation?.toLowerCase().includes(q) ||
      m.destinationStation?.toLowerCase().includes(q) ||
      m.route?.fromCity?.name?.toLowerCase().includes(q) ||
      m.route?.toCity?.name?.toLowerCase().includes(q)
  })

  const totalPages = Math.ceil(total / limit) || 1

  const stats = React.useMemo(() => {
    const inTransit = manifests.filter(m => m.status === "IN_TRANSIT").length
    const completed = manifests.filter(m => m.status === "COMPLETED").length
    const cancelled = manifests.filter(m => m.status === "CANCELLED").length
    return { total: total, inTransit, completed, cancelled }
  }, [manifests, total])

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Manifests" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Manifests"
          description="Bulk shipment manifests & SGR parcel dispatch"
          actions={
            <Button onClick={() => router.push("/dashboard/manifests/new-sgr")}>
              <HugeiconsIcon icon={PlusIcon} className="size-4" />
              New SGR Manifest
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Manifests"
            value={formatNumber(stats.total)}
            icon={Package02Icon}
            loading={loading}
            hint="All manifests"
          />
          <MetricCard
            label="In Transit"
            value={formatNumber(stats.inTransit)}
            icon={TruckIcon}
            loading={loading}
            hint="Currently moving"
          />
          <MetricCard
            label="Completed"
            value={formatNumber(stats.completed)}
            icon={CheckmarkCircle02Icon}
            loading={loading}
            hint="Successfully completed"
          />
          <MetricCard
            label="Cancelled"
            value={formatNumber(stats.cancelled)}
            icon={Cancel01Icon}
            loading={loading}
            hint="Cancelled manifests"
          />
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search manifest #, route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "ALL"); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => { setPage(1); load() }} className="sm:ml-auto">
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
                  <th className="px-4 py-3 font-medium text-muted-foreground">Manifest #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Driver</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Shipments</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Weight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-40" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-12" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Package02Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No manifests found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr
                      key={m.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => router.push(`/dashboard/manifests/${m.id}`)}
                    >
                      <td className="px-4 py-3 font-medium">{m.manifestNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {m.originStation ? `${m.originStation} → ${m.destinationStation}` : m.route ? `${m.route.fromCity?.name} → ${m.route.toCity?.name}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.batchNo || m.driver?.user?.name || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{m.totalShipments || 0}</td>
                      <td className="px-4 py-3 tabular-nums">{Number(m.totalWeightKg || 0).toFixed(1)} kg</td>
                      <td className="px-4 py-3">
                        <Badge variant={m.status === "COMPLETED" ? "default" : "secondary"}>{m.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(m.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
