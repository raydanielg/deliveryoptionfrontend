"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartIcon, Package02Icon, TruckIcon, CoinsIcon } from "@hugeicons/core-free-icons"

export default function AnalyticsPage() {
  const [shipmentStats, setShipmentStats] = useState<any>(null)
  const [orderStats, setOrderStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, o] = await Promise.all([
          api.shipments.stats(),
          api.orders.stats(),
        ])
        setShipmentStats(s.data)
        setOrderStats(o.data)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cards = [
    { title: "Total Shipments", value: shipmentStats?.total, icon: Package02Icon },
    { title: "In Transit", value: shipmentStats?.inTransit, icon: TruckIcon },
    { title: "Delivered", value: shipmentStats?.delivered, icon: ChartIcon },
    { title: "Total Revenue", value: orderStats?.totalRevenue, icon: CoinsIcon, prefix: "TZS " },
  ]

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Analytics" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Platform performance metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          cards.map((c) => (
            <Card key={c.title}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">{c.title}</span>
                  <span className="text-2xl font-bold">{c.prefix}{Number(c.value ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HugeiconsIcon icon={c.icon} strokeWidth={2} className="size-5" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment Distribution</CardTitle>
          <CardDescription>Breakdown by status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Booked", value: shipmentStats?.booked || 0 },
            { label: "Driver Assigned", value: shipmentStats?.driverAssigned || 0 },
            { label: "Picked Up", value: shipmentStats?.pickedUp || 0 },
            { label: "In Transit", value: shipmentStats?.inTransit || 0 },
            { label: "Out for Delivery", value: shipmentStats?.outForDelivery || 0 },
            { label: "Delivered", value: shipmentStats?.delivered || 0 },
            { label: "Cancelled", value: shipmentStats?.cancelled || 0 },
          ].map((s) => {
            const max = shipmentStats?.total || 1
            const pct = Math.min((s.value / max) * 100, 100)
            return (
              <div key={s.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
