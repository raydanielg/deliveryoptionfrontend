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
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function ParcelCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: "", description: "", image: "", isActive: true })

  useEffect(() => { loadCategories() }, [])

  async function loadCategories() {
    try {
      const result = await api.parcelCategories.list()
      setCategories(result.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: "", description: "", image: "", isActive: true })
    setDialogOpen(true)
  }

  function openEdit(cat: any) {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description || "", image: cat.image || "", isActive: cat.isActive })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editing) {
        await api.parcelCategories.update(editing.id, form)
        toast.success("Category updated")
      } else {
        await api.parcelCategories.create(form)
        toast.success("Category created")
      }
      setDialogOpen(false)
      loadCategories()
    } catch (err: any) {
      toast.error(err.message || "Failed to save category")
    }
  }

  async function toggleCategory(id: string) {
    try {
      await api.parcelCategories.toggle(id)
      loadCategories()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle")
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category?")) return
    try {
      await api.parcelCategories.delete(id)
      toast.success("Category deleted")
      loadCategories()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Parcel Categories" },
    ]}>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parcel Categories</h1>
          <p className="text-sm text-muted-foreground">Manage parcel types and categories</p>
        </div>
        <Button onClick={openCreate}>Add Category</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))
        ) : categories.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              No parcel categories found. Click &quot;Add Category&quot; to create one.
            </CardContent>
          </Card>
        ) : (
          categories.map((cat) => (
            <Card key={cat.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                        {cat.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{cat.name}</h3>
                      <Badge variant={cat.isActive ? "default" : "secondary"} className="mt-1">
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <Switch checked={cat.isActive} onCheckedChange={() => toggleCategory(cat.id)} />
                </div>
                {cat.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span>{cat._count?.shipments || 0} shipments</span>
                  <span>·</span>
                  <span>{cat._count?.fareWeights || 0} fare rules</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => openEdit(cat)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteCategory(cat.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Parcel Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
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
