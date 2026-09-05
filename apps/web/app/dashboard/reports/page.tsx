"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Package02Icon,
  CoinsIcon,
  TruckIcon,
  Train01Icon,
  Airplane01Icon,
  BikeIcon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Clock01Icon,
  Download01Icon,
  Search01Icon,
  TrendingUpIcon,
  Route02Icon,
  Globe02Icon,
  CancelCircleIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { exportToCSV } from "@/lib/csv-export"
import { formatMoney, formatNumber, formatPercent, formatDate } from "@/lib/format"

type ReportTab = "overview" | "modes" | "exceptions" | "revenue" | "routes"

const TABS: { id: ReportTab; label: string; icon: any }[] = [
  { id: "overview", label: "Overview", icon: Package02Icon },
  { id: "modes", label: "By Mode", icon: TruckIcon },
  { id: "revenue", label: "Revenue", icon: CoinsIcon },
  { id: "routes", label: "Top Routes", icon: Route02Icon },
  { id: "exceptions", label: "Exceptions", icon: AlertCircleIcon },
]

const MODE_META: Record<string, { label: string; icon: any; color: string }> = {
  ROAD: { label: "Road", icon: TruckIcon, color: "text-blue-600" },
  RAIL: { label: "SGR Rail", icon: Train01Icon, color: "text-green-600" },
  AIR: { label: "Air Cargo", icon: Airplane01Icon, color: "text-sky-600" },
  COURIER: { label: "Courier", icon: BikeIcon, color: "text-orange-600" },
}

export default function ReportsPage() {
  const [tab, setTab] = React.useState<ReportTab>("overview")
  const [shipments, setShipments] = React.useState<any[]>([])
  const [orders, setOrders] = React.useState<any[]>([])
  const [exceptions, setExceptions] = React.useState<any[]>([])
  const [shipStats, setShipStats] = React.useState<any>(null)
  const [orderStats, setOrderStats] = React.useState<any>(null)
  const [excStats, setExcStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [dateRange, setDateRange] = React.useState<{ start: string; end: string }>({ start: "", end: "" })
  const [overviewReport, setOverviewReport] = React.useState<any>(null)
  const [revenueReport, setRevenueReport] = React.useState<any>(null)
  const [topRoutes, setTopRoutes] = React.useState<any[]>([])

  React.useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      setLoading(true)
      try {
        const dateParams = buildDateParams(dateRange)
        const [shipRes, orderRes, excRes, shipStatsRes, orderStatsRes, excStatsRes, overviewRes, revenueRes, routesRes] = await Promise.allSettled([
          api.shipments.list(`?page=1&limit=200${dateParams}`),
          api.orders.list(`?page=1&limit=200${dateParams}`),
          api.exceptions.list(`?page=1&limit=200${dateParams}`),
          api.shipments.stats(),
          api.orders.stats(),
          api.exceptions.stats(),
          api.reports.overview(dateParams.replace("&", "")),
          api.reports.revenue(dateParams.replace("&", "")),
          api.reports.topRoutes(dateParams.replace("&", "") + "&limit=10"),
        ])

        if (cancelled) return

        if (shipRes.status === "fulfilled") {
          const data = shipRes.value.data?.shipments || shipRes.value.data || []
          setShipments(Array.isArray(data) ? data : [])
        }
        if (orderRes.status === "fulfilled") {
          const data = orderRes.value.data?.orders || orderRes.value.data || []
          setOrders(Array.isArray(data) ? data : [])
        }
        if (excRes.status === "fulfilled") {
          const data = excRes.value.data?.exceptions || excRes.value.data || []
          setExceptions(Array.isArray(data) ? data : [])
        }
        if (shipStatsRes.status === "fulfilled") setShipStats(shipStatsRes.value.data)
        if (orderStatsRes.status === "fulfilled") setOrderStats(orderStatsRes.value.data)
        if (excStatsRes.status === "fulfilled") setExcStats(excStatsRes.value.data)
        if (overviewRes.status === "fulfilled") setOverviewReport(overviewRes.value.data)
        if (revenueRes.status === "fulfilled") setRevenueReport(revenueRes.value.data)
        if (routesRes.status === "fulfilled") setTopRoutes(routesRes.value.data || [])
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    return () => { cancelled = true }
  }, [dateRange])

  function buildDateParams(range: { start: string; end: string }) {
    let params = ""
    if (range.start) params += `&startDate=${new Date(range.start).toISOString()}`
    if (range.end) params += `&endDate=${new Date(range.end).toISOString()}`
    return params
  }

  function handleExport() {
    const date = new Date().toISOString().slice(0, 10)

    if (tab === "overview") {
      exportToCSV(`overview-report-${date}`, [
        "Tracking Number", "Status", "Transport Mode", "From", "To", "Customer", "Amount", "Created At",
      ], shipments.map((s) => [
        s.trackingNumber || "—",
        s.status || "—",
        s.transportMode || "—",
        s.fromAddress?.city || "—",
        s.toAddress?.city || "—",
        s.customer?.name || s.customer?.user?.name || "—",
        s.totalAmount || 0,
        s.createdAt ? formatDate(s.createdAt) : "—",
      ]))
    } else if (tab === "modes") {
      const modeData = computeModeBreakdown(shipments)
      exportToCSV(`mode-report-${date}`, [
        "Mode", "Shipments", "Delivered", "In Transit", "Cancelled", "Revenue", "Success Rate (%)",
      ], modeData.map((m) => [
        m.mode,
        m.total,
        m.delivered,
        m.inTransit,
        m.cancelled,
        m.revenue,
        m.successRate.toFixed(1),
      ]))
    } else if (tab === "exceptions") {
      exportToCSV(`exceptions-report-${date}`, [
        "ID", "Type", "Status", "Shipment", "Description", "Created At",
      ], exceptions.map((e) => [
        e.id || "—",
        e.type || "—",
        e.status || "—",
        e.shipment?.trackingNumber || e.shipmentId || "—",
        e.description || e.note || "—",
        e.createdAt ? formatDate(e.createdAt) : "—",
      ]))
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reports" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Reports"
          description="Comprehensive operational insights — overview, transport mode breakdown, revenue, routes, and exception tracking."
          actions={
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className="w-auto"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="w-auto"
              />
              <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
                <HugeiconsIcon icon={Download01Icon} className="size-4" />
                Export CSV
              </Button>
            </div>
          }
        />

        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 rounded-xl border border-border/60 bg-muted/30 p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-white text-foreground shadow-sm dark:bg-slate-800"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <HugeiconsIcon icon={t.icon} className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="mt-2 h-7 w-28" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {tab === "overview" && (
              <OverviewTab
                shipments={shipments}
                orders={orders}
                shipStats={shipStats}
                orderStats={orderStats}
                overviewReport={overviewReport}
              />
            )}
            {tab === "modes" && <ModesTab shipments={shipments} />}
            {tab === "revenue" && <RevenueTab revenueReport={revenueReport} orders={orders} />}
            {tab === "routes" && <RoutesTab topRoutes={topRoutes} />}
            {tab === "exceptions" && (
              <ExceptionsTab exceptions={exceptions} excStats={excStats} />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

/* ====================== OVERVIEW TAB ====================== */
function OverviewTab({ shipments, orders, shipStats, orderStats, overviewReport }: {
  shipments: any[]
  orders: any[]
  shipStats: any
  orderStats: any
  overviewReport?: any
}) {
  const [search, setSearch] = React.useState("")

  const delivered = shipments.filter((s) => s.status === "DELIVERED").length
  const cancelled = shipments.filter((s) => s.status === "CANCELLED").length
  const inTransit = shipments.filter((s) => ["IN_TRANSIT", "OUT_FOR_DELIVERY", "PICKED_UP", "ONGOING", "ACCEPTED", "OUT_FOR_PICKUP"].includes(s.status)).length
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || o.amount || 0), 0)
  const avgValue = shipments.length > 0 ? totalRevenue / shipments.length : 0

  const filtered = shipments.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.trackingNumber?.toLowerCase().includes(q) ||
      s.fromAddress?.city?.toLowerCase().includes(q) ||
      s.toAddress?.city?.toLowerCase().includes(q) ||
      s.customer?.name?.toLowerCase().includes(q) ||
      s.customer?.user?.name?.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Shipments" value={formatNumber(shipments.length)} icon={Package02Icon} hint={`${delivered} delivered`} />
        <MetricCard label="Total Revenue" value={formatMoney(totalRevenue, "TZS", { compact: true })} icon={CoinsIcon} hint="From all orders" />
        <MetricCard label="In Transit" value={formatNumber(inTransit)} icon={Clock01Icon} hint="Active deliveries" />
        <MetricCard label="Avg Shipment Value" value={formatMoney(avgValue, "TZS", { compact: true })} icon={TrendingUpIcon} hint="Per shipment" />
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Delivered" value={formatNumber(delivered)} icon={CheckmarkCircle02Icon} hint={`${shipments.length > 0 ? ((delivered / shipments.length) * 100).toFixed(1) : 0}% success rate`} />
        <MetricCard label="Cancelled" value={formatNumber(cancelled)} icon={CancelCircleIcon} positiveIsGood={false} hint={`${shipments.length > 0 ? ((cancelled / shipments.length) * 100).toFixed(1) : 0}% cancellation`} />
        <MetricCard label="Total Orders" value={formatNumber(orders.length)} icon={CoinsIcon} hint="All orders" />
        <MetricCard label="Pending Payment" value={formatNumber(orders.filter((o) => o.paymentStatus === "PENDING").length)} icon={Clock01Icon} hint="Awaiting payment" />
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tracking #, route, customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Shipments Table */}
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Mode</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <HugeiconsIcon icon={Package02Icon} className="mx-auto size-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">No shipments found</p>
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 50).map((s) => {
                  const mode = MODE_META[s.transportMode] || { label: s.transportMode || "—", icon: TruckIcon, color: "" }
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{s.trackingNumber || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} size="sm" /></td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <HugeiconsIcon icon={mode.icon} className={`size-3.5 ${mode.color}`} />
                          {mode.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.fromAddress?.city || "—"} → {s.toAddress?.city || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.customer?.name || s.customer?.user?.name || "—"}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(Number(s.totalAmount || 0), "TZS", { compact: true })}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.createdAt ? formatDate(s.createdAt) : "—"}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <div className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
            Showing 50 of {filtered.length} records — export CSV for full data
          </div>
        )}
      </div>
    </div>
  )
}

/* ====================== BY MODE TAB ====================== */
function computeModeBreakdown(shipments: any[]) {
  const modes: Record<string, { total: number; delivered: number; inTransit: number; cancelled: number; revenue: number }> = {}

  for (const s of shipments) {
    const mode = s.transportMode || "ROAD"
    if (!modes[mode]) modes[mode] = { total: 0, delivered: 0, inTransit: 0, cancelled: 0, revenue: 0 }
    modes[mode].total++
    if (s.status === "DELIVERED") modes[mode].delivered++
    if (["IN_TRANSIT", "OUT_FOR_DELIVERY", "PICKED_UP", "ONGOING", "ACCEPTED", "OUT_FOR_PICKUP"].includes(s.status)) modes[mode].inTransit++
    if (s.status === "CANCELLED") modes[mode].cancelled++
    modes[mode].revenue += Number(s.totalAmount || 0)
  }

  return Object.entries(modes).map(([mode, v]) => ({
    mode,
    ...v,
    successRate: v.total > 0 ? (v.delivered / v.total) * 100 : 0,
  })).sort((a, b) => b.total - a.total)
}

function ModesTab({ shipments }: { shipments: any[] }) {
  const [search, setSearch] = React.useState("")
  const modeData = React.useMemo(() => computeModeBreakdown(shipments), [shipments])

  const totalShipments = modeData.reduce((s, m) => s + m.total, 0)
  const totalRevenue = modeData.reduce((s, m) => s + m.revenue, 0)
  const totalDelivered = modeData.reduce((s, m) => s + m.delivered, 0)
  const overallSuccess = totalShipments > 0 ? (totalDelivered / totalShipments) * 100 : 0

  const filteredShipments = shipments.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.trackingNumber?.toLowerCase().includes(q) ||
      s.fromAddress?.city?.toLowerCase().includes(q) ||
      s.toAddress?.city?.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Transport Modes" value={formatNumber(modeData.length)} icon={Route02Icon} hint="Active modes" />
        <MetricCard label="Total Shipments" value={formatNumber(totalShipments)} icon={Package02Icon} hint="Across all modes" />
        <MetricCard label="Overall Success Rate" value={formatPercent(overallSuccess)} icon={CheckmarkCircle02Icon} hint={`${totalDelivered} delivered`} />
        <MetricCard label="Total Revenue" value={formatMoney(totalRevenue, "TZS", { compact: true })} icon={CoinsIcon} hint="All modes combined" />
      </div>

      {/* Mode Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {modeData.map((m) => {
          const meta = MODE_META[m.mode] || { label: m.mode, icon: TruckIcon, color: "" }
          return (
            <div key={m.mode} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted/40">
                    <HugeiconsIcon icon={meta.icon} className={`size-4 ${meta.color}`} />
                  </div>
                  <span className="text-sm font-semibold">{meta.label}</span>
                </div>
                <Badge variant="secondary" className="tabular-nums">{m.total}</Badge>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="font-medium text-emerald-600 tabular-nums">{m.delivered}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">In Transit</span>
                  <span className="font-medium text-sky-600 tabular-nums">{m.inTransit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span className="font-medium text-red-600 tabular-nums">{m.cancelled}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-1.5">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-semibold tabular-nums">{formatMoney(m.revenue, "TZS", { compact: true })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Success</span>
                  <span className={`font-semibold tabular-nums ${m.successRate >= 95 ? "text-emerald-600" : m.successRate >= 85 ? "text-amber-600" : "text-red-600"}`}>
                    {m.successRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mode Breakdown Table */}
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Mode</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Shipments</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Delivered</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">In Transit</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Cancelled</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Success Rate</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {modeData.map((m) => {
                const meta = MODE_META[m.mode] || { label: m.mode, icon: TruckIcon, color: "" }
                return (
                  <tr key={m.mode} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-medium">
                        <HugeiconsIcon icon={meta.icon} className={`size-4 ${meta.color}`} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{m.total}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-600">{m.delivered}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-sky-600">{m.inTransit}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-red-600">{m.cancelled}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={m.successRate >= 95 ? "font-medium text-emerald-600 tabular-nums" : m.successRate >= 85 ? "font-medium text-amber-600 tabular-nums" : "font-medium text-red-600 tabular-nums"}>
                        {m.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(m.revenue, "TZS", { compact: true })}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tracking #, route..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Shipments by Mode Table */}
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Mode</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <HugeiconsIcon icon={TruckIcon} className="mx-auto size-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">No shipments found</p>
                  </td>
                </tr>
              ) : (
                filteredShipments.slice(0, 50).map((s) => {
                  const meta = MODE_META[s.transportMode] || { label: s.transportMode || "—", icon: TruckIcon, color: "" }
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{s.trackingNumber || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <HugeiconsIcon icon={meta.icon} className={`size-3.5 ${meta.color}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} size="sm" /></td>
                      <td className="px-4 py-3 text-muted-foreground">{s.fromAddress?.city || "—"} → {s.toAddress?.city || "—"}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(Number(s.totalAmount || 0), "TZS", { compact: true })}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.createdAt ? formatDate(s.createdAt) : "—"}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredShipments.length > 50 && (
          <div className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
            Showing 50 of {filteredShipments.length} records — export CSV for full data
          </div>
        )}
      </div>
    </div>
  )
}

/* ====================== EXCEPTIONS TAB ====================== */
function ExceptionsTab({ exceptions, excStats }: { exceptions: any[]; excStats: any }) {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")

  const open = exceptions.filter((e) => e.status === "OPEN" || e.status === "PENDING").length
  const resolved = exceptions.filter((e) => e.status === "RESOLVED" || e.status === "CLOSED").length
  const escalated = exceptions.filter((e) => e.status === "ESCALATED").length
  const resolutionRate = exceptions.length > 0 ? (resolved / exceptions.length) * 100 : 0

  const filtered = exceptions.filter((e) => {
    if (statusFilter !== "ALL" && e.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return e.type?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.shipment?.trackingNumber?.toLowerCase().includes(q)
  })

  const STATUS_FILTERS = [
    { value: "ALL", label: "All" },
    { value: "OPEN", label: "Open" },
    { value: "PENDING", label: "Pending" },
    { value: "ESCALATED", label: "Escalated" },
    { value: "RESOLVED", label: "Resolved" },
    { value: "CLOSED", label: "Closed" },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Exceptions" value={formatNumber(exceptions.length)} icon={AlertCircleIcon} hint="All time" />
        <MetricCard label="Open" value={formatNumber(open)} icon={Clock01Icon} positiveIsGood={false} hint="Needs attention" />
        <MetricCard label="Escalated" value={formatNumber(escalated)} icon={TrendingUpIcon} positiveIsGood={false} hint="High priority" />
        <MetricCard label="Resolution Rate" value={formatPercent(resolutionRate)} icon={CheckmarkCircle02Icon} hint={`${resolved} resolved`} />
      </div>

      {/* Exception Type Breakdown */}
      {excStats?.byType && excStats.byType.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">By Type</h3>
          <div className="flex flex-wrap gap-2">
            {excStats.byType.map((t: any) => (
              <div key={t.type} className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-1.5">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">{t.type?.replace(/_/g, " ").toLowerCase()}</span>
                <Badge variant="secondary" className="tabular-nums text-xs">{t._count?.type || t.count || 0}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search type, description, tracking..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exceptions Table */}
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Shipment</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Sender</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Receiver</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">No exceptions found</p>
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 50).map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{e.id?.slice(0, 8) || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-medium">{e.type?.replace(/_/g, " ").toLowerCase() || "—"}</Badge>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={e.status} size="sm" /></td>
                    <td className="px-4 py-3 text-muted-foreground">{e.shipment?.trackingNumber || e.shipmentId?.slice(0, 8) || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.shipment?.fromAddress?.fullName || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.shipment?.toAddress?.fullName || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{e.description || e.note || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.createdAt ? formatDate(e.createdAt) : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <div className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
            Showing 50 of {filtered.length} records — export CSV for full data
          </div>
        )}
      </div>
    </div>
  )
}

/* ====================== REVENUE TAB ====================== */
function RevenueTab({ revenueReport, orders }: { revenueReport: any; orders: any[] }) {
  const totalRevenue = revenueReport?.totalRevenue || orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0)
  const outstanding = revenueReport?.outstandingPayments || 0
  const refunded = revenueReport?.refundedAmount || 0
  const unpaidInvoices = revenueReport?.unpaidInvoices || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Revenue" value={formatMoney(totalRevenue, "TZS", { compact: true })} icon={CoinsIcon} hint={`${revenueReport?.totalPayments || orders.length} payments`} />
        <MetricCard label="Outstanding" value={formatMoney(outstanding, "TZS", { compact: true })} icon={Clock01Icon} positiveIsGood={false} hint={`${revenueReport?.outstandingCount || 0} pending`} />
        <MetricCard label="Refunded" value={formatMoney(refunded, "TZS", { compact: true })} icon={Cancel01Icon} positiveIsGood={false} hint={`${revenueReport?.refundCount || 0} refunds`} />
        <MetricCard label="Unpaid Invoices" value={formatMoney(unpaidInvoices, "TZS", { compact: true })} icon={AlertCircleIcon} positiveIsGood={false} hint={`${revenueReport?.unpaidInvoiceCount || 0} invoices`} />
      </div>

      {revenueReport?.revenueByMethod && revenueReport.revenueByMethod.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Revenue by Payment Method</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2 font-medium text-muted-foreground">Method</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Amount</th>
                  <th className="pb-2 font-medium text-muted-foreground text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {revenueReport.revenueByMethod.map((m: any) => (
                  <tr key={m.method} className="border-b last:border-0">
                    <td className="py-2 font-medium">{m.method?.replace(/_/g, " ").toLowerCase() || "—"}</td>
                    <td className="py-2 text-right tabular-nums">{formatMoney(Number(m.amount || 0), "TZS", { compact: true })}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">{m.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Order #</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Payment Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <HugeiconsIcon icon={CoinsIcon} className="mx-auto size-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.slice(0, 50).map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{o.orderNumber || o.id?.slice(0, 8) || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} size="sm" /></td>
                    <td className="px-4 py-3"><StatusBadge status={o.paymentStatus} size="sm" /></td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(Number(o.totalAmount || 0), "TZS", { compact: true })}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.createdAt ? formatDate(o.createdAt) : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ====================== ROUTES TAB ====================== */
function RoutesTab({ topRoutes }: { topRoutes: any[] }) {
  const maxCount = topRoutes.length > 0 ? topRoutes[0].count : 1

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Routes" value={formatNumber(topRoutes.length)} icon={Route02Icon} hint="Active routes" />
        <MetricCard label="Busiest Route" value={topRoutes[0]?.route || "—"} icon={TrendingUpIcon} hint={topRoutes[0] ? `${topRoutes[0].count} shipments` : ""} />
        <MetricCard label="Total Weight" value={`${formatNumber(topRoutes.reduce((s, r) => s + (r.weightKg || 0), 0))} kg`} icon={Package02Icon} hint="Across all routes" />
        <MetricCard label="Total Revenue" value={formatMoney(topRoutes.reduce((s, r) => s + (r.revenue || 0), 0), "TZS", { compact: true })} icon={CoinsIcon} hint="All routes" />
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold">Route Volume</h3>
        {topRoutes.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No route data available</p>
        ) : (
          topRoutes.map((r, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-1">
                  <HugeiconsIcon icon={Route02Icon} className="size-3.5 text-muted-foreground" />
                  {r.route}
                </span>
                <span className="text-muted-foreground tabular-nums">{r.count} shipments · {formatMoney(Number(r.revenue || 0), "TZS", { compact: true })}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                  style={{ width: `${(r.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {topRoutes.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Shipments</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Weight (kg)</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Revenue</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Delivered</th>
                </tr>
              </thead>
              <tbody>
                {topRoutes.map((r, i) => (
                  <tr key={i} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{r.route}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.count}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(r.weightKg || 0)}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(Number(r.revenue || 0), "TZS", { compact: true })}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-600">{r.delivered || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
