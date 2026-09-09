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
import { Message01Icon, PlusIcon, PlayIcon, PauseIcon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatDate } from "@/lib/format"

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  RUNNING: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
}

export default function WhatsAppCampaignsPage() {
  const [campaigns, setCampaigns] = React.useState<any[]>([])
  const [connections, setConnections] = React.useState<any[]>([])
  const [templates, setTemplates] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ name: "", description: "", connectionId: "", templateId: "", audienceType: "ALL_CUSTOMERS", sendRate: 10 })

  React.useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [camps, conns, tmpls] = await Promise.all([
        api.whatsapp.listCampaigns(),
        api.whatsapp.listConnections(),
        api.whatsapp.listTemplates(),
      ])
      setCampaigns(camps.data || [])
      setConnections(conns.data || [])
      setTemplates(tmpls.data || [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load campaigns")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!form.name || !form.connectionId || !form.templateId) {
      toast.error("Name, connection, and template are required")
      return
    }
    setSaving(true)
    try {
      await api.whatsapp.createCampaign(form)
      toast.success("Campaign created")
      setAddOpen(false)
      setForm({ name: "", description: "", connectionId: "", templateId: "", audienceType: "ALL_CUSTOMERS", sendRate: 10 })
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to create campaign")
    } finally {
      setSaving(false)
    }
  }

  async function handleAction(action: string, id: string) {
    try {
      if (action === "start") await api.whatsapp.startCampaign(id)
      else if (action === "pause") await api.whatsapp.pauseCampaign(id)
      else if (action === "resume") await api.whatsapp.resumeCampaign(id)
      else if (action === "cancel") await api.whatsapp.cancelCampaign(id)
      toast.success(`Campaign ${action}ed`)
      load()
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} campaign`)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "WhatsApp", href: "/dashboard/whatsapp" }, { label: "Campaigns" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="WhatsApp Campaigns"
          description="Marketing campaigns with rate limiting, scheduling, and consent"
          actions={
            <Sheet open={addOpen} onOpenChange={setAddOpen}>
              <SheetTrigger render={<Button />}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                New Campaign
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>New WhatsApp Campaign</SheetTitle>
                  <SheetDescription>Schedule marketing messages to your audience</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 px-4 pb-6">
                  <div className="grid gap-2">
                    <Label>Campaign Name <span className="text-destructive">*</span></Label>
                    <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Holiday Promotion" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea rows={2} value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>WhatsApp Connection <span className="text-destructive">*</span></Label>
                    <Select value={form.connectionId} onValueChange={(v) => setForm(prev => ({ ...prev, connectionId: v ?? "" }))}>
                      <SelectTrigger><SelectValue placeholder="Select connection" /></SelectTrigger>
                      <SelectContent>
                        {connections.filter((c: any) => c.status === "CONNECTED").map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Template <span className="text-destructive">*</span></Label>
                    <Select value={form.templateId} onValueChange={(v) => setForm(prev => ({ ...prev, templateId: v ?? "" }))}>
                      <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                      <SelectContent>
                        {templates.filter((t: any) => t.category === "MARKETING").map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Audience</Label>
                    <Select value={form.audienceType} onValueChange={(v) => setForm(prev => ({ ...prev, audienceType: v ?? "ALL_CUSTOMERS" }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL_CUSTOMERS">All Customers</SelectItem>
                        <SelectItem value="FILTERED">Filtered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Send Rate (messages/min)</Label>
                    <Input type="number" value={form.sendRate} onChange={(e) => setForm(prev => ({ ...prev, sendRate: Number(e.target.value) }))} />
                  </div>
                  <Button className="w-full" onClick={handleCreate} disabled={saving}>
                    {saving ? "Creating..." : "Create Campaign"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          }
        />

        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Connection</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Template</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Progress</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Created</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    </tr>
                  ))
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Message01Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No campaigns yet</p>
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c: any) => (
                    <tr key={c.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.connection?.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.template?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge className={CAMPAIGN_STATUS_COLORS[c.status] || "bg-gray-100"}>
                          {c.status?.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-xs">
                        {c.totalSent} / {c.recipientCount} sent
                        {c.totalFailed > 0 && <span className="text-red-600"> ({c.totalFailed} failed)</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {c.status === "DRAFT" && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("start", c.id)}>
                              <HugeiconsIcon icon={PlayIcon} className="size-3" /> Start
                            </Button>
                          )}
                          {c.status === "RUNNING" && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("pause", c.id)}>
                              <HugeiconsIcon icon={PauseIcon} className="size-3" /> Pause
                            </Button>
                          )}
                          {c.status === "PAUSED" && (
                            <Button size="sm" variant="outline" onClick={() => handleAction("resume", c.id)}>
                              <HugeiconsIcon icon={PlayIcon} className="size-3" /> Resume
                            </Button>
                          )}
                          {(c.status === "RUNNING" || c.status === "PAUSED" || c.status === "SCHEDULED") && (
                            <Button size="sm" variant="ghost" onClick={() => handleAction("cancel", c.id)}>
                              <HugeiconsIcon icon={Cancel01Icon} className="size-3" /> Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
