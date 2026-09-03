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

export default function ParcelWeightsPage() {
  const [weights, setWeights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ minWeight: 0, maxWeight: 0, isActive: true })

  useEffect(() => { loadWeights() }, [])

  async function loadWeights() {
    try {
      const result = await api.parcelWeights.list()
      setWeights(result.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ minWeight: 0, maxWeight: 0, isActive: true })
    setDialogOpen(true)
  }

  function openEdit(w: any) {
    setEditing(w)
    setForm({ minWeight: w.minWeight, maxWeight: w.maxWeight, isActive: w.isActive })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editing) {
        await api.parcelWeights.update(editing.id, form)
        toast.success("Weight tier updated")
      } else {
        await api.parcelWeights.create(form)
        toast.success("Weight tier created")
      }
      setDialogOpen(false)
      loadWeights()
    } catch (err: any) {
      toast.error(err.message || "Failed to save")
    }
  }

  async function toggleWeight(id: string) {
    try {
      await api.parcelWeights.toggle(id)
      loadWeights()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle")
    }
  }

  async function deleteWeight(id: string) {
    if (!confirm("Delete this weight tier?")) return
    try {
      await api.parcelWeights.delete(id)
      toast.success("Weight tier deleted")
      loadWeights()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Parcel Weights" },
    ]}>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parcel Weight Tiers</h1>
          <p className="text-sm text-muted-foreground">Manage weight ranges for parcel fare calculation</p>
        </div>
        <Button onClick={openCreate}>Add Weight Tier</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Min Weight (kg)</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Max Weight (kg)</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Fare Rules</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>)}
                    </tr>
                  ))
                ) : weights.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No weight tiers found
                  </td></tr>
                ) : (
                  weights.map((w) => (
                    <tr key={w.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{w.minWeight}</td>
                      <td className="px-4 py-3 font-medium">{w.maxWeight}</td>
                      <td className="px-4 py-3 text-muted-foreground">{w._count?.fareWeights || 0}</td>
                      <td className="px-4 py-3">
                        <Switch checked={w.isActive} onCheckedChange={() => toggleWeight(w.id)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(w)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteWeight(w.id)}>Delete</Button>
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
            <DialogTitle>{editing ? "Edit Weight Tier" : "Add Weight Tier"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minWeight">Min Weight (kg)</Label>
                <Input id="minWeight" type="number" step="0.01" value={form.minWeight} onChange={(e) => setForm({ ...form, minWeight: parseFloat(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWeight">Max Weight (kg)</Label>
                <Input id="maxWeight" type="number" step="0.01" value={form.maxWeight} onChange={(e) => setForm({ ...form, maxWeight: parseFloat(e.target.value) })} required />
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
