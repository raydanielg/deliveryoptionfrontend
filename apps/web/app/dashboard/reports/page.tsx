"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { buttonVariants } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Download01Icon,
  Package02Icon,
  CoinsIcon,
  Route02Icon,
  UserGroupIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { exportToCSV } from "@/lib/csv-export"
import { formatMoney, formatNumber, formatPercent, formatDate } from "@/lib/format"

type ReportTab = "shipments" | "revenue" | "routes" | "users" | "exceptions"

const TABS: { id: ReportTab; label: string; icon: any }[] = [
  { id: "shipments", label: "Shipments", icon: Package02Icon },
  { id: "revenue", label: "Revenue", icon: CoinsIcon },
  { id: "routes", label: "Routes", icon: Route02Icon },
  { id: "users", label: "Users", icon: UserGroupIcon },
  { id: "exceptions", label: "Exceptions", icon: AlertCircleIcon },
]

export default function ReportsPage() {
  const [tab, setTab] = React.useState<ReportTab>("shipments")
  const [shipments, setShipments] = React.useState<any[]>([])
  const [orders, setOrders] = React.useState<any[]>([])
  const [routes, setRoutes] = React.useState<any[]>([])
  const [users, setUsers] = React.useState<any[]>([])
  const [exceptions, setExceptions] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      setLoading(true)
      try {
        const [shipRes, orderRes, routeRes, userRes, excRes] = await Promise.allSettled([
          api.shipments.list("?page=1&limit=100"),
          api.orders.list("?page=1&limit=100"),
          api.shipments.list("?page=1&limit=500"),
          api.users.list("?page=1&limit=100"),
          api.exceptions.list("?page=1&limit=100"),
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
        if (routeRes.status === "fulfilled") {
          const data = routeRes.value.data?.shipments || routeRes.value.data || []
          const routeMap: Record<string, { total: number; delivered: number; revenue: number }> = {}
          for (const s of data) {
            const from = s.fromAddress?.city || s.fromAddress?.address || "Unknown"
            const to = s.toAddress?.city || s.toAddress?.address || "Unknown"
            const route = `${from} → ${to}`
            if (!routeMap[route]) routeMap[route] = { total: 0, delivered: 0, revenue: 0 }
            routeMap[route].total++
            if (s.status === "DELIVERED") routeMap[route].delivered++
            routeMap[route].revenue += Number(s.totalAmount || 0)
          }
          setRoutes(Object.entries(routeMap).map(([route, v]) => ({
            route,
            shipments: v.total,
            delivered: v.delivered,
            successRate: v.total > 0 ? (v.delivered / v.total) * 100 : 0,
            revenue: v.revenue,
          })).sort((a, b) => b.shipments - a.shipments))
        }
        if (userRes.status === "fulfilled") {
          const data = userRes.value.data?.users || userRes.value.data || []
          setUsers(Array.isArray(data) ? data : [])
        }
        if (excRes.status === "fulfilled") {
          const data = excRes.value.data?.exceptions || excRes.value.data || []
          setExceptions(Array.isArray(data) ? data : [])
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    return () => { cancelled = true }
  }, [])

  function handleExport() {
    const date = new Date().toISOString().slice(0, 10)

    if (tab === "shipments") {
      exportToCSV(`shipments-report-${date}`, [
        "Tracking Number", "Status", "From", "To", "Customer", "Amount", "Currency", "Created At",
      ], shipments.map((s) => [
        s.trackingNumber || "—",
        s.status || "—",
        s.fromAddress?.city || "—",
        s.toAddress?.city || "—",
        s.customer?.name || s.customer?.user?.name || "—",
        s.totalAmount || 0,
        s.currency || "TZS",
        s.createdAt ? formatDate(s.createdAt) : "—",
      ]))
    } else if (tab === "revenue") {
      exportToCSV(`revenue-report-${date}`, [
        "Order ID", "Status", "Customer", "Amount", "Currency", "Created At",
      ], orders.map((o) => [
        o.id || o.orderNumber || "—",
        o.status || "—",
        o.customer?.name || o.customer?.user?.name || "—",
        o.totalAmount || o.amount || 0,
        o.currency || "TZS",
        o.createdAt ? formatDate(o.createdAt) : "—",
      ]))
    } else if (tab === "routes") {
      exportToCSV(`routes-report-${date}`, [
        "Route", "Shipments", "Delivered", "Success Rate (%)", "Revenue",
      ], routes.map((r) => [
        r.route,
        r.shipments,
        r.delivered,
        r.successRate.toFixed(1),
        r.revenue,
      ]))
    } else if (tab === "users") {
      exportToCSV(`users-report-${date}`, [
        "Name", "Email", "Phone", "Role", "Active", "Created At",
      ], users.map((u) => [
        u.name || "—",
        u.email || "—",
        u.phone || "—",
        u.role || "—",
        u.isActive ? "Yes" : "No",
        u.createdAt ? formatDate(u.createdAt) : "—",
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

  const tabCount = tab === "shipments" ? shipments.length : tab === "revenue" ? orders.length : tab === "routes" ? routes.length : tab === "users" ? users.length : exceptions.length

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reports" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Reports"
          description="Generate and export operational reports — shipments, revenue, routes, users, and exceptions."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || tabCount === 0}>
                <HugeiconsIcon icon={Download01Icon} className="size-4" />
                Export CSV
              </Button>
              <Link href="/dashboard/analytics" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                Analytics
              </Link>
            </>
          }
        />

        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
          {TABS.map((t) => {
            const count = t.id === "shipments" ? shipments.length : t.id === "revenue" ? orders.length : t.id === "routes" ? routes.length : t.id === "users" ? users.length : exceptions.length
            return (
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
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Report content */}
        {loading ? (
          <Card className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/30" />
              ))}
            </div>
          </Card>
        ) : (
          <>
            {tab === "shipments" && <ShipmentsReport shipments={shipments} />}
            {tab === "revenue" && <RevenueReport orders={orders} />}
            {tab === "routes" && <RoutesReport routes={routes} />}
            {tab === "users" && <UsersReport users={users} />}
            {tab === "exceptions" && <ExceptionsReport exceptions={exceptions} />}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

/* ---------- Shipments Report ---------- */
function ShipmentsReport({ shipments }: { shipments: any[] }) {
  if (shipments.length === 0) {
    return <EmptyReport icon={Package02Icon} title="No shipments found" description="Shipment data will appear here once available." />
  }

  const delivered = shipments.filter((s) => s.status === "DELIVERED").length
  const cancelled = shipments.filter((s) => s.status === "CANCELLED").length
  const inTransit = shipments.filter((s) => ["IN_TRANSIT", "OUT_FOR_DELIVERY", "PICKED_UP", "ONGOING"].includes(s.status)).length

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="Total" value={formatNumber(shipments.length)} />
        <SummaryStat label="Delivered" value={formatNumber(delivered)} tone="good" />
        <SummaryStat label="In Transit" value={formatNumber(inTransit)} tone="info" />
        <SummaryStat label="Cancelled" value={formatNumber(cancelled)} tone="critical" />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {shipments.slice(0, 50).map((s) => (
                <tr key={s.id} className="border-b last:border-0 transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{s.trackingNumber || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} size="sm" /></td>
                  <td className="px-4 py-3 text-muted-foreground">{s.fromAddress?.city || "—"} → {s.toAddress?.city || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.customer?.name || s.customer?.user?.name || "—"}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(s.totalAmount, s.currency || "TZS", { compact: true })}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.createdAt ? formatDate(s.createdAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shipments.length > 50 && (
          <div className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
            Showing 50 of {shipments.length} records — export CSV for full data
          </div>
        )}
      </Card>
    </div>
  )
}

/* ---------- Revenue Report ---------- */
function RevenueReport({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return <EmptyReport icon={CoinsIcon} title="No orders found" description="Revenue data will appear here once orders are created." />
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || o.amount || 0), 0)
  const paid = orders.filter((o) => o.status === "PAID" || o.status === "CONFIRMED" || o.status === "COMPLETED").length
  const pending = orders.filter((o) => o.status === "PENDING" || o.status === "PENDING_PAYMENT").length
  const cancelled = orders.filter((o) => o.status === "CANCELLED").length

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="Total Revenue" value={formatMoney(totalRevenue, "TZS", { compact: true })} />
        <SummaryStat label="Paid" value={formatNumber(paid)} tone="good" />
        <SummaryStat label="Pending" value={formatNumber(pending)} tone="warning" />
        <SummaryStat label="Cancelled" value={formatNumber(cancelled)} tone="critical" />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Order ID</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 50).map((o) => (
                <tr key={o.id} className="border-b last:border-0 transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{o.orderNumber || o.id?.slice(0, 8) || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} size="sm" /></td>
                  <td className="px-4 py-3 text-muted-foreground">{o.customer?.name || o.customer?.user?.name || "—"}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(o.totalAmount || o.amount, o.currency || "TZS", { compact: true })}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.createdAt ? formatDate(o.createdAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length > 50 && (
          <div className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
            Showing 50 of {orders.length} records — export CSV for full data
          </div>
        )}
      </Card>
    </div>
  )
}

/* ---------- Routes Report ---------- */
function RoutesReport({ routes }: { routes: any[] }) {
  if (routes.length === 0) {
    return <EmptyReport icon={Route02Icon} title="No route data" description="Route performance will appear here once shipments are created." />
  }

  const totalShipments = routes.reduce((sum, r) => sum + r.shipments, 0)
  const totalDelivered = routes.reduce((sum, r) => sum + r.delivered, 0)
  const totalRevenue = routes.reduce((sum, r) => sum + r.revenue, 0)
  const avgSuccess = totalShipments > 0 ? (totalDelivered / totalShipments) * 100 : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="Total Routes" value={formatNumber(routes.length)} />
        <SummaryStat label="Total Shipments" value={formatNumber(totalShipments)} />
        <SummaryStat label="Avg Success" value={formatPercent(avgSuccess)} tone="good" />
        <SummaryStat label="Total Revenue" value={formatMoney(totalRevenue, "TZS", { compact: true })} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Shipments</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Delivered</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Success Rate</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.route} className="border-b last:border-0 transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{r.route}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.shipments}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.delivered}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={
                      r.successRate >= 95
                        ? "font-medium text-emerald-600 tabular-nums"
                        : r.successRate >= 85
                          ? "font-medium text-amber-600 tabular-nums"
                          : "font-medium text-red-600 tabular-nums"
                    }>
                      {r.successRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(r.revenue, "TZS", { compact: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ---------- Users Report ---------- */
function UsersReport({ users }: { users: any[] }) {
  if (users.length === 0) {
    return <EmptyReport icon={UserGroupIcon} title="No users found" description="User data will appear here once users are registered." />
  }

  const active = users.filter((u) => u.isActive).length
  const drivers = users.filter((u) => u.role === "DRIVER").length
  const customers = users.filter((u) => u.role === "CUSTOMER").length

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="Total Users" value={formatNumber(users.length)} />
        <SummaryStat label="Active" value={formatNumber(active)} tone="good" />
        <SummaryStat label="Drivers" value={formatNumber(drivers)} tone="info" />
        <SummaryStat label="Customers" value={formatNumber(customers)} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 50).map((u) => (
                <tr key={u.id} className="border-b last:border-0 transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="font-medium">{u.role || "—"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.createdAt ? formatDate(u.createdAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length > 50 && (
          <div className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
            Showing 50 of {users.length} records — export CSV for full data
          </div>
        )}
      </Card>
    </div>
  )
}

/* ---------- Exceptions Report ---------- */
function ExceptionsReport({ exceptions }: { exceptions: any[] }) {
  if (exceptions.length === 0) {
    return <EmptyReport icon={AlertCircleIcon} title="No exceptions found" description="Exception data will appear here once issues are logged." />
  }

  const open = exceptions.filter((e) => e.status === "OPEN" || e.status === "PENDING").length
  const resolved = exceptions.filter((e) => e.status === "RESOLVED" || e.status === "CLOSED").length

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat label="Total" value={formatNumber(exceptions.length)} />
        <SummaryStat label="Open" value={formatNumber(open)} tone="warning" />
        <SummaryStat label="Resolved" value={formatNumber(resolved)} tone="good" />
        <SummaryStat label="Rate" value={formatPercent(exceptions.length > 0 ? (resolved / exceptions.length) * 100 : 0)} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Shipment</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {exceptions.slice(0, 50).map((e) => (
                <tr key={e.id} className="border-b last:border-0 transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{e.id?.slice(0, 8) || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="font-medium">{e.type?.replace(/_/g, " ").toLowerCase() || "—"}</Badge>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} size="sm" /></td>
                  <td className="px-4 py-3 text-muted-foreground">{e.shipment?.trackingNumber || e.shipmentId?.slice(0, 8) || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{e.description || e.note || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.createdAt ? formatDate(e.createdAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {exceptions.length > 50 && (
          <div className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
            Showing 50 of {exceptions.length} records — export CSV for full data
          </div>
        )}
      </Card>
    </div>
  )
}

/* ---------- Shared components ---------- */
function SummaryStat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warning" | "critical" | "info" }) {
  const toneClass = {
    good: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    critical: "text-red-600 dark:text-red-400",
    info: "text-sky-600 dark:text-sky-400",
  }
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${tone ? toneClass[tone] : ""}`}>{value}</p>
    </Card>
  )
}

function EmptyReport({ icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <Card className="py-16 text-center">
      <HugeiconsIcon icon={icon} className="mx-auto size-10 text-muted-foreground/40" />
      <p className="mt-3 text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
    </Card>
  )
}
