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
  ArrowLeftIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  AlertCircleIcon, PlusIcon, TruckIcon, EyeIcon,
} from "@hugeicons/core-free-icons"

export default function ReturnsPage() {
  const [returns, setReturns] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    shipmentId: "", reason: "", description: "", returnStationId: "",
  })

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.exceptions.list("type=RETURN_REQUEST")
      setReturns(result.data || [])
    } catch {
      setReturns([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = returns.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return r.shipment?.trackingNumber?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.station?.name?.toLowerCase().includes(q)
  })

  const pendingCount = returns.filter((r) => r.status === "OPEN" || r.status === "IN_REVIEW").length
  const inTransitCount = returns.filter((r) => r.status === "RESOLVED").length
  const completedCount = returns.filter((r) => r.status === "CLOSED").length
  const escalatedCount = returns.filter((r) => r.status === "ESCALATED").length

  async function handleCreateReturn(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.exceptions.createReturn({
        shipmentId: form.shipmentId,
        reason: form.reason,
        description: form.description,
        returnStationId: form.returnStationId || undefined,
      })
      toast.success("Return request created")
      setDialogOpen(false)
      setForm({ shipmentId: "", reason: "", description: "", returnStationId: "" })
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to create return")
    }
  }

  async function handleResolve() {
    if (!selected) return
    try {
      await api.exceptions.resolve(selected.id, { resolution: "Return processed and completed" })
      toast.success("Return resolved")
      setSelected(null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve")
    }
  }

  async function handleEscalate(id: string) {
    try {
      await api.exceptions.escalate(id)
      toast.success("Return escalated")
      setSelected(null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to escalate")
    }
  }

  function handleExportPDF() {
    exportToPDF({
      title: "Returns Report",
      subtitle: "Shipment return requests and their status",
      columns: [
        { header: "Tracking #", key: "tracking" },
        { header: "Reason", key: "reason" },
        { header: "Station", key: "station" },
        { header: "Status", key: "status" },
        { header: "Date", key: "date" },
      ],
      rows: filtered.map((r) => ({
        tracking: r.shipment?.trackingNumber || "—",
        reason: r.reason || "—",
        station: r.station?.name || "—",
        status: r.status?.replace(/_/g, " ") || "—",
        date: r.createdAt ? formatDate(r.createdAt) : "—",
      })),
      meta: [
        { label: "Total Returns", value: String(returns.length) },
        { label: "Pending", value: String(pendingCount) },
        { label: "Completed", value: String(completedCount) },
      ],
    })
  }

  const statusFilters = ["ALL", "OPEN", "IN_REVIEW", "ESCALATED", "RESOLVED", "CLOSED"]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Exceptions", href: "/dashboard/exceptions" },
      { label: "Returns" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="↩️ Returns"
          description="Shipment return requests — track, process, and manage returned parcels."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <HugeiconsIcon icon={Download01Icon} className="size-4" />
                Export PDF
              </Button>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                New Return
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Returns" value={formatNumber(returns.length)} icon={ArrowLeftIcon} hint="All returns" />
          <MetricCard label="Pending" value={formatNumber(pendingCount)} icon={AlertCircleIcon} hint="Awaiting processing" />
          <MetricCard label="In Transit" value={formatNumber(inTransitCount)} icon={TruckIcon} hint="Being returned" />
          <MetricCard label="Completed" value={formatNumber(completedCount)} icon={CheckmarkCircle02Icon} hint="Returned to origin" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tracking, reason, station..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={ArrowLeftIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No return requests found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Reason</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Station</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => setSelected(r)}
                    >
                      <td className="px-4 py-3 font-medium tabular-nums">{r.shipment?.trackingNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.shipment?.customer?.name || r.shipment?.sender?.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{r.reason || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.station?.name || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} size="sm" /></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.createdAt ? formatDate(r.createdAt) : "—"}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); setSelected(r) }}>
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
                  <HugeiconsIcon icon={ArrowLeftIcon} className="size-5 text-primary" />
                  {selected.shipment?.trackingNumber || "Return"}
                </SheetTitle>
                <SheetDescription>
                  Return request — {selected.station?.name || "No station"}
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
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="mt-1 text-sm font-medium">{selected.shipment?.customer?.name || selected.shipment?.sender?.name || "—"}</p>
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

                {selected.shipment && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-2">Shipment Details</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Origin</p>
                        <p className="font-medium">{selected.shipment.origin || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Destination</p>
                        <p className="font-medium">{selected.shipment.destination || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="font-medium">{selected.shipment.status?.replace(/_/g, " ") || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Receiver</p>
                        <p className="font-medium">{selected.shipment.receiver?.name || "—"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selected.resolution && (
                  <div className="rounded-lg border bg-green-500/5 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Resolution</p>
                    <p className="text-sm">{selected.resolution}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                  {(selected.status === "OPEN" || selected.status === "IN_REVIEW") && (
                    <Button variant="outline" className="flex-1" onClick={() => handleEscalate(selected.id)}>
                      Escalate
                    </Button>
                  )}
                  {(selected.status === "OPEN" || selected.status === "ESCALATED" || selected.status === "IN_REVIEW") && (
                    <Button className="flex-1" onClick={handleResolve}>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                      Mark Returned
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Return Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Return Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateReturn} className="space-y-4">
            <div className="space-y-2">
              <Label>Shipment ID *</Label>
              <Input value={form.shipmentId} onChange={(e) => setForm({ ...form, shipmentId: e.target.value })} required placeholder="Enter shipment ID" />
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required placeholder="e.g. Customer refused delivery" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Additional details about the return..."
              />
            </div>
            <div className="space-y-2">
              <Label>Return Station ID (optional)</Label>
              <Input value={form.returnStationId} onChange={(e) => setForm({ ...form, returnStationId: e.target.value })} placeholder="Station to receive the return" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Return</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
