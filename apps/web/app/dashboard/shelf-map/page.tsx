"use client"

import * as React from "react"
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
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Bookshelf01Icon,
  PlusIcon,
  Search01Icon,
  Package02Icon,
  CheckmarkCircle02Icon,
  AlertTriangle,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber } from "@/lib/format"

export default function ShelfMapPage() {
  const [shelves, setShelves] = React.useState<any[]>([])
  const [stations, setStations] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [stationFilter, setStationFilter] = React.useState("ALL")
  const [codeSearch, setCodeSearch] = React.useState("")
  const [searching, setSearching] = React.useState(false)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [createForm, setCreateForm] = React.useState({ stationId: "", code: "", rack: "", shelfLevel: "", bin: "", capacityBoxes: "" })
  const [creating, setCreating] = React.useState(false)

  const [assignShelf, setAssignShelf] = React.useState<any>(null)
  const [pendingBoxes, setPendingBoxes] = React.useState<any[]>([])
  const [manualBoxNumber, setManualBoxNumber] = React.useState("")
  const [selectedPendingBoxId, setSelectedPendingBoxId] = React.useState("")
  const [assigning, setAssigning] = React.useState(false)

  React.useEffect(() => { loadStations() }, [])
  React.useEffect(() => { loadShelves() }, [stationFilter])

  async function loadStations() {
    try {
      const res = await api.stations.list("isActive=true")
      const raw = res.data?.stations || res.data
      setStations(Array.isArray(raw) ? raw : [])
    } catch {
      setStations([])
    }
  }

  async function loadShelves() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (stationFilter !== "ALL") params.set("stationId", stationFilter)
      const res = await api.shelfLocations.list(params.toString())
      const raw = res.data?.shelves || res.data
      setShelves(Array.isArray(raw) ? raw : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load shelf locations")
    } finally {
      setLoading(false)
    }
  }

  async function handleCodeSearch() {
    if (!codeSearch.trim()) {
      loadShelves()
      return
    }
    setSearching(true)
    try {
      const params = new URLSearchParams()
      params.set("code", codeSearch.trim())
      if (stationFilter !== "ALL") params.set("stationId", stationFilter)
      const res = await api.shelfLocations.search(params.toString())
      setShelves(res.data ? [res.data] : [])
    } catch (err: any) {
      setShelves([])
      toast.error(err.message || "No shelf found for that code")
    } finally {
      setSearching(false)
    }
  }

  const stats = React.useMemo(() => {
    const total = shelves.length
    const occupied = shelves.filter((s) => (s.boxes?.length || 0) > 0 || (s.shipments?.length || 0) > 0).length
    const totalCapacity = shelves.reduce((sum, s) => sum + (s.capacityBoxes || 0), 0)
    const totalBoxes = shelves.reduce((sum, s) => sum + (s.boxes?.length || 0), 0)
    return { total, occupied, totalCapacity, totalBoxes }
  }, [shelves])

  async function handleCreate() {
    if (!createForm.stationId || !createForm.code) {
      toast.error("Station and code are required")
      return
    }
    setCreating(true)
    try {
      await api.shelfLocations.create({
        stationId: createForm.stationId,
        code: createForm.code,
        rack: createForm.rack || undefined,
        shelfLevel: createForm.shelfLevel || undefined,
        bin: createForm.bin || undefined,
        capacityBoxes: createForm.capacityBoxes ? Number(createForm.capacityBoxes) : undefined,
      })
      toast.success("Shelf location created")
      setCreateOpen(false)
      setCreateForm({ stationId: "", code: "", rack: "", shelfLevel: "", bin: "", capacityBoxes: "" })
      loadShelves()
    } catch (err: any) {
      toast.error(err.message || "Failed to create shelf location")
    } finally {
      setCreating(false)
    }
  }

  async function openAssignSheet(shelf: any) {
    setAssignShelf(shelf)
    setManualBoxNumber("")
    setSelectedPendingBoxId("")
    try {
      const res = await api.cargoIntake.pendingTz()
      const raw = res.data?.boxes || res.data
      setPendingBoxes(Array.isArray(raw) ? raw : [])
    } catch {
      setPendingBoxes([])
    }
  }

  async function handleAssignBox() {
    if (!assignShelf) return
    setAssigning(true)
    try {
      let boxId = selectedPendingBoxId
      if (!boxId && manualBoxNumber.trim()) {
        const res = await api.consolidationBoxes.list(`search=${encodeURIComponent(manualBoxNumber.trim())}`)
        const raw = res.data?.boxes || res.data
        const found = Array.isArray(raw) ? raw.find((b: any) => b.boxNumber === manualBoxNumber.trim()) || raw[0] : null
        if (!found) {
          toast.error("Box not found")
          setAssigning(false)
          return
        }
        boxId = found.id
      }
      if (!boxId) {
        toast.error("Select or enter a box")
        setAssigning(false)
        return
      }
      await api.shelfLocations.assignBox(assignShelf.id, { boxId })
      toast.success("Box assigned to shelf")
      setAssignShelf(null)
      loadShelves()
    } catch (err: any) {
      toast.error(err.message || "Failed to assign box to shelf")
    } finally {
      setAssigning(false)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Shelf Map" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Shelf Map"
          description="Structured shelf locations for boxes & shipments arriving in Tanzania"
          actions={
            <Button onClick={() => setCreateOpen(true)}>
              <HugeiconsIcon icon={PlusIcon} className="size-4" />
              Add Shelf
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Shelves" value={formatNumber(stats.total)} icon={Bookshelf01Icon} loading={loading} hint="Configured locations" />
          <MetricCard label="Occupied" value={formatNumber(stats.occupied)} icon={Package02Icon} loading={loading} hint="Holding cargo" />
          <MetricCard label="Boxes Shelved" value={formatNumber(stats.totalBoxes)} icon={CheckmarkCircle02Icon} loading={loading} hint="Across all shelves" />
          <MetricCard label="Total Capacity" value={formatNumber(stats.totalCapacity)} icon={Bookshelf01Icon} loading={loading} hint="Box slots" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by shelf code..."
              value={codeSearch}
              onChange={(e) => setCodeSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCodeSearch()}
              className="pl-9"
            />
          </div>
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
          <Button variant="outline" loading={searching} onClick={handleCodeSearch} className="sm:ml-auto">
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
            Search
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
          </div>
        ) : shelves.length === 0 ? (
          <div className="rounded-lg border border-dashed py-16 text-center">
            <HugeiconsIcon icon={Bookshelf01Icon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No shelf locations found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shelves.map((s: any) => {
              const occupancy = s.boxes?.length || 0
              const capacity = s.capacityBoxes || 0
              const full = capacity > 0 && occupancy >= capacity
              return (
                <div key={s.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{s.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {[s.rack && `Rack ${s.rack}`, s.shelfLevel && `Level ${s.shelfLevel}`, s.bin && `Bin ${s.bin}`].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs">
                    {full && <HugeiconsIcon icon={AlertTriangle} className="size-3.5 text-amber-600" />}
                    <span className={full ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                      {occupancy}{capacity ? ` / ${capacity}` : ""} boxes
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    {(s.boxes || []).slice(0, 4).map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between rounded bg-muted/30 px-2 py-1 text-xs">
                        <span className="font-medium">{b.boxNumber}</span>
                        <span className="text-muted-foreground">{b.status}</span>
                      </div>
                    ))}
                    {(s.boxes?.length || 0) > 4 && (
                      <p className="text-xs text-muted-foreground">+{s.boxes.length - 4} more</p>
                    )}
                    {(s.shipments || []).slice(0, 3).map((sh: any) => (
                      <div key={sh.id} className="flex items-center justify-between rounded bg-muted/20 px-2 py-1 text-xs">
                        <span>{sh.trackingNumber}</span>
                      </div>
                    ))}
                  </div>

                  <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => openAssignSheet(s)}>
                    <HugeiconsIcon icon={Package02Icon} className="size-3.5" />
                    Assign Box
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Shelf Sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PlusIcon} className="size-5 text-primary" />
              Add Shelf Location
            </SheetTitle>
            <SheetDescription>Register a new structured shelf slot</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Station <span className="text-destructive">*</span></Label>
              <Select value={createForm.stationId} onValueChange={(v) => setCreateForm({ ...createForm, stationId: v ?? "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station">
                    {(v: string) => stations.find((s: any) => s.id === v)?.name || v || "Select station"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {stations.map((st: any) => <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Shelf Code <span className="text-destructive">*</span></Label>
              <Input value={createForm.code} onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })} placeholder="e.g. A-03-B2" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label>Rack</Label>
                <Input value={createForm.rack} onChange={(e) => setCreateForm({ ...createForm, rack: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Level</Label>
                <Input value={createForm.shelfLevel} onChange={(e) => setCreateForm({ ...createForm, shelfLevel: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Bin</Label>
                <Input value={createForm.bin} onChange={(e) => setCreateForm({ ...createForm, bin: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Capacity (boxes)</Label>
              <Input type="number" value={createForm.capacityBoxes} onChange={(e) => setCreateForm({ ...createForm, capacityBoxes: e.target.value })} />
            </div>
            <Button className="w-full" onClick={handleCreate} loading={creating}>Create Shelf</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Assign Box Sheet */}
      <Sheet open={!!assignShelf} onOpenChange={(v) => !v && setAssignShelf(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Package02Icon} className="size-5 text-primary" />
              Assign Box to Shelf {assignShelf?.code}
            </SheetTitle>
            <SheetDescription>Pick an arrived box waiting to be shelved, or enter a box number directly</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            {pendingBoxes.length > 0 && (
              <div className="grid gap-2">
                <Label>Arrived, Unshelved Boxes</Label>
                <Select value={selectedPendingBoxId} onValueChange={(v) => { setSelectedPendingBoxId(v ?? ""); setManualBoxNumber("") }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a box">
                      {(v: string) => pendingBoxes.find((b: any) => b.id === v)?.boxNumber || v || "Select a box"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {pendingBoxes.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>{b.boxNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Or Enter Box Number</Label>
              <Input
                value={manualBoxNumber}
                onChange={(e) => { setManualBoxNumber(e.target.value); setSelectedPendingBoxId("") }}
                placeholder="e.g. BOX-2026-000123"
              />
            </div>
            <Button className="w-full" onClick={handleAssignBox} loading={assigning} disabled={!selectedPendingBoxId && !manualBoxNumber.trim()}>
              Assign to Shelf
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
