"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { MetricCard } from "@/components/shared/metric-card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Package02Icon,
  TruckIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  PlusIcon,
  MapIcon,
  Coins01Icon,
  UserGroupIcon,
  AlertCircleIcon,
  ChartIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { formatNumber, formatMoney, formatRelative } from "@/lib/format"

export default function OperationsPage() {
  const [shipmentStats, setShipmentStats] = React.useState<any>(null)
  const [orderStats, setOrderStats] = React.useState<any>(null)
  const [recentShipments, setRecentShipments] = React.useState<any[]>([])
  const [recentOrders, setRecentOrders] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [shipStats, orderStatsRes, shipList, orderList] = await Promise.allSettled([
          api.shipments.stats(),
          api.orders.stats(),
          api.shipments.list("?page=1&limit=5"),
          api.orders.list("?page=1&limit=5"),
        ])
        if (shipStats.status === "fulfilled") setShipmentStats(shipStats.value.data)
        if (orderStatsRes.status === "fulfilled") setOrderStats(orderStatsRes.value.data)
        if (shipList.status === "fulfilled") setRecentShipments(shipList.value.data || [])
        if (orderList.status === "fulfilled") setRecentOrders(orderList.value.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const quickActions = [
    { label: "New Shipment", icon: PlusIcon, href: "/dashboard/shipments/new", description: "Create a new shipment" },
    { label: "Live Tracking", icon: MapIcon, href: "/dashboard/tracking", description: "Track shipments in real-time" },
    { label: "Manifests", icon: TruckIcon, href: "/dashboard/manifests", description: "Bulk shipment manifests" },
    { label: "Orders", icon: Coins01Icon, href: "/dashboard/orders", description: "Customer orders overview" },
    { label: "Exceptions", icon: AlertCircleIcon, href: "/dashboard/exceptions", description: "Handle delivery exceptions" },
    { label: "Customers", icon: UserGroupIcon, href: "/dashboard/customers", description: "Manage customer accounts" },
  ]

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Operations" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Operations"
          description="Manage shipments, deliveries, and assignments"
          actions={
            <Link href="/dashboard/shipments/new">
              <Button>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                New Shipment
              </Button>
            </Link>
          }
        />

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Shipments"
            value={formatNumber(shipmentStats?.total ?? 0)}
            icon={Package02Icon}
            loading={loading}
            hint="All shipments"
          />
          <MetricCard
            label="In Transit"
            value={formatNumber(shipmentStats?.inTransit ?? 0)}
            icon={TruckIcon}
            loading={loading}
            hint="Currently moving"
          />
          <MetricCard
            label="Delivered"
            value={formatNumber(shipmentStats?.delivered ?? 0)}
            icon={CheckmarkCircle02Icon}
            loading={loading}
            hint="Successfully delivered"
          />
          <MetricCard
            label="Cancelled"
            value={formatNumber(shipmentStats?.cancelled ?? 0)}
            icon={Cancel01Icon}
            loading={loading}
            hint="Cancelled shipments"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href}>
              <Card className="group h-full p-4 transition-all hover:shadow-md hover:border-primary/40">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/10">
                  <HugeiconsIcon icon={a.icon} className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <p className="mt-3 text-sm font-semibold">{a.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Shipments + Recent Orders */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Shipments */}
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Package02Icon} className="size-5 text-muted-foreground" />
                <h2 className="text-base font-semibold">Recent Shipments</h2>
              </div>
              <Link href="/dashboard/shipments" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                View all
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </Link>
            </div>
            <div className="divide-y">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <Skeleton className="size-9 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                ))
              ) : recentShipments.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <HugeiconsIcon icon={Package02Icon} className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No shipments yet</p>
                </div>
              ) : (
                recentShipments.map((s) => (
                  <Link key={s.id} href={`/dashboard/shipments/${s.id}`} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted/40">
                      <HugeiconsIcon icon={Package02Icon} className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.trackingNumber}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.fromAddress?.city} → {s.toAddress?.city} · {formatRelative(s.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={s.status} size="sm" />
                  </Link>
                ))
              )}
            </div>
          </Card>

          {/* Recent Orders */}
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Coins01Icon} className="size-5 text-muted-foreground" />
                <h2 className="text-base font-semibold">Recent Orders</h2>
              </div>
              <Link href="/dashboard/orders" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                View all
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </Link>
            </div>
            <div className="divide-y">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <Skeleton className="size-9 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))
              ) : recentOrders.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <HugeiconsIcon icon={Coins01Icon} className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted/40">
                      <HugeiconsIcon icon={Coins01Icon} className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{o.orderNumber}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatMoney(Number(o.totalAmount || 0), o.currency || "TZS", { compact: true })} · {o.customer?.user?.name || o.createdBy?.name || "—"} · {formatRelative(o.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={o.paymentStatus} size="sm" />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Order Stats Summary */}
        {orderStats && !loading && (
          <Card className="p-0">
            <div className="border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={ChartIcon} className="size-5 text-muted-foreground" />
                <h2 className="text-base font-semibold">Orders Summary</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/40">
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{formatNumber(orderStats.total ?? 0)}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{formatMoney(Number(orderStats.totalRevenue || 0), "TZS", { compact: true })}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground">Confirmed</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-emerald-600">{formatNumber(orderStats.confirmed ?? 0)}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-amber-600">{formatNumber(orderStats.pending ?? 0)}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
