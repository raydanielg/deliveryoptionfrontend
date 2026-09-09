"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Message01Icon, PlusIcon, Search01Icon, RefreshIcon, CheckmarkCircle02Icon, AlertCircleIcon, ClockIcon, SendIcon, Cancel01Icon, PlayIcon, PauseIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"

const STATUS_COLORS: Record<string, string> = {
  CONNECTED: "bg-green-100 text-green-700",
  QR_REQUIRED: "bg-orange-100 text-orange-700",
  CONNECTING: "bg-blue-100 text-blue-700",
  RECONNECTING: "bg-yellow-100 text-yellow-700",
  DISCONNECTED: "bg-gray-100 text-gray-700",
  SESSION_EXPIRED: "bg-red-100 text-red-700",
  ERROR: "bg-red-100 text-red-700",
  DISABLED: "bg-gray-100 text-gray-500",
}

export default function WhatsAppPage() {
  const [dashboard, setDashboard] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [addOpen, setAddOpen] = React.useState(false)
  const [addLoading, setAddLoading] = React.useState(false)
  const [newConn, setNewConn] = React.useState({ name: "", purpose: "customer_care" })
  const [qrData, setQrData] = React.useState<{ connectionId: string; qrCode: string } | null>(null)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

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
    setActionLoading(conn.id)
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
    const phone = prompt("Enter test recipient phone number (e.g. 255700000000):")
    if (!phone) return
    setActionLoading(`test-${conn.id}`)
    try {
      await api.whatsapp.sendTest({ connectionId: conn.id, recipient: phone })
      toast.success("Test message queued")
    } catch (err: any) {
      toast.error(err.message || "Failed to send test")
    } finally {
      setActionLoading(null)
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
                        <Button className="w-full" onClick={handleCreate} disabled={addLoading}>
                          {addLoading ? "Generating QR..." : "Generate QR Code"}
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-muted-foreground text-center">
                          Open WhatsApp on your phone → Settings → Linked Devices → Link a Device → Scan this QR
                        </p>
                        <div className="rounded-lg border p-4 bg-white">
                          <img src={qrData.qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <HugeiconsIcon icon={ClockIcon} className="size-4 animate-pulse" />
                          Waiting for scan...
                        </div>
                        <Button variant="outline" onClick={() => { setQrData(null); setAddOpen(false) }}>
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
                  connections.map((c: any) => (
                    <tr key={c.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.accountId || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{c.purpose || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_COLORS[c.status] || "bg-gray-100 text-gray-700"}>
                          {c.status?.replace(/_/g, " ").toLowerCase()}
                        </Badge>
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
                            <Button size="sm" variant="outline" disabled={actionLoading === `test-${c.id}`}
                              onClick={() => handleTestMessage(c)}>
                              Test
                            </Button>
                          )}
                          {(c.status === "DISCONNECTED" || c.status === "ERROR" || c.status === "SESSION_EXPIRED") && c.isActive && (
                            <Button size="sm" variant="outline" disabled={actionLoading === c.id}
                              onClick={() => handleAction("reconnect", c)}>
                              Reconnect
                            </Button>
                          )}
                          {c.status === "CONNECTED" && (
                            <Button size="sm" variant="outline" disabled={actionLoading === c.id}
                              onClick={() => handleAction("disconnect", c)}>
                              Disconnect
                            </Button>
                          )}
                          {c.status !== "DISABLED" && (
                            <Button size="sm" variant="outline" disabled={actionLoading === c.id}
                              onClick={() => handleAction("logout", c)}>
                              Logout
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" disabled={actionLoading === c.id}
                            onClick={() => handleAction("toggle", c)}>
                            {c.isActive ? "Disable" : "Enable"}
                          </Button>
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
