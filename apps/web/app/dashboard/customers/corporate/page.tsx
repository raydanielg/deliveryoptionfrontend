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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatMoney, formatNumber, formatDate } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UsersIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  AlertCircleIcon, PlusIcon, PencilEdit02Icon, TrashIcon,
  CoinsIcon, TruckIcon, Building03Icon, EyeIcon,
} from "@hugeicons/core-free-icons"

export default function CorporateAccountsPage() {
  const [accounts, setAccounts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any>(null)
  const [form, setForm] = React.useState({
    companyName: "", contactPerson: "", email: "", phone: "",
    address: "", taxId: "", creditLimit: "", isActive: true,
  })

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.corporateAccounts.list()
      setAccounts(result.data || [])
    } catch {
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = accounts.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return a.companyName?.toLowerCase().includes(q) ||
      a.contactPerson?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q)
  })

  const activeCount = accounts.filter((a) => a.isActive).length
  const totalCredit = accounts.reduce((s, a) => s + Number(a.creditLimit || 0), 0)
  const totalSpent = accounts.reduce((s, a) => s + Number(a.totalSpent || 0), 0)

  function openCreate() {
    setEditing(null)
    setForm({ companyName: "", contactPerson: "", email: "", phone: "", address: "", taxId: "", creditLimit: "", isActive: true })
    setDialogOpen(true)
  }

  function openEdit(a: any) {
    setEditing(a)
    setForm({
      companyName: a.companyName || "", contactPerson: a.contactPerson || "",
      email: a.email || "", phone: a.phone || "",
      address: a.address || "", taxId: a.taxId || "",
      creditLimit: String(a.creditLimit || ""), isActive: a.isActive,
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data: any = {
        companyName: form.companyName,
        contactPerson: form.contactPerson,
        email: form.email,
        phone: form.phone,
        address: form.address,
        taxId: form.taxId,
        isActive: form.isActive,
      }
      if (form.creditLimit) data.creditLimit = Number(form.creditLimit)
      if (editing) {
        await api.corporateAccounts.update(editing.id, data)
        toast.success("Corporate account updated")
      } else {
        await api.corporateAccounts.create(data)
        toast.success("Corporate account created")
      }
      setDialogOpen(false)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to save")
    }
  }

  async function toggleAccount(id: string) {
    try {
      await api.corporateAccounts.toggle(id)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle")
    }
  }

  async function deleteAccount(id: string) {
    if (!confirm("Delete this corporate account?")) return
    try {
      await api.corporateAccounts.delete(id)
      toast.success("Account deleted")
      setSelected(null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  function handleExportPDF() {
    exportToPDF({
      title: "Corporate Accounts Report",
      subtitle: "Business and corporate customer accounts",
      columns: [
        { header: "Company", key: "company" },
        { header: "Contact", key: "contact" },
        { header: "Email", key: "email" },
        { header: "Credit Limit", key: "credit" },
        { header: "Status", key: "status" },
      ],
      rows: filtered.map((a) => ({
        company: a.companyName || "—",
        contact: a.contactPerson || "—",
        email: a.email || "—",
        credit: formatMoney(Number(a.creditLimit || 0), undefined, { showCode: false }),
        status: a.isActive ? "Active" : "Inactive",
      })),
      meta: [
        { label: "Total Accounts", value: String(accounts.length) },
        { label: "Active", value: String(activeCount) },
        { label: "Total Credit", value: formatMoney(totalCredit, undefined, { compact: true }) },
      ],
    })
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Customers", href: "/dashboard/customers" },
      { label: "Corporate Accounts" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="🏢 Corporate Accounts"
          description="Business and corporate customer accounts — manage credit limits, contacts, and billing."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <HugeiconsIcon icon={Download01Icon} className="size-4" />
                Export PDF
              </Button>
              <Button size="sm" onClick={openCreate}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                Add Account
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Accounts" value={formatNumber(accounts.length)} icon={Building03Icon} hint="All corporate" />
          <MetricCard label="Active" value={formatNumber(activeCount)} icon={CheckmarkCircle02Icon} hint="Currently active" />
          <MetricCard label="Total Credit" value={formatMoney(totalCredit, undefined, { compact: true })} icon={CoinsIcon} hint="Credit limits" />
          <MetricCard label="Total Spent" value={formatMoney(totalSpent, undefined, { compact: true })} icon={TruckIcon} hint="All spending" />
        </div>

        <div className="relative max-w-xs">
          <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search company, contact, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No corporate accounts found</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="group rounded-lg border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <HugeiconsIcon icon={Building03Icon} className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{a.companyName}</h3>
                      <p className="text-xs text-muted-foreground">{a.contactPerson || "—"}</p>
                    </div>
                  </div>
                  <Switch checked={a.isActive} onCheckedChange={() => toggleAccount(a.id)} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={a.isActive ? "default" : "secondary"} className="text-xs">
                    {a.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {a.creditLimit != null && (
                    <Badge variant="secondary" className="text-xs">
                      Credit: {formatMoney(Number(a.creditLimit), undefined, { showCode: false, compact: true })}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 mb-4 text-xs text-muted-foreground">
                  {a.email && <p>{a.email}</p>}
                  {a.phone && <p className="tabular-nums">{a.phone}</p>}
                </div>

                <div className="flex gap-2 border-t pt-3">
                  <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => setSelected(a)}>
                    <HugeiconsIcon icon={EyeIcon} className="size-3.5" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => openEdit(a)}>
                    <HugeiconsIcon icon={PencilEdit02Icon} className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => deleteAccount(a.id)}>
                    <HugeiconsIcon icon={TrashIcon} className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <HugeiconsIcon icon={Building03Icon} className="size-5 text-primary" />
                  </div>
                  {selected.companyName}
                </SheetTitle>
                <SheetDescription>
                  {selected.contactPerson || "No contact person"} — {selected.email || "No email"}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <StatusBadge status={selected.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="mt-1 text-sm font-medium">{selected.companyName || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Contact Person</p>
                    <p className="mt-1 text-sm font-medium">{selected.contactPerson || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="mt-1 text-sm font-medium">{selected.email || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.phone || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Credit Limit</p>
                    <p className="mt-1 text-sm font-bold tabular-nums">{formatMoney(Number(selected.creditLimit || 0))}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Tax ID</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.taxId || "—"}</p>
                  </div>
                </div>

                {selected.address && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="mt-1 text-sm">{selected.address}</p>
                  </div>
                )}

                {selected.totalShipments != null && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border bg-primary/5 p-3 text-center">
                      <HugeiconsIcon icon={TruckIcon} className="mx-auto size-4 text-primary mb-1" />
                      <p className="text-lg font-bold tabular-nums">{selected.totalShipments}</p>
                      <p className="text-xs text-muted-foreground">Shipments</p>
                    </div>
                    <div className="rounded-lg border bg-primary/5 p-3 text-center">
                      <HugeiconsIcon icon={CoinsIcon} className="mx-auto size-4 text-primary mb-1" />
                      <p className="text-lg font-bold tabular-nums">{formatMoney(Number(selected.totalSpent || 0), undefined, { compact: true, showCode: false })}</p>
                      <p className="text-xs text-muted-foreground">Spent</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                  <Button variant="outline" onClick={() => { openEdit(selected); setSelected(null) }}>
                    <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" />
                    Edit
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
            <DialogTitle>{editing ? "Edit Corporate Account" : "Add Corporate Account"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tax ID</Label>
                <Input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Credit Limit</Label>
                <Input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
