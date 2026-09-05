"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit02Icon, Delete02Icon, PlusIcon, ImageUploadIcon, Attachment02Icon, StarIcon, Search01Icon, ViewIcon, File02Icon } from "@hugeicons/core-free-icons"
import { formatNumber } from "@/lib/format"

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-700",
  ARCHIVED: "bg-orange-100 text-orange-700",
}

export default function BlogPage() {
  const [posts, setPosts] = React.useState<any[]>([])
  const [categories, setCategories] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any>(null)
  const [activeTab, setActiveTab] = React.useState("posts")
  const [form, setForm] = React.useState({
    title: "", excerpt: "", content: "", coverImage: "", status: "DRAFT",
    isFeatured: false, tags: "", categoryId: "", seoTitle: "", seoDescription: "",
  })
  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const attachInputRef = React.useRef<HTMLInputElement>(null)
  const [editingPostImages, setEditingPostImages] = React.useState<any[]>([])
  const [editingPostAttachments, setEditingPostAttachments] = React.useState<any[]>([])

  React.useEffect(() => { loadPosts(); loadStats(); loadCategories() }, [page, statusFilter])
  React.useEffect(() => { if (search) { const t = setTimeout(() => { setPage(1); loadPosts() }, 400); return () => clearTimeout(t) } }, [search])

  async function loadPosts() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)
      params.set("page", String(page))
      params.set("limit", "20")
      const res = await api.blog.list(params.toString())
      setPosts(res.data || [])
      setTotalPages(Math.ceil((res.total || 0) / 20))
    } catch (err: any) {
      toast.error(err.message || "Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const res = await api.blog.stats()
      setStats(res.data)
    } catch {}
  }

  async function loadCategories() {
    try {
      const res = await api.blog.categories.list()
      setCategories(res.data || [])
    } catch {}
  }

  function openCreate() {
    setEditing(null)
    setForm({ title: "", excerpt: "", content: "", coverImage: "", status: "DRAFT", isFeatured: false, tags: "", categoryId: "", seoTitle: "", seoDescription: "" })
    setEditingPostImages([])
    setEditingPostAttachments([])
    setSheetOpen(true)
  }

  async function openEdit(post: any) {
    setEditing(post)
    setForm({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      coverImage: post.coverImage || "",
      status: post.status || "DRAFT",
      isFeatured: post.isFeatured || false,
      tags: (post.tags || []).join(", "),
      categoryId: post.categoryId || "",
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
    })
    try {
      const full = await api.blog.get(post.id)
      setEditingPostImages(full.data?.images || [])
      setEditingPostAttachments(full.data?.attachments || [])
    } catch {}
    setSheetOpen(true)
  }

  async function handleSubmit() {
    try {
      const body = {
        title: form.title,
        excerpt: form.excerpt || undefined,
        content: form.content,
        coverImage: form.coverImage || undefined,
        status: form.status,
        isFeatured: form.isFeatured,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        categoryId: form.categoryId || undefined,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
      }

      if (editing) {
        await api.blog.update(editing.id, body)
        toast.success("Post updated")
      } else {
        const res = await api.blog.create(body)
        toast.success("Post created")
        if (res.data?.id) {
          setEditing(res.data)
        }
      }
      setSheetOpen(false)
      loadPosts()
      loadStats()
    } catch (err: any) {
      toast.error(err.message || "Failed to save post")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this blog post?")) return
    try {
      await api.blog.delete(id)
      toast.success("Post deleted")
      loadPosts()
      loadStats()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  async function handleUploadImages() {
    if (!editing || !imageInputRef.current?.files?.length) return
    try {
      const formData = new FormData()
      Array.from(imageInputRef.current.files).forEach((f) => formData.append("images", f))
      await api.blog.uploadImages(editing.id, formData)
      toast.success("Images uploaded")
      const full = await api.blog.get(editing.id)
      setEditingPostImages(full.data?.images || [])
      if (imageInputRef.current) imageInputRef.current.value = ""
    } catch (err: any) {
      toast.error(err.message || "Failed to upload images")
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!editing) return
    try {
      await api.blog.deleteImage(editing.id, imageId)
      setEditingPostImages((prev) => prev.filter((i) => i.id !== imageId))
      toast.success("Image deleted")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete image")
    }
  }

  async function handleUploadAttachments() {
    if (!editing || !attachInputRef.current?.files?.length) return
    try {
      const formData = new FormData()
      Array.from(attachInputRef.current.files).forEach((f) => formData.append("files", f))
      await api.blog.uploadAttachments(editing.id, formData)
      toast.success("Attachments uploaded")
      const full = await api.blog.get(editing.id)
      setEditingPostAttachments(full.data?.attachments || [])
      if (attachInputRef.current) attachInputRef.current.value = ""
    } catch (err: any) {
      toast.error(err.message || "Failed to upload attachments")
    }
  }

  async function handleDeleteAttachment(attachmentId: string) {
    if (!editing) return
    try {
      await api.blog.deleteAttachment(editing.id, attachmentId)
      setEditingPostAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
      toast.success("Attachment deleted")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete attachment")
    }
  }

  async function handleToggleFeatured(post: any) {
    try {
      await api.blog.update(post.id, { isFeatured: !post.isFeatured })
      loadPosts()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle")
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Blog" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Blog Management"
          description="Create and manage blog posts, images, and attachments"
          actions={
            <Button onClick={openCreate}>
              <HugeiconsIcon icon={PlusIcon} className="size-4" />
              New Post
            </Button>
          }
        />

        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Posts" value={formatNumber(stats.total ?? 0)} icon={File02Icon} loading={loading} />
            <MetricCard label="Published" value={formatNumber(stats.published ?? 0)} icon={StarIcon} loading={loading} />
            <MetricCard label="Drafts" value={formatNumber(stats.drafts ?? 0)} icon={PencilEdit02Icon} loading={loading} />
            <MetricCard label="Total Views" value={formatNumber(stats.totalViews ?? 0)} icon={ViewIcon} loading={loading} />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:max-w-xs">
                <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : (v ?? "")); setPage(1) }}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border">
                <HugeiconsIcon icon={File02Icon} className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No blog posts yet. Create your first post!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-start gap-4 rounded-lg border p-4">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="size-16 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">No img</div>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{post.title}</h3>
                          <Badge className={STATUS_COLORS[post.status] || ""}>{post.status}</Badge>
                          {post.isFeatured && <Badge className="bg-yellow-100 text-yellow-700">Featured</Badge>}
                        </div>
                        {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>By {post.author?.name || "Unknown"}</span>
                          {post.category && <span>• {post.category.name}</span>}
                          <span>• {post.views} views</span>
                          {post._count?.images > 0 && <span>• {post._count.images} images</span>}
                          {post._count?.attachments > 0 && <span>• {post._count.attachments} files</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleFeatured(post)} title="Toggle featured">
                          <HugeiconsIcon icon={StarIcon} className={`size-4 ${post.isFeatured ? "fill-yellow-400 text-yellow-400" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(post)} title="Edit">
                          <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} title="Delete">
                          <HugeiconsIcon icon={Delete02Icon} className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManager categories={categories} onReload={loadCategories} />
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PlusIcon} className="size-5 text-primary" />
              {editing ? "Edit Post" : "Create New Post"}
            </SheetTitle>
            <SheetDescription>{editing ? "Update blog post details" : "Create a new blog post"}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" />
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary..." rows={2} />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your post content here..." rows={8} />
            </div>
            <div>
              <Label>Cover Image URL</Label>
              <Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: (v ?? "DRAFT") })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v === "none" ? "" : (v ?? "") })}>
                  <SelectTrigger><SelectValue placeholder="No category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="logistics, delivery, tanzania" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SEO Title</Label>
                <Input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="SEO title" />
              </div>
              <div>
                <Label>SEO Description</Label>
                <Input value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="SEO description" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
              <Label>Featured post</Label>
            </div>

            {editing && (
              <>
                <div className="border-t pt-4">
                  <Label>Images</Label>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {editingPostImages.map((img) => (
                      <div key={img.id} className="group relative">
                        <img src={img.url} alt={img.caption || ""} className="size-20 rounded-lg border object-cover" />
                        <button onClick={() => handleDeleteImage(img.id)} className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">×</button>
                      </div>
                    ))}
                    <label className="flex size-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:bg-muted">
                      <HugeiconsIcon icon={ImageUploadIcon} className="size-5" />
                      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUploadImages} />
                    </label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label>Attachments (PDFs, Documents)</Label>
                  <div className="mt-2 space-y-2">
                    {editingPostAttachments.map((att) => (
                      <div key={att.id} className="flex items-center gap-2 rounded-lg border p-2">
                        <HugeiconsIcon icon={Attachment02Icon} className="size-4 text-muted-foreground" />
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm hover:underline">{att.fileName}</a>
                        <span className="text-xs text-muted-foreground">{att.fileType}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAttachment(att.id)}>
                          <HugeiconsIcon icon={Delete02Icon} className="size-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 text-sm text-muted-foreground hover:bg-muted">
                      <HugeiconsIcon icon={Attachment02Icon} className="size-4" />
                      Upload files
                      <input ref={attachInputRef} type="file" multiple className="hidden" onChange={handleUploadAttachments} />
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!form.title || !form.content}>
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}

function CategoriesManager({ categories, onReload }: { categories: any[]; onReload: () => void }) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  async function handleCreate() {
    if (!name.trim()) return
    try {
      await api.blog.categories.create({ name, description: description || undefined })
      toast.success("Category created")
      setName("")
      setDescription("")
      onReload()
    } catch (err: any) {
      toast.error(err.message || "Failed to create category")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return
    try {
      await api.blog.categories.delete(id)
      toast.success("Category deleted")
      onReload()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-semibold">Add Category</h3>
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            <HugeiconsIcon icon={PlusIcon} className="size-4" />
            Add Category
          </Button>
      </div>

      <div className="space-y-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c._count?.posts || 0} posts • /{c.slug}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                  <HugeiconsIcon icon={Delete02Icon} className="size-4 text-red-500" />
                </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
