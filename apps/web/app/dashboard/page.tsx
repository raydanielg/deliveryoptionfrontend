import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Package02Icon, TruckIcon, Globe02Icon, ArrowUp01Icon, ArrowDown01Icon, Route02Icon, ClockIcon, CheckmarkCircle02Icon, CancelCircleIcon, MapIcon, CoinsIcon, UserGroupIcon, BoxIcon } from "@hugeicons/core-free-icons"

const stats = [
  {
    title: "Total Shipments",
    value: "2,847",
    change: "+18.2%",
    trend: "up" as const,
    icon: <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-5" />,
  },
  {
    title: "In Transit",
    value: "142",
    change: "+12.4%",
    trend: "up" as const,
    icon: <HugeiconsIcon icon={TruckIcon} strokeWidth={2} className="size-5" />,
  },
  {
    title: "Available Drivers",
    value: "38",
    change: "-2.1%",
    trend: "down" as const,
    icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-5" />,
  },
  {
    title: "Revenue (Month)",
    value: "TZS 84.2M",
    change: "+24.6%",
    trend: "up" as const,
    icon: <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} className="size-5" />,
  },
]

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

export default function Page() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }, { label: "Overview" }]}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Xerin Delivery Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, Ezra. Here&apos;s your logistics overview today.</p>
            </div>
            <Link href="/dashboard/shipments/new">
              <Button>
                <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-4" />
                New Shipment
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">{stat.title}</span>
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${stat.trend === "up" ? "text-primary" : "text-destructive"}`}>
                      <HugeiconsIcon icon={stat.trend === "up" ? ArrowUp01Icon : ArrowDown01Icon} strokeWidth={2} className="size-3" />
                      {stat.change}
                      <span className="text-muted-foreground">vs last week</span>
                    </span>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {stat.icon}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Shipments</CardTitle>
                <CardDescription>Latest shipments across all routes</CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle>Live Shipments</CardTitle>
                <CardDescription>Active shipments in real-time</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {liveDeliveries.map((delivery) => (
                  <div key={delivery.tracking} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{delivery.tracking}</span>
                      <Badge variant="secondary" className="gap-1">
                        <HugeiconsIcon icon={ClockIcon} strokeWidth={2} className="size-3" />
                        {delivery.eta}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HugeiconsIcon icon={TruckIcon} strokeWidth={2} className="size-4" />
                      {delivery.driver}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-4" />
                      {delivery.route}
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${delivery.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{delivery.progress}% complete</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivery Success Rate</CardTitle>
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">96.8%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
                <HugeiconsIcon icon={Route02Icon} strokeWidth={2} className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2 hr</div>
                <p className="text-xs text-muted-foreground">avg transit time across all modes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
                <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} className="size-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <p className="text-xs text-muted-foreground">-1.2% from last month</p>
              </CardContent>
            </Card>
          </div>
    </DashboardLayout>
  )
}
