"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatMoney, formatNumber, formatDate } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Globe02Icon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  AlertCircleIcon, ClockIcon, TruckIcon, PlaneIcon,
  ArrowUpRight02Icon, ArrowDownRight02Icon,
} from "@hugeicons/core-free-icons"

export default function IntlShipmentsPage() {
  const [shipments, setShipments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.shipments.list("category=INTERNATIONAL")
      setShipments(result.data || [])
    } catch {
      setShipments([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = shipments.filter((s) => {
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return s.trackingNumber?.toLowerCase().includes(q) ||
      s.fromAddress?.city?.toLowerCase().includes(q) ||
      s.toAddress?.city?.toLowerCase().includes(q) ||
      s.fromAddress?.country?.toLowerCase().includes(q) ||
      s.toAddress?.country?.toLowerCase().includes(q)
  })

  const inTransit = shipments.filter((s) => s.status === "IN_TRANSIT" || s.status === "ONGOING" || s.status === "OUT_FOR_DELIVERY").length
  const delivered = shipments.filter((s) => s.status === "DELIVERED" || s.status === "COMPLETED").length
  const pending = shipments.filter((s) => s.status === "PENDING" || s.status === "ACCEPTED" || s.status === "OUT_FOR_PICKUP").length
  const totalValue = shipments.reduce((s, x) => s + Number(x.totalAmount || x.fare || 0), 0)

  function handleExportPDF() {
    exportToPDF({
      title: "International Shipments Report",
      subtitle: "Cross-border and international deliveries",
      columns: [
        { header: "Tracking #", key: "tracking" },
        { header: "Route", key: "route" },
        { header: "Transport", key: "transport" },
        { header: "Status", key: "status" },
        { header: "Date", key: "date" },
      ],
      rows: filtered.map((s) => ({
        tracking: s.trackingNumber || "—",
        route: `${s.fromAddress?.city || "—"}, ${s.fromAddress?.country || "—"} → ${s.toAddress?.city || "—"}, ${s.toAddress?.country || "—"}`,
        transport: s.transportMode || "—",
        status: s.status?.replace(/_/g, " ") || "—",
        date: s.createdAt ? formatDate(s.createdAt) : "—",
      })),
      meta: [
        { label: "Total Shipments", value: String(shipments.length) },
        { label: "In Transit", value: String(inTransit) },
        { label: "Delivered", value: String(delivered) },
      ],
    })
  }

  const statusFilters = ["ALL", "PENDING", "ACCEPTED", "IN_TRANSIT", "ONGOING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "International", href: "/dashboard/international" },
      { label: "Int'l Shipments" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Int'l Shipments"
          icon={<HugeiconsIcon icon={Globe02Icon} className="size-6 text-primary" />}
          description="Cross-border deliveries — air cargo, sea freight, and international road transport."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Shipments" value={formatNumber(shipments.length)} icon={Globe02Icon} hint="All international" />
          <MetricCard label="In Transit" value={formatNumber(inTransit)} icon={TruckIcon} hint="Moving" />
          <MetricCard label="Delivered" value={formatNumber(delivered)} icon={CheckmarkCircle02Icon} hint="Completed" />
          <MetricCard label="Total Value" value={formatMoney(totalValue, undefined, { compact: true })} icon={Globe02Icon} hint="Shipment values" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tracking #, city, country..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {s === "ALL" ? "All" : s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No international shipments found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Transport</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => setSelected(s)}
                    >
                      <td className="px-4 py-3 font-medium">{s.trackingNumber}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span>{s.fromAddress?.city}, {s.fromAddress?.country}</span>
                          <HugeiconsIcon icon={ArrowUpRight02Icon} className="size-3 text-muted-foreground/60" />
                          <span>{s.toAddress?.city}, {s.toAddress?.country}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {s.transportMode === "AIR" && <HugeiconsIcon icon={PlaneIcon} className="size-3.5 text-blue-600" />}
                          {s.transportMode === "ROAD" && <HugeiconsIcon icon={TruckIcon} className="size-3.5 text-emerald-600" />}
                          {s.transportMode === "SEA" && <HugeiconsIcon icon={Globe02Icon} className="size-3.5 text-cyan-600" />}
                          <Badge variant="secondary" className="text-xs">{s.transportMode || "—"}</Badge>
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} size="sm" /></td>
                      <td className="px-4 py-3 text-muted-foreground">{s.createdAt ? formatDate(s.createdAt) : "—"}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); setSelected(s) }}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Globe02Icon} className="size-5 text-primary" />
                  {selected.trackingNumber}
                </SheetTitle>
                <SheetDescription>
                  {selected.fromAddress?.city}, {selected.fromAddress?.country} → {selected.toAddress?.city}, {selected.toAddress?.country}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                {/* Status */}
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Shipment Status</span>
                  <StatusBadge status={selected.status} size="sm" />
                </div>

                {/* Route card */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Origin</p>
                      <p className="mt-1 text-sm font-semibold">{selected.fromAddress?.city || "—"}</p>
                      <p className="text-xs text-muted-foreground">{selected.fromAddress?.country || "—"}</p>
                    </div>
                    <div className="flex-1 mx-4 flex items-center justify-center">
                      <div className="h-px flex-1 bg-border" />
                      <HugeiconsIcon icon={ArrowUpRight02Icon} className="size-4 text-muted-foreground" />
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Destination</p>
                      <p className="mt-1 text-sm font-semibold">{selected.toAddress?.city || "—"}</p>
                      <p className="text-xs text-muted-foreground">{selected.toAddress?.country || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Transport Mode</p>
                    <p className="mt-1 text-sm font-medium">{selected.transportMode || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="mt-1 text-sm font-bold tabular-nums">{formatMoney(Number(selected.totalAmount || selected.fare || 0))}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.weight ? `${selected.weight} kg` : "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="mt-1 text-sm font-medium">{selected.createdAt ? formatDate(selected.createdAt) : "—"}</p>
                  </div>
                </div>

                {selected.recipient?.name && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Recipient</p>
                    <p className="mt-1 text-sm font-medium">{selected.recipient.name}</p>
                    {selected.recipient.phone && <p className="text-xs text-muted-foreground">{selected.recipient.phone}</p>}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      window.open(`/dashboard/tracking?tracking=${selected.trackingNumber}`, "_blank")
                    }}
                  >
                    Track Shipment
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
