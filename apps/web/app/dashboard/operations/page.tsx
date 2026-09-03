"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Package02Icon, TruckIcon, CoinsIcon, UserGroupIcon, PlusIcon, MapIcon, ChartIcon } from "@hugeicons/core-free-icons"

export default function OperationsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    try {
      const result = await api.shipments.stats()
      setStats(result.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    { title: "Total Shipments", value: stats?.total, icon: Package02Icon, href: "/dashboard/shipments" },
    { title: "In Transit", value: stats?.inTransit, icon: TruckIcon, href: "/dashboard/tracking" },
    { title: "Delivered", value: stats?.delivered, icon: ChartIcon, href: "/dashboard/shipments" },
    { title: "Cancelled", value: stats?.cancelled, icon: Package02Icon, href: "/dashboard/shipments" },
  ]

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Operations" }]}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operations</h1>
          <p className="text-sm text-muted-foreground">Manage shipments, deliveries, and assignments</p>
        </div>
        <Link href="/dashboard/shipments/new">
          <Button>
            <HugeiconsIcon icon={PlusIcon} strokeWidth={2} className="size-4" />
            New Shipment
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          cards.map((c) => (
            <Link key={c.title} href={c.href}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">{c.title}</span>
                    <span className="text-2xl font-bold">{c.value ?? 0}</span>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <HugeiconsIcon icon={c.icon} strokeWidth={2} className="size-5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/shipments">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">Shipments</CardTitle>
              </div>
              <CardDescription>View and manage all shipments</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/tracking">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">Live Tracking</CardTitle>
              </div>
              <CardDescription>Track shipments in real-time</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/manifests">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={TruckIcon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">Manifests</CardTitle>
              </div>
              <CardDescription>Bulk shipment manifests</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/orders">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">Orders</CardTitle>
              </div>
              <CardDescription>Customer orders overview</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/customers">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">Customers</CardTitle>
              </div>
              <CardDescription>Manage customer accounts</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/payments">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">Payments</CardTitle>
              </div>
              <CardDescription>Payment transactions</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  )
}
