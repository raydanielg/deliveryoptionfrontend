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

export default function SurgePricingPage() {
  const [surges, setSurges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    name: "", surgePercentage: 0, isActive: true,
    startDate: "", endDate: "",
  })

  useEffect(() => { loadSurges() }, [])

  async function loadSurges() {
    try {
      const result = await api.surgePricing.list()
      setSurges(result.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: "", surgePercentage: 0, isActive: true, startDate: "", endDate: "" })
    setDialogOpen(true)
  }

  function openEdit(s: any) {
    setEditing(s)
    setForm({
      name: s.name, surgePercentage: s.surgePercentage, isActive: s.isActive,
      startDate: s.startDate ? new Date(s.startDate).toISOString().slice(0, 16) : "",
      endDate: s.endDate ? new Date(s.endDate).toISOString().slice(0, 16) : "",
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data: any = {
        name: form.name,
        surgePercentage: form.surgePercentage,
        isActive: form.isActive,
        startDate: new Date(form.startDate).toISOString(),
      }
      if (form.endDate) data.endDate = new Date(form.endDate).toISOString()
      if (editing) {
        await api.surgePricing.update(editing.id, data)
        toast.success("Surge pricing updated")
      } else {
        await api.surgePricing.create(data)
        toast.success("Surge pricing created")
      }
      setDialogOpen(false)
      loadSurges()
    } catch (err: any) {
      toast.error(err.message || "Failed to save")
    }
  }

  async function toggleSurge(id: string) {
    try {
      await api.surgePricing.toggle(id)
      loadSurges()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle")
    }
  }

  async function deleteSurge(id: string) {
    if (!confirm("Delete this surge pricing?")) return
    try {
      await api.surgePricing.delete(id)
      toast.success("Surge pricing deleted")
      loadSurges()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Surge Pricing" },
    ]}>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Surge Pricing</h1>
          <p className="text-sm text-muted-foreground">Manage time-based surge pricing for peak hours</p>
        </div>
        <Button onClick={openCreate}>Add Surge</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Surge %</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Start Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">End Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Time Slots</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>)}
                    </tr>
                  ))
                ) : surges.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No surge pricing rules found</td></tr>
                ) : (
                  surges.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3"><Badge variant="default">{s.surgePercentage}%</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{s.startDate ? new Date(s.startDate).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.endDate ? new Date(s.endDate).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.timeSlots?.length || 0}</td>
                      <td className="px-4 py-3"><Switch checked={s.isActive} onCheckedChange={() => toggleSurge(s.id)} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteSurge(s.id)}>Delete</Button>
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
            <DialogTitle>{editing ? "Edit Surge Pricing" : "Add Surge Pricing"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Peak Hours Surge" required />
            </div>
            <div className="space-y-2">
              <Label>Surge Percentage (%)</Label>
              <Input type="number" step="0.01" min="0" max="500" value={form.surgePercentage} onChange={(e) => setForm({ ...form, surgePercentage: parseFloat(e.target.value) })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>End Date (optional)</Label>
                <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
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
