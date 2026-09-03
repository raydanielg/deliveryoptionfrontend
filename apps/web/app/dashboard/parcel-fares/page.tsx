"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function ParcelFaresPage() {
  const [fares, setFares] = useState<any[]>([])
  const [fareWeights, setFareWeights] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [weights, setWeights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fareDialogOpen, setFareDialogOpen] = useState(false)
  const [fwDialogOpen, setFwDialogOpen] = useState(false)
  const [editingFare, setEditingFare] = useState<any>(null)
  const [editingFw, setEditingFw] = useState<any>(null)

  const [fareForm, setFareForm] = useState({
    baseFare: 0, returnFee: 0, cancellationFee: 0, baseFarePerKm: 0,
    cancellationFeePercent: 0, minCancellationFee: 0, isActive: true,
  })
  const [fwForm, setFwForm] = useState({
    parcelFareId: "", parcelWeightId: "", parcelCategoryId: "",
    baseFare: 0, returnFee: 0, cancellationFee: 0, farePerKm: 0,
  })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      const [faresRes, fwRes, catRes, wRes] = await Promise.all([
        api.parcelFares.list(),
        api.parcelFares.listFareWeights(),
        api.parcelCategories.list(),
        api.parcelWeights.list(),
      ])
      setFares(faresRes.data || [])
      setFareWeights(fwRes.data || [])
      setCategories(catRes.data || [])
      setWeights(wRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openCreateFare() {
    setEditingFare(null)
    setFareForm({ baseFare: 0, returnFee: 0, cancellationFee: 0, baseFarePerKm: 0, cancellationFeePercent: 0, minCancellationFee: 0, isActive: true })
    setFareDialogOpen(true)
  }

  function openEditFare(fare: any) {
    setEditingFare(fare)
    setFareForm({
      baseFare: fare.baseFare, returnFee: fare.returnFee, cancellationFee: fare.cancellationFee,
      baseFarePerKm: fare.baseFarePerKm, cancellationFeePercent: fare.cancellationFeePercent,
      minCancellationFee: fare.minCancellationFee, isActive: fare.isActive,
    })
    setFareDialogOpen(true)
  }

  async function handleFareSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingFare) {
        await api.parcelFares.update(editingFare.id, fareForm)
        toast.success("Fare updated")
      } else {
        await api.parcelFares.create(fareForm)
        toast.success("Fare created")
      }
      setFareDialogOpen(false)
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to save fare")
    }
  }

  async function deleteFare(id: string) {
    if (!confirm("Delete this fare?")) return
    try {
      await api.parcelFares.delete(id)
      toast.success("Fare deleted")
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  function openCreateFw() {
    setEditingFw(null)
    setFwForm({ parcelFareId: fares[0]?.id || "", parcelWeightId: "", parcelCategoryId: "", baseFare: 0, returnFee: 0, cancellationFee: 0, farePerKm: 0 })
    setFwDialogOpen(true)
  }

  function openEditFw(fw: any) {
    setEditingFw(fw)
    setFwForm({
      parcelFareId: fw.parcelFareId, parcelWeightId: fw.parcelWeightId,
      parcelCategoryId: fw.parcelCategoryId || "", baseFare: fw.baseFare,
      returnFee: fw.returnFee, cancellationFee: fw.cancellationFee, farePerKm: fw.farePerKm,
    })
    setFwDialogOpen(true)
  }

  async function handleFwSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data = { ...fwForm, parcelCategoryId: fwForm.parcelCategoryId || undefined }
      if (editingFw) {
        await api.parcelFares.updateFareWeight(editingFw.id, data)
        toast.success("Fare weight updated")
      } else {
        await api.parcelFares.createFareWeight(data)
        toast.success("Fare weight created")
      }
      setFwDialogOpen(false)
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to save fare weight")
    }
  }

  async function deleteFw(id: string) {
    if (!confirm("Delete this fare weight?")) return
    try {
      await api.parcelFares.deleteFareWeight(id)
      toast.success("Fare weight deleted")
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Parcel Fares" },
    ]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Parcel Fares</h1>
        <p className="text-sm text-muted-foreground">Manage base fares, weight-based pricing, and cancellation fees</p>
      </div>

      <Tabs defaultValue="fares">
        <TabsList>
          <TabsTrigger value="fares">Base Fares</TabsTrigger>
          <TabsTrigger value="fare-weights">Fare Weights</TabsTrigger>
        </TabsList>

        <TabsContent value="fares" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateFare}>Add Fare</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Base Fare</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Per Km</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Return Fee</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Cancel Fee</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Cancel %</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-b last:border-0">
                          {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>)}
                        </tr>
                      ))
                    ) : fares.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No fares found</td></tr>
                    ) : (
                      fares.map((f) => (
                        <tr key={f.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{Number(f.baseFare).toLocaleString()}</td>
                          <td className="px-4 py-3">{Number(f.baseFarePerKm).toLocaleString()}</td>
                          <td className="px-4 py-3">{Number(f.returnFee).toLocaleString()}</td>
                          <td className="px-4 py-3">{Number(f.cancellationFee).toLocaleString()}</td>
                          <td className="px-4 py-3">{f.cancellationFeePercent}%</td>
                          <td className="px-4 py-3"><Badge variant={f.isActive ? "default" : "secondary"}>{f.isActive ? "Active" : "Inactive"}</Badge></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditFare(f)}>Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteFare(f.id)}>Delete</Button>
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
        </TabsContent>

        <TabsContent value="fare-weights" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateFw}>Add Fare Weight</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Category</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Weight Range</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Base Fare</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Per Km</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Return Fee</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Cancel Fee</th>
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
                    ) : fareWeights.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No fare weights found</td></tr>
                    ) : (
                      fareWeights.map((fw) => (
                        <tr key={fw.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="px-4 py-3">{fw.parcelCategory?.name || "—"}</td>
                          <td className="px-4 py-3">{fw.parcelWeight ? `${fw.parcelWeight.minWeight} - ${fw.parcelWeight.maxWeight} kg` : "—"}</td>
                          <td className="px-4 py-3 font-medium">{Number(fw.baseFare).toLocaleString()}</td>
                          <td className="px-4 py-3">{Number(fw.farePerKm).toLocaleString()}</td>
                          <td className="px-4 py-3">{Number(fw.returnFee).toLocaleString()}</td>
                          <td className="px-4 py-3">{Number(fw.cancellationFee).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditFw(fw)}>Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteFw(fw.id)}>Delete</Button>
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
        </TabsContent>
      </Tabs>

      {/* Fare Dialog */}
      <Dialog open={fareDialogOpen} onOpenChange={setFareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFare ? "Edit Fare" : "Add Parcel Fare"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFareSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Base Fare</Label>
                <Input type="number" step="0.01" value={fareForm.baseFare} onChange={(e) => setFareForm({ ...fareForm, baseFare: parseFloat(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Per Km</Label>
                <Input type="number" step="0.01" value={fareForm.baseFarePerKm} onChange={(e) => setFareForm({ ...fareForm, baseFarePerKm: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Return Fee</Label>
                <Input type="number" step="0.01" value={fareForm.returnFee} onChange={(e) => setFareForm({ ...fareForm, returnFee: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Cancellation Fee</Label>
                <Input type="number" step="0.01" value={fareForm.cancellationFee} onChange={(e) => setFareForm({ ...fareForm, cancellationFee: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Cancellation %</Label>
                <Input type="number" step="0.01" value={fareForm.cancellationFeePercent} onChange={(e) => setFareForm({ ...fareForm, cancellationFeePercent: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Min Cancel Fee</Label>
                <Input type="number" step="0.01" value={fareForm.minCancellationFee} onChange={(e) => setFareForm({ ...fareForm, minCancellationFee: parseFloat(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={fareForm.isActive} onCheckedChange={(v) => setFareForm({ ...fareForm, isActive: v })} />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setFareDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingFare ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fare Weight Dialog */}
      <Dialog open={fwDialogOpen} onOpenChange={setFwDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFw ? "Edit Fare Weight" : "Add Fare Weight"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFwSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Fare</Label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={fwForm.parcelFareId} onChange={(e) => setFwForm({ ...fwForm, parcelFareId: e.target.value })} required>
                <option value="">Select fare</option>
                {fares.map((f) => <option key={f.id} value={f.id}>Fare {f.id.slice(-6)}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight Tier</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={fwForm.parcelWeightId} onChange={(e) => setFwForm({ ...fwForm, parcelWeightId: e.target.value })} required>
                  <option value="">Select weight</option>
                  {weights.map((w) => <option key={w.id} value={w.id}>{w.minWeight} - {w.maxWeight} kg</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={fwForm.parcelCategoryId} onChange={(e) => setFwForm({ ...fwForm, parcelCategoryId: e.target.value })}>
                  <option value="">Any category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Base Fare</Label>
                <Input type="number" step="0.01" value={fwForm.baseFare} onChange={(e) => setFwForm({ ...fwForm, baseFare: parseFloat(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Per Km</Label>
                <Input type="number" step="0.01" value={fwForm.farePerKm} onChange={(e) => setFwForm({ ...fwForm, farePerKm: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Return Fee</Label>
                <Input type="number" step="0.01" value={fwForm.returnFee} onChange={(e) => setFwForm({ ...fwForm, returnFee: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Cancel Fee</Label>
                <Input type="number" step="0.01" value={fwForm.cancellationFee} onChange={(e) => setFwForm({ ...fwForm, cancellationFee: parseFloat(e.target.value) })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setFwDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingFw ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
