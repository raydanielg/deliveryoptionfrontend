"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Train01Icon, Package02Icon, ScaleIcon, CheckmarkCircle02Icon, PlusIcon, MapPinIcon, LayersIcon, ArrowRight01Icon, ZapIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export default function SGRPage() {
  const [shipments, setShipments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [stations, setStations] = useState<any[]>([])
  const [capacity, setCapacity] = useState<any>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [booking, setBooking] = useState({
    originStationId: "",
    destinationStationId: "",
    senderName: "",
    senderPhone: "",
    receiverName: "",
    receiverPhone: "",
    actualWeightKg: "",
    description: "",
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [listRes, statsRes, stRes, capRes] = await Promise.all([
        api.sgr.list(filter ? `?status=${filter}` : ""),
        api.sgr.stats(),
        api.stations.list("type=SGR_STATION&isActive=true"),
        api.capacity.stations(),
      ])
      setShipments(listRes.data || [])
      setStats(statsRes.data)
      setStations(stRes.data || [])
      setCapacity(capRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load SGR data")
    } finally {
      setLoading(false)
    }
  }

  async function handleBooking() {
    if (!booking.originStationId || !booking.destinationStationId || !booking.actualWeightKg) {
      toast.error("Please fill in stations and weight")
      return
    }
    if (booking.originStationId === booking.destinationStationId) {
      toast.error("Origin and destination must be different")
      return
    }
    setBookingLoading(true)
    try {
      await api.sgr.createBooking({
        originStationId: booking.originStationId,
        destinationStationId: booking.destinationStationId,
        fromFullName: booking.senderName,
        fromPhone: booking.senderPhone,
        toFullName: booking.receiverName,
        toPhone: booking.receiverPhone,
        actualWeightKg: parseFloat(booking.actualWeightKg),
        description: booking.description,
        serviceLevel: "STANDARD",
        fulfillmentType: "STATION_TO_STATION",
      })
      toast.success("SGR booking created successfully")
      setBookingOpen(false)
      setBooking({ originStationId: "", destinationStationId: "", senderName: "", senderPhone: "", receiverName: "", receiverPhone: "", actualWeightKg: "", description: "" })
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking")
    } finally {
      setBookingLoading(false)
    }
  }

  async function handleAction(action: string, shipment: any) {
    const actions: Record<string, () => Promise<any>> = {
      "verify-weigh": () => api.sgr.verifyWeigh(shipment.id, { actualWeightKg: shipment.actualWeightKg }),
      "consolidate": () => api.sgr.consolidate({ shipmentIds: [shipment.id] }),
    }
    if (!actions[action]) return
    try {
      await actions[action]()
      toast.success(`${action.replace(/-/g, " ")} completed`)
      loadData()
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action}`)
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
        <div className="flex gap-2">
          <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <DialogTrigger render={<Button />}>
              <HugeiconsIcon icon={PlusIcon} className="size-4 mr-2" />
              New Booking
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Train01Icon} className="size-5 text-primary" />
                  New SGR Parcel Booking
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Origin Station <span className="text-destructive">*</span></Label>
                    <Select value={booking.originStationId} onValueChange={(v) => setBooking(prev => ({ ...prev, originStationId: v ?? "" }))}>
                      <SelectTrigger><SelectValue placeholder="Select origin" /></SelectTrigger>
                      <SelectContent>
                        {stations.map((st: any) => <SelectItem key={st.id} value={st.id}>{st.name} — {st.city}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Destination Station <span className="text-destructive">*</span></Label>
                    <Select value={booking.destinationStationId} onValueChange={(v) => setBooking(prev => ({ ...prev, destinationStationId: v ?? "" }))}>
                      <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                      <SelectContent>
                        {stations.filter((st: any) => st.id !== booking.originStationId).map((st: any) => <SelectItem key={st.id} value={st.id}>{st.name} — {st.city}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Sender Name</Label>
                    <Input value={booking.senderName} onChange={(e) => setBooking(prev => ({ ...prev, senderName: e.target.value }))} placeholder="Sender name" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Sender Phone</Label>
                    <Input value={booking.senderPhone} onChange={(e) => setBooking(prev => ({ ...prev, senderPhone: e.target.value }))} placeholder="+255..." />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Receiver Name</Label>
                    <Input value={booking.receiverName} onChange={(e) => setBooking(prev => ({ ...prev, receiverName: e.target.value }))} placeholder="Receiver name" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Receiver Phone</Label>
                    <Input value={booking.receiverPhone} onChange={(e) => setBooking(prev => ({ ...prev, receiverPhone: e.target.value }))} placeholder="+255..." />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Weight (kg) <span className="text-destructive">*</span></Label>
                    <Input type="number" step="0.01" value={booking.actualWeightKg} onChange={(e) => setBooking(prev => ({ ...prev, actualWeightKg: e.target.value }))} placeholder="e.g. 5.5" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Input value={booking.description} onChange={(e) => setBooking(prev => ({ ...prev, description: e.target.value }))} placeholder="Package contents" />
                  </div>
                </div>
                <Button className="w-full" onClick={handleBooking} disabled={bookingLoading}>
                  {bookingLoading ? "Creating..." : "Create SGR Booking"}
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 ml-2" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => loadData()}>
            <HugeiconsIcon icon={Train01Icon} className="size-4 mr-2" />
            Refresh
          </Button>
        </div>
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

      {/* Station Capacity */}
      {capacity && Array.isArray(capacity) && capacity.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Train01Icon} className="size-5 text-primary" />
              Station Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {capacity.filter((st: any) => st.type === "SGR_STATION").map((st: any, i: number) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <HugeiconsIcon icon={MapPinIcon} className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{st.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{st.city}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{st.utilizedKg || 0} / {st.capacityKg || 0} kg</span>
                    <Badge variant={st.utilizationPercent > 80 ? "destructive" : "secondary"}>
                      {st.utilizationPercent || 0}%
                    </Badge>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${st.utilizationPercent > 80 ? "bg-red-500" : st.utilizationPercent > 50 ? "bg-orange-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(st.utilizationPercent || 0, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                    <th className="pb-2 pr-4 font-medium">Created</th>
                    <th className="pb-2 font-medium">Actions</th>
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
                      <td className="py-3 pr-4 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {(s.status === "PENDING" || s.status === "AT_STATION") && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("verify-weigh", s)}>
                              <HugeiconsIcon icon={ScaleIcon} className="size-3 mr-1" />
                              Weigh
                            </Button>
                          )}
                          {(s.status === "WEIGHED" || s.status === "AT_STATION") && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("consolidate", s)}>
                              <HugeiconsIcon icon={LayersIcon} className="size-3 mr-1" />
                              Consolidate
                            </Button>
                          )}
                        </div>
                      </td>
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
