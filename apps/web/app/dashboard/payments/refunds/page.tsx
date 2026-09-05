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
  CoinsIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  AlertCircleIcon, ClockIcon, Cancel01Icon, ArrowDownRight02Icon,
} from "@hugeicons/core-free-icons"

export default function RefundsPage() {
  const [refunds, setRefunds] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)
  const [statusUpdate, setStatusUpdate] = React.useState("")

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.refunds.list()
      setRefunds(result.data || [])
    } catch {
      setRefunds([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = refunds.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return r.refundRef?.toLowerCase().includes(q) ||
      r.customer?.name?.toLowerCase().includes(q) ||
      r.payment?.paymentRef?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q)
  })

  const pendingCount = refunds.filter((r) => r.status === "PENDING" || r.status === "REQUESTED").length
  const approvedCount = refunds.filter((r) => r.status === "APPROVED" || r.status === "COMPLETED").length
  const rejectedCount = refunds.filter((r) => r.status === "REJECTED" || r.status === "CANCELLED").length
  const totalRefundAmount = refunds.filter((r) => r.status === "APPROVED" || r.status === "COMPLETED").reduce((s, r) => s + Number(r.amount || 0), 0)

  function openDetail(r: any) {
    setSelected(r)
    setStatusUpdate(r.status)
  }

  async function updateStatus() {
    if (!selected || !statusUpdate) return
    try {
      await api.refunds.updateStatus(selected.id, { status: statusUpdate })
      toast.success("Refund status updated")
      setSelected(null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  function handleExportPDF() {
    exportToPDF({
      title: "Refunds Report",
      subtitle: "All refund requests and their processing status",
      columns: [
        { header: "Refund Ref", key: "ref" },
        { header: "Customer", key: "customer" },
        { header: "Amount", key: "amount" },
        { header: "Reason", key: "reason" },
        { header: "Status", key: "status" },
        { header: "Date", key: "date" },
      ],
      rows: filtered.map((r) => ({
        ref: r.refundRef || "—",
        customer: r.customer?.name || "—",
        amount: formatMoney(Number(r.amount || 0), undefined, { showCode: false }),
        reason: r.reason || "—",
        status: r.status || "—",
        date: r.createdAt ? formatDate(r.createdAt) : "—",
      })),
      meta: [
        { label: "Total Refunds", value: String(refunds.length) },
        { label: "Approved", value: String(approvedCount) },
        { label: "Total Refunded", value: formatMoney(totalRefundAmount, undefined, { compact: true }) },
      ],
    })
  }

  const statusFilters = ["ALL", "PENDING", "REQUESTED", "APPROVED", "PROCESSING", "COMPLETED", "REJECTED", "CANCELLED"]
  const STATUS_OPTIONS = ["PENDING", "REQUESTED", "APPROVED", "PROCESSING", "COMPLETED", "REJECTED", "CANCELLED"]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Payments", href: "/dashboard/payments" },
      { label: "Refunds" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Refunds"
          icon={<HugeiconsIcon icon={ArrowDownRight02Icon} className="size-6 text-primary" />}
          description="Process and track refund requests — approve, reject, and monitor refund status."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Refunds" value={formatNumber(refunds.length)} icon={CoinsIcon} hint="All requests" />
          <MetricCard label="Pending" value={formatNumber(pendingCount)} icon={ClockIcon} hint="Awaiting review" />
          <MetricCard label="Approved" value={formatNumber(approvedCount)} icon={CheckmarkCircle02Icon} hint="Processed" />
          <MetricCard label="Total Refunded" value={formatMoney(totalRefundAmount, undefined, { compact: true })} icon={ArrowDownRight02Icon} hint="Refund amount" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search ref, customer, reason..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                {s === "ALL" ? "All" : s}
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
            <p className="mt-2 text-sm text-muted-foreground">No refund requests found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Refund Ref</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Reason</th>
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
                      onClick={() => openDetail(r)}
                    >
                      <td className="px-4 py-3 font-medium tabular-nums">{r.refundRef || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.customer?.name || "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-destructive">-{formatMoney(Number(r.amount || 0), undefined, { showCode: false })}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{r.reason || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} size="sm" /></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.createdAt ? formatDate(r.createdAt) : "—"}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); openDetail(r) }}>Manage</Button>
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
                  <HugeiconsIcon icon={CoinsIcon} className="size-5 text-primary" />
                  {selected.refundRef || "Refund Request"}
                </SheetTitle>
                <SheetDescription>
                  {selected.customer?.name || "Unknown"} — {formatMoney(Number(selected.amount || 0))}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Current Status</span>
                  <StatusBadge status={selected.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Refund Ref</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.refundRef || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-destructive">-{formatMoney(Number(selected.amount || 0))}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="mt-1 text-sm font-medium">{selected.customer?.name || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="mt-1 text-sm font-medium">{selected.createdAt ? formatDate(selected.createdAt) : "—"}</p>
                  </div>
                </div>

                {selected.reason && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Reason</p>
                    <p className="mt-1 text-sm">{selected.reason}</p>
                  </div>
                )}

                {selected.payment?.paymentRef && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Original Payment</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.payment.paymentRef}</p>
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
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
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
