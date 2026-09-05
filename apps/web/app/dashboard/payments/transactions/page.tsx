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
import { formatMoney, formatNumber, formatDate } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CoinsIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  AlertCircleIcon, ClockIcon, ArrowUpRight02Icon, ArrowDownRight02Icon,
} from "@hugeicons/core-free-icons"

export default function TransactionsPage() {
  const [payments, setPayments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.payments.list()
      setPayments(result.data || [])
    } catch {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = payments.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return p.paymentRef?.toLowerCase().includes(q) ||
      p.payer?.name?.toLowerCase().includes(q) ||
      p.method?.toLowerCase().includes(q)
  })

  const paidCount = payments.filter((p) => p.status === "PAID" || p.status === "COMPLETED").length
  const pendingCount = payments.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length
  const failedCount = payments.filter((p) => p.status === "FAILED" || p.status === "CANCELLED").length
  const totalRevenue = payments.filter((p) => p.status === "PAID" || p.status === "COMPLETED").reduce((s, p) => s + Number(p.amount || 0), 0)

  function handleExportPDF() {
    exportToPDF({
      title: "Transactions Report",
      subtitle: "All payment transactions and their status",
      columns: [
        { header: "Payment Ref", key: "ref" },
        { header: "Payer", key: "payer" },
        { header: "Amount", key: "amount" },
        { header: "Method", key: "method" },
        { header: "Status", key: "status" },
        { header: "Date", key: "date" },
      ],
      rows: filtered.map((p) => ({
        ref: p.paymentRef || "—",
        payer: p.payer?.name || "—",
        amount: formatMoney(Number(p.amount || 0), undefined, { showCode: false }),
        method: p.method?.replace(/_/g, " ") || "—",
        status: p.status || "—",
        date: p.createdAt ? formatDate(p.createdAt) : "—",
      })),
      meta: [
        { label: "Total Transactions", value: String(payments.length) },
        { label: "Paid", value: String(paidCount) },
        { label: "Total Revenue", value: formatMoney(totalRevenue, undefined, { compact: true }) },
      ],
    })
  }

  const statusFilters = ["ALL", "PENDING", "PROCESSING", "PAID", "COMPLETED", "FAILED", "CANCELLED"]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Payments", href: "/dashboard/payments" },
      { label: "Transactions" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="💳 Transactions"
          description="All payment transactions — track payments, methods, and settlement status."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Transactions" value={formatNumber(payments.length)} icon={CoinsIcon} hint="All records" />
          <MetricCard label="Paid" value={formatNumber(paidCount)} icon={CheckmarkCircle02Icon} hint="Completed payments" />
          <MetricCard label="Pending" value={formatNumber(pendingCount)} icon={ClockIcon} hint="Awaiting confirmation" />
          <MetricCard label="Total Revenue" value={formatMoney(totalRevenue, undefined, { compact: true })} icon={ArrowUpRight02Icon} hint="From paid transactions" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search ref, payer, method..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Payment Ref</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Payer</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Method</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => setSelected(p)}
                    >
                      <td className="px-4 py-3 font-medium tabular-nums">{p.paymentRef || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.payer?.name || "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{formatMoney(Number(p.amount || 0), undefined, { showCode: false })}</td>
                      <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{p.method?.replace(/_/g, " ") || "—"}</Badge></td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} size="sm" /></td>
                      <td className="px-4 py-3 text-muted-foreground">{p.createdAt ? formatDate(p.createdAt) : "—"}</td>
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
                  {selected.paymentRef || "Transaction"}
                </SheetTitle>
                <SheetDescription>
                  {selected.payer?.name || "Unknown payer"} — {formatMoney(Number(selected.amount || 0))}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <StatusBadge status={selected.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Payment Ref</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.paymentRef || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="mt-1 text-sm font-bold tabular-nums">{formatMoney(Number(selected.amount || 0))}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Method</p>
                    <p className="mt-1 text-sm font-medium">{selected.method?.replace(/_/g, " ") || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Payer</p>
                    <p className="mt-1 text-sm font-medium">{selected.payer?.name || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Gateway</p>
                    <p className="mt-1 text-sm font-medium">{selected.gateway?.name || selected.gatewayId || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="mt-1 text-sm font-medium">{selected.createdAt ? formatDate(selected.createdAt) : "—"}</p>
                  </div>
                </div>

                {selected.shipment?.trackingNumber && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Shipment</p>
                    <p className="mt-1 text-sm font-medium">{selected.shipment.trackingNumber}</p>
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
