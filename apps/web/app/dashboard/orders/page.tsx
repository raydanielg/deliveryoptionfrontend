"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Coins01Icon,
  Search01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ChartIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { formatMoney, formatNumber, formatDate } from "@/lib/format"

const PAYMENT_FILTERS = [
  { value: "ALL", label: "All Payments" },
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "PARTIAL", label: "Partially Paid" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "FAILED", label: "Failed" },
]

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [paymentFilter, setPaymentFilter] = React.useState("ALL")
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const limit = 20

  React.useEffect(() => { loadOrders() }, [page, paymentFilter])

  async function loadOrders() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(limit))
      if (paymentFilter !== "ALL") params.set("paymentStatus", paymentFilter)
      const [listRes, statsRes] = await Promise.allSettled([
        api.orders.list(params.toString()),
        api.orders.stats(),
      ])
      if (listRes.status === "fulfilled") {
        setOrders(listRes.value.data || [])
        setTotal(listRes.value.pagination?.total || listRes.value.total || 0)
      }
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = orders.filter(o => {
    if (!search) return true
    const q = search.toLowerCase()
    return o.orderNumber?.toLowerCase().includes(q) || o.customerName?.toLowerCase().includes(q)
  })

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Orders" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Orders"
          description="Customer order history and payment tracking"
        />

        {/* Stats Summary */}
        {stats && !loading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums">{formatNumber(stats.total ?? 0)}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HugeiconsIcon icon={ChartIcon} className="size-5" />
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums">{formatMoney(Number(stats.totalRevenue || 0), "TZS", { compact: true })}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <HugeiconsIcon icon={Coins01Icon} className="size-5" />
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-600">{formatNumber(stats.confirmed ?? 0)}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5" />
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-amber-600">{formatNumber(stats.pending ?? 0)}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <HugeiconsIcon icon={Clock01Icon} className="size-5" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filter Toolbar */}
        <Card className="p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search order #, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v ?? "ALL"); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by payment" /></SelectTrigger>
              <SelectContent>
                {PAYMENT_FILTERS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setPage(1); loadOrders() }} className="sm:ml-auto">
              <HugeiconsIcon icon={Search01Icon} className="size-4" />
              Search
            </Button>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Order #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Payment</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-3"><Skeleton className="h-5 w-28" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Coins01Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.id} className="border-b last:border-0 transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.customer?.user?.name || o.createdBy?.name || "—"}</td>
                      <td className="px-4 py-3 font-medium tabular-nums">{formatMoney(Number(o.totalAmount || 0), o.currency || "TZS", { compact: true })}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.paymentStatus} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
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
        </Card>
      </div>
    </DashboardLayout>
  )
}
