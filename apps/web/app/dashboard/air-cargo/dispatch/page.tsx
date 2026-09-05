"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Airplane01Icon, AirplaneTakeOff01Icon, Search01Icon, CheckmarkCircle02Icon, Package02Icon, PlusIcon, ArrowRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { formatNumber, formatDate } from "@/lib/format"
import { toast } from "sonner"

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "CREATED", label: "Created" },
  { value: "LOADING", label: "Loading" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

export default function AirCargoDispatchPage() {
  const router = useRouter()
  const [manifests, setManifests] = React.useState<any[]>([])
  const [airports, setAirports] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [dispatchOpen, setDispatchOpen] = React.useState(false)
  const [dispatchLoading, setDispatchLoading] = React.useState(false)
  const [dispatchForm, setDispatchForm] = React.useState({
    originStationId: "",
    destinationStationId: "",
    flightNumber: "",
    airline: "",
    shipmentIds: "",
  })

  React.useEffect(() => { loadData() }, [statusFilter])

  async function loadData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      const [mRes, stRes] = await Promise.all([
        api.manifests.list(params.toString()),
        api.stations.list("type=AIRPORT_CARGO&isActive=true"),
      ])
      const rawManifests = mRes.data?.manifests || mRes.data
      const allManifests = Array.isArray(rawManifests) ? rawManifests : []
      const airManifests = allManifests.filter((m: any) =>
        m.type === "AIR_CARGO" || m.manifestNumber?.startsWith("AIR") || m.transportMode === "AIR"
      )
      setManifests(airManifests)
      const rawAirports = stRes.data?.stations || stRes.data
      setAirports(Array.isArray(rawAirports) ? rawAirports : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load flight dispatch data")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateDispatch() {
    if (!dispatchForm.originStationId || !dispatchForm.destinationStationId) {
      toast.error("Please select origin and destination airports")
      return
    }
    if (dispatchForm.originStationId === dispatchForm.destinationStationId) {
      toast.error("Origin and destination must be different")
      return
    }
    setDispatchLoading(true)
    try {
      const body: Record<string, any> = {
        originStationId: dispatchForm.originStationId,
        destinationStationId: dispatchForm.destinationStationId,
      }
      if (dispatchForm.flightNumber) body.flightNumber = dispatchForm.flightNumber
      if (dispatchForm.airline) body.airline = dispatchForm.airline
      if (dispatchForm.shipmentIds) {
        body.shipmentIds = dispatchForm.shipmentIds.split(",").map((s) => s.trim()).filter(Boolean)
      }
      await api.airCargo.createFlightDispatch(body)
      toast.success("Flight dispatch created successfully")
      setDispatchOpen(false)
      setDispatchForm({ originStationId: "", destinationStationId: "", flightNumber: "", airline: "", shipmentIds: "" })
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to create flight dispatch")
    } finally {
      setDispatchLoading(false)
    }
  }

  async function handleArrive(manifest: any) {
    try {
      await api.airCargo.arriveAtAirport(manifest.id, { arrived: true })
      toast.success("Marked as arrived at destination airport")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to mark as arrived")
    }
  }

  const filtered = manifests.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return m.manifestNumber?.toLowerCase().includes(q) ||
      m.originStation?.toLowerCase().includes(q) ||
      m.destinationStation?.toLowerCase().includes(q) ||
      m.flightNumber?.toLowerCase().includes(q)
  })

  const stats = React.useMemo(() => {
    const inTransit = manifests.filter(m => m.status === "IN_TRANSIT").length
    const completed = manifests.filter(m => m.status === "COMPLETED").length
    const cancelled = manifests.filter(m => m.status === "CANCELLED").length
    return { total: manifests.length, inTransit, completed, cancelled }
  }, [manifests])

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Air Cargo", href: "/dashboard/air-cargo" }, { label: "Flight Dispatch" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Flight Dispatch"
          description="Air cargo flight dispatch and manifest management"
          actions={
            <div className="flex gap-2">
              <Sheet open={dispatchOpen} onOpenChange={setDispatchOpen}>
                <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <HugeiconsIcon icon={AirplaneTakeOff01Icon} className="size-5 text-primary" />
                      New Flight Dispatch
                    </SheetTitle>
                    <SheetDescription>Create a new air cargo flight dispatch manifest</SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 px-4 pb-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Origin Airport <span className="text-destructive">*</span></Label>
                        <Select value={dispatchForm.originStationId} onValueChange={(v) => setDispatchForm(prev => ({ ...prev, originStationId: v ?? "" }))}>
                          <SelectTrigger><SelectValue placeholder="Select origin" /></SelectTrigger>
                          <SelectContent>
                            {airports.map((st: any) => <SelectItem key={st.id} value={st.id}>{st.name} — {st.city}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Destination Airport <span className="text-destructive">*</span></Label>
                        <Select value={dispatchForm.destinationStationId} onValueChange={(v) => setDispatchForm(prev => ({ ...prev, destinationStationId: v ?? "" }))}>
                          <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                          <SelectContent>
                            {airports.filter((st: any) => st.id !== dispatchForm.originStationId).map((st: any) => <SelectItem key={st.id} value={st.id}>{st.name} — {st.city}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Flight Number</Label>
                        <Input value={dispatchForm.flightNumber} onChange={(e) => setDispatchForm(prev => ({ ...prev, flightNumber: e.target.value }))} placeholder="e.g. TC101" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Airline</Label>
                        <Input value={dispatchForm.airline} onChange={(e) => setDispatchForm(prev => ({ ...prev, airline: e.target.value }))} placeholder="e.g. Air Tanzania" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Shipment IDs (comma-separated)</Label>
                      <Input value={dispatchForm.shipmentIds} onChange={(e) => setDispatchForm(prev => ({ ...prev, shipmentIds: e.target.value }))} placeholder="shipment-id-1, shipment-id-2" />
                    </div>
                    <Button className="w-full" onClick={handleCreateDispatch} disabled={dispatchLoading}>
                      {dispatchLoading ? "Creating..." : "Create Flight Dispatch"}
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
            label="Total Dispatches"
            value={formatNumber(stats.total)}
            icon={AirplaneTakeOff01Icon}
            loading={loading}
            hint="All flight dispatches"
          />
          <MetricCard
            label="In Transit"
            value={formatNumber(stats.inTransit)}
            icon={Airplane01Icon}
            loading={loading}
            hint="Currently airborne"
          />
          <MetricCard
            label="Completed"
            value={formatNumber(stats.completed)}
            icon={CheckmarkCircle02Icon}
            loading={loading}
            hint="Successfully arrived"
          />
          <MetricCard
            label="Cancelled"
            value={formatNumber(stats.cancelled)}
            icon={Cancel01Icon}
            loading={loading}
            hint="Cancelled dispatches"
          />
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search manifest #, flight, route..."
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

        {/* Table */}
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Manifest #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Flight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Shipments</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Weight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-40" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-12" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={AirplaneTakeOff01Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No flight dispatches found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr
                      key={m.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => router.push(`/dashboard/manifests/${m.id}`)}
                    >
                      <td className="px-4 py-3 font-medium">{m.manifestNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.flightNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {m.originStation ? `${m.originStation} → ${m.destinationStation}` : m.route ? `${m.route.fromCity?.name} → ${m.route.toCity?.name}` : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{m.totalShipments || 0}</td>
                      <td className="px-4 py-3 tabular-nums">{Number(m.totalWeightKg || 0).toFixed(1)} kg</td>
                      <td className="px-4 py-3">
                        <Badge variant={m.status === "COMPLETED" ? "default" : "secondary"}>{m.status?.replace(/_/g, " ").toLowerCase()}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(m.createdAt)}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {m.status === "IN_TRANSIT" && (
                          <Button size="sm" variant="outline" onClick={() => handleArrive(m)}>
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
                            Mark Arrived
                          </Button>
                        )}
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
