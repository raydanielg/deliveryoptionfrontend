"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Airplane01Icon, Package02Icon, CheckmarkCircle02Icon, AirplaneTakeOff01Icon, PlusIcon, ArrowRight01Icon, CheckSquare, SendIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export default function AirCargoPage() {
  const [shipments, setShipments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [airports, setAirports] = useState<any[]>([])
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
    cargoType: "GENERAL",
    description: "",
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [listRes, statsRes, stRes] = await Promise.all([
        api.airCargo.list(filter ? `?status=${filter}` : ""),
        api.airCargo.stats(),
        api.stations.list("type=AIRPORT&isActive=true"),
      ])
      setShipments(listRes.data || [])
      setStats(statsRes.data)
      setAirports(stRes.data || [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load air cargo data")
    } finally {
      setLoading(false)
    }
  }

  async function handleBooking() {
    if (!booking.originStationId || !booking.destinationStationId || !booking.actualWeightKg) {
      toast.error("Please fill in airports and weight")
      return
    }
    if (booking.originStationId === booking.destinationStationId) {
      toast.error("Origin and destination must be different")
      return
    }
    setBookingLoading(true)
    try {
      await api.airCargo.createBooking({
        originStationId: booking.originStationId,
        destinationStationId: booking.destinationStationId,
        fromFullName: booking.senderName,
        fromPhone: booking.senderPhone,
        toFullName: booking.receiverName,
        toPhone: booking.receiverPhone,
        actualWeightKg: parseFloat(booking.actualWeightKg),
        cargoType: booking.cargoType,
        description: booking.description,
        serviceLevel: "EXPRESS",
        fulfillmentType: "AIRPORT_TO_AIRPORT",
      })
      toast.success("Air Cargo booking created successfully")
      setBookingOpen(false)
      setBooking({ originStationId: "", destinationStationId: "", senderName: "", senderPhone: "", receiverName: "", receiverPhone: "", actualWeightKg: "", cargoType: "GENERAL", description: "" })
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking")
    } finally {
      setBookingLoading(false)
    }
  }

  async function handleAction(action: string, shipment: any) {
    try {
      if (action === "accept") {
        await api.airCargo.acceptCargo(shipment.id, { accepted: true })
        toast.success("Cargo accepted")
      } else if (action === "dispatch") {
        await api.airCargo.createFlightDispatch({ shipmentIds: [shipment.id] })
        toast.success("Flight dispatch created")
      }
      loadData()
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action}`)
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
        <div className="flex gap-2">
          <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <DialogTrigger asChild>
              <Button>
                <HugeiconsIcon icon={PlusIcon} className="size-4 mr-2" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Airplane01Icon} className="size-5 text-primary" />
                  New Air Cargo Booking
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Origin Airport <span className="text-destructive">*</span></Label>
                    <Select value={booking.originStationId} onValueChange={(v) => setBooking(prev => ({ ...prev, originStationId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select origin" /></SelectTrigger>
                      <SelectContent>
                        {airports.map((st: any) => <SelectItem key={st.id} value={st.id}>{st.name} — {st.city}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Destination Airport <span className="text-destructive">*</span></Label>
                    <Select value={booking.destinationStationId} onValueChange={(v) => setBooking(prev => ({ ...prev, destinationStationId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                      <SelectContent>
                        {airports.filter((st: any) => st.id !== booking.originStationId).map((st: any) => <SelectItem key={st.id} value={st.id}>{st.name} — {st.city}</SelectItem>)}
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
                    <Input type="number" step="0.01" value={booking.actualWeightKg} onChange={(e) => setBooking(prev => ({ ...prev, actualWeightKg: e.target.value }))} placeholder="e.g. 15.5" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cargo Type</Label>
                    <Select value={booking.cargoType} onValueChange={(v) => setBooking(prev => ({ ...prev, cargoType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General Cargo</SelectItem>
                        <SelectItem value="PERISHABLE">Perishable</SelectItem>
                        <SelectItem value="DANGEROUS">Dangerous Goods</SelectItem>
                        <SelectItem value="FRAGILE">Fragile</SelectItem>
                        <SelectItem value="VALUABLE">Valuable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Input value={booking.description} onChange={(e) => setBooking(prev => ({ ...prev, description: e.target.value }))} placeholder="Cargo contents" />
                </div>
                <Button className="w-full" onClick={handleBooking} disabled={bookingLoading}>
                  {bookingLoading ? "Creating..." : "Create Air Cargo Booking"}
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 ml-2" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => loadData()}>
            <HugeiconsIcon icon={Airplane01Icon} className="size-4 mr-2" />
            Refresh
          </Button>
        </div>
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
                    <th className="pb-2 pr-4 font-medium">Created</th>
                    <th className="pb-2 font-medium">Actions</th>
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
                      <td className="py-3 pr-4 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {s.status === "PENDING" && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("accept", s)}>
                              <HugeiconsIcon icon={CheckSquare} className="size-3 mr-1" />
                              Accept
                            </Button>
                          )}
                          {s.status === "CARGO_ACCEPTED" && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("dispatch", s)}>
                              <HugeiconsIcon icon={SendIcon} className="size-3 mr-1" />
                              Dispatch
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
