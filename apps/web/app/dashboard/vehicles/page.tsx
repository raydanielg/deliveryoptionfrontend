"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  TruckIcon,
  Search01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  AlertCircleIcon,
  CancelCircleIcon,
  PlusIcon,
  Refresh01Icon,
  IdCardIcon,
  BikeIcon,
  VanIcon,
  Car01Icon,
  PickupIcon,
  PackageIcon,
  ContainerIcon,
  BicycleIcon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { formatNumber } from "@/lib/format"
import { toast } from "sonner"

const VEHICLE_ICON: Record<string, any> = {
  MOTORCYCLE: BikeIcon,
  BICYCLE: BicycleIcon,
  VAN: VanIcon,
  TRUCK: TruckIcon,
  CAR: Car01Icon,
  PICKUP: PickupIcon,
  TRAILER: PackageIcon,
  CONTAINER: ContainerIcon,
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = React.useState<any[]>([])
  const [carriers, setCarriers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("ALL")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<any | null>(null)
  const [form, setForm] = React.useState({ carrierId: "", registrationNo: "", type: "MOTORCYCLE", capacityKg: "", make: "", model: "", year: "" })

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const [vehiclesRes, carriersRes] = await Promise.all([
        api.vehicles.list(),
        api.carriers.list(),
      ])
      setVehicles(vehiclesRes.data || [])
      setCarriers(carriersRes.data || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const filtered = vehicles.filter((v) => {
    if (typeFilter !== "ALL" && v.type !== typeFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return v.registrationNo?.toLowerCase().includes(q) ||
      v.model?.toLowerCase().includes(q) ||
      v.carrier?.name?.toLowerCase().includes(q)
  })

  const active = vehicles.filter((v) => v.status === "ACTIVE").length
  const maintenance = vehicles.filter((v) => v.status === "MAINTENANCE").length
  const inactive = vehicles.filter((v) => v.status === "INACTIVE").length
  const totalCapacity = vehicles.reduce((s, v) => s + Number(v.capacityKg || 0), 0)

  const types = Array.from(new Set(vehicles.map((v) => v.type).filter(Boolean)))
  const TYPE_FILTERS = [
    { value: "ALL", label: "All Types" },
    ...types.map((t) => ({ value: t, label: t?.replace(/_/g, " ").toLowerCase() })),
  ]

  async function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault()
    try {
      const body: Record<string, any> = {
        carrierId: form.carrierId,
        registrationNo: form.registrationNo,
        type: form.type,
        capacityKg: Number(form.capacityKg) || 0,
      }
      if (form.make) body.make = form.make
      if (form.model) body.model = form.model
      if (form.year) body.year = Number(form.year)
      await api.vehicles.create(body)
      toast.success("Vehicle added successfully")
      setDialogOpen(false)
      setForm({ carrierId: "", registrationNo: "", type: "MOTORCYCLE", capacityKg: "", make: "", model: "", year: "" })
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to add vehicle")
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await api.vehicles.updateStatus(id, { status })
      toast.success(`Vehicle status updated to ${status}`)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Fleet", href: "/dashboard/fleet" }, { label: "Vehicles" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Vehicles"
          icon={<HugeiconsIcon icon={TruckIcon} className="size-6 text-primary" />}
          description="Fleet vehicle management — registration, capacity, carrier assignments, and status."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={load}>
                <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                Add Vehicle
              </Button>
            </div>
          }
        />

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Vehicles" value={formatNumber(vehicles.length)} icon={TruckIcon} hint="All registered" />
          <MetricCard label="Active" value={formatNumber(active)} icon={CheckmarkCircle02Icon} hint="On the road" />
          <MetricCard label="Maintenance" value={formatNumber(maintenance)} icon={Clock01Icon} positiveIsGood={false} hint="Being serviced" />
          <MetricCard label="Total Capacity" value={`${formatNumber(totalCapacity)} kg`} icon={TruckIcon} hint="Combined fleet" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search registration, model, carrier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  typeFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="mt-3 h-16 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No vehicles found</p>
          </div>
        ) : (
          <>
            {/* Vehicle Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, 12).map((v) => (
                <div key={v.id} className="cursor-pointer rounded-lg border bg-card p-4 transition-shadow hover:shadow-md" onClick={() => setSelected(v)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted/40">
                        <HugeiconsIcon icon={VEHICLE_ICON[v.type] || Car01Icon} className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{v.registrationNo || "—"}</p>
                        <p className="text-xs text-muted-foreground">{v.model || v.type?.replace(/_/g, " ").toLowerCase() || "—"}</p>
                      </div>
                    </div>
                    <StatusBadge status={v.status || "INACTIVE"} size="sm" />
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium">{v.type?.replace(/_/g, " ").toLowerCase() || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium tabular-nums">{formatNumber(v.capacityKg || 0)} kg</span>
                    </div>
                    {v.carrier && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Carrier</span>
                        <span className="font-medium">{v.carrier.name}</span>
                      </div>
                    )}
                    {v.driver && (
                      <div className="flex items-center justify-between border-t pt-1.5">
                        <span className="text-muted-foreground">Driver</span>
                        <span className="font-medium">{v.driver.user?.name || v.driver.name || "—"}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Full Table */}
            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Registration</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Model</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Carrier</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Driver</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Capacity</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((v) => (
                      <tr key={v.id} className="cursor-pointer transition-colors hover:bg-muted/20" onClick={() => setSelected(v)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={VEHICLE_ICON[v.type] || Car01Icon} className="size-4 text-muted-foreground" />
                            <span className="font-medium">{v.registrationNo || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{v.type?.replace(/_/g, " ").toLowerCase() || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.model || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.carrier?.name || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.driver?.user?.name || v.driver?.name || "—"}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">{formatNumber(v.capacityKg || 0)} kg</td>
                        <td className="px-4 py-3"><StatusBadge status={v.status || "INACTIVE"} size="sm" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Vehicle Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <HugeiconsIcon icon={VEHICLE_ICON[selected.type] || Car01Icon} className="size-5 text-primary" />
                  </div>
                  {selected.registrationNo || "Vehicle"}
                </SheetTitle>
                <SheetDescription>{selected.model || selected.type?.replace(/_/g, " ").toLowerCase() || ""}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    value={selected.status || "ACTIVE"}
                    onChange={(e) => {
                      handleStatusChange(selected.id, e.target.value)
                      setSelected({ ...selected, status: e.target.value })
                    }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="mt-1 text-sm font-medium">{selected.type?.replace(/_/g, " ").toLowerCase() || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{formatNumber(selected.capacityKg || 0)} kg</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Carrier</p>
                    <p className="mt-1 text-sm font-medium">{selected.carrier?.name || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Make / Model</p>
                    <p className="mt-1 text-sm font-medium">{[selected.make, selected.model].filter(Boolean).join(" ") || "—"}</p>
                  </div>
                  {selected.year && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Year</p>
                      <p className="mt-1 text-sm font-medium tabular-nums">{selected.year}</p>
                    </div>
                  )}
                  {selected.driver && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Driver</p>
                      <p className="mt-1 text-sm font-medium">{selected.driver.user?.name || selected.driver.name || "—"}</p>
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Vehicle Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Carrier *</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.carrierId} onChange={(e) => setForm({ ...form, carrierId: e.target.value })} required>
                  <option value="">Select carrier...</option>
                  {carriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Registration No *</Label>
                <Input value={form.registrationNo} onChange={(e) => setForm({ ...form, registrationNo: e.target.value.toUpperCase() })} placeholder="T123 ABC" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle Type *</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="MOTORCYCLE">Motorcycle</option>
                  <option value="BICYCLE">Bicycle</option>
                  <option value="CAR">Car</option>
                  <option value="VAN">Van</option>
                  <option value="PICKUP">Pickup</option>
                  <option value="TRUCK">Truck</option>
                  <option value="TRAILER">Trailer</option>
                  <option value="CONTAINER">Container</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Capacity (KG) *</Label>
                <Input type="number" value={form.capacityKg} onChange={(e) => setForm({ ...form, capacityKg: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Make</Label>
                <Input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Toyota" />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Hilux" />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Add Vehicle</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
