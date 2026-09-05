"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusIcon, Package02Icon, PencilEdit02Icon, Delete02Icon, Search01Icon } from "@hugeicons/core-free-icons"

export default function ParcelCategoriesPage() {
  const [categories, setCategories] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any>(null)
  const [form, setForm] = React.useState({ name: "", description: "", image: "", isActive: true })
  const [search, setSearch] = React.useState("")

  React.useEffect(() => { loadCategories() }, [])

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
    setSheetOpen(true)
  }

  function openEdit(cat: any) {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description || "", image: cat.image || "", isActive: cat.isActive })
    setSheetOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = {
        name: form.name,
        ...(form.description ? { description: form.description } : {}),
        ...(form.image ? { image: form.image } : {}),
        isActive: form.isActive,
      }
      if (editing) {
        await api.parcelCategories.update(editing.id, payload)
        toast.success("Category updated")
      } else {
        await api.parcelCategories.create(payload)
        toast.success("Category created")
      }
      setSheetOpen(false)
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
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Parcel Categories"
          description="Manage parcel types and categories"
          actions={
            <Button onClick={openCreate}>
              <HugeiconsIcon icon={PlusIcon} className="size-4" />
              Add Category
            </Button>
          }
        />

        {/* Search */}
        <div className="relative max-w-xs">
          <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <Skeleton className="h-32 w-full" />
              </div>
            ))
          ) : categories.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
            <div className="col-span-full rounded-lg border py-12 text-center">
              <HugeiconsIcon icon={Package02Icon} className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No parcel categories found. Click &quot;Add Category&quot; to create one.</p>
            </div>
          ) : (
            categories.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase())).map((cat) => (
              <div key={cat.id} className="relative rounded-lg border p-4">
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
                  <Button variant="outline" size="sm" onClick={() => openEdit(cat)}>
                    <HugeiconsIcon icon={PencilEdit02Icon} className="size-3.5" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteCategory(cat.id)}>
                    <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PlusIcon} className="size-5 text-primary" />
              {editing ? "Edit Category" : "Add Parcel Category"}
            </SheetTitle>
            <SheetDescription>{editing ? "Update category details" : "Create a new parcel category"}</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
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
              <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
