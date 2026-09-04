"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Train01Icon, Package02Icon, ScaleIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export default function SGRPage() {
  const [shipments, setShipments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [listRes, statsRes] = await Promise.all([
        api.sgr.list(filter ? `?status=${filter}` : ""),
        api.sgr.stats(),
      ])
      setShipments(listRes.data || [])
      setStats(statsRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load SGR shipments")
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    AT_STATION: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    WEIGHED: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    CONSOLIDATED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    LOADED_ON_TRAIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    IN_TRANSIT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    ARRIVED_DESTINATION: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    DELIVERED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "SGR Parcel Service" }]}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SGR Parcel Service</h1>
          <p className="text-sm text-muted-foreground">Manage rail parcel shipments, stations & manifests</p>
        </div>
        <Button onClick={() => loadData()}>
          <HugeiconsIcon icon={Train01Icon} className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Shipments", value: stats?.total ?? 0, icon: Package02Icon, color: "from-blue-500 to-cyan-500" },
          { label: "In Transit", value: stats?.inTransit ?? 0, icon: Train01Icon, color: "from-orange-500 to-amber-500" },
          { label: "At Station", value: stats?.atStation ?? 0, icon: ScaleIcon, color: "from-purple-500 to-pink-500" },
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
      <div className="mt-6 flex gap-2">
        {["", "PENDING", "AT_STATION", "IN_TRANSIT", "ARRIVED_DESTINATION", "DELIVERED"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilter(f); setTimeout(loadData, 0) }}
          >
            {f || "All"}
          </Button>
        ))}
      </div>

      {/* Shipments Table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>SGR Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : shipments.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No SGR shipments found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Tracking #</th>
                    <th className="pb-2 pr-4 font-medium">From</th>
                    <th className="pb-2 pr-4 font-medium">To</th>
                    <th className="pb-2 pr-4 font-medium">Weight</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s: any) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{s.trackingNumber || s.id.slice(0, 8)}</td>
                      <td className="py-3 pr-4">{s.fromAddress?.city || s.originStation?.name || "—"}</td>
                      <td className="py-3 pr-4">{s.toAddress?.city || s.destinationStation?.name || "—"}</td>
                      <td className="py-3 pr-4">{s.actualWeightKg ? `${s.actualWeightKg} kg` : "—"}</td>
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
