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
import { WarehouseIcon, Package02Icon, PackageReceiveIcon, ContainerIcon, CheckmarkCircle02Icon, ScaleIcon, Tag01Icon, Bookshelf01Icon, LayersIcon, SendIcon, Clock01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "RECEIVED", label: "Received" },
  { value: "WEIGHED", label: "Weighed" },
  { value: "LABELED", label: "Labeled" },
  { value: "SHELVED", label: "Shelved" },
  { value: "CONSOLIDATED", label: "Consolidated" },
  { value: "RELEASED", label: "Released" },
]

export default function WarehousePage() {
  const [shipments, setShipments] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [receiveOpen, setReceiveOpen] = React.useState(false)
  const [receiveForm, setReceiveForm] = React.useState({ stationId: "", shipmentId: "" })
  const [shelfSheet, setShelfSheet] = React.useState<any>(null)
  const [shelfBin, setShelfBin] = React.useState("")
  const [consolidateOpen, setConsolidateOpen] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [historySheet, setHistorySheet] = React.useState<any>(null)
  const [history, setHistory] = React.useState<any[]>([])

  React.useEffect(() => { loadData() }, [statusFilter])

  async function loadData() {
    setLoading(true)
    try {
      const params = statusFilter !== "ALL" ? `?status=${statusFilter}` : ""
      const [listRes, statsRes] = await Promise.all([
        api.warehouse.list(params),
        api.warehouse.stats(),
      ])
      const rawShipments = listRes.data?.shipments || listRes.data
      setShipments(Array.isArray(rawShipments) ? rawShipments : [])
      setStats(statsRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load warehouse shipments")
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action: string, shipment: any) {
    try {
      if (action === "verify-weigh") {
        await api.warehouse.verifyWeigh({ shipmentId: shipment.id, actualWeightKg: shipment.actualWeightKg })
        toast.success("Verified & weighed")
      } else if (action === "label") {
        await api.warehouse.generateLabel(shipment.id)
        toast.success("Label generated")
      } else if (action === "release") {
        await api.warehouse.release({ shipmentId: shipment.id })
        toast.success("Shipment released")
      }
      loadData()
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action}`)
    }
  }

  async function handleShelfAssign() {
    if (!shelfSheet || !shelfBin) return
    try {
      await api.warehouse.assignShelfBin({ shipmentId: shelfSheet.id, shelfBin })
      toast.success(`Assigned to ${shelfBin}`)
      setShelfSheet(null)
      setShelfBin("")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to assign shelf")
    }
  }

  async function handleConsolidate() {
    if (selectedIds.length < 2) {
      toast.error("Select at least 2 shipments to consolidate")
      return
    }
    try {
      await api.warehouse.consolidate({ shipmentIds: selectedIds })
      toast.success("Shipments consolidated")
      setConsolidateOpen(false)
      setSelectedIds([])
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to consolidate")
    }
  }

  async function loadHistory(shipment: any) {
    setHistorySheet(shipment)
    try {
      const res = await api.tracking.trackShipment(shipment.trackingNumber)
      setHistory(res.data?.events || [])
    } catch {
      setHistory([])
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const filtered = shipments.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.trackingNumber?.toLowerCase().includes(q) ||
      s.shelfBinLocation?.toLowerCase().includes(q) ||
      s.fromAddress?.city?.toLowerCase().includes(q) ||
      s.toAddress?.city?.toLowerCase().includes(q)
  })

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Warehouse" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Warehouse Operations"
          description="Receiving, shelving, consolidation & release"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setReceiveOpen(true)}>
                <HugeiconsIcon icon={PackageReceiveIcon} className="size-4" />
                Receive
              </Button>
              <Button variant="outline" onClick={() => setConsolidateOpen(true)} disabled={selectedIds.length < 2}>
                <HugeiconsIcon icon={LayersIcon} className="size-4" />
                Consolidate ({selectedIds.length})
              </Button>
              <Button variant="outline" onClick={() => loadData()}>
                <HugeiconsIcon icon={WarehouseIcon} className="size-4" />
                Refresh
              </Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total in Warehouse"
            value={formatNumber(stats?.total ?? 0)}
            icon={Package02Icon}
            loading={loading}
            hint="All items"
          />
          <MetricCard
            label="Received Today"
            value={formatNumber(stats?.receivedToday ?? 0)}
            icon={PackageReceiveIcon}
            loading={loading}
            hint="Today's intake"
          />
          <MetricCard
            label="Consolidated"
            value={formatNumber(stats?.consolidated ?? 0)}
            icon={ContainerIcon}
            loading={loading}
            hint="Batched for dispatch"
          />
          <MetricCard
            label="Released"
            value={formatNumber(stats?.released ?? 0)}
            icon={CheckmarkCircle02Icon}
            loading={loading}
            hint="Sent out"
          />
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tracking #, shelf, city..."
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
        </div>

        {/* Shipments Table */}
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground w-8"></th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Shelf/Bin</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Weight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Received</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={WarehouseIcon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No shipments in warehouse</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s: any) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(s.id)}
                          onChange={() => toggleSelect(s.id)}
                          className="size-4 rounded border-muted"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">{s.trackingNumber || s.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.shelfBinLocation || s.shelfBin || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{s.actualWeightKg ? `${s.actualWeightKg} kg` : "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.fromAddress?.city} → {s.toAddress?.city}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{s.status?.replace(/_/g, " ").toLowerCase()}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.receivedAt ? formatDate(s.receivedAt) : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.status === "RECEIVED" && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("verify-weigh", s)}>
                              <HugeiconsIcon icon={ScaleIcon} className="size-3.5" />
                              Weigh
                            </Button>
                          )}
                          {s.status === "WEIGHED" && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("label", s)}>
                              <HugeiconsIcon icon={Tag01Icon} className="size-3.5" />
                              Label
                            </Button>
                          )}
                          {s.status === "LABELED" && (
                            <Button size="sm" variant="outline" onClick={() => setShelfSheet(s)}>
                              <HugeiconsIcon icon={Bookshelf01Icon} className="size-3.5" />
                              Shelve
                            </Button>
                          )}
                          {(s.status === "SHELVED" || s.status === "CONSOLIDATED") && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("release", s)}>
                              <HugeiconsIcon icon={SendIcon} className="size-3.5" />
                              Release
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => loadHistory(s)}>
                            <HugeiconsIcon icon={Clock01Icon} className="size-3.5" />
                            History
                          </Button>
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

      {/* Receive Sheet */}
      <Sheet open={receiveOpen} onOpenChange={setReceiveOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PackageReceiveIcon} className="size-5 text-primary" />
              Receive Shipment
            </SheetTitle>
            <SheetDescription>Receive a shipment at the warehouse</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Station / Warehouse ID</Label>
              <Input value={receiveForm.stationId} onChange={(e) => setReceiveForm({ ...receiveForm, stationId: e.target.value })} placeholder="Enter station ID" />
            </div>
            <div className="grid gap-2">
              <Label>Shipment ID</Label>
              <Input value={receiveForm.shipmentId} onChange={(e) => setReceiveForm({ ...receiveForm, shipmentId: e.target.value })} placeholder="Enter shipment ID" />
            </div>
            <Button className="w-full" onClick={async () => {
              try {
                await api.warehouse.receive(receiveForm.stationId, { shipmentId: receiveForm.shipmentId })
                toast.success("Shipment received at warehouse")
                setReceiveOpen(false)
                setReceiveForm({ stationId: "", shipmentId: "" })
                loadData()
              } catch (err: any) {
                toast.error(err.message || "Failed to receive shipment")
              }
            }}>
              Confirm Receive
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Shelf-Bin Assignment Sheet */}
      <Sheet open={!!shelfSheet} onOpenChange={(v) => !v && setShelfSheet(null)}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Bookshelf01Icon} className="size-5 text-primary" />
              Assign Shelf & Bin
            </SheetTitle>
            <SheetDescription>Assign a storage location for this shipment</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="text-sm text-muted-foreground">
              Shipment: <span className="font-medium text-foreground">{shelfSheet?.trackingNumber}</span>
            </div>
            <div className="grid gap-2">
              <Label>Shelf/Bin Location <span className="text-destructive">*</span></Label>
              <Input
                value={shelfBin}
                onChange={(e) => setShelfBin(e.target.value)}
                placeholder="e.g. A-03-B2"
              />
              <p className="text-xs text-muted-foreground">Format: Rack-Shelf-Bin (e.g. A-03-B2)</p>
            </div>
            <Button className="w-full" onClick={handleShelfAssign} disabled={!shelfBin}>
              Assign Location
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Consolidate Sheet */}
      <Sheet open={consolidateOpen} onOpenChange={setConsolidateOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={LayersIcon} className="size-5 text-primary" />
              Consolidate Shipments
            </SheetTitle>
            <SheetDescription>Group selected shipments into a single batch</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="text-sm text-muted-foreground">
              {selectedIds.length} shipment(s) selected for consolidation. This will group them into a single batch for outbound dispatch.
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              {shipments.filter(s => selectedIds.includes(s.id)).map(s => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.trackingNumber || s.id.slice(0, 8)}</span>
                  <span className="text-muted-foreground">{s.actualWeightKg} kg</span>
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={handleConsolidate}>
              Confirm Consolidation
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Movement History Sheet */}
      <Sheet open={!!historySheet} onOpenChange={(v) => !v && setHistorySheet(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Clock01Icon} className="size-5 text-primary" />
              Movement History
            </SheetTitle>
            <SheetDescription>Tracking events for {historySheet?.trackingNumber}</SheetDescription>
          </SheetHeader>
          <div className="space-y-2 px-4 pb-6 max-h-[60vh] overflow-y-auto">
            {history.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">No tracking events found</p>
            ) : (
              history.map((evt: any, i: number) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                    <HugeiconsIcon icon={Package02Icon} className="size-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{evt.event?.replace(/_/g, " ").toLowerCase() || evt.status?.replace(/_/g, " ").toLowerCase()}</div>
                    {evt.location && <div className="text-xs text-muted-foreground">{evt.location}</div>}
                    {evt.description && <div className="text-xs text-muted-foreground">{evt.description}</div>}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(evt.createdAt || evt.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
