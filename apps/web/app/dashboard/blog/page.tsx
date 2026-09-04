"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
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
import { ArrowRight01Icon, PencilEdit02Icon, Delete02Icon, PlusIcon, ViewIcon, ImageUploadIcon, Attachment02Icon, StarIcon } from "@hugeicons/core-free-icons"

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-700",
  ARCHIVED: "bg-orange-100 text-orange-700",
}

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("posts")
  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", coverImage: "", status: "DRAFT",
    isFeatured: false, tags: "", categoryId: "", seoTitle: "", seoDescription: "",
  })
  const imageInputRef = useRef<HTMLInputElement>(null)
  const attachInputRef = useRef<HTMLInputElement>(null)
  const [editingPostImages, setEditingPostImages] = useState<any[]>([])
  const [editingPostAttachments, setEditingPostAttachments] = useState<any[]>([])

  useEffect(() => { loadPosts(); loadStats(); loadCategories() }, [page, statusFilter])
  useEffect(() => { if (search) { const t = setTimeout(() => { setPage(1); loadPosts() }, 400); return () => clearTimeout(t) } }, [search])

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
    setDialogOpen(true)
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
    setDialogOpen(true)
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
      setDialogOpen(false)
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
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blog Management</h1>
            <p className="text-sm text-muted-foreground">Create and manage blog posts, images, and attachments</p>
          </div>
          <Button onClick={openCreate}>
            <HugeiconsIcon icon={PlusIcon} strokeWidth={2} className="size-4" />
            New Post
          </Button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-gray-600">{stats.drafts}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:max-w-xs"
              />
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1) }}>
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
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">No blog posts yet. Create your first post!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardContent className="flex items-start gap-4 p-4">
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
                          <HugeiconsIcon icon={StarIcon} strokeWidth={2} className={`size-4 ${post.isFeatured ? "fill-yellow-400 text-yellow-400" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(post)} title="Edit">
                          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} title="Delete">
                          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "Create New Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
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
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v === "none" ? "" : v })}>
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
                      <HugeiconsIcon icon={ImageUploadIcon} strokeWidth={2} className="size-5" />
                      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUploadImages} />
                    </label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label>Attachments (PDFs, Documents)</Label>
                  <div className="mt-2 space-y-2">
                    {editingPostAttachments.map((att) => (
                      <div key={att.id} className="flex items-center gap-2 rounded-lg border p-2">
                        <HugeiconsIcon icon={Attachment02Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm hover:underline">{att.fileName}</a>
                        <span className="text-xs text-muted-foreground">{att.fileType}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAttachment(att.id)}>
                          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 text-sm text-muted-foreground hover:bg-muted">
                      <HugeiconsIcon icon={Attachment02Icon} strokeWidth={2} className="size-4" />
                      Upload files
                      <input ref={attachInputRef} type="file" multiple className="hidden" onChange={handleUploadAttachments} />
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!form.title || !form.content}>
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

function CategoriesManager({ categories, onReload }: { categories: any[]; onReload: () => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

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
      <Card>
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            <HugeiconsIcon icon={PlusIcon} strokeWidth={2} className="size-4" />
            Add Category
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c._count?.posts || 0} posts • /{c.slug}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
