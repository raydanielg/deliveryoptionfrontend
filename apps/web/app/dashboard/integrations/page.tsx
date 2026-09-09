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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@workspace/ui/components/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusIcon, PlugSocketIcon, CheckmarkCircle02Icon, AlertCircleIcon,
  SentIcon, RefreshIcon, Key01Icon, ClipboardIcon,
} from "@hugeicons/core-free-icons"

const AUTH_METHODS = ["NONE", "API_KEY", "BEARER", "BASIC", "OAUTH2", "CUSTOM"]
const PARTNER_STATUSES = ["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED", "ERROR"]
const EVENT_GROUPS: Record<string, string[]> = {
  Shipment: ["shipment.created", "shipment.updated", "shipment.cancelled", "shipment.in_transit", "shipment.arrived", "shipment.out_for_delivery", "shipment.delivered", "shipment.delivery_failed"],
  Payment: ["payment.pending", "payment.success", "payment.failed", "payment.refunded"],
  Driver: ["driver.assigned", "driver.reassigned"],
  Cargo: ["cargo.received", "cargo.picked_up", "pod.created"],
  Exception: ["exception.created", "exception.resolved"],
  Customs: ["customs.hold", "customs.released"],
  Warehouse: ["warehouse.received", "warehouse.moved", "warehouse.dispatched"],
  SGR: ["sgr.loaded", "sgr.departed", "sgr.arrived"],
  Air: ["air.loaded", "air.departed", "air.arrived"],
}
const ALL_EVENTS = Object.values(EVENT_GROUPS).flat()

const HEALTH_TONE: Record<string, "good" | "warning" | "serious" | "critical" | "neutral"> = {
  HEALTHY: "good", WARNING: "warning", DEGRADED: "serious", FAILING: "critical", DISABLED: "neutral",
}

const emptyForm = {
  name: "", company: "", contactEmail: "", apiBaseUrl: "",
  authMethod: "NONE", authConfig: {} as Record<string, string>,
  webhookUrl: "", subscribedEvents: [] as string[], scopes: ["shipments.read"] as string[],
  status: "PENDING", notes: "",
}

export default function IntegrationsPage() {
  const [partners, setPartners] = React.useState<any[]>([])
  const [dashboard, setDashboard] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm)
  const [saving, setSaving] = React.useState(false)
  const [selected, setSelected] = React.useState<any>(null)
  const [tab, setTab] = React.useState<"overview" | "logs" | "webhooks" | "keys">("overview")
  const [logs, setLogs] = React.useState<any[]>([])
  const [deliveries, setDeliveries] = React.useState<any[]>([])
  const [apiKeys, setApiKeys] = React.useState<any[]>([])
  const [revealedKey, setRevealedKey] = React.useState<string | null>(null)
  const [testing, setTesting] = React.useState(false)

  React.useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [p, d] = await Promise.all([api.integrations.listPartners(), api.integrations.dashboard()])
      setPartners(p.data || [])
      setDashboard(d.data || null)
    } catch (err: any) {
      toast.error(err.message || "Failed to load integrations")
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setForm(emptyForm)
    setCreateOpen(true)
  }

  async function submitCreate() {
    if (!form.name.trim()) { toast.error("Partner name is required"); return }
    setSaving(true)
    try {
      const res = await api.integrations.createPartner(form)
      toast.success("Partner integration created")
      if (res.data?.webhookSecretOnceOnly) {
        setRevealedKey(res.data.webhookSecretOnceOnly)
      }
      setCreateOpen(false)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to create partner")
    } finally {
      setSaving(false)
    }
  }

  async function openDetail(partner: any) {
    setSelected(partner)
    setTab("overview")
    try {
      const [l, w, k] = await Promise.all([
        api.integrations.getLogs(partner.id, "limit=20"),
        api.integrations.getWebhookDeliveries(partner.id, "limit=20"),
        api.integrations.listApiKeys(partner.id),
      ])
      setLogs(l.data || [])
      setDeliveries(w.data || [])
      setApiKeys(k.data || [])
    } catch {
      // partner detail still shows even if a sub-panel fails to load
    }
  }

  async function toggleStatus(partner: any) {
    const next = partner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      await api.integrations.setPartnerStatus(partner.id, next)
      toast.success(next === "ACTIVE" ? "Partner activated" : "Partner disabled")
      load()
      if (selected?.id === partner.id) setSelected({ ...selected, status: next })
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  async function runTestWebhook(partnerId: string) {
    setTesting(true)
    try {
      const res = await api.integrations.testWebhook(partnerId)
      const d = res.data
      if (d.status === "DELIVERED") {
        toast.success(`Test webhook delivered — HTTP ${d.httpStatus} in ${d.responseTimeMs}ms`)
      } else {
        toast.error(`Test webhook failed: ${d.lastError || `HTTP ${d.httpStatus}`}`)
      }
    } catch (err: any) {
      toast.error(err.message || "Test webhook failed")
    } finally {
      setTesting(false)
    }
  }

  async function createKey(partnerId: string) {
    try {
      const res = await api.integrations.createApiKey(partnerId, { label: "New key", environment: "live", scopes: selected?.scopes || [] })
      setRevealedKey(res.data.apiKey)
      const k = await api.integrations.listApiKeys(partnerId)
      setApiKeys(k.data || [])
    } catch (err: any) {
      toast.error(err.message || "Failed to create API key")
    }
  }

  async function revokeKey(keyId: string, partnerId: string) {
    try {
      await api.integrations.revokeApiKey(keyId)
      toast.success("API key revoked")
      const k = await api.integrations.listApiKeys(partnerId)
      setApiKeys(k.data || [])
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke key")
    }
  }

  function toggleEvent(event: string) {
    setForm((f) => ({
      ...f,
      subscribedEvents: f.subscribedEvents.includes(event) ? f.subscribedEvents.filter((e) => e !== event) : [...f.subscribedEvents, event],
    }))
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Integrations" }]}>
      <PageHeader
        title="Partner Integrations"
        description="External partners, marketplaces, and logistics providers connected to Xerin Express via API and webhooks."
        actions={<Button onClick={openCreate}><HugeiconsIcon icon={PlusIcon} className="mr-1.5 size-4" />New Partner</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Integrations" value={dashboard?.total ?? "—"} icon={PlugSocketIcon} loading={loading} />
        <MetricCard label="Active" value={dashboard?.active ?? "—"} icon={CheckmarkCircle02Icon} loading={loading} />
        <MetricCard label="Failing" value={dashboard?.failed ?? "—"} icon={AlertCircleIcon} loading={loading} />
        <MetricCard label="Events (24h)" value={dashboard?.eventsToday ?? "—"} subtitle={dashboard ? `${dashboard.deliveredToday} delivered · ${dashboard.failedToday} failed` : undefined} icon={SentIcon} loading={loading} />
      </div>

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Auth</th>
                <th className="px-4 py-3">Webhook</th>
                <th className="px-4 py-3">Events</th>
                <th className="px-4 py-3">Health</th>
                <th className="px-4 py-3">Last Activity</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td></tr>
                ))
              ) : partners.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No partner integrations yet. Create one to connect an external system.</td></tr>
              ) : (
                partners.map((p) => (
                  <tr key={p.id} className="cursor-pointer transition-colors hover:bg-muted/20" onClick={() => openDetail(p)}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.name}</div>
                      {p.company && <div className="text-xs text-muted-foreground">{p.company}</div>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.authMethod}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.webhookUrl ? "Configured" : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.subscribedEvents?.length || 0}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className={HEALTH_TONE[p.health] === "good" ? "border-emerald-500/40 text-emerald-600" : HEALTH_TONE[p.health] === "critical" ? "border-red-500/40 text-red-600" : ""}>{p.health}</Badge></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.lastActivityAt ? formatDate(p.lastActivityAt) : "Never"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); toggleStatus(p) }}>
                        {p.status === "ACTIVE" ? "Disable" : "Enable"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Partner Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Partner Integration</DialogTitle>
            <DialogDescription>Every field here maps to real backend authentication, webhook signing, and event-subscription logic — nothing is stored without effect.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Partner Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Acme Marketplace" />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Contact Email</Label>
                <Input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Partner API Base URL</Label>
                <Input value={form.apiBaseUrl} onChange={(e) => setForm({ ...form, apiBaseUrl: e.target.value })} placeholder="https://partner.example.com/api/v1" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Authentication</Label>
              <Select value={form.authMethod} onValueChange={(v) => setForm({ ...form, authMethod: v || "NONE", authConfig: {} })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUTH_METHODS.map((m) => <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {form.authMethod === "API_KEY" && (
              <div className="grid gap-3 sm:grid-cols-2 rounded-lg border p-3">
                <div className="space-y-1.5">
                  <Label>Header Name</Label>
                  <Input value={form.authConfig.headerName || ""} onChange={(e) => setForm({ ...form, authConfig: { ...form.authConfig, headerName: e.target.value } })} placeholder="X-API-Key" />
                </div>
                <div className="space-y-1.5">
                  <Label>API Key</Label>
                  <Input type="password" value={form.authConfig.apiKey || ""} onChange={(e) => setForm({ ...form, authConfig: { ...form.authConfig, apiKey: e.target.value } })} />
                </div>
              </div>
            )}
            {form.authMethod === "BEARER" && (
              <div className="rounded-lg border p-3 space-y-1.5">
                <Label>Bearer Token</Label>
                <Input type="password" value={form.authConfig.token || ""} onChange={(e) => setForm({ ...form, authConfig: { ...form.authConfig, token: e.target.value } })} />
              </div>
            )}
            {form.authMethod === "BASIC" && (
              <div className="grid gap-3 sm:grid-cols-2 rounded-lg border p-3">
                <div className="space-y-1.5">
                  <Label>Username</Label>
                  <Input value={form.authConfig.username || ""} onChange={(e) => setForm({ ...form, authConfig: { ...form.authConfig, username: e.target.value } })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <Input type="password" value={form.authConfig.password || ""} onChange={(e) => setForm({ ...form, authConfig: { ...form.authConfig, password: e.target.value } })} />
                </div>
              </div>
            )}
            {form.authMethod === "OAUTH2" && (
              <div className="grid gap-3 sm:grid-cols-2 rounded-lg border p-3">
                <div className="space-y-1.5"><Label>Client ID</Label><Input value={form.authConfig.clientId || ""} onChange={(e) => setForm({ ...form, authConfig: { ...form.authConfig, clientId: e.target.value } })} /></div>
                <div className="space-y-1.5"><Label>Client Secret</Label><Input type="password" value={form.authConfig.clientSecret || ""} onChange={(e) => setForm({ ...form, authConfig: { ...form.authConfig, clientSecret: e.target.value } })} /></div>
                <div className="space-y-1.5"><Label>Authorization URL</Label><Input value={form.authConfig.authorizationUrl || ""} onChange={(e) => setForm({ ...form, authConfig: { ...form.authConfig, authorizationUrl: e.target.value } })} /></div>
                <div className="space-y-1.5"><Label>Token URL</Label><Input value={form.authConfig.tokenUrl || ""} onChange={(e) => setForm({ ...form, authConfig: { ...form.authConfig, tokenUrl: e.target.value } })} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Scopes</Label><Input value={form.authConfig.scopes || ""} onChange={(e) => setForm({ ...form, authConfig: { ...form.authConfig, scopes: e.target.value } })} placeholder="read write" /></div>
              </div>
            )}
            {form.authMethod === "CUSTOM" && (
              <div className="grid gap-3 sm:grid-cols-2 rounded-lg border p-3">
                <div className="space-y-1.5"><Label>Header Name</Label><Input value={form.authConfig.headerName || ""} onChange={(e) => setForm({ ...form, authConfig: { ...form.authConfig, headerName: e.target.value } })} /></div>
                <div className="space-y-1.5"><Label>Header Value</Label><Input type="password" value={form.authConfig.headerValue || ""} onChange={(e) => setForm({ ...form, authConfig: { ...form.authConfig, headerValue: e.target.value } })} /></div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Outbound Webhook URL</Label>
              <Input value={form.webhookUrl} onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })} placeholder="https://partner.example.com/webhooks/xerin" />
              <p className="text-xs text-muted-foreground">A signing secret is generated automatically and shown once when you save — every payload is HMAC-signed with it.</p>
            </div>

            <div className="space-y-1.5">
              <Label>Enabled Events</Label>
              <div className="max-h-56 overflow-y-auto rounded-lg border p-3 space-y-3">
                {Object.entries(EVENT_GROUPS).map(([group, events]) => (
                  <div key={group}>
                    <div className="mb-1 text-xs font-semibold text-muted-foreground">{group}</div>
                    <div className="flex flex-wrap gap-2">
                      {events.map((ev) => (
                        <button
                          key={ev}
                          type="button"
                          onClick={() => toggleEvent(ev)}
                          className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${form.subscribedEvents.includes(ev) ? "border-primary bg-primary/10 text-primary" : "border-muted text-muted-foreground hover:border-primary/40"}`}
                        >
                          {ev}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v || "PENDING" })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{PARTNER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={submitCreate} disabled={saving}>{saving ? "Saving..." : "Save Integration"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revealed secret (webhook secret or API key) — shown exactly once */}
      <Dialog open={!!revealedKey} onOpenChange={() => setRevealedKey(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Copy this now — it won't be shown again</DialogTitle>
            <DialogDescription>Store it securely. Xerin only keeps a hash/encrypted copy from this point on.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
            <code className="flex-1 break-all text-xs">{revealedKey}</code>
            <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(revealedKey || ""); toast.success("Copied") }}>
              <HugeiconsIcon icon={ClipboardIcon} className="size-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealedKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partner detail */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{selected.company || "Partner integration"}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <Badge variant="outline">{selected.health}</Badge>
                  <Badge variant="outline">{selected.authMethod}</Badge>
                </div>

                <div className="flex gap-2 border-b pb-2">
                  {(["overview", "logs", "webhooks", "keys"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                      {t}
                    </button>
                  ))}
                </div>

                {tab === "overview" && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">API Base URL</span><span>{selected.apiBaseUrl || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Webhook URL</span><span className="max-w-[220px] truncate">{selected.webhookUrl || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Events subscribed</span><span>{selected.subscribedEvents?.length || 0}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatDate(selected.createdAt)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Last activity</span><span>{selected.lastActivityAt ? formatDate(selected.lastActivityAt) : "Never"}</span></div>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {selected.subscribedEvents?.map((e: string) => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)}
                    </div>
                    <Button className="w-full" variant="outline" disabled={testing || !selected.webhookUrl} onClick={() => runTestWebhook(selected.id)}>
                      <HugeiconsIcon icon={SentIcon} className="mr-1.5 size-4" />{testing ? "Sending..." : "Send Test Webhook"}
                    </Button>
                  </div>
                )}

                {tab === "logs" && (
                  <div className="space-y-2">
                    {logs.length === 0 && <p className="text-sm text-muted-foreground">No integration activity yet.</p>}
                    {logs.map((l) => (
                      <div key={l.id} className="rounded-lg border p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{l.direction} · {l.event || "—"}</span>
                          <Badge variant={l.result === "SUCCESS" ? "outline" : "destructive"} className="text-[10px]">{l.result}</Badge>
                        </div>
                        <div className="mt-1 text-muted-foreground">{l.httpStatus ?? ""} {l.latencyMs ? `· ${l.latencyMs}ms` : ""} · {formatDate(l.createdAt)}</div>
                        {l.message && <div className="mt-1 text-muted-foreground">{l.message}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {tab === "webhooks" && (
                  <div className="space-y-2">
                    {deliveries.length === 0 && <p className="text-sm text-muted-foreground">No webhook deliveries yet.</p>}
                    {deliveries.map((d) => (
                      <div key={d.id} className="rounded-lg border p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{d.event}</span>
                          <StatusBadge status={d.status} />
                        </div>
                        <div className="mt-1 text-muted-foreground">Attempt {d.attempt}/{d.maxAttempts} · {d.httpStatus ?? "—"} · {formatDate(d.createdAt)}</div>
                        {d.status === "FAILED" && (
                          <Button size="sm" variant="outline" className="mt-2 h-7 text-[11px]" onClick={async () => { await api.integrations.retryDelivery(d.id); toast.success("Requeued"); openDetail(selected) }}>
                            <HugeiconsIcon icon={RefreshIcon} className="mr-1 size-3" />Retry
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {tab === "keys" && (
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" onClick={() => createKey(selected.id)}>
                      <HugeiconsIcon icon={Key01Icon} className="mr-1.5 size-4" />Create API Key
                    </Button>
                    {apiKeys.map((k) => (
                      <div key={k.id} className="flex items-center justify-between rounded-lg border p-2.5 text-xs">
                        <div>
                          <div className="font-mono">{k.keyPrefix}****</div>
                          <div className="text-muted-foreground">{k.environment} · {k.status} · {k.scopes?.join(", ")}</div>
                        </div>
                        {k.status === "ACTIVE" && (
                          <Button size="sm" variant="ghost" className="h-7 text-[11px] text-destructive" onClick={() => revokeKey(k.id, selected.id)}>Revoke</Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
