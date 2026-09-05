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
  UserGroupIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  CallIcon,
  Globe02Icon,
  PlusIcon,
  Refresh01Icon,
  Mail01Icon,
  PhoneIcon,
  HandshakeIcon,
  Package02Icon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { formatNumber } from "@/lib/format"
import { toast } from "sonner"

const CARRIER_ICON: Record<string, any> = {
  XERIN: TruckIcon,
  PARTNER: HandshakeIcon,
  THIRD_PARTY: Package02Icon,
}

export default function CarriersPage() {
  const [carriers, setCarriers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("ALL")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<any | null>(null)
  const [form, setForm] = React.useState({ name: "", type: "PARTNER", email: "", phone: "", address: "", city: "", country: "Tanzania", licenseNo: "" })

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.carriers.list()
      setCarriers(result.data || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const filtered = carriers.filter((c) => {
    if (typeFilter !== "ALL" && c.type !== typeFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
  })

  const xerinCount = carriers.filter((c) => c.type === "XERIN").length
  const partnerCount = carriers.filter((c) => c.type === "PARTNER").length
  const totalDrivers = carriers.reduce((s, c) => s + (c._count?.drivers || 0), 0)
  const totalVehicles = carriers.reduce((s, c) => s + (c._count?.vehicles || 0), 0)

  const types = Array.from(new Set(carriers.map((c) => c.type).filter(Boolean)))
  const TYPE_FILTERS = [
    { value: "ALL", label: "All Carriers" },
    ...types.map((t) => ({ value: t, label: t?.replace(/_/g, " ").toLowerCase() })),
  ]

  async function handleAddCarrier(e: React.FormEvent) {
    e.preventDefault()
    try {
      const body: Record<string, any> = { name: form.name, type: form.type }
      if (form.email) body.email = form.email
      if (form.phone) body.phone = form.phone
      if (form.address) body.address = form.address
      if (form.city) body.city = form.city
      if (form.country) body.country = form.country
      if (form.licenseNo) body.licenseNo = form.licenseNo
      await api.carriers.create(body)
      toast.success("Carrier added successfully")
      setDialogOpen(false)
      setForm({ name: "", type: "PARTNER", email: "", phone: "", address: "", city: "", country: "Tanzania", licenseNo: "" })
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to add carrier")
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Fleet", href: "/dashboard/fleet" }, { label: "Carriers" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Carriers"
          icon={<HugeiconsIcon icon={HandshakeIcon} className="size-6 text-primary" />}
          description="Xerin and partner carriers — manage relationships, driver counts, and vehicle assignments."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={load}>
                <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                Add Carrier
              </Button>
            </div>
          }
        />

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Carriers" value={formatNumber(carriers.length)} icon={TruckIcon} hint="All registered" />
          <MetricCard label="Xerin Fleet" value={formatNumber(xerinCount)} icon={CheckmarkCircle02Icon} hint="In-house" />
          <MetricCard label="Total Drivers" value={formatNumber(totalDrivers)} icon={UserGroupIcon} hint="Across all carriers" />
          <MetricCard label="Total Vehicles" value={formatNumber(totalVehicles)} icon={TruckIcon} hint="Across all carriers" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
            <p className="mt-2 text-sm text-muted-foreground">No carriers found</p>
          </div>
        ) : (
          <>
            {/* Carrier Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, 12).map((c) => (
                <div key={c.id} className="cursor-pointer rounded-lg border bg-card p-4 transition-shadow hover:shadow-md" onClick={() => setSelected(c)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted/40">
                        <HugeiconsIcon icon={CARRIER_ICON[c.type] || Package02Icon} className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{c.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{c.email || "—"}</p>
                      </div>
                    </div>
                    <Badge variant={c.type === "XERIN" ? "default" : "secondary"} className="text-xs">
                      {c.type?.replace(/_/g, " ").toLowerCase() || "—"}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    {c.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{c.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Drivers</span>
                      <span className="font-medium tabular-nums">{c._count?.drivers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Vehicles</span>
                      <span className="font-medium tabular-nums">{c._count?.vehicles || 0}</span>
                    </div>
                    {c.isActive !== undefined && (
                      <div className="flex items-center justify-between border-t pt-1.5">
                        <span className="text-muted-foreground">Status</span>
                        <StatusBadge status={c.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                      </div>
                    )}
                  </div>

                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/30"
                    >
                      <HugeiconsIcon icon={CallIcon} className="size-3.5" />
                      Call Carrier
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Full Table */}
            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Carrier</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Phone</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Drivers</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Vehicles</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id} className="cursor-pointer transition-colors hover:bg-muted/20" onClick={() => setSelected(c)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={CARRIER_ICON[c.type] || Package02Icon} className="size-4 text-muted-foreground" />
                            <span className="font-medium">{c.name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={c.type === "XERIN" ? "default" : "secondary"} className="text-xs">
                            {c.type?.replace(/_/g, " ").toLowerCase() || "—"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.email || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.phone || "—"}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">{c._count?.drivers || 0}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">{c._count?.vehicles || 0}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.isActive === false ? "INACTIVE" : "ACTIVE"} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Carrier Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <HugeiconsIcon icon={CARRIER_ICON[selected.type] || Package02Icon} className="size-5 text-primary" />
                  </div>
                  {selected.name || "Carrier"}
                </SheetTitle>
                <SheetDescription>{selected.type?.replace(/_/g, " ").toLowerCase() || ""}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><HugeiconsIcon icon={Mail01Icon} className="size-3" /> Email</p>
                    <p className="mt-1 text-sm font-medium">{selected.email || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><HugeiconsIcon icon={PhoneIcon} className="size-3" /> Phone</p>
                    <p className="mt-1 text-sm font-medium">{selected.phone || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Drivers</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected._count?.drivers || 0}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Vehicles</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected._count?.vehicles || 0}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">City</p>
                    <p className="mt-1 text-sm font-medium">{selected.city || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Country</p>
                    <p className="mt-1 text-sm font-medium">{selected.country || "—"}</p>
                  </div>
                  {selected.licenseNo && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">License No</p>
                      <p className="mt-1 text-sm font-mono font-medium">{selected.licenseNo}</p>
                    </div>
                  )}
                  {selected.address && (
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="mt-1 text-sm font-medium">{selected.address}</p>
                    </div>
                  )}
                </div>

                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/30">
                    <HugeiconsIcon icon={CallIcon} className="size-4" />
                    Call Carrier
                  </a>
                )}

                <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Carrier Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Carrier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCarrier} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Carrier Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="XERIN">Xerin (In-house)</option>
                  <option value="PARTNER">Partner</option>
                  <option value="THIRD_PARTY">Third Party</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+255..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>License No</Label>
                <Input value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Add Carrier</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
