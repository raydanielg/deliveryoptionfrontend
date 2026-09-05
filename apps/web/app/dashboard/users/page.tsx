"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { api } from "@/lib/api"
import { toast } from "sonner"

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin", color: "bg-red-100 text-red-700" },
  { value: "OPERATIONS_MANAGER", label: "Operations Manager", color: "bg-blue-100 text-blue-700" },
  { value: "DISPATCHER", label: "Dispatcher", color: "bg-purple-100 text-purple-700" },
  { value: "FINANCE", label: "Finance", color: "bg-green-100 text-green-700" },
  { value: "CUSTOMER_SUPPORT", label: "Customer Support", color: "bg-orange-100 text-orange-700" },
  { value: "WAREHOUSE_MANAGER", label: "Warehouse Manager", color: "bg-indigo-100 text-indigo-700" },
  { value: "CUSTOMS_OFFICER", label: "Customs Officer", color: "bg-teal-100 text-teal-700" },
  { value: "REPORT_VIEWER", label: "Report Viewer", color: "bg-gray-100 text-gray-700" },
  { value: "CUSTOMER", label: "Customer", color: "bg-cyan-100 text-cyan-700" },
  { value: "DRIVER", label: "Driver", color: "bg-amber-100 text-amber-700" },
]

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "CUSTOMER", isActive: true,
  })

  useEffect(() => { loadUsers() }, [page, roleFilter])

  async function loadUsers() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (roleFilter) params.set("role", roleFilter)
      params.set("page", String(page))
      params.set("limit", "20")
      const res = await api.users.list(params.toString())
      setUsers(res.data || [])
      setTotalPages(res.pagination?.totalPages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: "", email: "", phone: "", password: "", role: "CUSTOMER", isActive: true })
    setDialogOpen(true)
  }

  function openEdit(user: any) {
    setEditing(user)
    setForm({
      name: user.name, email: user.email, phone: user.phone || "",
      password: "", role: user.role, isActive: user.isActive,
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editing) {
        const data: any = { name: form.name, email: form.email, phone: form.phone || undefined, role: form.role, isActive: form.isActive }
        await api.users.update(editing.id, data)
        toast.success("User updated")
      } else {
        if (!form.password || form.password.length < 8) {
          toast.error("Password must be at least 8 characters")
          return
        }
        await api.users.create({
          name: form.name, email: form.email, phone: form.phone || undefined,
          password: form.password, role: form.role, isActive: form.isActive,
        })
        toast.success("User created")
      }
      setDialogOpen(false)
      loadUsers()
    } catch (err: any) {
      toast.error(err.message || "Failed to save user")
    }
  }

  async function toggleUser(id: string) {
    try {
      await api.users.toggle(id)
      loadUsers()
    } catch (err: any) { toast.error(err.message) }
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user?")) return
    try {
      await api.users.delete(id)
      toast.success("User deleted")
      loadUsers()
    } catch (err: any) { toast.error(err.message) }
  }

  async function changeRole(id: string, role: string) {
    try {
      await api.users.changeRole(id, role)
      toast.success("Role updated")
      loadUsers()
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Users" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="User Management"
          description="Manage users, roles, and permissions"
          actions={<Button onClick={openCreate}>Add User</Button>}
        />

        {/* Filter toolbar */}
        <Card className="p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setPage(1), loadUsers())}
              className="sm:max-w-xs"
            />
            <Select value={roleFilter || "all"} onValueChange={(v) => { setRoleFilter(v === "all" ? "" : (v ?? "")); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setPage(1); loadUsers() }} className="sm:ml-auto">Search</Button>
          </div>
        </Card>

        {/* Users table */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Phone</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Last Login</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>)}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No users found</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0 transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <Select value={u.role} onValueChange={(v) => { if (v) changeRole(u.id, v) }}>
                          <SelectTrigger className="h-7 w-[160px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch checked={u.isActive} onCheckedChange={() => toggleUser(u.id)} />
                          <span className={u.isActive ? "text-green-600 text-xs" : "text-red-600 text-xs"}>
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(u)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteUser(u.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit User" : "Add User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Phone (optional)</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+255..." />
            </div>
            {!editing && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v: string | null) => setForm({ ...form, role: (v as string) || "CUSTOMER" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
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
      </div>
    </DashboardLayout>
  )
}
