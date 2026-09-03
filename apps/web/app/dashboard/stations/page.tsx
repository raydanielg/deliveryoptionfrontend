"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Store02Icon, PlusIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export default function StationsPage() {
  const router = useRouter()
  const [stations, setStations] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: "", code: "", type: "SGR_STATION", city: "", region: "",
    country: "Tanzania", address: "", phone: "", email: "",
    managerName: "", capacityKg: "",
  })

  useEffect(() => { loadData() }, [])

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

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Operations", href: "/dashboard/operations" }, { label: "Stations" }]}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stations</h1>
          <p className="text-sm text-muted-foreground">SGR stations, warehouses, hubs & drop points</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <HugeiconsIcon icon={PlusIcon} className="size-4 mr-2" />
          New Station
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Stations</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold">{stats.active}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">In Inventory</p><p className="text-2xl font-bold">{stats.totalInventory}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Dispatched</p><p className="text-2xl font-bold">{stats.totalDispatched}</p></CardContent></Card>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create New Station</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
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
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 9 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>)}
                    </tr>
                  ))
                ) : stations.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                    <HugeiconsIcon icon={Store02Icon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
                    No stations found
                  </td></tr>
                ) : (
                  stations.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/dashboard/stations/${s.id}`)}>
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{s.code}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{s.type.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-muted-foreground">{[s.city, s.region, s.country].filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.managerName || "—"}</td>
                      <td className="px-4 py-3">{s._count?.inventory || 0}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.capacityKg ? `${Number(s.capacityKg).toLocaleString()} kg` : "—"}</td>
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
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
