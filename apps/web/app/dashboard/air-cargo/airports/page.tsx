"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Airplane01Icon, Search01Icon, CheckmarkCircle02Icon, Package02Icon, AirplaneLanding01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { formatNumber } from "@/lib/format"
import { toast } from "sonner"

export default function AirportsPage() {
  const router = useRouter()
  const [airports, setAirports] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [stRes, statsRes] = await Promise.all([
        api.stations.list("type=AIRPORT_CARGO"),
        api.stations.stats(),
      ])
      setAirports(stRes.data || [])
      setStats(statsRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load airports")
    } finally {
      setLoading(false)
    }
  }

  const filtered = airports.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.name?.toLowerCase().includes(q) ||
      s.code?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q)
  })

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Air Cargo", href: "/dashboard/air-cargo" }, { label: "Airports" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Airports"
          description="Airport stations and hubs for air cargo operations"
          actions={
            <Button variant="outline" onClick={() => loadData()}>
              <HugeiconsIcon icon={Airplane01Icon} className="size-4" />
              Refresh
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Airports"
            value={formatNumber(airports.length)}
            icon={Airplane01Icon}
            loading={loading}
            hint="All airport stations"
          />
          <MetricCard
            label="Active"
            value={formatNumber(airports.filter(s => s.isActive).length)}
            icon={CheckmarkCircle02Icon}
            loading={loading}
            hint="Currently active"
          />
          <MetricCard
            label="In Inventory"
            value={formatNumber(stats?.totalInventory ?? 0)}
            icon={Package02Icon}
            loading={loading}
            hint="Items at airports"
          />
          <MetricCard
            label="Arrived Today"
            value={formatNumber(stats?.totalDispatched ?? 0)}
            icon={AirplaneLanding01Icon}
            loading={loading}
            hint="Arrivals processed"
          />
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, code, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Code</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Location</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Manager</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Inventory</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Capacity</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-12" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Airplane01Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No airports found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => router.push(`/dashboard/stations/${s.id}`)}
                    >
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{s.code}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{[s.city, s.region, s.country].filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.managerName || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{s._count?.inventory || 0}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.capacityKg ? `${Number(s.capacityKg).toLocaleString()} kg` : "—"}</td>
                      <td className="px-4 py-3"><Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge></td>
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
