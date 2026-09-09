"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@workspace/ui/components/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@workspace/ui/components/dialog"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Message01Icon,
  PlusIcon,
  RefreshIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ClockIcon,
  SendIcon,
  Cancel01Icon,
  PlayIcon,
  PauseIcon,
  Logout01Icon,
  Login01Icon,
  WifiOff01Icon,
  Wifi01Icon,
  QrCode01Icon,
  AlertDiamondIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"
import QRCode from "qrcode"
import { useEffect, useState } from "react"

function QRCodeImage({ data }: { data: string }) {
  const [src, setSrc] = useState<string>("")
  useEffect(() => {
    QRCode.toDataURL(data, { width: 256, margin: 1 }).then(setSrc).catch(() => {})
  }, [data])
  return src ? <img src={src} alt="WhatsApp QR Code" className="w-64 h-64 rounded-lg" /> : <div className="w-64 h-64 animate-pulse bg-muted rounded-lg" />
}

const STATUS_CONFIG: Record<string, { color: string; dot: string; icon: any }> = {
  CONNECTED: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", dot: "bg-emerald-500", icon: Wifi01Icon },
  QR_REQUIRED: { color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", dot: "bg-amber-500", icon: QrCode01Icon },
  CONNECTING: { color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", dot: "bg-blue-500", icon: ClockIcon },
  RECONNECTING: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400", dot: "bg-yellow-500", icon: RefreshIcon },
  DISCONNECTED: { color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", dot: "bg-gray-400", icon: WifiOff01Icon },
  SESSION_EXPIRED: { color: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400", dot: "bg-red-500", icon: AlertDiamondIcon },
  ERROR: { color: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400", dot: "bg-red-500", icon: AlertCircleIcon },
  DISABLED: { color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500", dot: "bg-gray-300", icon: PauseIcon },
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DISCONNECTED!
  return (
    <Badge className={`${config.color} gap-1.5`}>
      <span className={`size-1.5 rounded-full ${config.dot} ${status === "CONNECTING" || status === "RECONNECTING" ? "animate-pulse" : ""}`} />
      {status?.replace(/_/g, " ").toLowerCase()}
    </Badge>
  )
}

export default function WhatsAppPage() {
  const [dashboard, setDashboard] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [addLoading, setAddLoading] = React.useState(false)
  const [newConn, setNewConn] = React.useState({ name: "", purpose: "customer_care" })
  const [qrData, setQrData] = React.useState<{ connectionId: string; qrCode: string } | null>(null)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)
  const [testOpen, setTestOpen] = React.useState(false)
  const [testConn, setTestConn] = React.useState<any>(null)
  const [testForm, setTestForm] = React.useState({ recipient: "", message: "" })
  const [testSending, setTestSending] = React.useState(false)

  React.useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const res = await api.whatsapp.dashboard()
      setDashboard(res.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load WhatsApp data")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!newConn.name) {
      toast.error("Connection name is required")
      return
    }
    setAddLoading(true)
    try {
      const res = await api.whatsapp.createConnection({ name: newConn.name, purpose: newConn.purpose })
      if (res.data?.qrCode) {
        setQrData({ connectionId: res.data.connectionId, qrCode: res.data.qrCode })
        toast.success("QR code generated — scan with WhatsApp")
      } else if (res.data?.status === "CONNECTED") {
        toast.success("WhatsApp connected successfully")
        setAddOpen(false)
        loadData()
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create connection")
    } finally {
      setAddLoading(false)
    }
  }

  async function pollQR(connectionId: string) {
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 3000))
      try {
        const res = await api.whatsapp.getQRCode(connectionId)
        if (res.data?.status === "CONNECTED") {
          toast.success("WhatsApp connected!")
          setQrData(null)
          setAddOpen(false)
          loadData()
          return
        }
        if (res.data?.qrCode && res.data.qrCode !== qrData?.qrCode) {
          setQrData({ connectionId, qrCode: res.data.qrCode })
        }
      } catch {
        // ignore
      }
    }
  }

  React.useEffect(() => {
    if (qrData?.connectionId) {
      pollQR(qrData.connectionId)
    }
  }, [qrData?.connectionId])

  async function handleAction(action: string, conn: any) {
    setActionLoading(`${action}-${conn.id}`)
    try {
      if (action === "reconnect") await api.whatsapp.reconnect(conn.id)
      else if (action === "disconnect") await api.whatsapp.disconnect(conn.id, false)
      else if (action === "logout") await api.whatsapp.disconnect(conn.id, true)
      else if (action === "toggle") await api.whatsapp.toggleConnection(conn.id, !conn.isActive)
      toast.success(`${action} completed`)
      loadData()
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action}`)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleTestMessage(conn: any) {
    setTestConn(conn)
    setTestForm({ recipient: "", message: "" })
    setTestOpen(true)
  }

  async function sendTest() {
    if (!testConn) return
    if (!testForm.recipient.trim()) {
      toast.error("Recipient phone number is required")
      return
    }
    setTestSending(true)
    try {
      const res = await api.whatsapp.sendTest({
        connectionId: testConn.id,
        recipient: testForm.recipient.trim(),
        message: testForm.message.trim() || undefined,
      })
      toast.success(res?.data?.status === "SENT" ? "Test message sent!" : `Test message ${res?.data?.status || "queued"}`)
      setTestOpen(false)
      setTestConn(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to send test message")
    } finally {
      setTestSending(false)
    }
  }

  const connections = dashboard?.connections || []
  const summary = dashboard?.summary || {}

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "WhatsApp Engine" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="WhatsApp Engine"
          description="Persistent session-based WhatsApp messaging — connect once, send forever"
          actions={
            <div className="flex gap-2">
              <Sheet open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) setQrData(null) }}>
                <SheetTrigger render={<Button />}>
                  <HugeiconsIcon icon={PlusIcon} className="size-4" />
                  Add Connection
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <HugeiconsIcon icon={Message01Icon} className="size-5 text-primary" />
                      Add WhatsApp Connection
                    </SheetTitle>
                    <SheetDescription>Connect a WhatsApp account by scanning QR once</SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 px-4 pb-6">
                    {!qrData ? (
                      <>
                        <div className="grid gap-2">
                          <Label>Connection Name <span className="text-destructive">*</span></Label>
                          <Input value={newConn.name} onChange={(e) => setNewConn(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. XERIN Customer Care" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Purpose</Label>
                          <Select value={newConn.purpose} onValueChange={(v) => setNewConn(prev => ({ ...prev, purpose: v ?? "customer_care" }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer_care">Customer Care</SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="operations">Operations</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                          <HugeiconsIcon icon={AlertCircleIcon} className="size-4 shrink-0 text-amber-500" />
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            You'll need your phone with WhatsApp installed to scan the QR code.
                            Make sure WhatsApp Web is not already linked on too many devices.
                          </p>
                        </div>
                        <Button className="w-full" onClick={handleCreate} disabled={addLoading}>
                          {addLoading ? (
                            <><HugeiconsIcon icon={ClockIcon} className="size-4 animate-pulse" /> Generating QR...</>
                          ) : (
                            <><HugeiconsIcon icon={QrCode01Icon} className="size-4" /> Generate QR Code</>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 dark:border-amber-900 dark:bg-amber-950/30">
                          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Waiting for scan...</span>
                        </div>
                        <div className="rounded-xl border-2 border-primary/20 bg-white p-4 shadow-lg">
                          <QRCodeImage data={qrData.qrCode} />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <p className="text-sm font-medium text-center">
                            Open WhatsApp on your phone
                          </p>
                          <p className="text-xs text-muted-foreground text-center max-w-xs">
                            Settings → Linked Devices → Link a Device → Scan this QR code
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <HugeiconsIcon icon={ClockIcon} className="size-4 animate-pulse" />
                          QR refreshes automatically every 3 seconds
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => { setQrData(null); setAddOpen(false) }}>
                          <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              <Button variant="outline" onClick={() => loadData()}>
                <HugeiconsIcon icon={RefreshIcon} className="size-4" />
                Refresh
              </Button>
            </div>
          }
        />

        {/* Test Message Dialog */}
        <Sheet open={testOpen} onOpenChange={(v) => { setTestOpen(v); if (!v) setTestConn(null) }}>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={SendIcon} className="size-5 text-primary" />
                Send Test Message
              </SheetTitle>
              <SheetDescription>Send a test WhatsApp message to verify your connection is working</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-4 pb-6">
              {testConn && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <HugeiconsIcon icon={Message01Icon} className="size-4 text-primary" />
                    <span className="font-medium">{testConn.name}</span>
                    <StatusBadge status={testConn.status} />
                  </div>
                  {testConn.accountId && (
                    <p className="mt-1 text-xs text-muted-foreground">Account: {testConn.accountId}</p>
                  )}
                </div>
              )}
              <div className="grid gap-2">
                <Label>Recipient Phone <span className="text-destructive">*</span></Label>
                <Input
                  value={testForm.recipient}
                  onChange={(e) => setTestForm(prev => ({ ...prev, recipient: e.target.value }))}
                  placeholder="255700000000"
                />
                <p className="text-xs text-muted-foreground">Enter full phone number with country code (e.g. 255 for Tanzania)</p>
              </div>
              <div className="grid gap-2">
                <Label>Message (optional)</Label>
                <Textarea
                  value={testForm.message}
                  onChange={(e) => setTestForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="XERIN Express test message — this is a test from the WhatsApp Engine."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">Leave empty to use default test message</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-4 shrink-0 text-blue-500" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Make sure the recipient has WhatsApp installed and the phone number is active.
                  The message will be sent via your connected WhatsApp account.
                </p>
              </div>
              <Button className="w-full" onClick={sendTest} disabled={testSending}>
                {testSending ? (
                  <><HugeiconsIcon icon={ClockIcon} className="size-4 animate-pulse" /> Sending...</>
                ) : (
                  <><HugeiconsIcon icon={SendIcon} className="size-4" /> Send Test Message</>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <MetricCard label="Connections" value={formatNumber(summary.totalConnections || 0)} icon={Message01Icon} loading={loading} />
          <MetricCard label="Connected" value={formatNumber(summary.connected || 0)} icon={CheckmarkCircle02Icon} loading={loading} />
          <MetricCard label="Messages Sent" value={formatNumber(summary.totalSent || 0)} icon={SendIcon} loading={loading} />
          <MetricCard label="Delivered" value={formatNumber(summary.totalDelivered || 0)} icon={CheckmarkCircle02Icon} loading={loading} />
          <MetricCard label="Queued" value={formatNumber(summary.totalQueued || 0)} icon={ClockIcon} loading={loading} />
          <MetricCard label="Failed" value={formatNumber(summary.totalFailed || 0)} icon={AlertCircleIcon} loading={loading} />
        </div>

        {/* Connections Table */}
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Account</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Purpose</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Messages</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Last Seen</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    </tr>
                  ))
                ) : connections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Message01Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No WhatsApp connections yet</p>
                    </td>
                  </tr>
                ) : (
                  connections.map((c: any) => {
                    const config = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.DISCONNECTED!
                    const isActive = actionLoading?.endsWith(c.id)
                    return (
                      <tr key={c.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`flex size-8 items-center justify-center rounded-lg ${config.color}`}>
                              <HugeiconsIcon icon={config.icon} className="size-4" />
                            </div>
                            <span className="font-medium">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.accountId || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">{c.purpose || "—"}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-4 py-3 tabular-nums text-xs">
                          <span className="text-green-600">{c.messagesSent} sent</span>
                          {" / "}
                          <span className="text-red-600">{c.messagesFailed} failed</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{c.lastSeenAt ? formatDate(c.lastSeenAt) : "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {c.status === "CONNECTED" && (
                              <Button size="sm" variant="outline" disabled={isActive}
                                onClick={() => handleTestMessage(c)}>
                                <HugeiconsIcon icon={SendIcon} className="size-3.5" />
                                Test
                              </Button>
                            )}
                            {(c.status === "DISCONNECTED" || c.status === "ERROR" || c.status === "SESSION_EXPIRED") && c.isActive && (
                              <Button size="sm" variant="outline" disabled={isActive}
                                onClick={() => handleAction("reconnect", c)}>
                                <HugeiconsIcon icon={Login01Icon} className="size-3.5" />
                                Reconnect
                              </Button>
                            )}
                            {c.status === "CONNECTED" && (
                              <Button size="sm" variant="outline" disabled={isActive}
                                onClick={() => handleAction("disconnect", c)}>
                                <HugeiconsIcon icon={WifiOff01Icon} className="size-3.5" />
                                Disconnect
                              </Button>
                            )}
                            {c.status !== "DISABLED" && (
                              <Button size="sm" variant="outline" disabled={isActive}
                                onClick={() => handleAction("logout", c)}>
                                <HugeiconsIcon icon={Logout01Icon} className="size-3.5" />
                                Logout
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" disabled={isActive}
                              onClick={() => handleAction("toggle", c)}>
                              <HugeiconsIcon icon={c.isActive ? PauseIcon : PlayIcon} className="size-3.5" />
                              {c.isActive ? "Disable" : "Enable"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
