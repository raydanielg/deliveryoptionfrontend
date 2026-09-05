"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
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
  AlertCircleIcon, ClockIcon, File02Icon, PencilEdit02Icon,
  ArrowDownRight02Icon, ArrowUpRight02Icon,
} from "@hugeicons/core-free-icons"

const STATUS_FLOW = ["PENDING", "UNDER_REVIEW", "CLEARED", "HELD", "REJECTED"]

export default function CustomsPage() {
  const [customs, setCustoms] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)
  const [statusUpdate, setStatusUpdate] = React.useState("")

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.customs.get("")
      setCustoms(result.data || [])
    } catch {
      setCustoms([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = customs.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return c.shipment?.trackingNumber?.toLowerCase().includes(q) ||
      c.countryOfOrigin?.toLowerCase().includes(q) ||
      c.importExportType?.toLowerCase().includes(q) ||
      c.hsCode?.toLowerCase().includes(q)
  })

  const pendingCount = customs.filter((c) => c.status === "PENDING" || c.status === "UNDER_REVIEW").length
  const clearedCount = customs.filter((c) => c.status === "CLEARED").length
  const heldCount = customs.filter((c) => c.status === "HELD" || c.status === "REJECTED").length
  const totalDeclared = customs.reduce((s, c) => s + Number(c.declaredValue || 0), 0)

  function openDetail(c: any) {
    setSelected(c)
    setStatusUpdate(c.status)
  }

  async function updateStatus() {
    if (!selected || !statusUpdate) return
    try {
      await api.customs.updateStatus(selected.id, { status: statusUpdate })
      toast.success("Customs status updated")
      setSelected(null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  function handleExportPDF() {
    exportToPDF({
      title: "Customs Declarations Report",
      subtitle: "All customs declarations and clearance status",
      columns: [
        { header: "Shipment", key: "shipment" },
        { header: "Type", key: "type" },
        { header: "Declared Value", key: "value" },
        { header: "Origin", key: "origin" },
        { header: "HS Code", key: "hsCode" },
        { header: "Status", key: "status" },
      ],
      rows: filtered.map((c) => ({
        shipment: c.shipment?.trackingNumber || c.shipmentId || "—",
        type: c.importExportType || "—",
        value: formatMoney(Number(c.declaredValue || 0), undefined, { showCode: false }),
        origin: c.countryOfOrigin || "—",
        hsCode: c.hsCode || "—",
        status: c.status || "—",
      })),
      meta: [
        { label: "Total Declarations", value: String(customs.length) },
        { label: "Cleared", value: String(clearedCount) },
        { label: "Total Declared Value", value: formatMoney(totalDeclared, undefined, { compact: true }) },
      ],
    })
  }

  const statusFilters = ["ALL", "PENDING", "UNDER_REVIEW", "CLEARED", "HELD", "REJECTED"]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "International", href: "/dashboard/international" },
      { label: "Customs" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Customs"
          icon={<HugeiconsIcon icon={Globe02Icon} className="size-6 text-primary" />}
          description="Customs declarations, clearance status, and duty calculations for international shipments."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Declarations" value={formatNumber(customs.length)} icon={File02Icon} hint="All records" />
          <MetricCard label="Pending Review" value={formatNumber(pendingCount)} icon={ClockIcon} hint="Awaiting clearance" />
          <MetricCard label="Cleared" value={formatNumber(clearedCount)} icon={CheckmarkCircle02Icon} hint="Passed customs" />
          <MetricCard label="Total Declared" value={formatMoney(totalDeclared, undefined, { compact: true })} icon={Globe02Icon} hint="Sum of declared values" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tracking #, origin, HS code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
            <p className="mt-2 text-sm text-muted-foreground">No customs declarations found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Shipment</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Declared Value</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Origin</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">HS Code</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => openDetail(c)}
                    >
                      <td className="px-4 py-3 font-medium">{c.shipment?.trackingNumber || c.shipmentId?.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {c.importExportType === "EXPORT" ? (
                            <HugeiconsIcon icon={ArrowUpRight02Icon} className="size-3.5 text-emerald-600" />
                          ) : (
                            <HugeiconsIcon icon={ArrowDownRight02Icon} className="size-3.5 text-blue-600" />
                          )}
                          <span className="text-muted-foreground">{c.importExportType || "—"}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{formatMoney(Number(c.declaredValue || 0), undefined, { showCode: false })}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.countryOfOrigin || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{c.hsCode || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} size="sm" /></td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); openDetail(c) }}>
                          <HugeiconsIcon icon={PencilEdit02Icon} className="size-3.5" />
                          Manage
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

      {/* Detail / Action Drawer */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Globe02Icon} className="size-5 text-primary" />
                  Customs Declaration
                </SheetTitle>
                <SheetDescription>
                  {selected.shipment?.trackingNumber || selected.shipmentId?.slice(0, 8)} — {selected.importExportType}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                {/* Status badge */}
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Current Status</span>
                  <StatusBadge status={selected.status} size="sm" />
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Import/Export</p>
                    <p className="mt-1 text-sm font-medium">{selected.importExportType || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Declared Value</p>
                    <p className="mt-1 text-sm font-bold tabular-nums">{formatMoney(Number(selected.declaredValue || 0))}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Country of Origin</p>
                    <p className="mt-1 text-sm font-medium">{selected.countryOfOrigin || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">HS Code</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.hsCode || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Duty Amount</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{formatMoney(Number(selected.dutyAmount || 0), undefined, { showCode: false })}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Tax Amount</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{formatMoney(Number(selected.taxAmount || 0), undefined, { showCode: false })}</p>
                  </div>
                </div>

                {selected.description && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="mt-1 text-sm">{selected.description}</p>
                  </div>
                )}

                {/* Status update */}
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                  >
                    {STATUS_FLOW.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                  <Button className="flex-1" onClick={updateStatus}>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                    Update Status
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
