"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { HugeiconsIcon } from "@hugeicons/react"
import { ContainerIcon, Package02Icon, LayersIcon, SendIcon, Search01Icon, ArrowRight01Icon, CheckmarkCircle02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { formatNumber, formatDate } from "@/lib/format"
import { toast } from "sonner"

export default function WarehouseConsolidationPage() {
  const [shipments, setShipments] = React.useState<any[]>([])
  const [consolidated, setConsolidated] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [consolidateOpen, setConsolidateOpen] = React.useState(false)
  const [consolidateLoading, setConsolidateLoading] = React.useState(false)
  const [consolidateForm, setConsolidateForm] = React.useState({ destination: "", notes: "" })

  React.useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [availRes, consRes, statsRes] = await Promise.all([
        api.warehouse.list("?status=SHELVED"),
        api.warehouse.list("?status=CONSOLIDATED"),
        api.warehouse.stats(),
      ])
      setShipments(availRes.data || [])
      setConsolidated(consRes.data || [])
      setStats(statsRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load consolidation data")
    } finally {
      setLoading(false)
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleConsolidate() {
    if (selectedIds.length < 2) {
      toast.error("Select at least 2 shipments to consolidate")
      return
    }
    if (!consolidateForm.destination) {
      toast.error("Please enter a destination")
      return
    }
    setConsolidateLoading(true)
    try {
      await api.warehouse.consolidate({
        shipmentIds: selectedIds,
        destination: consolidateForm.destination,
        notes: consolidateForm.notes || undefined,
      })
      toast.success("Shipments consolidated successfully")
      setConsolidateOpen(false)
      setSelectedIds([])
      setConsolidateForm({ destination: "", notes: "" })
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to consolidate")
    } finally {
      setConsolidateLoading(false)
    }
  }

  async function handleRelease(shipment: any) {
    try {
      await api.warehouse.release({ shipmentId: shipment.id })
      toast.success("Shipment released for dispatch")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to release shipment")
    }
  }

  const filtered = shipments.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.trackingNumber?.toLowerCase().includes(q) ||
      s.toAddress?.city?.toLowerCase().includes(q)
  })

  const filteredConsolidated = consolidated.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.trackingNumber?.toLowerCase().includes(q) ||
      s.toAddress?.city?.toLowerCase().includes(q)
  })

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Warehouse", href: "/dashboard/warehouse" }, { label: "Consolidation" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Consolidation"
          description="Group shipments into consolidated loads for efficient dispatch"
          actions={
            <div className="flex gap-2">
              <Button onClick={() => setConsolidateOpen(true)} disabled={selectedIds.length < 2}>
                <HugeiconsIcon icon={ContainerIcon} className="size-4" />
                Consolidate ({selectedIds.length})
              </Button>
              <Button variant="outline" onClick={() => loadData()}>
                <HugeiconsIcon icon={LayersIcon} className="size-4" />
                Refresh
              </Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Available"
            value={formatNumber(shipments.length)}
            icon={Package02Icon}
            loading={loading}
            hint="Shelved & ready"
          />
          <MetricCard
            label="Consolidated"
            value={formatNumber(consolidated.length)}
            icon={ContainerIcon}
            loading={loading}
            hint="In consolidation"
          />
          <MetricCard
            label="Total in Warehouse"
            value={formatNumber(stats?.total ?? 0)}
            icon={LayersIcon}
            loading={loading}
            hint="All items"
          />
          <MetricCard
            label="Released"
            value={formatNumber(stats?.released ?? 0)}
            icon={SendIcon}
            loading={loading}
            hint="Sent for dispatch"
          />
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tracking #, destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Available Shipments */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Available for Consolidation</h3>
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground w-10"></th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Destination</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Weight</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Shelf/Bin</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Shelved</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <HugeiconsIcon icon={Package02Icon} className="mx-auto size-8 text-muted-foreground/40" />
                        <p className="mt-2 text-sm text-muted-foreground">No shipments available for consolidation</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr key={s.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(s.id)}
                            onChange={() => toggleSelect(s.id)}
                            className="size-4 rounded border-border"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{s.trackingNumber || s.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.toAddress?.city || "—"}</td>
                        <td className="px-4 py-3 tabular-nums">{s.actualWeightKg ? `${s.actualWeightKg} kg` : "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.shelfBin || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.shelvedAt ? formatDate(s.shelvedAt) : "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Consolidated Shipments */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Consolidated Loads</h3>
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Destination</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Weight</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Consolidated</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                      </tr>
                    ))
                  ) : filteredConsolidated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <HugeiconsIcon icon={ContainerIcon} className="mx-auto size-8 text-muted-foreground/40" />
                        <p className="mt-2 text-sm text-muted-foreground">No consolidated loads yet</p>
                      </td>
                    </tr>
                  ) : (
                    filteredConsolidated.map((s) => (
                      <tr key={s.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{s.trackingNumber || s.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.toAddress?.city || "—"}</td>
                        <td className="px-4 py-3 tabular-nums">{s.actualWeightKg ? `${s.actualWeightKg} kg` : "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{s.status?.replace(/_/g, " ").toLowerCase()}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{s.consolidatedAt ? formatDate(s.consolidatedAt) : "—"}</td>
                        <td className="px-4 py-3">
                          {s.status === "CONSOLIDATED" && (
                            <Button size="sm" variant="outline" onClick={() => handleRelease(s)}>
                              <HugeiconsIcon icon={SendIcon} className="size-3.5" />
                              Release
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
      </div>

      {/* Consolidate Sheet */}
      <Sheet open={consolidateOpen} onOpenChange={setConsolidateOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ContainerIcon} className="size-5 text-primary" />
              Consolidate Shipments
            </SheetTitle>
            <SheetDescription>{selectedIds.length} shipments selected for consolidation</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Destination <span className="text-destructive">*</span></Label>
              <Input value={consolidateForm.destination} onChange={(e) => setConsolidateForm(prev => ({ ...prev, destination: e.target.value }))} placeholder="e.g. Dar es Salaam" />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input value={consolidateForm.notes} onChange={(e) => setConsolidateForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Optional notes" />
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium mb-2">Selected Shipments ({selectedIds.length})</p>
              <div className="space-y-1">
                {selectedIds.map(id => {
                  const s = shipments.find(x => x.id === id)
                  return (
                    <div key={id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{s?.trackingNumber || id.slice(0, 8)}</span>
                      <span className="text-muted-foreground">{s?.actualWeightKg ? `${s.actualWeightKg} kg` : "—"}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <Button className="w-full" onClick={handleConsolidate} disabled={consolidateLoading}>
              {consolidateLoading ? "Consolidating..." : "Confirm Consolidation"}
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
