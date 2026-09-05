"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Switch } from "@workspace/ui/components/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon, PlusIcon, Search01Icon, EditIcon,
  CheckmarkCircle02Icon, LockIcon, MailIcon,
  PhoneIcon, Refresh01Icon,
} from "@hugeicons/core-free-icons"

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/15 text-red-600 border-red-500/30",
  OPERATIONS_MANAGER: "bg-purple-500/15 text-purple-600 border-purple-500/30",
  DISPATCHER: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  CUSTOMER: "bg-green-500/15 text-green-600 border-green-500/30",
  DRIVER: "bg-orange-500/15 text-orange-600 border-orange-500/30",
}

export default function TeamPage() {
  const [users, setUsers] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editMode, setEditMode] = React.useState(false)
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", role: "CUSTOMER", password: "" })

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.users.list(),
        api.users.stats(),
      ])
      setUsers(usersRes.data || [])
      setStats(statsRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load team members")
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q)
  })

  const adminCount = users.filter((u) => u.role === "SUPER_ADMIN" || u.role === "OPERATIONS_MANAGER").length
  const activeCount = users.filter((u) => u.isActive).length
  const driverCount = users.filter((u) => u.role === "DRIVER").length
  const customerCount = users.filter((u) => u.role === "CUSTOMER").length

  async function handleToggleActive(id: string, current: boolean) {
    try {
      await api.users.toggle(id)
      toast.success(`User ${current ? "deactivated" : "activated"}`)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle user")
    }
  }

  async function handleRoleChange(id: string, role: string) {
    try {
      await api.users.changeRole(id, role)
      toast.success("Role updated")
      setSelected((prev: any) => prev ? { ...prev, role } : null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to change role")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editMode && selected) {
        await api.users.update(selected.id, { name: form.name, email: form.email, phone: form.phone, role: form.role })
        toast.success("Team member updated")
      } else {
        await api.users.create(form)
        toast.success("Team member added")
      }
      setDialogOpen(false)
      setForm({ name: "", email: "", phone: "", role: "CUSTOMER", password: "" })
      setEditMode(false)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to save team member")
    }
  }

  function openAdd() {
    setEditMode(false)
    setForm({ name: "", email: "", phone: "", role: "CUSTOMER", password: "" })
    setDialogOpen(true)
  }

  function openEdit(user: any) {
    setEditMode(true)
    setSelected(user)
    setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "", role: user.role || "CUSTOMER", password: "" })
    setDialogOpen(true)
  }

  const roleFilters = ["ALL", "SUPER_ADMIN", "OPERATIONS_MANAGER", "DISPATCHER", "DRIVER", "CUSTOMER"]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/dashboard/settings" },
      { label: "Team" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Team Management"
          icon={<HugeiconsIcon icon={UserGroupIcon} className="size-6 text-primary" />}
          description="Manage team members, roles, and permissions."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={load}>
                <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
                Refresh
              </Button>
              <Button size="sm" onClick={openAdd}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                Add Member
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Members" value={formatNumber(users.length)} icon={UserGroupIcon} hint="All users" />
          <MetricCard label="Active" value={formatNumber(activeCount)} icon={CheckmarkCircle02Icon} hint="Currently active" />
          <MetricCard label="Admins" value={formatNumber(adminCount)} icon={LockIcon} hint="Super admin & ops" />
          <MetricCard label="Drivers" value={formatNumber(driverCount)} icon={UserGroupIcon} hint="Driver accounts" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roleFilters.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  roleFilter === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {r === "ALL" ? "All Roles" : r.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={UserGroupIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No team members found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Phone</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => setSelected(u)}
                    >
                      <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${roleColors[u.role] || "bg-muted/40 text-muted-foreground border-border"}`}>
                          {u.role?.replace(/_/g, " ") || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={u.isActive}
                          onCheckedChange={() => handleToggleActive(u.id, u.isActive)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.createdAt ? formatDate(u.createdAt) : "—"}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); openEdit(u) }}>
                          <HugeiconsIcon icon={EditIcon} className="size-3.5" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {selected.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  {selected.name || "User"}
                </SheetTitle>
                <SheetDescription>{selected.email || "No email"}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Role</span>
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    value={selected.role}
                    onChange={(e) => handleRoleChange(selected.id, e.target.value)}
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="OPERATIONS_MANAGER">Operations Manager</option>
                    <option value="DISPATCHER">Dispatcher</option>
                    <option value="DRIVER">Driver</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><HugeiconsIcon icon={MailIcon} className="size-3" /> Email</p>
                    <p className="mt-1 text-sm font-medium">{selected.email || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><HugeiconsIcon icon={PhoneIcon} className="size-3" /> Phone</p>
                    <p className="mt-1 text-sm font-medium">{selected.phone || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="mt-1">
                      <Badge variant={selected.isActive ? "default" : "secondary"}>
                        {selected.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="mt-1 text-sm font-medium">{selected.createdAt ? formatDate(selected.createdAt) : "—"}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                  <Button className="flex-1" onClick={() => { openEdit(selected); setSelected(null) }}>
                    <HugeiconsIcon icon={EditIcon} className="size-4" />
                    Edit Member
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+255..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="OPERATIONS_MANAGER">Operations Manager</option>
                  <option value="DISPATCHER">Dispatcher</option>
                  <option value="DRIVER">Driver</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
              </div>
              {!editMode && (
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editMode} />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editMode ? "Update Member" : "Add Member"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
