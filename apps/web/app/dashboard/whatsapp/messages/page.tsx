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
import { SendIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatDate } from "@/lib/format"

const MSG_STATUS_COLORS: Record<string, string> = {
  QUEUED: "bg-gray-100 text-gray-700",
  SENDING: "bg-blue-100 text-blue-700",
  SENT: "bg-green-100 text-green-700",
  DELIVERED: "bg-green-100 text-green-700",
  READ: "bg-purple-100 text-purple-700",
  FAILED: "bg-red-100 text-red-700",
  RETRYING: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-gray-100 text-gray-500",
}

export default function WhatsAppMessagesPage() {
  const [messages, setMessages] = React.useState<any[]>([])
  const [connections, setConnections] = React.useState<any[]>([])
  const [templates, setTemplates] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [search, setSearch] = React.useState("")
  const [sendOpen, setSendOpen] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [form, setForm] = React.useState({ connectionId: "", recipient: "", templateName: "", message: "" })

  React.useEffect(() => { load() }, [statusFilter])

  async function load() {
    setLoading(true)
    try {
      const params = statusFilter !== "ALL" ? `?status=${statusFilter}` : ""
      const [msgs, conns, tmpls] = await Promise.all([
        api.whatsapp.listMessages(params),
        api.whatsapp.listConnections(),
        api.whatsapp.listTemplates(),
      ])
      setMessages(msgs.data || [])
      setConnections(conns.data || [])
      setTemplates(tmpls.data || [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!form.recipient || !form.connectionId) {
      toast.error("Recipient and connection are required")
      return
    }
    setSending(true)
    try {
      if (form.templateName) {
        await api.whatsapp.sendMessage({
          connectionId: form.connectionId,
          recipient: form.recipient,
          templateName: form.templateName,
        })
      } else {
        await api.whatsapp.sendTest({
          connectionId: form.connectionId,
          recipient: form.recipient,
          message: form.message || "XERIN Express test message",
        })
      }
      toast.success("Message queued")
      setSendOpen(false)
      setForm({ connectionId: "", recipient: "", templateName: "", message: "" })
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const filtered = messages.filter((m: any) =>
    !search || m.recipient?.includes(search) || m.messageBody?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "WhatsApp", href: "/dashboard/whatsapp" }, { label: "Messages" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="WhatsApp Messages"
          description="Message logs with delivery tracking and retry status"
          actions={
            <Sheet open={sendOpen} onOpenChange={setSendOpen}>
              <SheetTrigger render={<Button />}>
                <HugeiconsIcon icon={SendIcon} className="size-4" />
                Send Message
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Send WhatsApp Message</SheetTitle>
                  <SheetDescription>Send a message or test via a connected WhatsApp session</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 px-4 pb-6">
                  <div className="grid gap-2">
                    <Label>Connection <span className="text-destructive">*</span></Label>
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
                    <Label>Recipient Phone <span className="text-destructive">*</span></Label>
                    <Input value={form.recipient} onChange={(e) => setForm(prev => ({ ...prev, recipient: e.target.value }))} placeholder="255700000000" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Template (optional)</Label>
                    <Select value={form.templateName} onValueChange={(v) => setForm(prev => ({ ...prev, templateName: v ?? "" }))}>
                      <SelectTrigger><SelectValue placeholder="Select template or type message" /></SelectTrigger>
                      <SelectContent>
                        {templates.map((t: any) => (
                          <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {!form.templateName && (
                    <div className="grid gap-2">
                      <Label>Message</Label>
                      <Textarea rows={4} value={form.message} onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))} placeholder="Type your message..." />
                    </div>
                  )}
                  <Button className="w-full" onClick={handleSend} disabled={sending}>
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="QUEUED">Queued</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="READ">Read</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="RETRYING">Retrying</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search by recipient or content..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Messages Table */}
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Recipient</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Message</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Event</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Connection</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Sent</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-48" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No messages found
                    </td>
                  </tr>
                ) : (
                  filtered.slice(0, 50).map((m: any) => (
                    <tr key={m.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 tabular-nums">{m.recipient}</td>
                      <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">{m.messageBody}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{m.eventType || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge className={MSG_STATUS_COLORS[m.status] || "bg-gray-100"}>
                          {m.status?.toLowerCase()}
                        </Badge>
                        {m.smsFallbackSent && <Badge variant="outline" className="ml-1 text-xs">SMS</Badge>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{m.connection?.name || "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{m.sentAt ? formatDate(m.sentAt) : "—"}</td>
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
