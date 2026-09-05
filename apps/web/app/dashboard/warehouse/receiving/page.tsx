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
import { HugeiconsIcon } from "@hugeicons/react"
import { PackageReceiveIcon, Package02Icon, ScaleIcon, Tag01Icon, Bookshelf01Icon, Search01Icon, ArrowRight01Icon, CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { formatNumber, formatDate } from "@/lib/format"
import { toast } from "sonner"

export default function WarehouseReceivingPage() {
  const [shipments, setShipments] = React.useState<any[]>([])
  const [stations, setStations] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [receiveOpen, setReceiveOpen] = React.useState(false)
  const [receiveLoading, setReceiveLoading] = React.useState(false)
  const [receiveForm, setReceiveForm] = React.useState({ stationId: "", shipmentId: "" })

  React.useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [listRes, statsRes, stRes] = await Promise.all([
        api.warehouse.list("?status=RECEIVED"),
        api.warehouse.stats(),
        api.stations.list("type=WAREHOUSE&isActive=true"),
      ])
      const rawShipments = listRes.data?.shipments || listRes.data
      setShipments(Array.isArray(rawShipments) ? rawShipments : [])
      setStats(statsRes.data)
      const rawStations = stRes.data?.stations || stRes.data
      setStations(Array.isArray(rawStations) ? rawStations : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load receiving data")
    } finally {
      setLoading(false)
    }
  }

  async function handleReceive() {
    if (!receiveForm.stationId || !receiveForm.shipmentId) {
      toast.error("Please fill in station and shipment ID")
      return
    }
    setReceiveLoading(true)
    try {
      await api.warehouse.receive(receiveForm.stationId, { shipmentId: receiveForm.shipmentId })
      toast.success("Shipment received at warehouse")
      setReceiveOpen(false)
      setReceiveForm({ stationId: "", shipmentId: "" })
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to receive shipment")
    } finally {
      setReceiveLoading(false)
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
      s.fromAddress?.city?.toLowerCase().includes(q) ||
      s.toAddress?.city?.toLowerCase().includes(q)
  })

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Warehouse", href: "/dashboard/warehouse" }, { label: "Receiving" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Receiving"
          description="Receive and process incoming shipments at the warehouse"
          actions={
            <div className="flex gap-2">
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
                      <Label>Station / Warehouse <span className="text-destructive">*</span></Label>
                      <Select value={receiveForm.stationId} onValueChange={(v) => setReceiveForm(prev => ({ ...prev, stationId: v ?? "" }))}>
                        <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                        <SelectContent>
                          {stations.map((st: any) => <SelectItem key={st.id} value={st.id}>{st.name} — {st.city}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Shipment ID / Tracking # <span className="text-destructive">*</span></Label>
                      <Input value={receiveForm.shipmentId} onChange={(e) => setReceiveForm(prev => ({ ...prev, shipmentId: e.target.value }))} placeholder="Enter shipment ID or tracking number" />
                    </div>
                    <Button className="w-full" onClick={handleReceive} disabled={receiveLoading}>
                      {receiveLoading ? "Receiving..." : "Confirm Receive"}
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <Button variant="outline" onClick={() => loadData()}>
                <HugeiconsIcon icon={PackageReceiveIcon} className="size-4" />
                Refresh
              </Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Received"
            value={formatNumber(shipments.length)}
            icon={PackageReceiveIcon}
            loading={loading}
            hint="Currently received"
          />
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
            icon={Clock01Icon}
            loading={loading}
            hint="Today's intake"
          />
          <MetricCard
            label="Processed"
            value={formatNumber(shipments.filter(s => s.status !== "RECEIVED").length)}
            icon={CheckmarkCircle02Icon}
            loading={loading}
            hint="Weighed & labeled"
          />
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tracking #, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Weight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Received</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-40" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={PackageReceiveIcon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No received shipments found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{s.trackingNumber || s.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.fromAddress?.city || "—"} → {s.toAddress?.city || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{s.actualWeightKg ? `${s.actualWeightKg} kg` : "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{s.status?.replace(/_/g, " ").toLowerCase()}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.receivedAt ? formatDate(s.receivedAt) : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
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
