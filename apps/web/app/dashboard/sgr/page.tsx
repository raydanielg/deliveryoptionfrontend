"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Train01Icon, Package02Icon, ScaleIcon, CheckmarkCircle02Icon, PlusIcon, Search01Icon, ArrowRight01Icon, LayersIcon, MapPinIcon, AlertCircleIcon, Navigation01Icon, PackageCheckIcon, ClockIcon, TrainTrackIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "BOOKED", label: "Booked" },
  { value: "AWAITING_CARGO", label: "Awaiting Cargo" },
  { value: "CARGO_RECEIVED", label: "Cargo Received" },
  { value: "SCREENING", label: "Screening" },
  { value: "READY_FOR_RAIL", label: "Ready for Rail" },
  { value: "TRAIN_ASSIGNED", label: "Train Assigned" },
  { value: "LOADED", label: "Loaded" },
  { value: "TRAIN_DEPARTED", label: "Train Departed" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "TRAIN_ARRIVED", label: "Train Arrived" },
  { value: "DESTINATION_STATION", label: "Destination Station" },
  { value: "READY_FOR_COLLECTION", label: "Ready for Collection" },
  { value: "LAST_MILE_ASSIGNED", label: "Last Mile Assigned" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "COLLECTED", label: "Collected" },
  { value: "EXCEPTION", label: "Exception" },
]

const STATUS_COLORS: Record<string, string> = {
  BOOKED: "bg-blue-100 text-blue-700",
  AWAITING_CARGO: "bg-orange-100 text-orange-700",
  CARGO_RECEIVED: "bg-cyan-100 text-cyan-700",
  SCREENING: "bg-yellow-100 text-yellow-700",
  READY_FOR_RAIL: "bg-purple-100 text-purple-700",
  TRAIN_ASSIGNED: "bg-indigo-100 text-indigo-700",
  LOADED: "bg-violet-100 text-violet-700",
  TRAIN_DEPARTED: "bg-green-100 text-green-700",
  IN_TRANSIT: "bg-green-100 text-green-700",
  TRAIN_ARRIVED: "bg-teal-100 text-teal-700",
  DESTINATION_STATION: "bg-teal-100 text-teal-700",
  READY_FOR_COLLECTION: "bg-amber-100 text-amber-700",
  LAST_MILE_ASSIGNED: "bg-orange-100 text-orange-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  COLLECTED: "bg-green-100 text-green-700",
  EXCEPTION: "bg-red-100 text-red-700",
}

export default function SGRPage() {
  const [shipments, setShipments] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [controlTower, setControlTower] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [stations, setStations] = React.useState<any[]>([])
  const [capacity, setCapacity] = React.useState<any>(null)
  const [bookingOpen, setBookingOpen] = React.useState(false)
  const [bookingLoading, setBookingLoading] = React.useState(false)
  const [booking, setBooking] = React.useState({
    originStationId: "",
    destinationStationId: "",
    sgrServiceType: "STATION_TO_STATION",
    senderName: "",
    senderPhone: "",
    receiverName: "",
    receiverPhone: "",
    actualWeightKg: "",
    description: "",
  })
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  React.useEffect(() => { loadData() }, [statusFilter])

  async function loadData() {
    setLoading(true)
    try {
      const params = statusFilter !== "ALL" ? `?status=${statusFilter}` : ""
      const [listRes, statsRes, towerRes, stRes, capRes] = await Promise.all([
        api.sgr.list(params),
        api.sgr.stats(),
        api.sgr.controlTower(),
        api.stations.list("type=SGR_STATION&isActive=true"),
        api.capacity.stations(),
      ])
      const rawShipments = listRes.data?.shipments || listRes.data
      setShipments(Array.isArray(rawShipments) ? rawShipments : [])
      setStats(statsRes.data)
      setControlTower(towerRes.data)
      const rawStations = stRes.data?.stations || stRes.data
      setStations(Array.isArray(rawStations) ? rawStations : [])
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
        sgrServiceType: booking.sgrServiceType,
        fromFullName: booking.senderName,
        fromPhone: booking.senderPhone,
        toFullName: booking.receiverName,
        toPhone: booking.receiverPhone,
        actualWeightKg: parseFloat(booking.actualWeightKg),
        description: booking.description,
        serviceLevel: "STANDARD",
        category: "DOMESTIC",
      })
      toast.success("SGR booking created successfully")
      setBookingOpen(false)
      setBooking({ originStationId: "", destinationStationId: "", sgrServiceType: "STATION_TO_STATION", senderName: "", senderPhone: "", receiverName: "", receiverPhone: "", actualWeightKg: "", description: "" })
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking")
    } finally {
      setBookingLoading(false)
    }
  }

  async function handleAction(action: string, shipment: any) {
    setActionLoading(shipment.id)
    const actions: Record<string, () => Promise<any>> = {
      "first-mile": () => api.sgr.firstMile(shipment.id),
      "receive-cargo": () => api.sgr.receiveCargo(shipment.id, { stationId: shipment.originStationId }),
      "start-screening": () => api.sgr.startScreening(shipment.id),
      "complete-screening": () => api.sgr.completeScreening(shipment.id, { passed: true }),
      "verify-weigh": () => api.sgr.verifyWeigh(shipment.id, { actualWeightKg: shipment.actualWeightKg }),
      "consolidate": () => api.sgr.consolidate({ shipmentIds: [shipment.id] }),
      "last-mile": () => api.sgr.lastMile(shipment.id),
      "collect": () => api.sgr.collect(shipment.id),
    }
    if (!actions[action]) { setActionLoading(null); return }
    try {
      await actions[action]()
      toast.success(`${action.replace(/-/g, " ")} completed`)
      loadData()
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action}`)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleTrainAction(action: string, trainId: string) {
    setActionLoading(`train-${trainId}`)
    try {
      if (action === "depart") {
        await api.sgr.departTrain(trainId)
        toast.success("Train departed")
      } else if (action === "arrive") {
        await api.sgr.arriveTrain(trainId)
        toast.success("Train arrived")
      }
      loadData()
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} train`)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = shipments.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.trackingNumber?.toLowerCase().includes(q) ||
      s.fromAddress?.city?.toLowerCase().includes(q) ||
      s.toAddress?.city?.toLowerCase().includes(q) ||
      s.originStation?.name?.toLowerCase().includes(q) ||
      s.destinationStation?.name?.toLowerCase().includes(q)
  })

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "SGR Parcel Service" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="SGR Logistics Control Tower"
          description="Full SGR transport mode — first mile, rail, last mile, train capacity & exceptions"
          actions={
            <div className="flex gap-2">
              <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
                <SheetTrigger render={<Button />}>
                  <HugeiconsIcon icon={PlusIcon} className="size-4" />
                  New Booking
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <HugeiconsIcon icon={Train01Icon} className="size-5 text-primary" />
                      New SGR Parcel Booking
                    </SheetTitle>
                    <SheetDescription>Create a new rail parcel shipment booking</SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 px-4 pb-6">
                    <div className="grid gap-2">
                      <Label>Service Type <span className="text-destructive">*</span></Label>
                      <Select value={booking.sgrServiceType} onValueChange={(v) => setBooking(prev => ({ ...prev, sgrServiceType: v ?? "STATION_TO_STATION" }))}>
                        <SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STATION_TO_STATION">Station → Station</SelectItem>
                          <SelectItem value="DOOR_TO_STATION">Door → Station</SelectItem>
                          <SelectItem value="STATION_TO_DOOR">Station → Door</SelectItem>
                          <SelectItem value="DOOR_TO_DOOR">Door → Door</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <Button variant="outline" onClick={() => loadData()}>
                <HugeiconsIcon icon={Train01Icon} className="size-4" />
                Refresh
              </Button>
            </div>
          }
        />

        {/* SGR Control Tower Stats */}
        {controlTower?.stats && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <MetricCard label="Total" value={formatNumber(controlTower.stats.total ?? 0)} icon={Package02Icon} loading={loading} />
            <MetricCard label="Awaiting Cargo" value={formatNumber(controlTower.stats.awaitingCargo ?? 0)} icon={ClockIcon} loading={loading} />
            <MetricCard label="At Station" value={formatNumber(controlTower.stats.cargoReceived ?? 0)} icon={ScaleIcon} loading={loading} />
            <MetricCard label="Ready for Rail" value={formatNumber(controlTower.stats.readyForRail ?? 0)} icon={TrainTrackIcon} loading={loading} />
            <MetricCard label="In Transit" value={formatNumber(controlTower.stats.inTransit ?? 0)} icon={Navigation01Icon} loading={loading} />
            <MetricCard label="Delivered" value={formatNumber((controlTower.stats.delivered ?? 0) + (controlTower.stats.collected ?? 0))} icon={CheckmarkCircle02Icon} loading={loading} />
          </div>
        )}

        {/* SGR Status Flow Bar */}
        {controlTower?.stats && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3 text-xs">
            {[
              { label: "Awaiting Cargo", value: controlTower.stats.awaitingCargo, color: "text-orange-600" },
              { label: "Cargo Received", value: controlTower.stats.cargoReceived, color: "text-cyan-600" },
              { label: "Screening", value: controlTower.stats.screening, color: "text-yellow-600" },
              { label: "Ready for Rail", value: controlTower.stats.readyForRail, color: "text-purple-600" },
              { label: "Train Assigned", value: controlTower.stats.trainAssigned, color: "text-indigo-600" },
              { label: "Loaded", value: controlTower.stats.loaded, color: "text-violet-600" },
              { label: "In Transit", value: controlTower.stats.inTransit, color: "text-green-600" },
              { label: "Arrived", value: controlTower.stats.trainArrived, color: "text-teal-600" },
              { label: "Ready for Collection", value: controlTower.stats.readyForCollection, color: "text-amber-600" },
              { label: "Last Mile", value: controlTower.stats.lastMile, color: "text-orange-600" },
              { label: "Delivered", value: controlTower.stats.delivered, color: "text-green-600" },
              { label: "Collected", value: controlTower.stats.collected, color: "text-green-600" },
              { label: "Exceptions", value: controlTower.stats.exceptions, color: "text-red-600" },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 text-muted-foreground/40" />}
                <div className="flex flex-col items-center gap-0.5">
                  <span className={`font-semibold ${s.color}`}>{s.value ?? 0}</span>
                  <span className="text-muted-foreground">{s.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Train Departures Today */}
        {controlTower?.trainsToday && controlTower.trainsToday.length > 0 && (
          <div className="rounded-lg border">
            <div className="flex items-center gap-2 border-b p-4">
              <HugeiconsIcon icon={Train01Icon} className="size-5 text-muted-foreground" />
              <h2 className="text-base font-semibold tracking-tight">Today's Train Departures</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-2 font-medium text-muted-foreground">Train</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">Route</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">Departure</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">Capacity</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {controlTower.trainsToday.map((t: any) => (
                    <tr key={t.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-2 font-medium">{t.trainNumber}</td>
                      <td className="px-4 py-2 text-muted-foreground">{t.route}</td>
                      <td className="px-4 py-2 text-muted-foreground">{formatDate(t.departureAt)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums text-xs text-muted-foreground">{t.allocatedKg}/{t.totalCapacityKg} kg</span>
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${t.allocatedKg / t.totalCapacityKg > 0.9 ? "bg-red-500" : t.allocatedKg / t.totalCapacityKg > 0.5 ? "bg-orange-500" : "bg-green-500"}`}
                              style={{ width: `${Math.min((t.allocatedKg / t.totalCapacityKg) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">({t.allocationsCount} shipments)</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant={t.status === "DEPARTED" ? "default" : t.status === "ARRIVED" ? "secondary" : "outline"}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1">
                          {t.status === "SCHEDULED" || t.status === "FULL" ? (
                            <Button size="sm" variant="outline" disabled={actionLoading === `train-${t.id}`}
                              onClick={() => handleTrainAction("depart", t.id)}>
                              Depart
                            </Button>
                          ) : t.status === "DEPARTED" ? (
                            <Button size="sm" variant="outline" disabled={actionLoading === `train-${t.id}`}
                              onClick={() => handleTrainAction("arrive", t.id)}>
                              Arrive
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Exceptions */}
        {controlTower?.activeExceptions && controlTower.activeExceptions.length > 0 && (
          <div className="rounded-lg border border-red-200">
            <div className="flex items-center gap-2 border-b p-4">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-red-600" />
              <h2 className="text-base font-semibold tracking-tight text-red-700">Active SGR Exceptions</h2>
            </div>
            <div className="divide-y">
              {controlTower.activeExceptions.map((exc: any) => (
                <div key={exc.id} className="flex items-center justify-between p-3">
                  <div>
                    <span className="text-sm font-medium">{exc.type.replace(/_/g, " ").toLowerCase()}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{exc.shipment?.trackingNumber}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{exc.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Station Capacity */}
        {capacity && Array.isArray(capacity) && capacity.length > 0 && (
          <div className="rounded-lg border p-5">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Train01Icon} className="size-5 text-muted-foreground" />
              <h2 className="text-base font-semibold tracking-tight">Station Capacity</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tracking #, station..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => loadData()} className="sm:ml-auto">
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
            Search
          </Button>
        </div>

        {/* Shipments Table */}
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">From</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">To</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Weight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Created</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Train01Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No SGR shipments found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s: any) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{s.trackingNumber || s.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.fromAddress?.city || s.originStation?.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.toAddress?.city || s.destinationStation?.name || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{s.actualWeightKg ? `${s.actualWeightKg} kg` : "—"}</td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_COLORS[s.status] || "bg-gray-100 text-gray-700"}>{s.status?.replace(/_/g, " ").toLowerCase()}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(s.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(s.status === "AWAITING_CARGO" || s.status === "BOOKED") && (
                            <Button size="sm" variant="outline" disabled={actionLoading === s.id}
                              onClick={() => handleAction("first-mile", s)}>
                              First Mile
                            </Button>
                          )}
                          {s.status === "PICKED_UP" && (
                            <Button size="sm" variant="outline" disabled={actionLoading === s.id}
                              onClick={() => handleAction("receive-cargo", s)}>
                              Receive Cargo
                            </Button>
                          )}
                          {s.status === "CARGO_RECEIVED" && (
                            <Button size="sm" variant="outline" disabled={actionLoading === s.id}
                              onClick={() => handleAction("start-screening", s)}>
                              Screen
                            </Button>
                          )}
                          {s.status === "SCREENING" && (
                            <Button size="sm" variant="outline" disabled={actionLoading === s.id}
                              onClick={() => handleAction("complete-screening", s)}>
                              Pass Screening
                            </Button>
                          )}
                          {s.status === "READY_FOR_COLLECTION" && (
                            <Button size="sm" variant="outline" disabled={actionLoading === s.id}
                              onClick={() => handleAction("collect", s)}>
                              <HugeiconsIcon icon={PackageCheckIcon} className="size-3.5" />
                              Collect
                            </Button>
                          )}
                          {s.status === "DESTINATION_STATION" && (
                            <Button size="sm" variant="outline" disabled={actionLoading === s.id}
                              onClick={() => handleAction("last-mile", s)}>
                              Last Mile
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
