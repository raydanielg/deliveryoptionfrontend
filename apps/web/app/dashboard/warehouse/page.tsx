"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { WarehouseIcon, Package02Icon, PackageReceiveIcon, ContainerIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export default function WarehousePage() {
  const [shipments, setShipments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [showReceive, setShowReceive] = useState(false)
  const [receiveForm, setReceiveForm] = useState({ stationId: "", shipmentId: "" })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [listRes, statsRes] = await Promise.all([
        api.warehouse.list(filter ? `?status=${filter}` : ""),
        api.warehouse.stats(),
      ])
      setShipments(listRes.data || [])
      setStats(statsRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load warehouse shipments")
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    RECEIVED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    WEIGHED: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    LABELED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    SHELVED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    CONSOLIDATED: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    RELEASED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Warehouse" }]}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warehouse Operations</h1>
          <p className="text-sm text-muted-foreground">Receiving, shelving, consolidation & release</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowReceive(!showReceive)}>
            <HugeiconsIcon icon={PackageReceiveIcon} className="size-4 mr-2" />
            Receive
          </Button>
          <Button onClick={() => loadData()}>
            <HugeiconsIcon icon={WarehouseIcon} className="size-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total in Warehouse", value: stats?.total ?? 0, icon: Package02Icon, color: "from-blue-500 to-cyan-500" },
          { label: "Received Today", value: stats?.receivedToday ?? 0, icon: PackageReceiveIcon, color: "from-orange-500 to-amber-500" },
          { label: "Consolidated", value: stats?.consolidated ?? 0, icon: ContainerIcon, color: "from-purple-500 to-pink-500" },
          { label: "Released", value: stats?.released ?? 0, icon: CheckmarkCircle02Icon, color: "from-green-500 to-emerald-500" },
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

      {/* Receive Form */}
      {showReceive && (
        <Card className="mt-4 border-primary">
          <CardHeader>
            <CardTitle>Receive Shipment at Warehouse</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Station / Warehouse ID</Label>
              <Input value={receiveForm.stationId} onChange={(e) => setReceiveForm({ ...receiveForm, stationId: e.target.value })} placeholder="Enter station ID" />
            </div>
            <div className="grid gap-2">
              <Label>Shipment ID</Label>
              <Input value={receiveForm.shipmentId} onChange={(e) => setReceiveForm({ ...receiveForm, shipmentId: e.target.value })} placeholder="Enter shipment ID" />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={async () => {
                try {
                  await api.warehouse.receive(receiveForm.stationId, { shipmentId: receiveForm.shipmentId })
                  toast.success("Shipment received at warehouse")
                  setShowReceive(false)
                  setReceiveForm({ stationId: "", shipmentId: "" })
                  loadData()
                } catch (err: any) {
                  toast.error(err.message || "Failed to receive shipment")
                }
              }}>
                Confirm Receive
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="mt-6 flex gap-2 flex-wrap">
        {["", "RECEIVED", "WEIGHED", "LABELED", "SHELVED", "CONSOLIDATED", "RELEASED"].map((f) => (
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
          <CardTitle>Warehouse Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : shipments.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No shipments in warehouse</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Tracking #</th>
                    <th className="pb-2 pr-4 font-medium">Shelf/Bin</th>
                    <th className="pb-2 pr-4 font-medium">Weight</th>
                    <th className="pb-2 pr-4 font-medium">Route</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s: any) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{s.trackingNumber || s.id.slice(0, 8)}</td>
                      <td className="py-3 pr-4">{s.shelfBin || "—"}</td>
                      <td className="py-3 pr-4">{s.actualWeightKg ? `${s.actualWeightKg} kg` : "—"}</td>
                      <td className="py-3 pr-4">{s.fromAddress?.city} → {s.toAddress?.city}</td>
                      <td className="py-3 pr-4">
                        <Badge className={statusColors[s.status] || "bg-muted text-muted-foreground"} variant="secondary">
                          {s.status?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">{s.receivedAt ? new Date(s.receivedAt).toLocaleDateString() : "—"}</td>
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
