"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [station, setStation] = useState<any>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [trackingNumber, setTrackingNumber] = useState("")

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    try {
      const [stationRes, invRes] = await Promise.all([
        api.stations.get(id),
        api.stations.inventory(id),
      ])
      setStation(stationRes.data)
      const rawInventory = invRes.data?.items || invRes.data
      setInventory(Array.isArray(rawInventory) ? rawInventory : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load station")
    } finally {
      setLoading(false)
    }
  }

  async function handleReceive(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.stations.receive(id, { trackingNumber })
      toast.success("Shipment received at station")
      setTrackingNumber("")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to receive shipment")
    }
  }

  async function handleDispatch(inventoryId: string) {
    try {
      await api.stations.dispatch(id, { inventoryId })
      toast.success("Inventory dispatched")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch")
    }
  }

  if (loading) return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Stations", href: "/dashboard/stations" }, { label: "Details" }]}>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </DashboardLayout>
  )

  if (!station) return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Stations", href: "/dashboard/stations" }, { label: "Not Found" }]}>
      <p className="text-center text-muted-foreground py-12">Station not found</p>
    </DashboardLayout>
  )

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Stations", href: "/dashboard/stations" }, { label: station.name }]}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{station.name}</h1>
          <p className="text-sm text-muted-foreground">{station.code} — {station.type.replace(/_/g, " ")}</p>
        </div>
        <Badge variant={station.isActive ? "default" : "secondary"}>{station.isActive ? "Active" : "Inactive"}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Location</p><p className="text-lg font-semibold">{[station.city, station.region, station.country].filter(Boolean).join(", ") || "—"}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Manager</p><p className="text-lg font-semibold">{station.managerName || "—"}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Capacity</p><p className="text-lg font-semibold">{station.capacityKg ? `${Number(station.capacityKg).toLocaleString()} kg` : "—"}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">In Inventory</p><p className="text-lg font-semibold">{station._count?.inventory || 0}</p></CardContent></Card>
      </div>

      {station.phone || station.email ? (
        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {station.phone && <p><span className="text-muted-foreground">Phone:</span> {station.phone}</p>}
            {station.email && <p><span className="text-muted-foreground">Email:</span> {station.email}</p>}
            {station.address && <p className="sm:col-span-2"><span className="text-muted-foreground">Address:</span> {station.address}</p>}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader><CardTitle>Receive Shipment</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleReceive} className="flex gap-2">
            <Input placeholder="Enter tracking number..." value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} required />
            <Button type="submit">Receive</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Station Inventory ({inventory.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Sender</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Receiver</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Weight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Received</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No inventory at this station</td></tr>
                ) : (
                  inventory.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{inv.shipment?.trackingNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.shipment?.order?.senderName || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.shipment?.order?.receiverName || "—"}</td>
                      <td className="px-4 py-3">{inv.shipment?.chargeableWeightKg ? `${Number(inv.shipment.chargeableWeightKg).toFixed(1)} kg` : "—"}</td>
                      <td className="px-4 py-3"><Badge variant={inv.status === "RECEIVED" ? "default" : "secondary"}>{inv.status}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(inv.receivedAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {inv.status === "RECEIVED" && (
                          <Button size="sm" variant="outline" onClick={() => handleDispatch(inv.id)}>Dispatch</Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
