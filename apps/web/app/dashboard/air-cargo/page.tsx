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
import { Airplane01Icon, Package02Icon, CheckmarkCircle02Icon, AirplaneTakeOff01Icon, PlusIcon, ArrowRight01Icon, CheckSquare, SendIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CARGO_ACCEPTED", label: "Cargo Accepted" },
  { value: "FLIGHT_DISPATCHED", label: "Flight Dispatched" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "ARRIVED_AIRPORT", label: "Arrived at Airport" },
  { value: "CUSTOMS_REVIEW", label: "Customs Review" },
  { value: "CUSTOMS_CLEARED", label: "Customs Cleared" },
  { value: "DELIVERED", label: "Delivered" },
]

export default function AirCargoPage() {
  const [shipments, setShipments] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [airports, setAirports] = React.useState<any[]>([])
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
    cargoType: "GENERAL",
    description: "",
  })

  React.useEffect(() => { loadData() }, [statusFilter])

  async function loadData() {
    setLoading(true)
    try {
      const params = statusFilter !== "ALL" ? `?status=${statusFilter}` : ""
      const [listRes, statsRes, stRes] = await Promise.all([
        api.airCargo.list(params),
        api.airCargo.stats(),
        api.stations.list("type=AIRPORT_CARGO&isActive=true"),
      ])
      const rawShipments = listRes.data?.shipments || listRes.data
      setShipments(Array.isArray(rawShipments) ? rawShipments : [])
      setStats(statsRes.data)
      const rawAirports = stRes.data?.stations || stRes.data
      setAirports(Array.isArray(rawAirports) ? rawAirports : [])
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

  const filtered = shipments.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.trackingNumber?.toLowerCase().includes(q) ||
      s.awbNumber?.toLowerCase().includes(q) ||
      s.fromAddress?.city?.toLowerCase().includes(q) ||
      s.toAddress?.city?.toLowerCase().includes(q)
  })

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Air Cargo" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Air Cargo"
          description="Manage air freight shipments, flight dispatch & customs"
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
                      <HugeiconsIcon icon={Airplane01Icon} className="size-5 text-primary" />
                      New Air Cargo Booking
                    </SheetTitle>
                    <SheetDescription>Create a new air freight shipment booking</SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 px-4 pb-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Origin Airport <span className="text-destructive">*</span></Label>
                        <Select value={booking.originStationId} onValueChange={(v) => setBooking(prev => ({ ...prev, originStationId: v ?? "" }))}>
                          <SelectTrigger><SelectValue placeholder="Select origin" /></SelectTrigger>
                          <SelectContent>
                            {airports.map((st: any) => <SelectItem key={st.id} value={st.id}>{st.name} — {st.city}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Destination Airport <span className="text-destructive">*</span></Label>
                        <Select value={booking.destinationStationId} onValueChange={(v) => setBooking(prev => ({ ...prev, destinationStationId: v ?? "" }))}>
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
                        <Select value={booking.cargoType} onValueChange={(v) => setBooking(prev => ({ ...prev, cargoType: v ?? "" }))}>
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
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <Button variant="outline" onClick={() => loadData()}>
                <HugeiconsIcon icon={Airplane01Icon} className="size-4" />
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
            hint="All air cargo"
          />
          <MetricCard
            label="In Transit"
            value={formatNumber(stats?.inTransit ?? 0)}
            icon={AirplaneTakeOff01Icon}
            loading={loading}
            hint="Currently flying"
          />
          <MetricCard
            label="Accepted"
            value={formatNumber(stats?.accepted ?? 0)}
            icon={Airplane01Icon}
            loading={loading}
            hint="Cargo accepted"
          />
          <MetricCard
            label="Delivered"
            value={formatNumber(stats?.delivered ?? 0)}
            icon={CheckmarkCircle02Icon}
            loading={loading}
            hint="Successfully delivered"
          />
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tracking #, AWB, city..."
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
                  <th className="px-4 py-3 font-medium text-muted-foreground">AWB</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">From</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">To</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Cargo Type</th>
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
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Airplane01Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No air cargo shipments found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s: any) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{s.trackingNumber || s.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.awbNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.fromAddress?.city || s.airportOrigin || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.toAddress?.city || s.airportDestination || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.cargoType?.toLowerCase() || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{s.status?.replace(/_/g, " ").toLowerCase()}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(s.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {s.status === "PENDING" && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("accept", s)}>
                              <HugeiconsIcon icon={CheckSquare} className="size-3.5" />
                              Accept
                            </Button>
                          )}
                          {s.status === "CARGO_ACCEPTED" && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("dispatch", s)}>
                              <HugeiconsIcon icon={SendIcon} className="size-3.5" />
                              Dispatch
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
