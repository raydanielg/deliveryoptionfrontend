"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Store02Icon,
  PlusIcon,
  Search01Icon,
  CheckmarkCircle02Icon,
  Package02Icon,
  TruckIcon,
} from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { formatNumber } from "@/lib/format"
import { toast } from "sonner"

const TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "SGR_STATION", label: "SGR Station" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "HUB", label: "Hub" },
  { value: "DROP_POINT", label: "Drop Point" },
  { value: "AIRPORT_CARGO", label: "Airport Cargo" },
]

export default function StationsPage() {
  const router = useRouter()
  const [stations, setStations] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("ALL")
  const [form, setForm] = React.useState({
    name: "", code: "", type: "SGR_STATION", city: "", region: "",
    country: "Tanzania", address: "", phone: "", email: "",
    managerName: "", capacityKg: "",
  })

  React.useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [stationsRes, statsRes] = await Promise.all([
        api.stations.list(),
        api.stations.stats(),
      ])
      setStations(stationsRes.data || [])
      setStats(statsRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load stations")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      const body: Record<string, any> = { ...form }
      if (body.capacityKg) body.capacityKg = Number(body.capacityKg)
      await api.stations.create(body)
      toast.success("Station created successfully")
      setShowForm(false)
      setForm({ name: "", code: "", type: "SGR_STATION", city: "", region: "", country: "Tanzania", address: "", phone: "", email: "", managerName: "", capacityKg: "" })
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to create station")
    }
  }

  async function handleToggle(id: string) {
    try {
      await api.stations.toggle(id)
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle station")
    }
  }

  const filtered = stations.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.name?.toLowerCase().includes(q) ||
      s.code?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q)
  }).filter(s => typeFilter === "ALL" || s.type === typeFilter)

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Stations" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Stations"
          description="SGR stations, warehouses, hubs & drop points"
          actions={
            <Button onClick={() => setShowForm(!showForm)}>
              <HugeiconsIcon icon={PlusIcon} className="size-4" />
              New Station
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Stations"
            value={formatNumber(stats?.total ?? 0)}
            icon={Store02Icon}
            loading={loading}
            hint="All stations"
          />
          <MetricCard
            label="Active"
            value={formatNumber(stats?.active ?? 0)}
            icon={CheckmarkCircle02Icon}
            loading={loading}
            hint="Currently active"
          />
          <MetricCard
            label="In Inventory"
            value={formatNumber(stats?.totalInventory ?? 0)}
            icon={Package02Icon}
            loading={loading}
            hint="Items in inventory"
          />
          <MetricCard
            label="Dispatched"
            value={formatNumber(stats?.totalDispatched ?? 0)}
            icon={TruckIcon}
            loading={loading}
            hint="Items dispatched"
          />
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-lg border p-5">
            <h2 className="text-base font-semibold tracking-tight">Create New Station</h2>
            <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div><label className="text-sm font-medium">Name *</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="text-sm font-medium">Code *</label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="DAR" required /></div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="SGR_STATION">SGR Station</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="HUB">Hub</option>
                  <option value="DROP_POINT">Drop Point</option>
                  <option value="AIRPORT_CARGO">Airport Cargo</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">City</label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Region</label><Input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Country</label><Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Address</label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Manager Name</label><Input value={form.managerName} onChange={e => setForm({ ...form, managerName: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Capacity (KG)</label><Input type="number" value={form.capacityKg} onChange={e => setForm({ ...form, capacityKg: e.target.value })} /></div>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
                <Button type="submit">Create Station</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, code, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "ALL")}>
            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by type" /></SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Code</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Location</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Manager</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Inventory</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Capacity</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="transition-colors hover:bg-muted/20">
                      {Array.from({ length: 9 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>)}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Store02Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No stations found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => router.push(`/dashboard/stations/${s.id}`)}
                    >
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{s.code}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{s.type.replace(/_/g, " ").toLowerCase()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{[s.city, s.region, s.country].filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.managerName || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{s._count?.inventory || 0}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.capacityKg ? `${Number(s.capacityKg).toLocaleString()} kg` : "—"}</td>
                      <td className="px-4 py-3"><Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge></td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleToggle(s.id) }}>
                          {s.isActive ? "Deactivate" : "Activate"}
                        </Button>
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
