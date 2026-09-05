"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  PlusIcon, AlertTriangleIcon, ArrowUpIcon, EyeIcon,
} from "@hugeicons/core-free-icons"

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [typeFilter, setTypeFilter] = React.useState("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)
  const [resolution, setResolution] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({ shipmentId: "", type: "MISSED_SCAN", reason: "", description: "", stationId: "" })

  React.useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [excRes, statsRes] = await Promise.all([
        api.exceptions.list(),
        api.exceptions.stats(),
      ])
      setExceptions(excRes.data || [])
      setStats(statsRes.data)
    } catch {
      setExceptions([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = exceptions.filter((exc) => {
    if (statusFilter !== "ALL" && exc.status !== statusFilter) return false
    if (typeFilter !== "ALL" && exc.type !== typeFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return exc.shipment?.trackingNumber?.toLowerCase().includes(q) ||
      exc.reason?.toLowerCase().includes(q) ||
      exc.description?.toLowerCase().includes(q) ||
      exc.station?.name?.toLowerCase().includes(q)
  })

  const openCount = exceptions.filter((e) => e.status === "OPEN").length
  const escalatedCount = exceptions.filter((e) => e.status === "ESCALATED").length
  const resolvedCount = exceptions.filter((e) => e.status === "RESOLVED" || e.status === "CLOSED").length
  const inReviewCount = exceptions.filter((e) => e.status === "IN_REVIEW").length

  function openDetail(exc: any) {
    setSelected(exc)
    setResolution(exc.resolution || "")
  }

  async function handleResolve() {
    if (!selected || !resolution.trim()) return
    try {
      await api.exceptions.resolve(selected.id, { resolution })
      toast.success("Exception resolved")
      setSelected(null)
      setResolution("")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve")
    }
  }

  async function handleEscalate(id: string) {
    try {
      await api.exceptions.escalate(id)
      toast.success("Exception escalated")
      setSelected(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to escalate")
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.exceptions.create(form)
      toast.success("Exception created")
      setDialogOpen(false)
      setForm({ shipmentId: "", type: "MISSED_SCAN", reason: "", description: "", stationId: "" })
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to create exception")
    }
  }

  function handleExportPDF() {
    exportToPDF({
      title: "Exceptions Report",
      subtitle: "Shipment exceptions, issues, and resolutions",
      columns: [
        { header: "Tracking #", key: "tracking" },
        { header: "Type", key: "type" },
        { header: "Reason", key: "reason" },
        { header: "Station", key: "station" },
        { header: "Status", key: "status" },
        { header: "Date", key: "date" },
      ],
      rows: filtered.map((exc) => ({
        tracking: exc.shipment?.trackingNumber || "—",
        type: exc.type?.replace(/_/g, " ") || "—",
        reason: exc.reason || "—",
        station: exc.station?.name || "—",
        status: exc.status?.replace(/_/g, " ") || "—",
        date: exc.createdAt ? formatDate(exc.createdAt) : "—",
      })),
      meta: [
        { label: "Total", value: String(exceptions.length) },
        { label: "Open", value: String(openCount) },
        { label: "Escalated", value: String(escalatedCount) },
        { label: "Resolved", value: String(resolvedCount) },
      ],
    })
  }

  const statusFilters = ["ALL", "OPEN", "IN_REVIEW", "ESCALATED", "RESOLVED", "CLOSED"]
  const typeFilters = ["ALL", "MISSED_SCAN", "DAMAGED", "LOST", "WRONG_DESTINATION", "OVERWEIGHT", "UNCLAIMED", "RETURN_REQUEST", "CUSTOMER_REFUSAL"]

  const typeColors: Record<string, string> = {
    DAMAGED: "bg-red-500/15 text-red-600 border-red-500/30",
    LOST: "bg-red-500/15 text-red-600 border-red-500/30",
    MISSED_SCAN: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
    WRONG_DESTINATION: "bg-orange-500/15 text-orange-600 border-orange-500/30",
    OVERWEIGHT: "bg-orange-500/15 text-orange-600 border-orange-500/30",
    UNCLAIMED: "bg-purple-500/15 text-purple-600 border-purple-500/30",
    RETURN_REQUEST: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    CUSTOMER_REFUSAL: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Exceptions" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="⚠️ All Exceptions"
          description="Shipment exceptions, issues, and anomalies — track, resolve, and escalate problems."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <HugeiconsIcon icon={Download01Icon} className="size-4" />
                Export PDF
              </Button>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                New Exception
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total" value={formatNumber(exceptions.length)} icon={AlertCircleIcon} hint="All exceptions" />
          <MetricCard label="Open" value={formatNumber(openCount)} icon={AlertCircleIcon} hint="Needs attention" />
          <MetricCard label="Escalated" value={formatNumber(escalatedCount)} icon={ArrowUpIcon} hint="High priority" />
          <MetricCard label="Resolved" value={formatNumber(resolvedCount)} icon={CheckmarkCircle02Icon} hint="Closed cases" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tracking, reason, station..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {typeFilters.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  typeFilter === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {t === "ALL" ? "All Types" : t.replace(/_/g, " ")}
              </button>
            ))}
          </div>
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
              {s === "ALL" ? "All Status" : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No exceptions found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Reason</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Station</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((exc) => (
                    <tr
                      key={exc.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => openDetail(exc)}
                    >
                      <td className="px-4 py-3 font-medium tabular-nums">{exc.shipment?.trackingNumber || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${typeColors[exc.type] || "bg-muted/40 text-muted-foreground border-border"}`}>
                          {exc.type?.replace(/_/g, " ") || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{exc.reason || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{exc.station?.name || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={exc.status} size="sm" /></td>
                      <td className="px-4 py-3 text-muted-foreground">{exc.createdAt ? formatDate(exc.createdAt) : "—"}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); openDetail(exc) }}>
                          <HugeiconsIcon icon={EyeIcon} className="size-3.5" />
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
                  <HugeiconsIcon icon={AlertTriangleIcon} className="size-5 text-primary" />
                  {selected.shipment?.trackingNumber || "Exception"}
                </SheetTitle>
                <SheetDescription>
                  {selected.type?.replace(/_/g, " ")} — {selected.station?.name || "No station"}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <StatusBadge status={selected.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Tracking #</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.shipment?.trackingNumber || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="mt-1">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${typeColors[selected.type] || "bg-muted/40 text-muted-foreground border-border"}`}>
                        {selected.type?.replace(/_/g, " ") || "—"}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Station</p>
                    <p className="mt-1 text-sm font-medium">{selected.station?.name || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="mt-1 text-sm font-medium">{selected.createdAt ? formatDate(selected.createdAt) : "—"}</p>
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm font-medium">{selected.reason || "—"}</p>
                </div>

                {selected.description && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{selected.description}</p>
                  </div>
                )}

                {selected.resolution && (
                  <div className="rounded-lg border bg-green-500/5 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Resolution</p>
                    <p className="text-sm">{selected.resolution}</p>
                  </div>
                )}

                {selected.assignedTo?.name && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="mt-1 text-sm font-medium">{selected.assignedTo.name}</p>
                  </div>
                )}

                {/* Resolve input */}
                {(selected.status === "OPEN" || selected.status === "ESCALATED" || selected.status === "IN_REVIEW") && (
                  <div className="space-y-2">
                    <Label>Resolution Details</Label>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={3}
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Enter resolution details..."
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                  {(selected.status === "OPEN" || selected.status === "IN_REVIEW") && (
                    <Button variant="outline" className="flex-1" onClick={() => handleEscalate(selected.id)}>
                      <HugeiconsIcon icon={ArrowUpIcon} className="size-4" />
                      Escalate
                    </Button>
                  )}
                  {(selected.status === "OPEN" || selected.status === "ESCALATED" || selected.status === "IN_REVIEW") && (
                    <Button className="flex-1" onClick={handleResolve} disabled={!resolution.trim()}>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Exception</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shipment ID *</Label>
                <Input value={form.shipmentId} onChange={(e) => setForm({ ...form, shipmentId: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="MISSED_SCAN">Missed Scan</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="LOST">Lost</option>
                  <option value="WRONG_DESTINATION">Wrong Destination</option>
                  <option value="OVERWEIGHT">Overweight</option>
                  <option value="UNCLAIMED">Unclaimed</option>
                  <option value="RETURN_REQUEST">Return Request</option>
                  <option value="CUSTOMER_REFUSAL">Customer Refusal</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reason *</Label>
                <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Station ID (optional)</Label>
                <Input value={form.stationId} onChange={(e) => setForm({ ...form, stationId: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Exception</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
