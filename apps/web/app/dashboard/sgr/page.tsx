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
import { Train01Icon, Package02Icon, ScaleIcon, CheckmarkCircle02Icon, PlusIcon, Search01Icon, ArrowRight01Icon, LayersIcon, MapPinIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "AT_STATION", label: "At Station" },
  { value: "WEIGHED", label: "Weighed" },
  { value: "CONSOLIDATED", label: "Consolidated" },
  { value: "LOADED_ON_TRAIN", label: "Loaded on Train" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "ARRIVED_DESTINATION", label: "Arrived" },
  { value: "DELIVERED", label: "Delivered" },
]

export default function SGRPage() {
  const [shipments, setShipments] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
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
    senderName: "",
    senderPhone: "",
    receiverName: "",
    receiverPhone: "",
    actualWeightKg: "",
    description: "",
  })

  React.useEffect(() => { loadData() }, [statusFilter])

  async function loadData() {
    setLoading(true)
    try {
      const params = statusFilter !== "ALL" ? `?status=${statusFilter}` : ""
      const [listRes, statsRes, stRes, capRes] = await Promise.all([
        api.sgr.list(params),
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
          title="SGR Parcel Service"
          description="Manage rail parcel shipments, stations & manifests"
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

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Shipments"
            value={formatNumber(stats?.total ?? 0)}
            icon={Package02Icon}
            loading={loading}
            hint="All SGR shipments"
          />
          <MetricCard
            label="In Transit"
            value={formatNumber(stats?.inTransit ?? 0)}
            icon={Train01Icon}
            loading={loading}
            hint="On the move"
          />
          <MetricCard
            label="At Station"
            value={formatNumber(stats?.atStation ?? 0)}
            icon={ScaleIcon}
            loading={loading}
            hint="Waiting at station"
          />
          <MetricCard
            label="Delivered"
            value={formatNumber(stats?.delivered ?? 0)}
            icon={CheckmarkCircle02Icon}
            loading={loading}
            hint="Successfully delivered"
          />
        </div>

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
                        <Badge variant="secondary">{s.status?.replace(/_/g, " ").toLowerCase()}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(s.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {(s.status === "PENDING" || s.status === "AT_STATION") && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("verify-weigh", s)}>
                              <HugeiconsIcon icon={ScaleIcon} className="size-3.5" />
                              Weigh
                            </Button>
                          )}
                          {(s.status === "WEIGHED" || s.status === "AT_STATION") && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("consolidate", s)}>
                              <HugeiconsIcon icon={LayersIcon} className="size-3.5" />
                              Consolidate
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
