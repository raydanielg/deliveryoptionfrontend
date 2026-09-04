"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Package02Icon,
  TruckIcon,
  MapIcon,
  CoinsIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  UserGroupIcon,
  Globe02Icon,
  WarehouseIcon,
  Train01Icon,
  Airplane01Icon,
  ArrowRight01Icon,
  CustomerService01Icon,
  File02Icon,
  AlertCircleIcon,
  PackageReceiveIcon,
  Route02Icon,
  BikeIcon,
  FlashIcon,
  ChartIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { ROLE_LABELS } from "@/lib/role-nav"

/* ---------- Shared Summary Card ---------- */
function RoleSummaryCard({ label, value, change, positive, icon, subtitle }: {
  label: string
  value: string
  change?: string
  positive?: boolean
  icon: any
  subtitle?: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            {subtitle && <span className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</span>}
            {change && (
              <span className={`text-xs font-semibold mt-1 ${positive ? "text-emerald-600" : "text-red-500"}`}>
                {change}
              </span>
            )}
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <HugeiconsIcon icon={icon} className="size-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  )
}

/* ---------- Super Admin / Operations Manager Dashboard ---------- */
export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.shipments.stats(),
      api.orders.stats(),
    ]).then(([shipRes, orderRes]) => {
      setStats({
        shipments: shipRes.status === "fulfilled" ? shipRes.value.data : null,
        orders: orderRes.status === "fulfilled" ? orderRes.value.data : null,
      })
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-4">
        <RoleSummaryCard label="Total Shipments" value={stats?.shipments?.total?.toString() || "0"} change="+18.2%" positive icon={Package02Icon} />
        <RoleSummaryCard label="In Transit" value={stats?.shipments?.inTransit?.toString() || "0"} icon={TruckIcon} />
        <RoleSummaryCard label="Total Orders" value={stats?.orders?.total?.toString() || "0"} icon={CoinsIcon} />
        <RoleSummaryCard label="Revenue" value={stats?.orders?.totalRevenue ? `TZS ${(stats.orders.totalRevenue / 1000000).toFixed(1)}M` : "TZS 0"} icon={CoinsIcon} subtitle="Total revenue" />
      </div>
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/dashboard/shipments/new"><Button size="sm"><HugeiconsIcon icon={Package02Icon} className="size-4" /> New Shipment</Button></Link>
            <Link href="/dashboard/users"><Button variant="outline" size="sm"><HugeiconsIcon icon={UserGroupIcon} className="size-4" /> Manage Users</Button></Link>
            <Link href="/dashboard/pricing/mode-config"><Button variant="outline" size="sm"><HugeiconsIcon icon={CoinsIcon} className="size-4" /> Pricing Config</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Transport Modes</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              { mode: "Road", icon: TruckIcon, url: "/dashboard/shipments", count: stats?.shipments?.byMode?.ROAD || 0 },
              { mode: "Rail (SGR)", icon: Train01Icon, url: "/dashboard/sgr", count: stats?.shipments?.byMode?.RAIL || 0 },
              { mode: "Air Cargo", icon: Airplane01Icon, url: "/dashboard/air-cargo", count: stats?.shipments?.byMode?.AIR || 0 },
            ].map((m) => (
              <Link key={m.mode} href={m.url} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={m.icon} className="size-4 text-primary" />
                  <span className="text-sm font-medium">{m.mode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{m.count}</Badge>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>System Status</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">API Status</span>
              <Badge className="bg-emerald-100 text-emerald-700">Operational</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Drivers</span>
              <Badge variant="secondary">{stats?.shipments?.activeDrivers || 0}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pending Exceptions</span>
              <Badge className="bg-amber-100 text-amber-700">{stats?.shipments?.exceptions || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ---------- Dispatcher Dashboard ---------- */
export function DispatcherDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.shipments.stats().then((res) => { setStats(res.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-4">
        <RoleSummaryCard label="Awaiting Assignment" value={stats?.awaitingAssignment?.toString() || "0"} icon={Package02Icon} subtitle="Needs driver" />
        <RoleSummaryCard label="In Transit" value={stats?.inTransit?.toString() || "0"} icon={TruckIcon} />
        <RoleSummaryCard label="Delivered Today" value={stats?.deliveredToday?.toString() || "0"} icon={CheckmarkCircle02Icon} />
        <RoleSummaryCard label="Exceptions" value={stats?.exceptions?.toString() || "0"} icon={AlertCircleIcon} subtitle="Needs attention" />
      </div>
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dispatch Actions</CardTitle>
            <CardDescription>Manage shipments across all transport modes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/dashboard/shipments"><Button size="sm"><HugeiconsIcon icon={Package02Icon} className="size-4" /> All Shipments</Button></Link>
            <Link href="/dashboard/assignments"><Button variant="outline" size="sm"><HugeiconsIcon icon={UserGroupIcon} className="size-4" /> Assignments</Button></Link>
            <Link href="/dashboard/manifests"><Button variant="outline" size="sm"><HugeiconsIcon icon={Route02Icon} className="size-4" /> Manifests</Button></Link>
            <Link href="/dashboard/control-tower"><Button variant="outline" size="sm"><HugeiconsIcon icon={MapIcon} className="size-4" /> Control Tower</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mode Overview</CardTitle>
            <CardDescription>Shipments by transport mode</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              { mode: "Road", icon: TruckIcon, url: "/dashboard/shipments", count: stats?.byMode?.ROAD || 0 },
              { mode: "Rail (SGR)", icon: Train01Icon, url: "/dashboard/sgr", count: stats?.byMode?.RAIL || 0 },
              { mode: "Air Cargo", icon: Airplane01Icon, url: "/dashboard/air-cargo", count: stats?.byMode?.AIR || 0 },
            ].map((m) => (
              <Link key={m.mode} href={m.url} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={m.icon} className="size-4 text-primary" />
                  <span className="text-sm font-medium">{m.mode}</span>
                </div>
                <Badge variant="secondary">{m.count}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ---------- Driver Dashboard ---------- */
export function DriverDashboard() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.shipments.list("assignedToMe=true&status=ASSIGNED,OUT_FOR_DELIVERY,PICKED_UP")
      .then((res) => { setAssignments(res.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />

  const active = assignments.filter((s) => s.status === "OUT_FOR_DELIVERY" || s.status === "PICKED_UP")
  const pending = assignments.filter((s) => s.status === "ASSIGNED")

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-4">
        <RoleSummaryCard label="Active Deliveries" value={active.length.toString()} icon={TruckIcon} subtitle="In progress" />
        <RoleSummaryCard label="Pending Pickup" value={pending.length.toString()} icon={Package02Icon} subtitle="Awaiting pickup" />
        <RoleSummaryCard label="Completed Today" value="0" icon={CheckmarkCircle02Icon} />
        <RoleSummaryCard label="Failed" value="0" icon={CancelCircleIcon} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Assignments</CardTitle>
          <CardDescription>Shipments assigned to you</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HugeiconsIcon icon={Package02Icon} className="size-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No active assignments</p>
              <p className="text-xs text-muted-foreground/70">Check back later for new deliveries</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-6 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Route</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((ship) => (
                    <tr key={ship.id} className="border-b last:border-0 transition-colors hover:bg-muted/50">
                      <td className="px-6 py-3 font-medium">{ship.trackingNumber}</td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {ship.fromAddress?.city} → {ship.toAddress?.city}
                      </td>
                      <td className="px-6 py-3"><Badge variant="secondary">{ship.status?.replace(/_/g, " ")}</Badge></td>
                      <td className="px-6 py-3">
                        <Link href={`/dashboard/shipments/${ship.id}`}>
                          <Button variant="ghost" size="sm" className="h-7">View <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" /></Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------- Warehouse Manager Dashboard ---------- */
export function WarehouseDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.warehouse.stats().then((res) => { setStats(res.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-4">
        <RoleSummaryCard label="Items in Storage" value={stats?.totalItems?.toString() || "0"} icon={WarehouseIcon} />
        <RoleSummaryCard label="Pending Receiving" value={stats?.pendingReceiving?.toString() || "0"} icon={PackageReceiveIcon} subtitle="Awaiting check-in" />
        <RoleSummaryCard label="Ready for Dispatch" value={stats?.readyForDispatch?.toString() || "0"} icon={TruckIcon} />
        <RoleSummaryCard label="Consolidations" value={stats?.consolidations?.toString() || "0"} icon={Package02Icon} />
      </div>
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Actions</CardTitle>
            <CardDescription>Manage inventory and dispatch</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/dashboard/warehouse"><Button size="sm"><HugeiconsIcon icon={WarehouseIcon} className="size-4" /> Inventory</Button></Link>
            <Link href="/dashboard/warehouse/receiving"><Button variant="outline" size="sm"><HugeiconsIcon icon={PackageReceiveIcon} className="size-4" /> Receiving</Button></Link>
            <Link href="/dashboard/warehouse/consolidation"><Button variant="outline" size="sm"><HugeiconsIcon icon={Package02Icon} className="size-4" /> Consolidation</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Packages received today</span>
              <Badge variant="secondary">{stats?.receivedToday || 0}</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Packages dispatched today</span>
              <Badge variant="secondary">{stats?.dispatchedToday || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total weight handled</span>
              <span className="font-medium">{stats?.totalWeightKg ? `${stats.totalWeightKg} kg` : "0 kg"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ---------- Finance Dashboard ---------- */
export function FinanceDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.orders.stats(),
      api.payments.list(),
    ]).then(([orderRes, payRes]) => {
      setStats({
        orders: orderRes.status === "fulfilled" ? orderRes.value.data : null,
        payments: payRes.status === "fulfilled" ? payRes.value.data : null,
      })
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingState />

  const totalRevenue = stats?.orders?.totalRevenue || 0
  const pendingPayments = stats?.orders?.pendingPayments || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-4">
        <RoleSummaryCard label="Total Revenue" value={`TZS ${(totalRevenue / 1000000).toFixed(1)}M`} change="+24.6%" positive icon={CoinsIcon} />
        <RoleSummaryCard label="Pending Payments" value={`TZS ${(pendingPayments / 1000).toFixed(0)}K`} icon={File02Icon} subtitle="Awaiting payment" />
        <RoleSummaryCard label="Transactions" value={(stats?.payments?.length || 0).toString()} icon={File02Icon} />
        <RoleSummaryCard label="Refunds" value="0" icon={CancelCircleIcon} />
      </div>
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Finance Actions</CardTitle>
            <CardDescription>Manage pricing and payments</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/dashboard/pricing/rules"><Button size="sm"><HugeiconsIcon icon={CoinsIcon} className="size-4" /> Pricing Rules</Button></Link>
            <Link href="/dashboard/payments/transactions"><Button variant="outline" size="sm"><HugeiconsIcon icon={File02Icon} className="size-4" /> Transactions</Button></Link>
            <Link href="/dashboard/payments/invoices"><Button variant="outline" size="sm"><HugeiconsIcon icon={File02Icon} className="size-4" /> Invoices</Button></Link>
            <Link href="/dashboard/payment-gateways"><Button variant="outline" size="sm"><HugeiconsIcon icon={CoinsIcon} className="size-4" /> Gateways</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue by Mode</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {[
              { mode: "Road", icon: TruckIcon, revenue: stats?.orders?.revenueByMode?.ROAD || 0 },
              { mode: "Rail (SGR)", icon: Train01Icon, revenue: stats?.orders?.revenueByMode?.RAIL || 0 },
              { mode: "Air Cargo", icon: Airplane01Icon, revenue: stats?.orders?.revenueByMode?.AIR || 0 },
            ].map((m) => (
              <div key={m.mode} className="flex items-center justify-between border-b last:border-0 pb-2">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={m.icon} className="size-4 text-primary" />
                  <span className="font-medium">{m.mode}</span>
                </div>
                <span className="font-semibold">TZS {(m.revenue / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ---------- Customer Support Dashboard ---------- */
export function CustomerSupportDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.exceptions.stats(),
      api.shipments.stats(),
    ]).then(([excRes, shipRes]) => {
      setStats({
        exceptions: excRes.status === "fulfilled" ? excRes.value.data : null,
        shipments: shipRes.status === "fulfilled" ? shipRes.value.data : null,
      })
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-4">
        <RoleSummaryCard label="Open Exceptions" value={stats?.exceptions?.open?.toString() || "0"} icon={AlertCircleIcon} subtitle="Needs attention" />
        <RoleSummaryCard label="Resolved Today" value={stats?.exceptions?.resolvedToday?.toString() || "0"} icon={CheckmarkCircle02Icon} />
        <RoleSummaryCard label="Active Shipments" value={stats?.shipments?.inTransit?.toString() || "0"} icon={TruckIcon} />
        <RoleSummaryCard label="Returns" value={stats?.exceptions?.returns?.toString() || "0"} icon={CancelCircleIcon} />
      </div>
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Support Actions</CardTitle>
            <CardDescription>Handle customer issues</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/dashboard/exceptions"><Button size="sm"><HugeiconsIcon icon={AlertCircleIcon} className="size-4" /> Exceptions</Button></Link>
            <Link href="/dashboard/support/tickets"><Button variant="outline" size="sm"><HugeiconsIcon icon={CustomerService01Icon} className="size-4" /> Tickets</Button></Link>
            <Link href="/dashboard/shipments"><Button variant="outline" size="sm"><HugeiconsIcon icon={Package02Icon} className="size-4" /> Shipments</Button></Link>
            <Link href="/dashboard/tracking"><Button variant="outline" size="sm"><HugeiconsIcon icon={MapIcon} className="size-4" /> Tracking</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Exception Breakdown</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">High Priority</span>
              <Badge className="bg-red-100 text-red-700">{stats?.exceptions?.highPriority || 0}</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Medium Priority</span>
              <Badge className="bg-amber-100 text-amber-700">{stats?.exceptions?.mediumPriority || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Low Priority</span>
              <Badge variant="secondary">{stats?.exceptions?.lowPriority || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ---------- Customs Officer Dashboard ---------- */
export function CustomsDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.shipments.list("category=INTERNATIONAL&status=CUSTOMS_REVIEW,CUSTOMS_HOLD")
      .then((res) => { setStats({ shipments: res.data || [] }); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />

  const pending = stats?.shipments?.length || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-4">
        <RoleSummaryCard label="Customs Review" value={pending.toString()} icon={Globe02Icon} subtitle="Awaiting clearance" />
        <RoleSummaryCard label="Cleared Today" value="0" icon={CheckmarkCircle02Icon} />
        <RoleSummaryCard label="On Hold" value="0" icon={AlertCircleIcon} />
        <RoleSummaryCard label="Documents Pending" value="0" icon={File02Icon} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>International Shipments</CardTitle>
          <CardDescription>Shipments requiring customs processing</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {pending === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HugeiconsIcon icon={Globe02Icon} className="size-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No shipments awaiting customs</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-6 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Route</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.shipments?.map((ship: any) => (
                    <tr key={ship.id} className="border-b last:border-0 transition-colors hover:bg-muted/50">
                      <td className="px-6 py-3 font-medium">{ship.trackingNumber}</td>
                      <td className="px-6 py-3 text-muted-foreground">{ship.fromAddress?.country} → {ship.toAddress?.country}</td>
                      <td className="px-6 py-3"><Badge variant="secondary">{ship.status?.replace(/_/g, " ")}</Badge></td>
                      <td className="px-6 py-3">
                        <Link href={`/dashboard/international/customs`}>
                          <Button variant="ghost" size="sm" className="h-7">Review <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" /></Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------- Report Viewer Dashboard ---------- */
export function ReportViewerDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-4">
        <RoleSummaryCard label="Total Shipments" value="2,847" change="+18.2%" positive icon={Package02Icon} />
        <RoleSummaryCard label="Delivery Rate" value="96.8%" change="+2.1%" positive icon={CheckmarkCircle02Icon} />
        <RoleSummaryCard label="Avg Transit Time" value="4.2 hr" icon={Clock01Icon} />
        <RoleSummaryCard label="Revenue" value="TZS 84.2M" change="+24.6%" positive icon={CoinsIcon} />
      </div>
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>View and download operational reports</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/dashboard/reports"><Button size="sm"><HugeiconsIcon icon={ChartIcon} className="size-4" /> View Reports</Button></Link>
            <Link href="/dashboard/analytics"><Button variant="outline" size="sm"><HugeiconsIcon icon={ChartIcon} className="size-4" /> Analytics</Button></Link>
            <Button variant="outline" size="sm"><HugeiconsIcon icon={Download01Icon} className="size-4" /> Export</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Performance by Mode</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {[
              { mode: "Road", icon: TruckIcon, rate: "97.4%" },
              { mode: "Rail (SGR)", icon: Train01Icon, rate: "98.1%" },
              { mode: "Air Cargo", icon: Airplane01Icon, rate: "95.2%" },
            ].map((m) => (
              <div key={m.mode} className="flex items-center justify-between border-b last:border-0 pb-2">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={m.icon} className="size-4 text-primary" />
                  <span className="font-medium">{m.mode}</span>
                </div>
                <Badge variant="secondary">{m.rate}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ---------- Customer Dashboard ---------- */
export function CustomerDashboard() {
  const { user } = useAuth()
  const [shipments, setShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.shipments.list("createdByMe=true&limit=5")
      .then((res) => { setShipments(res.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />

  const active = shipments.filter((s) => !["DELIVERED", "CANCELLED"].includes(s.status))
  const delivered = shipments.filter((s) => s.status === "DELIVERED")

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-4">
        <RoleSummaryCard label="Active Shipments" value={active.length.toString()} icon={TruckIcon} subtitle="In progress" />
        <RoleSummaryCard label="Delivered" value={delivered.length.toString()} icon={CheckmarkCircle02Icon} />
        <RoleSummaryCard label="Total Shipments" value={shipments.length.toString()} icon={Package02Icon} />
        <RoleSummaryCard label="Pending" value={shipments.filter((s) => s.status === "BOOKED").length.toString()} icon={Clock01Icon} />
      </div>
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Ship and track your packages</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/dashboard/shipments/new"><Button size="sm"><HugeiconsIcon icon={Package02Icon} className="size-4" /> New Shipment</Button></Link>
            <Link href="/dashboard/tracking"><Button variant="outline" size="sm"><HugeiconsIcon icon={MapIcon} className="size-4" /> Track Package</Button></Link>
            <Link href="/dashboard/payments"><Button variant="outline" size="sm"><HugeiconsIcon icon={CoinsIcon} className="size-4" /> Payments</Button></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Shipments</CardTitle>
            <CardDescription>Your latest shipments</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {shipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <HugeiconsIcon icon={Package02Icon} className="size-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No shipments yet</p>
                <Link href="/dashboard/shipments/new"><Button size="sm" className="mt-3">Create your first shipment</Button></Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-6 py-3 font-medium text-muted-foreground">Tracking #</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Route</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((ship) => (
                      <tr key={ship.id} className="border-b last:border-0 transition-colors hover:bg-muted/50">
                        <td className="px-6 py-3 font-medium">{ship.trackingNumber}</td>
                        <td className="px-6 py-3 text-muted-foreground">{ship.fromAddress?.city} → {ship.toAddress?.city}</td>
                        <td className="px-6 py-3"><Badge variant="secondary">{ship.status?.replace(/_/g, " ")}</Badge></td>
                        <td className="px-6 py-3">
                          <Link href={`/dashboard/shipments/${ship.id}`}>
                            <Button variant="ghost" size="sm" className="h-7">Track <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" /></Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ---------- Main Role Dashboard Router ---------- */
export function RoleDashboard() {
  const { user } = useAuth()
  const role = user?.role || "CUSTOMER"

  const roleLabel = ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {roleLabel} Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.name?.split(" ")[0] || "User"}. Here&apos;s your overview.
          </p>
        </div>
        <Link href="/dashboard/shipments/new">
          <Button size="sm">
            <HugeiconsIcon icon={Package02Icon} className="size-4" />
            New Shipment
          </Button>
        </Link>
      </div>

      {role === "SUPER_ADMIN" && <AdminDashboard />}
      {role === "OPERATIONS_MANAGER" && <AdminDashboard />}
      {role === "DISPATCHER" && <DispatcherDashboard />}
      {role === "DRIVER" && <DriverDashboard />}
      {role === "WAREHOUSE_MANAGER" && <WarehouseDashboard />}
      {role === "FINANCE" && <FinanceDashboard />}
      {role === "CUSTOMER_SUPPORT" && <CustomerSupportDashboard />}
      {role === "CUSTOMS_OFFICER" && <CustomsDashboard />}
      {role === "REPORT_VIEWER" && <ReportViewerDashboard />}
      {role === "CUSTOMER" && <CustomerDashboard />}
    </div>
  )
}
