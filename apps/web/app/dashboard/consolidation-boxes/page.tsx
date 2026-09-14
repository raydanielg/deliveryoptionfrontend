"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Package02Icon,
  PlusIcon,
  Search01Icon,
  Airplane01Icon,
  Bookshelf01Icon,
  AlertTriangle,
  PackageAddIcon,
  ScaleIcon,
  SentIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PACKING", label: "Packing" },
  { value: "PACKED", label: "Packed" },
  { value: "HANDED_TO_PASSENGER", label: "Handed to Passenger" },
  { value: "DEPARTED", label: "Departed" },
  { value: "ARRIVED_TZ", label: "Arrived TZ" },
  { value: "SHELVED", label: "Shelved" },
  { value: "BROKEN_DOWN", label: "Broken Down" },
  { value: "LOST", label: "Lost" },
  { value: "DAMAGED", label: "Damaged" },
]

export default function ConsolidationBoxesPage() {
  const router = useRouter()
  const [boxes, setBoxes] = React.useState<any[]>([])
  const [stations, setStations] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [stationFilter, setStationFilter] = React.useState("ALL")

  const [createOpen, setCreateOpen] = React.useState(false)
  const [createForm, setCreateForm] = React.useState({ originStationId: "", targetWeightKg: "23", notes: "" })
  const [creating, setCreating] = React.useState(false)

  const [addItemBox, setAddItemBox] = React.useState<any>(null)
  const [addItemForm, setAddItemForm] = React.useState({ trackingNumber: "", notes: "" })
  const [addingItem, setAddingItem] = React.useState(false)

  const [closeBox, setCloseBox] = React.useState<any>(null)
  const [actualWeight, setActualWeight] = React.useState("")
  const [closing, setClosing] = React.useState(false)

  const [assignBox, setAssignBox] = React.useState<any>(null)
  const [trips, setTrips] = React.useState<any[]>([])
  const [selectedTripId, setSelectedTripId] = React.useState("")
  const [assigning, setAssigning] = React.useState(false)

  const [exceptionBox, setExceptionBox] = React.useState<any>(null)
  const [exceptionForm, setExceptionForm] = React.useState({ status: "LOST", notes: "" })
  const [reporting, setReporting] = React.useState(false)

  React.useEffect(() => { loadStations() }, [])
  React.useEffect(() => { loadBoxes() }, [statusFilter, stationFilter])

  async function loadStations() {
    try {
      const res = await api.stations.list("isActive=true")
      const raw = res.data?.stations || res.data
      setStations(Array.isArray(raw) ? raw : [])
    } catch {
      setStations([])
    }
  }

  async function loadBoxes() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      if (stationFilter !== "ALL") params.set("stationId", stationFilter)
      if (search) params.set("search", search)
      const res = await api.consolidationBoxes.list(params.toString())
      const raw = res.data?.boxes || res.data
      setBoxes(Array.isArray(raw) ? raw : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load consolidation boxes")
    } finally {
      setLoading(false)
    }
  }

  const stats = React.useMemo(() => {
    const packing = boxes.filter((b) => b.status === "PACKING").length
    const packed = boxes.filter((b) => b.status === "PACKED").length
    const inTransit = boxes.filter((b) => b.status === "HANDED_TO_PASSENGER" || b.status === "DEPARTED").length
    const arrivedUnshelved = boxes.filter((b) => b.status === "ARRIVED_TZ").length
    return { packing, packed, inTransit, arrivedUnshelved }
  }, [boxes])

  async function handleCreate() {
    if (!createForm.originStationId) {
      toast.error("Select an origin station")
      return
    }
    setCreating(true)
    try {
      await api.consolidationBoxes.create({
        originStationId: createForm.originStationId,
        targetWeightKg: createForm.targetWeightKg ? Number(createForm.targetWeightKg) : undefined,
        notes: createForm.notes || undefined,
      })
      toast.success("Box created")
      setCreateOpen(false)
      setCreateForm({ originStationId: "", targetWeightKg: "23", notes: "" })
      loadBoxes()
    } catch (err: any) {
      toast.error(err.message || "Failed to create box")
    } finally {
      setCreating(false)
    }
  }

  async function handleAddItem() {
    if (!addItemBox || !addItemForm.trackingNumber.trim()) {
      toast.error("Enter a tracking number")
      return
    }
    setAddingItem(true)
    try {
      await api.consolidationBoxes.addItem(addItemBox.id, {
        trackingNumber: addItemForm.trackingNumber.trim(),
        notes: addItemForm.notes || undefined,
      })
      toast.success("Item added to box")
      setAddItemForm({ trackingNumber: "", notes: "" })
      setAddItemBox(null)
      loadBoxes()
    } catch (err: any) {
      toast.error(err.message || "Failed to add item")
    } finally {
      setAddingItem(false)
    }
  }

  async function handleClose() {
    if (!closeBox || !actualWeight) {
      toast.error("Enter the actual weight")
      return
    }
    setClosing(true)
    try {
      await api.consolidationBoxes.close(closeBox.id, { actualWeightKg: Number(actualWeight) })
      toast.success("Box closed & packed")
      setCloseBox(null)
      setActualWeight("")
      loadBoxes()
    } catch (err: any) {
      toast.error(err.message || "Failed to close box")
    } finally {
      setClosing(false)
    }
  }

  async function openAssignSheet(box: any) {
    setAssignBox(box)
    setSelectedTripId("")
    try {
      const res = await api.tripManifests.list("status=PLANNED")
      const raw = res.data?.trips || res.data
      const planned = Array.isArray(raw) ? raw : []
      const res2 = await api.tripManifests.list("status=BOXES_ASSIGNED")
      const raw2 = res2.data?.trips || res2.data
      const assigned = Array.isArray(raw2) ? raw2 : []
      setTrips([...planned, ...assigned])
    } catch {
      setTrips([])
    }
  }

  async function handleAssign() {
    if (!assignBox || !selectedTripId) {
      toast.error("Select a trip")
      return
    }
    setAssigning(true)
    try {
      await api.tripManifests.pairBox(selectedTripId, { boxId: assignBox.id })
      toast.success("Box assigned to trip")
      setAssignBox(null)
      loadBoxes()
    } catch (err: any) {
      toast.error(err.message || "Failed to assign box to trip")
    } finally {
      setAssigning(false)
    }
  }

  async function handleReportException() {
    if (!exceptionBox) return
    setReporting(true)
    try {
      await api.consolidationBoxes.setStatus(exceptionBox.id, {
        status: exceptionForm.status,
        notes: exceptionForm.notes || undefined,
      })
      toast.success(`Box marked ${exceptionForm.status.toLowerCase()}`)
      setExceptionBox(null)
      setExceptionForm({ status: "LOST", notes: "" })
      loadBoxes()
    } catch (err: any) {
      toast.error(err.message || "Failed to update box status")
    } finally {
      setReporting(false)
    }
  }

  const filtered = boxes.filter((b) => {
    if (!search) return true
    return b.boxNumber?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Consolidation Boxes" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Consolidation Boxes"
          description="Dubai-packed ~23kg boxes: pack, close, hand off to a trip, and track through arrival"
          actions={
            <Button onClick={() => setCreateOpen(true)}>
              <HugeiconsIcon icon={PlusIcon} className="size-4" />
              Create Box
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Packing" value={formatNumber(stats.packing)} icon={PackageAddIcon} loading={loading} hint="Open boxes" />
          <MetricCard label="Packed" value={formatNumber(stats.packed)} icon={Package02Icon} loading={loading} hint="Ready for a trip" />
          <MetricCard label="In Transit" value={formatNumber(stats.inTransit)} icon={Airplane01Icon} loading={loading} hint="Handed off / departed" />
          <MetricCard label="Arrived, Unshelved" value={formatNumber(stats.arrivedUnshelved)} icon={Bookshelf01Icon} loading={loading} hint="Needs shelving" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search box number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadBoxes()}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
            <SelectTrigger className="w-full sm:w-[190px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stationFilter} onValueChange={(v) => setStationFilter(v ?? "ALL")}>
            <SelectTrigger className="w-full sm:w-[190px]">
              <SelectValue placeholder="Filter by station">
                {(v: string) => (!v || v === "ALL" ? "All Stations" : stations.find((s: any) => s.id === v)?.name || v)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Stations</SelectItem>
              {stations.map((st: any) => <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadBoxes} className="sm:ml-auto">
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
            Search
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Box #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Origin</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Current Location</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Items</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Weight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Trip</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Created</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3" colSpan={9}><Skeleton className="h-5 w-full" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Package02Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No consolidation boxes found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((b: any) => (
                    <tr
                      key={b.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => router.push(`/dashboard/consolidation-boxes/${b.id}`)}
                    >
                      <td className="px-4 py-3 font-medium">{b.boxNumber}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{b.originStation?.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {b.currentShelfLocation ? b.currentShelfLocation?.code || "Shelved" : b.currentStation?.name || "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{b.items?.length ?? 0}</td>
                      <td className="px-4 py-3 tabular-nums">
                        {b.actualWeightKg ? `${b.actualWeightKg} kg` : b.targetWeightKg ? `~${b.targetWeightKg} kg` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{b.tripManifest?.tripNo || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(b.createdAt)}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap gap-1">
                          {b.status === "PACKING" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => setAddItemBox(b)}>
                                <HugeiconsIcon icon={PackageAddIcon} className="size-3.5" />
                                Add Item
                              </Button>
                              <Button size="sm" variant="outline" disabled={!b.items?.length} onClick={() => setCloseBox(b)}>
                                <HugeiconsIcon icon={ScaleIcon} className="size-3.5" />
                                Close
                              </Button>
                            </>
                          )}
                          {b.status === "PACKED" && (
                            <Button size="sm" variant="outline" onClick={() => openAssignSheet(b)}>
                              <HugeiconsIcon icon={SentIcon} className="size-3.5" />
                              Assign to Trip
                            </Button>
                          )}
                          {!["LOST", "DAMAGED", "BROKEN_DOWN"].includes(b.status) && (
                            <Button size="sm" variant="ghost" onClick={() => setExceptionBox(b)}>
                              <HugeiconsIcon icon={AlertTriangle} className="size-3.5" />
                              Report Issue
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

      {/* Create Box Sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PlusIcon} className="size-5 text-primary" />
              Create Consolidation Box
            </SheetTitle>
            <SheetDescription>Start a new box at the Dubai origin station</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Origin Station <span className="text-destructive">*</span></Label>
              <Select value={createForm.originStationId} onValueChange={(v) => setCreateForm({ ...createForm, originStationId: v ?? "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station">
                    {(v: string) => {
                      const st = stations.find((s: any) => s.id === v)
                      return st ? `${st.name} — ${st.city}` : v || "Select station"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {stations.map((st: any) => <SelectItem key={st.id} value={st.id}>{st.name} — {st.city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Target Weight (kg)</Label>
              <Input type="number" value={createForm.targetWeightKg} onChange={(e) => setCreateForm({ ...createForm, targetWeightKg: e.target.value })} placeholder="23" />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} placeholder="Optional notes" />
            </div>
            <Button className="w-full" onClick={handleCreate} loading={creating}>Create Box</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Item Sheet */}
      <Sheet open={!!addItemBox} onOpenChange={(v) => !v && setAddItemBox(null)}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PackageAddIcon} className="size-5 text-primary" />
              Add Item to Box
            </SheetTitle>
            <SheetDescription>Box {addItemBox?.boxNumber}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Tracking Number <span className="text-destructive">*</span></Label>
              <Input
                value={addItemForm.trackingNumber}
                onChange={(e) => setAddItemForm({ ...addItemForm, trackingNumber: e.target.value })}
                placeholder="Scan or enter tracking number"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={addItemForm.notes} onChange={(e) => setAddItemForm({ ...addItemForm, notes: e.target.value })} placeholder="Optional" />
            </div>
            <Button className="w-full" onClick={handleAddItem} loading={addingItem}>Add Item</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Close Box Sheet */}
      <Sheet open={!!closeBox} onOpenChange={(v) => !v && setCloseBox(null)}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ScaleIcon} className="size-5 text-primary" />
              Close Box
            </SheetTitle>
            <SheetDescription>Box {closeBox?.boxNumber} — {closeBox?.items?.length ?? 0} item(s)</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Actual Weight (kg) <span className="text-destructive">*</span></Label>
              <Input type="number" value={actualWeight} onChange={(e) => setActualWeight(e.target.value)} placeholder="e.g. 22.8" autoFocus />
            </div>
            <Button className="w-full" onClick={handleClose} loading={closing} disabled={!actualWeight}>Close & Mark Packed</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Assign to Trip Sheet */}
      <Sheet open={!!assignBox} onOpenChange={(v) => !v && setAssignBox(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Airplane01Icon} className="size-5 text-primary" />
              Assign Box to Trip
            </SheetTitle>
            <SheetDescription>Box {assignBox?.boxNumber} — pick a passenger trip to hand this box to</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            {trips.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                No open trips available.
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/trip-manifests")}>
                    Create a Trip Manifest
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>Trip</Label>
                <Select value={selectedTripId} onValueChange={(v) => setSelectedTripId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trip">
                      {(v: string) => {
                        const t = trips.find((tr: any) => tr.id === v)
                        return t ? `${t.tripNo} — ${t.passengerName}` : v || "Select a trip"
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {trips.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.tripNo} — {t.passengerName} ({t.flightDate ? formatDate(t.flightDate) : "—"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button className="w-full" onClick={handleAssign} loading={assigning} disabled={!selectedTripId}>Assign to Trip</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Exception Sheet */}
      <Sheet open={!!exceptionBox} onOpenChange={(v) => !v && setExceptionBox(null)}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={AlertTriangle} className="size-5 text-destructive" />
              Report Box Issue
            </SheetTitle>
            <SheetDescription>Box {exceptionBox?.boxNumber}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Issue Type</Label>
              <Select value={exceptionForm.status} onValueChange={(v) => setExceptionForm({ ...exceptionForm, status: v ?? "LOST" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOST">Lost</SelectItem>
                  <SelectItem value="DAMAGED">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={exceptionForm.notes} onChange={(e) => setExceptionForm({ ...exceptionForm, notes: e.target.value })} placeholder="What happened?" />
            </div>
            <Button className="w-full" variant="destructive" onClick={handleReportException} loading={reporting}>Report Issue</Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
