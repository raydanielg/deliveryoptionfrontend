"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Switch } from "@workspace/ui/components/switch"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { api } from "@/lib/api"
import { toast } from "sonner"

const EMPTY = { name: "", code: "", city: "", region: "", address: "", phone: "", email: "", isHeadOffice: false, isActive: true }

export default function BranchesPage() {
  const [rows, setRows] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState<any | "new" | null>(null)
  const [form, setForm] = React.useState<any>(EMPTY)
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    try { setRows((await api.branches.list()).data || []) } catch (e: any) { toast.error(e.message || "Failed to load branches") } finally { setLoading(false) }
  }, [])
  React.useEffect(() => { load() }, [load])

  function open(b: any | "new") {
    setEditing(b)
    setForm(b === "new" ? EMPTY : { name: b.name, code: b.code || "", city: b.city, region: b.region || "", address: b.address, phone: b.phone || "", email: b.email || "", isHeadOffice: b.isHeadOffice, isActive: b.isActive })
  }

  async function save() {
    if (!form.name.trim() || !form.code.trim() || !form.city.trim() || !form.address.trim()) { toast.error("Name, code, city and address are required"); return }
    setSaving(true)
    try {
      const body = { ...form, code: form.code.trim(), region: form.region.trim() || null, phone: form.phone.trim() || null, email: form.email.trim() || null }
      if (editing === "new") await api.branches.create(body); else await api.branches.update(editing.id, body)
      toast.success("Branch saved"); setEditing(null); load()
    } catch (e: any) { toast.error(e.message || "Could not save") } finally { setSaving(false) }
  }

  const field = (key: string, label: string, props: any = {}) => (
    <div className="grid gap-1.5"><Label>{label}</Label><Input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...props} /></div>
  )

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Branches" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader title="Branches" description="Each branch handles the shipments that start or end in its city (or region). Managers and agents are assigned to a branch under Users."
          actions={<Button onClick={() => open("new")}>Add branch</Button>} />
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/30 text-left">{["Branch", "Code", "Covers", "Staff", "Tasks", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-medium text-muted-foreground">{h}</th>)}</tr></thead>
              <tbody>
                {loading ? Array.from({ length: 3 }).map((_, i) => <tr key={i}><td className="px-4 py-3" colSpan={7}><Skeleton className="h-5 w-full" /></td></tr>)
                  : rows.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No branches yet</td></tr>
                  : rows.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{b.name}{b.isHeadOffice && <Badge className="ml-2" variant="secondary">Head office</Badge>}</td>
                      <td className="px-4 py-3 font-mono">{b.code}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.city}{b.region ? `, ${b.region}` : ""}</td>
                      <td className="px-4 py-3 tabular-nums">{b._count?.staff ?? 0}</td>
                      <td className="px-4 py-3 tabular-nums">{b._count?.agentTasks ?? 0}</td>
                      <td className="px-4 py-3">{b.isActive ? <Badge variant="secondary">Active</Badge> : <Badge variant="destructive">Off</Badge>}</td>
                      <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => open(b)}>Edit</Button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Sheet open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader><SheetTitle>{editing === "new" ? "Add branch" : "Edit branch"}</SheetTitle><SheetDescription>Shipments are routed here when their pickup or delivery city matches.</SheetDescription></SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            {field("name", "Name *", { maxLength: 80 })}
            {field("code", "Code * (2–6 letters/digits)", { maxLength: 6 })}
            {field("city", "City *")}
            {field("region", "Region (covers the whole region when no branch is in a town)")}
            {field("address", "Address *")}
            {field("phone", "Phone")}
            {field("email", "Email", { type: "email" })}
            <div className="flex items-center justify-between rounded-lg border p-3"><Label>Head office</Label><Switch checked={form.isHeadOffice} onCheckedChange={(v) => setForm({ ...form, isHeadOffice: v })} /></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><Label>Active</Label><Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /></div>
            <Button className="w-full" onClick={save} loading={saving}>Save branch</Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
