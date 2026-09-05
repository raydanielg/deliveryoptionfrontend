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
  File02Icon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  AlertCircleIcon, ClockIcon, Cancel01Icon, CoinsIcon,
} from "@hugeicons/core-free-icons"

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.invoices.list()
      setInvoices(result.data || [])
    } catch {
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = invoices.filter((inv) => {
    if (statusFilter !== "ALL" && inv.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.customer?.name?.toLowerCase().includes(q) ||
      inv.shipment?.trackingNumber?.toLowerCase().includes(q)
  })

  const pendingCount = invoices.filter((i) => i.status === "PENDING" || i.status === "DRAFT").length
  const paidCount = invoices.filter((i) => i.status === "PAID").length
  const cancelledCount = invoices.filter((i) => i.status === "CANCELLED").length
  const totalOutstanding = invoices.filter((i) => i.status === "PENDING" || i.status === "DRAFT").reduce((s, i) => s + Number(i.total || i.amount || 0), 0)

  async function markPaid(id: string) {
    try {
      await api.invoices.markPaid(id)
      toast.success("Invoice marked as paid")
      setSelected(null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to mark as paid")
    }
  }

  async function cancelInvoice(id: string) {
    if (!confirm("Cancel this invoice?")) return
    try {
      await api.invoices.cancel(id)
      toast.success("Invoice cancelled")
      setSelected(null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel")
    }
  }

  function handleExportPDF() {
    exportToPDF({
      title: "Invoices Report",
      subtitle: "All customer invoices and payment status",
      columns: [
        { header: "Invoice #", key: "num" },
        { header: "Customer", key: "customer" },
        { header: "Amount", key: "amount" },
        { header: "Status", key: "status" },
        { header: "Due Date", key: "due" },
      ],
      rows: filtered.map((inv) => ({
        num: inv.invoiceNumber || "—",
        customer: inv.customer?.name || "—",
        amount: formatMoney(Number(inv.total || inv.amount || 0), undefined, { showCode: false }),
        status: inv.status || "—",
        due: inv.dueDate ? formatDate(inv.dueDate) : "—",
      })),
      meta: [
        { label: "Total Invoices", value: String(invoices.length) },
        { label: "Paid", value: String(paidCount) },
        { label: "Outstanding", value: formatMoney(totalOutstanding, undefined, { compact: true }) },
      ],
    })
  }

  const statusFilters = ["ALL", "DRAFT", "PENDING", "PAID", "CANCELLED"]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Payments", href: "/dashboard/payments" },
      { label: "Invoices" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="🧾 Invoices"
          description="Customer invoices — generate, track, and manage payment status."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Invoices" value={formatNumber(invoices.length)} icon={File02Icon} hint="All records" />
          <MetricCard label="Pending" value={formatNumber(pendingCount)} icon={ClockIcon} hint="Awaiting payment" />
          <MetricCard label="Paid" value={formatNumber(paidCount)} icon={CheckmarkCircle02Icon} hint="Settled" />
          <MetricCard label="Outstanding" value={formatMoney(totalOutstanding, undefined, { compact: true })} icon={CoinsIcon} hint="Unpaid total" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search invoice #, customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
            <p className="mt-2 text-sm text-muted-foreground">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Invoice #</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Due Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => setSelected(inv)}
                    >
                      <td className="px-4 py-3 font-medium tabular-nums">{inv.invoiceNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.customer?.name || "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{formatMoney(Number(inv.total || inv.amount || 0), undefined, { showCode: false })}</td>
                      <td className="px-4 py-3"><StatusBadge status={inv.status} size="sm" /></td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.dueDate ? formatDate(inv.dueDate) : "—"}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); setSelected(inv) }}>View</Button>
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
                  <HugeiconsIcon icon={File02Icon} className="size-5 text-primary" />
                  {selected.invoiceNumber || "Invoice"}
                </SheetTitle>
                <SheetDescription>
                  {selected.customer?.name || "Unknown customer"} — {formatMoney(Number(selected.total || selected.amount || 0))}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <StatusBadge status={selected.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Invoice #</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.invoiceNumber || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="mt-1 text-sm font-bold tabular-nums">{formatMoney(Number(selected.total || selected.amount || 0))}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="mt-1 text-sm font-medium">{selected.customer?.name || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="mt-1 text-sm font-medium">{selected.dueDate ? formatDate(selected.dueDate) : "—"}</p>
                  </div>
                  {selected.subtotal != null && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Subtotal</p>
                      <p className="mt-1 text-sm font-medium tabular-nums">{formatMoney(Number(selected.subtotal), undefined, { showCode: false })}</p>
                    </div>
                  )}
                  {selected.tax != null && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Tax</p>
                      <p className="mt-1 text-sm font-medium tabular-nums">{formatMoney(Number(selected.tax), undefined, { showCode: false })}</p>
                    </div>
                  )}
                </div>

                {selected.shipment?.trackingNumber && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Shipment</p>
                    <p className="mt-1 text-sm font-medium">{selected.shipment.trackingNumber}</p>
                  </div>
                )}

                {selected.items?.length > 0 && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-2">Line Items</p>
                    <div className="space-y-1">
                      {selected.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.description || item.name}</span>
                          <span className="tabular-nums">{formatMoney(Number(item.amount || 0), undefined, { showCode: false })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                  {(selected.status === "PENDING" || selected.status === "DRAFT") && (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 text-destructive border-destructive/30"
                        onClick={() => cancelInvoice(selected.id)}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                        Cancel
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => markPaid(selected.id)}
                      >
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                        Mark Paid
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
