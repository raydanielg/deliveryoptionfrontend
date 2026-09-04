"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Airplane01Icon, Package02Icon, CheckmarkCircle02Icon, AirplaneTakeOff01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export default function AirCargoPage() {
  const [shipments, setShipments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [listRes, statsRes] = await Promise.all([
        api.airCargo.list(filter ? `?status=${filter}` : ""),
        api.airCargo.stats(),
      ])
      setShipments(listRes.data || [])
      setStats(statsRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load air cargo shipments")
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    CARGO_ACCEPTED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    FLIGHT_DISPATCHED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    IN_TRANSIT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    ARRIVED_AIRPORT: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    CUSTOMS_REVIEW: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    CUSTOMS_CLEARED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    DELIVERED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Air Cargo" }]}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Air Cargo</h1>
          <p className="text-sm text-muted-foreground">Manage air freight shipments, flight dispatch & customs</p>
        </div>
        <Button onClick={() => loadData()}>
          <HugeiconsIcon icon={Airplane01Icon} className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Shipments", value: stats?.total ?? 0, icon: Package02Icon, color: "from-purple-500 to-pink-500" },
          { label: "In Transit", value: stats?.inTransit ?? 0, icon: AirplaneTakeOff01Icon, color: "from-orange-500 to-amber-500" },
          { label: "Accepted", value: stats?.accepted ?? 0, icon: Airplane01Icon, color: "from-blue-500 to-cyan-500" },
          { label: "Delivered", value: stats?.delivered ?? 0, icon: CheckmarkCircle02Icon, color: "from-green-500 to-emerald-500" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                <HugeiconsIcon icon={stat.icon} className="size-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="mt-6 flex gap-2 flex-wrap">
        {["", "PENDING", "CARGO_ACCEPTED", "FLIGHT_DISPATCHED", "IN_TRANSIT", "ARRIVED_AIRPORT", "CUSTOMS_REVIEW", "DELIVERED"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilter(f); setTimeout(loadData, 0) }}
          >
            {f ? f.replace(/_/g, " ") : "All"}
          </Button>
        ))}
      </div>

      {/* Shipments Table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Air Cargo Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : shipments.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No air cargo shipments found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Tracking #</th>
                    <th className="pb-2 pr-4 font-medium">AWB</th>
                    <th className="pb-2 pr-4 font-medium">From</th>
                    <th className="pb-2 pr-4 font-medium">To</th>
                    <th className="pb-2 pr-4 font-medium">Cargo Type</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s: any) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{s.trackingNumber || s.id.slice(0, 8)}</td>
                      <td className="py-3 pr-4">{s.awbNumber || "—"}</td>
                      <td className="py-3 pr-4">{s.fromAddress?.city || s.airportOrigin || "—"}</td>
                      <td className="py-3 pr-4">{s.toAddress?.city || s.airportDestination || "—"}</td>
                      <td className="py-3 pr-4">{s.cargoType || "—"}</td>
                      <td className="py-3 pr-4">
                        <Badge className={statusColors[s.status] || "bg-muted text-muted-foreground"} variant="secondary">
                          {s.status?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
