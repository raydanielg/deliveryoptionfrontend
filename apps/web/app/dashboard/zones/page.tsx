"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function ZonesPage() {
  const [zones, setZones] = useState<any[]>([])
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    name: "", code: "", countryId: "", regionId: "", cityId: "", isActive: true,
  })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      const [zonesRes, geoRes] = await Promise.all([
        api.zones.list(),
        api.geography.listCountries().catch(() => ({ data: [] })),
      ])
      setZones(zonesRes.data || [])
      setCountries(geoRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: "", code: "", countryId: countries[0]?.id || "", regionId: "", cityId: "", isActive: true })
    setDialogOpen(true)
  }

  function openEdit(zone: any) {
    setEditing(zone)
    setForm({
      name: zone.name, code: zone.code || "",
      countryId: zone.countryId, regionId: zone.regionId || "", cityId: zone.cityId || "",
      isActive: zone.isActive,
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data: any = { name: form.name, isActive: form.isActive }
      if (form.code) data.code = form.code
      if (form.countryId) data.countryId = form.countryId
      if (form.regionId) data.regionId = form.regionId
      if (form.cityId) data.cityId = form.cityId
      if (editing) {
        await api.zones.update(editing.id, data)
        toast.success("Zone updated")
      } else {
        await api.zones.create(data)
        toast.success("Zone created")
      }
      setDialogOpen(false)
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to save zone")
    }
  }

  async function toggleZone(id: string) {
    try {
      await api.zones.toggle(id)
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle")
    }
  }

  async function deleteZone(id: string) {
    if (!confirm("Delete this zone?")) return
    try {
      await api.zones.delete(id)
      toast.success("Zone deleted")
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Zones" },
    ]}>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Zones</h1>
          <p className="text-sm text-muted-foreground">Manage delivery zones by country, region, and city</p>
        </div>
        <Button onClick={openCreate}>Add Zone</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Code</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Country</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Region</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">City</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Pricing Rules</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>)}
                    </tr>
                  ))
                ) : zones.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No zones found</td></tr>
                ) : (
                  zones.map((z) => (
                    <tr key={z.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{z.name}</td>
                      <td className="px-4 py-3">{z.code || "—"}</td>
                      <td className="px-4 py-3">{z.country?.name || "—"}</td>
                      <td className="px-4 py-3">{z.region?.name || "—"}</td>
                      <td className="px-4 py-3">{z.city?.name || "—"}</td>
                      <td className="px-4 py-3">{z._count?.pricingRules || 0}</td>
                      <td className="px-4 py-3"><Switch checked={z.isActive} onCheckedChange={() => toggleZone(z.id)} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(z)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteZone(z.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Zone" : "Add Zone"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dar es Salaam Central" required />
            </div>
            <div className="space-y-2">
              <Label>Code (optional)</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. DSM-01" />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.countryId} onChange={(e) => setForm({ ...form, countryId: e.target.value })} required>
                <option value="">Select country</option>
                {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Region ID (optional)</Label>
                <Input value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value })} placeholder="Region ID" />
              </div>
              <div className="space-y-2">
                <Label>City ID (optional)</Label>
                <Input value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })} placeholder="City ID" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
