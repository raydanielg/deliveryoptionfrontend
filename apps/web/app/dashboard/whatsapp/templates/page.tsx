"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Message01Icon, PlusIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatDate } from "@/lib/format"

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ name: "", eventType: "", body: "", smsBody: "", category: "TRANSACTIONAL" })

  React.useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await api.whatsapp.listTemplates()
      setTemplates(res.data || [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load templates")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!form.name || !form.body) {
      toast.error("Name and body are required")
      return
    }
    setSaving(true)
    try {
      await api.whatsapp.createTemplate(form)
      toast.success("Template created")
      setAddOpen(false)
      setForm({ name: "", eventType: "", body: "", smsBody: "", category: "TRANSACTIONAL" })
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to create template")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "WhatsApp", href: "/dashboard/whatsapp" }, { label: "Templates" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="WhatsApp Templates"
          description="Reusable message templates with {{variable}} interpolation"
          actions={
            <Sheet open={addOpen} onOpenChange={setAddOpen}>
              <SheetTrigger render={<Button />}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                New Template
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>New WhatsApp Template</SheetTitle>
                  <SheetDescription>Use {"{{variables}}"} for dynamic content</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 px-4 pb-6">
                  <div className="grid gap-2">
                    <Label>Template Name <span className="text-destructive">*</span></Label>
                    <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. booking_confirmation" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Event Type</Label>
                    <Input value={form.eventType} onChange={(e) => setForm(prev => ({ ...prev, eventType: e.target.value }))} placeholder="e.g. BOOKING_CREATED" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm(prev => ({ ...prev, category: v ?? "TRANSACTIONAL" }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRANSACTIONAL">Transactional</SelectItem>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="OTP">OTP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Body <span className="text-destructive">*</span></Label>
                    <Textarea rows={8} value={form.body} onChange={(e) => setForm(prev => ({ ...prev, body: e.target.value }))} placeholder="Hello {{customer_name}}, your shipment {{tracking_number}}..." />
                  </div>
                  <div className="grid gap-2">
                    <Label>SMS Fallback Body</Label>
                    <Textarea rows={3} value={form.smsBody} onChange={(e) => setForm(prev => ({ ...prev, smsBody: e.target.value }))} placeholder="Shorter SMS version..." />
                  </div>
                  <Button className="w-full" onClick={handleCreate} disabled={saving}>
                    {saving ? "Creating..." : "Create Template"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          }
        />

        <div className="grid gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          ) : templates.length === 0 ? (
            <div className="rounded-lg border p-12 text-center">
              <HugeiconsIcon icon={Message01Icon} className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No templates yet</p>
            </div>
          ) : (
            templates.map((t: any) => (
              <div key={t.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t.name}</span>
                    <Badge variant="outline">{t.category}</Badge>
                    {t.eventType && <Badge variant="secondary">{t.eventType}</Badge>}
                    {!t.isActive && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</span>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">{t.body}</pre>
                {t.variables?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.variables.map((v: string) => (
                      <Badge key={v} variant="outline" className="text-xs">{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
