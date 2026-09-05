"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Switch } from "@workspace/ui/components/switch"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MapIcon,
  Search01Icon,
  AlertCircleIcon,
  Download01Icon,
  CheckmarkCircle02Icon,
  CoinsIcon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatNumber, formatMoney } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"

export default function PricingZonesPage() {
  const [zones, setZones] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    async function load() {
      try {
        const result = await api.zones.list()
        setZones(result.data || [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function toggleZone(id: string) {
    try {
      await api.zones.toggle(id)
      toast.success("Zone toggled")
      loadZones()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle zone")
    }
  }

  async function loadZones() {
    try {
      const result = await api.zones.list()
      setZones(result.data || [])
    } catch {
    }
  }

  const filtered = zones.filter((z) => {
    if (!search) return true
    const q = search.toLowerCase()
    return z.name?.toLowerCase().includes(q) ||
      z.code?.toLowerCase().includes(q) ||
      z.description?.toLowerCase().includes(q)
  })

  const activeCount = zones.filter((z) => z.isActive).length
  const totalAreas = zones.reduce((s, z) => s + (z.areas?.length || z._count?.areas || 0), 0)
  const avgBaseFee = zones.length > 0 ? zones.reduce((s, z) => s + Number(z.baseFee || 0), 0) / zones.length : 0

  function handleExportPDF() {
    exportToPDF({
      title: "Zones Report",
      subtitle: "All delivery zones with base fees and coverage areas",
      columns: [
        { header: "Zone", key: "name" },
        { header: "Code", key: "code" },
        { header: "Description", key: "description" },
        { header: "Base Fee (TZS)", key: "baseFee" },
        { header: "Areas", key: "areas" },
        { header: "Status", key: "status" },
      ],
      rows: filtered.map((z) => ({
        name: z.name || "—",
        code: z.code || "—",
        description: z.description || "—",
        baseFee: formatMoney(Number(z.baseFee || 0), undefined, { showCode: false }),
        areas: String(z.areas?.length || z._count?.areas || 0),
        status: z.isActive ? "Active" : "Inactive",
      })),
      meta: [
        { label: "Total Zones", value: String(zones.length) },
        { label: "Active", value: String(activeCount) },
        { label: "Avg Base Fee", value: formatMoney(avgBaseFee, undefined, { compact: true }) },
      ],
    })
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pricing", href: "/dashboard/pricing" }, { label: "Zones" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Zones"
          icon={<HugeiconsIcon icon={MapIcon} className="size-6 text-primary" />}
          description="Manage delivery zones, coverage areas, and zone-based pricing."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Zones" value={formatNumber(zones.length)} icon={MapIcon} hint="All configured" />
          <MetricCard label="Active" value={formatNumber(activeCount)} icon={CheckmarkCircle02Icon} hint="In use" />
          <MetricCard label="Avg Base Fee" value={formatMoney(avgBaseFee, undefined, { compact: true })} icon={CoinsIcon} hint="Across zones" />
          <MetricCard label="Coverage Areas" value={formatNumber(totalAreas)} icon={MapIcon} hint="Linked to zones" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search zone name, code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No zones found</p>
          </div>
        ) : (
          <>
            {/* Zone Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, 12).map((z) => (
                <div key={z.id} className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted/40">
                        <HugeiconsIcon icon={MapIcon} className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{z.name || "—"}</p>
                        <p className="text-xs text-muted-foreground font-mono">{z.code || "—"}</p>
                      </div>
                    </div>
                    <StatusBadge status={z.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    {z.description && (
                      <p className="text-muted-foreground line-clamp-2">{z.description}</p>
                    )}
                    {z.baseFee !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Base Fee</span>
                        <span className="font-medium tabular-nums">{formatMoney(Number(z.baseFee || 0), undefined, { showCode: false })}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Areas</span>
                      <span className="font-medium tabular-nums">{z.areas?.length || z._count?.areas || 0}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t pt-2">
                    <span className="text-xs text-muted-foreground">Toggle Active</span>
                    <Switch checked={z.isActive} onCheckedChange={() => toggleZone(z.id)} />
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
                      <th className="px-4 py-3 font-medium text-muted-foreground">Zone</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Code</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Description</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Base Fee</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Areas</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((z) => (
                      <tr key={z.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{z.name || "—"}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{z.code || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{z.description || "—"}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">{formatMoney(Number(z.baseFee || 0), undefined, { showCode: false })}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{z.areas?.length || z._count?.areas || 0}</td>
                        <td className="px-4 py-3"><StatusBadge status={z.isActive ? "ACTIVE" : "INACTIVE"} size="sm" /></td>
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
