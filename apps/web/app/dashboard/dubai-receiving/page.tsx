"use client"

import * as React from "react"
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
  PackageAddIcon,
  InboxIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "RECEIVED_DUBAI", label: "Received Dubai" },
  { value: "AWAITING_CONSOLIDATION", label: "Awaiting Consolidation" },
  { value: "CONSOLIDATED", label: "Consolidated" },
  { value: "DEPARTED_DUBAI", label: "Departed Dubai" },
  { value: "ARRIVED_TANZANIA", label: "Arrived Tanzania" },
]

const LOCATION_OPTIONS = [
  { value: "ALL", label: "All Locations" },
  { value: "DUBAI_OFFICE", label: "Dubai Office" },
  { value: "DUBAI_WAREHOUSE", label: "Dubai Warehouse" },
]

const ITEM_TYPE_LABELS: Record<string, string> = {
  ELECTRONICS: "Electronics",
  GENERAL_CARGO: "General Cargo",
  ELI: "ELI",
  ONLINE_PARCEL: "Online Parcel",
  SPARE_PARTS: "Spare Parts",
  TV: "TV",
  COSMETICS: "Cosmetics",
  MIX_ITEMS: "Mix Items",
  OTHERS: "Others",
}

const EMPTY_FORM = {
  customerName: "",
  customerPhone: "",
  supplierId: "",
  supplierName: "",
  itemDescription: "",
  itemType: "GENERAL_CARGO",
  weightKg: "",
  piecesCount: "1",
  piecesUnit: "PARCEL",
  receivedLocation: "DUBAI_WAREHOUSE",
  deliveryOption: "",
  deliveryZoneId: "",
  remarks: "",
}

export default function DubaiReceivingPage() {
  const [shipments, setShipments] = React.useState<any[]>([])
  const [suppliers, setSuppliers] = React.useState<any[]>([])
  const [itemTypes, setItemTypes] = React.useState<string[]>([])
  const [deliveryOptions, setDeliveryOptions] = React.useState<any[]>([])
  const [zones, setZones] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [locationFilter, setLocationFilter] = React.useState("ALL")

  const [receiveOpen, setReceiveOpen] = React.useState(false)
  const [form, setForm] = React.useState({ ...EMPTY_FORM })
  const [receiving, setReceiving] = React.useState(false)

  React.useEffect(() => { loadConfig() }, [])
  React.useEffect(() => { loadShipments() }, [statusFilter, locationFilter])

  async function loadConfig() {
    try {
      const [supRes, typeRes, optRes, zoneRes] = await Promise.all([
        api.dubaiReceiving.suppliers(),
        api.dubaiReceiving.itemTypes(),
        api.deliveryConfig.options(),
        api.deliveryConfig.zones(),
      ])
      setSuppliers(Array.isArray(supRes.data) ? supRes.data : [])
      setItemTypes(Array.isArray(typeRes.data) ? typeRes.data : [])
      setDeliveryOptions(Array.isArray(optRes.data) ? optRes.data : [])
      setZones(Array.isArray(zoneRes.data) ? zoneRes.data : [])
    } catch {
      // config lists are best-effort; the form still works with free text
    }
  }

  async function loadShipments() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      if (locationFilter !== "ALL") params.set("receivedLocation", locationFilter)
      if (search) params.set("search", search)
      const res = await api.dubaiReceiving.list(params.toString())
      const raw = res.data?.shipments || res.data
      setShipments(Array.isArray(raw) ? raw : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load Dubai receiving records")
    } finally {
      setLoading(false)
    }
  }

  const stats = React.useMemo(() => {
    const today = new Date().toDateString()
    const receivedToday = shipments.filter((s) => new Date(s.createdAt).toDateString() === today).length
    const awaiting = shipments.filter((s) => ["RECEIVED_DUBAI", "AWAITING_CONSOLIDATION"].includes(s.status)).length
    const consolidated = shipments.filter((s) => s.status === "CONSOLIDATED").length
    const departed = shipments.filter((s) => s.status === "DEPARTED_DUBAI").length
    return { receivedToday, awaiting, consolidated, departed }
  }, [shipments])

  const filtered = React.useMemo(() => {
    if (!search) return shipments
    const q = search.toLowerCase()
    return shipments.filter((s) =>
      s.trackingNumber?.toLowerCase().includes(q) ||
      s.fromAddress?.fullName?.toLowerCase().includes(q) ||
      s.fromAddress?.phone?.includes(q)
    )
  }, [shipments, search])

  async function handleReceive() {
    if (!form.customerName.trim()) return toast.error("Customer name is required")
    if (!form.customerPhone.trim()) return toast.error("Customer phone is required")
    if (!form.itemDescription.trim()) return toast.error("Item description is required")
    if (!form.weightKg || Number(form.weightKg) <= 0) return toast.error("Enter a valid weight")
    if (!form.piecesCount || Number(form.piecesCount) <= 0) return toast.error("Enter valid pieces")

    setReceiving(true)
    try {
      const res = await api.dubaiReceiving.receive({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        supplierId: form.supplierId || undefined,
        supplierName: form.supplierName || undefined,
        itemDescription: form.itemDescription.trim(),
        itemType: form.itemType,
        weightKg: Number(form.weightKg),
        piecesCount: Number(form.piecesCount),
        piecesUnit: form.piecesUnit,
        receivedLocation: form.receivedLocation,
        deliveryOption: form.deliveryOption || undefined,
        deliveryZoneId: form.deliveryZoneId || undefined,
        remarks: form.remarks || undefined,
      })
      toast.success(res.message || "Parcel received")
      setReceiveOpen(false)
      setForm({ ...EMPTY_FORM })
      loadShipments()
    } catch (err: any) {
      toast.error(err.message || "Failed to receive parcel")
    } finally {
      setReceiving(false)
    }
  }

  const needsZone = form.deliveryOption && form.deliveryOption !== "COLLECT_AT_TAZARA_FREE"

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Dubai Receiving" }]}>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Dubai Receiving"
          description="Register parcels received at Dubai Office or Dubai Warehouse — auto tracking, supplier, item type"
          actions={
            <Button onClick={() => setReceiveOpen(true)}>
              <HugeiconsIcon icon={PlusIcon} className="size-4" />
              Receive Parcel
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Received Today" value={formatNumber(stats.receivedToday)} icon={InboxIcon} loading={loading} hint="New parcels today" />
          <MetricCard label="Awaiting Consolidation" value={formatNumber(stats.awaiting)} icon={PackageAddIcon} loading={loading} hint="Not yet in a box" />
          <MetricCard label="Consolidated" value={formatNumber(stats.consolidated)} icon={Package02Icon} loading={loading} hint="Inside a box" />
          <MetricCard label="Departed Dubai" value={formatNumber(stats.departed)} icon={Airplane01Icon} loading={loading} hint="On a flight" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tracking, customer, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadShipments()}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={(v) => setLocationFilter(v ?? "ALL")}>
            <SelectTrigger className="w-full sm:w-[190px]"><SelectValue placeholder="Filter by location" /></SelectTrigger>
            <SelectContent>
              {LOCATION_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadShipments} className="sm:ml-auto">
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
            Search
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Supplier</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Item Type</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Weight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Pieces</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Location</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Box</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Received</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3" colSpan={10}><Skeleton className="h-5 w-full" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Package02Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No parcels received yet</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s: any) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{s.trackingNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{s.fromAddress?.fullName || "—"}</div>
                        <div className="text-xs text-muted-foreground">{s.fromAddress?.phone || ""}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.supplier?.name || s.supplierName || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{ITEM_TYPE_LABELS[s.itemType] || s.itemType || "—"}</Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums">{s.actualWeightKg ? `${s.actualWeightKg} kg` : "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{s.piecesCount ? `${s.piecesCount} ${s.piecesUnit?.toLowerCase() || ""}` : "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.receivedLocation === "DUBAI_OFFICE" ? "Dubai Office" : s.receivedLocation === "DUBAI_WAREHOUSE" ? "Dubai Warehouse" : "—"}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{s.boxItems?.[0]?.box?.boxNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(s.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Receive Parcel Sheet */}
      <Sheet open={receiveOpen} onOpenChange={setReceiveOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PackageAddIcon} className="size-5 text-primary" />
              Receive Parcel in Dubai
            </SheetTitle>
            <SheetDescription>Register a parcel — the system issues a tracking number automatically</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Customer Name <span className="text-destructive">*</span></Label>
              <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="e.g. Zuhura Shabani" />
            </div>
            <div className="grid gap-2">
              <Label>Customer Phone <span className="text-destructive">*</span></Label>
              <Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="+255 7XX XXX XXX" />
            </div>
            <div className="grid gap-2">
              <Label>Supplier</Label>
              <Select value={form.supplierId} onValueChange={(v) => setForm({ ...form, supplierId: v ?? "", supplierName: "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier">
                    {(v: string) => suppliers.find((s: any) => s.id === v)?.name || v || "Select supplier"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {!form.supplierId && (
                <Input value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} placeholder="Or type supplier name" />
              )}
            </div>
            <div className="grid gap-2">
              <Label>Item Description <span className="text-destructive">*</span></Label>
              <Input value={form.itemDescription} onChange={(e) => setForm({ ...form, itemDescription: e.target.value })} placeholder="e.g. 3x phone cases, 1x charger" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Item Type <span className="text-destructive">*</span></Label>
                <Select value={form.itemType} onValueChange={(v) => setForm({ ...form, itemType: v ?? "GENERAL_CARGO" })}>
                  <SelectTrigger><SelectValue placeholder="Item type" /></SelectTrigger>
                  <SelectContent>
                    {itemTypes.map((t) => <SelectItem key={t} value={t}>{ITEM_TYPE_LABELS[t] || t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Weight (KG) <span className="text-destructive">*</span></Label>
                <Input type="number" min="0.01" step="0.01" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Pieces <span className="text-destructive">*</span></Label>
                <Input type="number" min="1" step="1" value={form.piecesCount} onChange={(e) => setForm({ ...form, piecesCount: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select value={form.piecesUnit} onValueChange={(v) => setForm({ ...form, piecesUnit: v ?? "PARCEL" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PARCEL">Parcel</SelectItem>
                    <SelectItem value="BOX">Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Received Location <span className="text-destructive">*</span></Label>
              <Select value={form.receivedLocation} onValueChange={(v) => setForm({ ...form, receivedLocation: v ?? "DUBAI_WAREHOUSE" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DUBAI_OFFICE">Dubai Office</SelectItem>
                  <SelectItem value="DUBAI_WAREHOUSE">Dubai Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Delivery Option</Label>
              <Select value={form.deliveryOption} onValueChange={(v) => setForm({ ...form, deliveryOption: v ?? "", deliveryZoneId: "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery option">
                    {(v: string) => deliveryOptions.find((o: any) => o.value === v)?.label || v || "Select delivery option"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {deliveryOptions.map((o: any) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {needsZone && (
              <div className="grid gap-2">
                <Label>Delivery Zone <span className="text-destructive">*</span></Label>
                <Select value={form.deliveryZoneId} onValueChange={(v) => setForm({ ...form, deliveryZoneId: v ?? "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone">
                      {(v: string) => {
                        const z = zones.find((x: any) => x.id === v)
                        return z ? `${z.name} — TSh ${formatNumber(Number(z.feeAmount))}` : v || "Select zone"
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z: any) => (
                      <SelectItem key={z.id} value={z.id}>{z.name} — TSh {formatNumber(Number(z.feeAmount))}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Remarks</Label>
              <Textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Optional notes" rows={2} />
            </div>
            <Button className="w-full" onClick={handleReceive} disabled={receiving}>
              {receiving ? "Receiving..." : "Receive & Generate Tracking"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
