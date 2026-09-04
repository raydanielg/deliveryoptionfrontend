"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { Package02Icon, TruckIcon, Globe02Icon, ArrowRight01Icon, UserGroupIcon, CoinsIcon, Download01Icon } from "@hugeicons/core-free-icons"
import { ShipmentPerformanceChart } from "@workspace/ui/components/chart-shipment-performance"
import { ServiceDistributionDonut } from "@workspace/ui/components/chart-service-distribution"
import {
  SummaryCard,
  ShipmentStatusSection,
  LiveOperationsSection,
  OperationalAlertsSection,
  RevenueOverviewSection,
  RoutePerformanceSection,
  DriverOverviewSection,
  DeliveryPerformanceSection,
  RecentActivitySection,
} from "@/components/dashboard-sections"
import { RoleDashboard } from "@/components/role-dashboards"
import { useAuth } from "@/lib/use-auth"

const recentShipments = [
  { tracking: "XRD-2026-000928", customer: "Amani Joseph", route: "Mwanza → Dar es Salaam", driver: "John M.", status: "In Transit", amount: "TZS 35,000", time: "2 min ago" },
  { tracking: "XRD-2026-000927", customer: "Neema Peter", route: "Mwanza → Geita", driver: "Salim A.", status: "Delivered", amount: "TZS 12,500", time: "18 min ago" },
  { tracking: "XRD-2026-000926", customer: "Grace Mushi", route: "China → Tanzania", driver: "—", status: "Customs Review", amount: "TZS 450,000", time: "1 hr ago" },
  { tracking: "XRD-2026-000925", customer: "David Kimaro", route: "Mwanza CBD → Pasiansi", driver: "Frank T.", status: "Out for Delivery", amount: "TZS 8,000", time: "2 hr ago" },
  { tracking: "XRD-2026-000924", customer: "Lucia Massawe", route: "Mwanza → Shinyanga", driver: "—", status: "Awaiting Pickup", amount: "TZS 28,000", time: "3 hr ago" },
  { tracking: "XRD-2026-000923", customer: "Peter Mbwambo", route: "Dar es Salaam → Mwanza", driver: "Brian K.", status: "Delivered", amount: "TZS 40,000", time: "5 hr ago" },
]

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  "Delivered": "default",
  "In Transit": "secondary",
  "Customs Review": "secondary",
  "Out for Delivery": "secondary",
  "Awaiting Pickup": "secondary",
  "Cancelled": "destructive",
}

const liveDeliveries = [
  { tracking: "XRD-2026-000928", driver: "John M.", route: "Mwanza → Dar es Salaam", progress: 65, eta: "6 hr" },
  { tracking: "XRD-2026-000925", driver: "Frank T.", route: "Mwanza CBD → Pasiansi", progress: 85, eta: "15 min" },
  { tracking: "XRD-2026-000922", driver: "Joseph M.", route: "Mwanza → Geita", progress: 40, eta: "3 hr" },
  { tracking: "XRD-2026-000920", driver: "Brian K.", route: "Mwanza → Shinyanga", progress: 20, eta: "5 hr" },
]

const shipmentStatusData = [
  { status: "DELIVERED", count: 2758, percentage: 96.8 },
  { status: "IN_TRANSIT", count: 42, percentage: 1.5 },
  { status: "PICKED_UP", count: 28, percentage: 1.0 },
  { status: "BOOKED", count: 12, percentage: 0.4 },
  { status: "CANCELLED", count: 7, percentage: 0.3 },
]

const operationalAlerts = [
  { id: "1", title: "Shipment delayed at customs", description: "XRD-2026-000926 — China → Tanzania", severity: "HIGH", timeAgo: "8 min ago", link: "/dashboard/shipments" },
  { id: "2", title: "Driver unavailable", description: "Driver Salim A. reported vehicle breakdown", severity: "MEDIUM", timeAgo: "23 min ago", link: "/dashboard/drivers" },
  { id: "3", title: "Delivery failed", description: "XRD-2026-000919 — customer not available", severity: "MEDIUM", timeAgo: "1 hr ago", link: "/dashboard/shipments" },
]

const topRoutes = [
  { route: "Mwanza → Dar es Salaam", shipments: 842, avgTime: "6.2 hr", successRate: 97.4 },
  { route: "Dar es Salaam → Mwanza", shipments: 621, avgTime: "6.5 hr", successRate: 96.8 },
  { route: "Mwanza → Geita", shipments: 318, avgTime: "2.1 hr", successRate: 98.2 },
  { route: "Mwanza → Shinyanga", shipments: 214, avgTime: "3.8 hr", successRate: 95.1 },
]

const recentActivities = [
  { id: "1", user: "Ezra", action: "created shipment XRD-2026-000928", timeAgo: "2 min ago" },
  { id: "2", user: "System", action: "auto-assigned driver to XRD-2026-000925", timeAgo: "15 min ago" },
  { id: "3", user: "Frank T.", action: "completed delivery XRD-2026-000927", timeAgo: "18 min ago" },
  { id: "4", user: "Admin", action: "updated parcel fare rates", timeAgo: "1 hr ago" },
  { id: "5", user: "System", action: "sent delivery notification for XRD-2026-000923", timeAgo: "5 hr ago" },
]

export default function Page() {
  const [range, setRange] = React.useState("today")
  const [region, setRegion] = React.useState("all")
  const { user } = useAuth()
  const role = user?.role || "CUSTOMER"
  const isAdminRole = role === "SUPER_ADMIN" || role === "OPERATIONS_MANAGER"

  if (!isAdminRole) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard" }, { label: "Overview" }]}>
        <RoleDashboard />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }, { label: "Overview" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        {/* Header with filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Delivery Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name?.split(" ")[0] || "Admin"}. Here&apos;s your logistics overview today.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={range} onValueChange={(v) => setRange(v ?? "today")}>
              <SelectTrigger className="h-9 w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={(v) => setRegion(v ?? "all")}>
              <SelectTrigger className="h-9 w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="mwanza">Mwanza</SelectItem>
                <SelectItem value="dar">Dar es Salaam</SelectItem>
                <SelectItem value="arusha">Arusha</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/dashboard/shipments/new">
              <Button size="sm">
                <HugeiconsIcon icon={Package02Icon} className="size-4" />
                New Shipment
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export
            </Button>
          </div>
        </div>

        {/* 1. KPI Summary Cards with animations */}
        <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-3 @3xl/main:grid-cols-5">
          <div className="animate-[fade-in_0.5s_ease-out]">
            <SummaryCard label="Total Shipments" value="2,847" change="+18.2%" positive={true} icon={Package02Icon} />
          </div>
          <div className="animate-[fade-in_0.5s_ease-out_0.05s_both]">
            <SummaryCard label="In Transit" value="142" change="+12.4%" positive={true} icon={TruckIcon} />
          </div>
          <div className="animate-[fade-in_0.5s_ease-out_0.1s_both]">
            <SummaryCard label="Available Drivers" value="38" change="-2.1%" positive={false} icon={UserGroupIcon} />
          </div>
          <div className="animate-[fade-in_0.5s_ease-out_0.15s_both]">
            <SummaryCard label="Revenue (Month)" value="TZS 84.2M" change="+24.6%" positive={true} icon={CoinsIcon} />
          </div>
          <div className="animate-[fade-in_0.5s_ease-out_0.2s_both]">
            <SummaryCard label="International" value="428" subtitle="Cross-border shipments" icon={Globe02Icon} />
          </div>
        </div>

        {/* 2. Shipment Performance Chart (wide) */}
        <div className="animate-[fade-in_0.6s_ease-out_0.2s_both]">
          <ShipmentPerformanceChart />
        </div>

        {/* 3. Service Distribution Donut + Live Operations */}
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 animate-[fade-in_0.6s_ease-out_0.25s_both]">
            <h3 className="text-sm font-semibold mb-4">Service Distribution</h3>
            <ServiceDistributionDonut />
          </div>
          <div className="animate-[fade-in_0.6s_ease-out_0.3s_both]">
            <LiveOperationsSection deliveries={liveDeliveries} />
          </div>
        </div>

        {/* 4. Recent Shipments table */}
        <div className="animate-[fade-in_0.6s_ease-out_0.3s_both]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Shipments</CardTitle>
                  <CardDescription>Latest shipments across all routes</CardDescription>
                </div>
                <a href="/dashboard/shipments">
                  <Button variant="ghost" size="sm" className="h-7">
                    View All
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
                  </Button>
                </a>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-6 py-3 font-medium text-muted-foreground">Tracking #</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Customer</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Route</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Driver</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentShipments.map((ship) => (
                      <tr key={ship.tracking} className="border-b last:border-0 transition-colors hover:bg-muted/50">
                        <td className="px-6 py-3 font-medium">{ship.tracking}</td>
                        <td className="px-6 py-3">{ship.customer}</td>
                        <td className="px-6 py-3 text-muted-foreground">{ship.route}</td>
                        <td className="px-6 py-3 text-muted-foreground">{ship.driver}</td>
                        <td className="px-6 py-3">
                          <Badge variant={statusVariant[ship.status] ?? "default"}>{ship.status}</Badge>
                        </td>
                        <td className="px-6 py-3 font-medium">{ship.amount}</td>
                        <td className="px-6 py-3 text-muted-foreground">{ship.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5. Shipment Status + Operational Alerts + Revenue */}
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
          <div className="animate-[fade-in_0.5s_ease-out_0.35s_both]">
            <ShipmentStatusSection data={shipmentStatusData} />
          </div>
          <div className="animate-[fade-in_0.5s_ease-out_0.4s_both]">
            <OperationalAlertsSection alerts={operationalAlerts} />
          </div>
          <div className="animate-[fade-in_0.5s_ease-out_0.45s_both]">
            <RevenueOverviewSection />
          </div>
        </div>

        {/* 6. Delivery Performance + Route Performance + Driver Overview */}
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
          <div className="animate-[fade-in_0.5s_ease-out_0.5s_both]">
            <DeliveryPerformanceSection />
          </div>
          <div className="animate-[fade-in_0.5s_ease-out_0.55s_both]">
            <RoutePerformanceSection routes={topRoutes} />
          </div>
          <div className="animate-[fade-in_0.5s_ease-out_0.6s_both]">
            <DriverOverviewSection />
          </div>
        </div>

        {/* 7. Recent Activity */}
        <div className="animate-[fade-in_0.5s_ease-out_0.65s_both]">
          <RecentActivitySection activities={recentActivities} />
        </div>
      </div>
    </DashboardLayout>
  )
}
