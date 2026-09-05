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
  UsersIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  AlertCircleIcon, CoinsIcon, TruckIcon, EyeIcon,
} from "@hugeicons/core-free-icons"

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)
  const [customerStats, setCustomerStats] = React.useState<any>(null)

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.customers.list()
      setCustomers(result.data || [])
    } catch {
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  async function openDetail(c: any) {
    setSelected(c)
    setCustomerStats(null)
    try {
      const stats = await api.customers.stats(c.id)
      setCustomerStats(stats.data || stats)
    } catch {
    }
  }

  const filtered = customers.filter((c) => {
    if (typeFilter !== "ALL" && c.type !== typeFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
  })

  const individualCount = customers.filter((c) => c.type === "INDIVIDUAL" || c.type === "CUSTOMER").length
  const corporateCount = customers.filter((c) => c.type === "CORPORATE" || c.type === "BUSINESS").length
  const activeCount = customers.filter((c) => c.isActive !== false).length
  const totalSpent = customers.reduce((s, c) => s + Number(c.totalSpent || 0), 0)

  function handleExportPDF() {
    exportToPDF({
      title: "Customers Report",
      subtitle: "All registered customers and their activity",
      columns: [
        { header: "Name", key: "name" },
        { header: "Email", key: "email" },
        { header: "Phone", key: "phone" },
        { header: "Type", key: "type" },
        { header: "Shipments", key: "shipments" },
        { header: "Total Spent", key: "spent" },
      ],
      rows: filtered.map((c) => ({
        name: c.name || "—",
        email: c.email || "—",
        phone: c.phone || "—",
        type: c.type || "—",
        shipments: String(c.totalShipments || 0),
        spent: formatMoney(Number(c.totalSpent || 0), undefined, { showCode: false }),
      })),
      meta: [
        { label: "Total Customers", value: String(customers.length) },
        { label: "Active", value: String(activeCount) },
        { label: "Total Spent", value: formatMoney(totalSpent, undefined, { compact: true }) },
      ],
    })
  }

  const typeFilters = ["ALL", "INDIVIDUAL", "CUSTOMER", "CORPORATE", "BUSINESS"]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Customers" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="👥 All Customers"
          description="All registered customers — individuals and businesses. View profiles, shipment history, and spending."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Customers" value={formatNumber(customers.length)} icon={UsersIcon} hint="All registered" />
          <MetricCard label="Individual" value={formatNumber(individualCount)} icon={UsersIcon} hint="Personal accounts" />
          <MetricCard label="Corporate" value={formatNumber(corporateCount)} icon={CheckmarkCircle02Icon} hint="Business accounts" />
          <MetricCard label="Total Spent" value={formatMoney(totalSpent, undefined, { compact: true })} icon={CoinsIcon} hint="All customer spending" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {typeFilters.map((s) => (
              <button
                key={s}
                onClick={() => setTypeFilter(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  typeFilter === s
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
            <p className="mt-2 text-sm text-muted-foreground">No customers found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Phone</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Shipments</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Total Spent</th>
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
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {c.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium">{c.name}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{c.phone || "—"}</td>
                      <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{c.type || "—"}</Badge></td>
                      <td className="px-4 py-3 text-right tabular-nums">{c.totalShipments || 0}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{formatMoney(Number(c.totalSpent || 0), undefined, { showCode: false })}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); openDetail(c) }}>
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {selected.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  {selected.name}
                </SheetTitle>
                <SheetDescription>
                  {selected.email} — {selected.type || "Customer"}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Account Status</span>
                  <StatusBadge status={selected.isActive === false ? "INACTIVE" : "ACTIVE"} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="mt-1 text-sm font-medium">{selected.email || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.phone || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="mt-1 text-sm font-medium">{selected.type || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="mt-1 text-sm font-medium">{selected.createdAt ? formatDate(selected.createdAt) : "—"}</p>
                  </div>
                </div>

                {/* Stats from API */}
                {customerStats && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border bg-primary/5 p-3 text-center">
                      <HugeiconsIcon icon={TruckIcon} className="mx-auto size-4 text-primary mb-1" />
                      <p className="text-lg font-bold tabular-nums">{customerStats.totalShipments || selected.totalShipments || 0}</p>
                      <p className="text-xs text-muted-foreground">Shipments</p>
                    </div>
                    <div className="rounded-lg border bg-primary/5 p-3 text-center">
                      <HugeiconsIcon icon={CoinsIcon} className="mx-auto size-4 text-primary mb-1" />
                      <p className="text-lg font-bold tabular-nums">{formatMoney(Number(customerStats.totalSpent || selected.totalSpent || 0), undefined, { compact: true, showCode: false })}</p>
                      <p className="text-xs text-muted-foreground">Spent</p>
                    </div>
                    <div className="rounded-lg border bg-primary/5 p-3 text-center">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mx-auto size-4 text-primary mb-1" />
                      <p className="text-lg font-bold tabular-nums">{customerStats.completedShipments || 0}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                )}

                {selected.address && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="mt-1 text-sm">{selected.address}</p>
                  </div>
                )}

                {selected.companyName && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="mt-1 text-sm font-medium">{selected.companyName}</p>
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
