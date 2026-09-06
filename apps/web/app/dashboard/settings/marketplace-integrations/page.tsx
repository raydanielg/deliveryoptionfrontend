"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Separator } from "@workspace/ui/components/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Globe02Icon,
  PlusIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  ViewIcon,
  ViewOffIcon,
  RefreshIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export default function MarketplaceIntegrationsPage() {
  const [integrations, setIntegrations] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [testing, setTesting] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [showNewForm, setShowNewForm] = React.useState(false)

  // Form state
  const [name, setName] = React.useState("")
  const [provider, setProvider] = React.useState("")
  const [apiBaseUrl, setApiBaseUrl] = React.useState("")
  const [outboundWebhookUrl, setOutboundWebhookUrl] = React.useState("")
  const [authType, setAuthType] = React.useState("API_KEY")
  const [credentialEnvRef, setCredentialEnvRef] = React.useState("")
  const [webhookSecretRef, setWebhookSecretRef] = React.useState("")
  const [apiKeyHeader, setApiKeyHeader] = React.useState("X-API-Key")
  const [apiKey, setApiKey] = React.useState("")
  const [webhookSecret, setWebhookSecret] = React.useState("")
  const [isActive, setIsActive] = React.useState(false)

  // Visibility toggles
  const [showApiKey, setShowApiKey] = React.useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = React.useState(false)

  React.useEffect(() => { loadIntegrations() }, [])

  async function loadIntegrations() {
    setLoading(true)
    try {
      const res = await api.marketplaceIntegrations.list()
      const raw = res.data
      setIntegrations(Array.isArray(raw) ? raw : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load integrations")
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName("")
    setProvider("")
    setApiBaseUrl("")
    setOutboundWebhookUrl("")
    setAuthType("API_KEY")
    setCredentialEnvRef("")
    setWebhookSecretRef("")
    setApiKeyHeader("X-API-Key")
    setApiKey("")
    setWebhookSecret("")
    setIsActive(false)
    setShowApiKey(false)
    setShowWebhookSecret(false)
    setEditingId(null)
  }

  function startEdit(integration: any) {
    setEditingId(integration.id)
    setShowNewForm(true)
    setName(integration.name || "")
    setProvider(integration.provider || "")
    setApiBaseUrl(integration.apiBaseUrl || "")
    setOutboundWebhookUrl(integration.outboundWebhookUrl || "")
    setAuthType(integration.authType || "API_KEY")
    setCredentialEnvRef(integration.credentialEnvRef || "")
    setWebhookSecretRef(integration.webhookSecretRef || "")
    setApiKeyHeader(integration.apiKeyHeader || "X-API-Key")
    setApiKey(integration.apiKey || "")
    setWebhookSecret(integration.webhookSecret || "")
    setIsActive(integration.isActive ?? false)
    setShowApiKey(false)
    setShowWebhookSecret(false)
  }

  async function handleSave() {
    if (!provider || !apiBaseUrl) {
      toast.error("Provider name and API base URL are required")
      return
    }

    setSaving(true)
    try {
      const body: Record<string, any> = {
        name: name || provider,
        provider,
        apiBaseUrl,
        outboundWebhookUrl,
        authType,
        credentialEnvRef,
        webhookSecretRef,
        apiKeyHeader,
        isActive,
      }
      if (apiKey && !apiKey.includes("•••")) body.apiKey = apiKey
      if (webhookSecret && !webhookSecret.includes("•••")) body.webhookSecret = webhookSecret

      if (editingId) {
        await api.marketplaceIntegrations.update(editingId, body)
        toast.success("Integration updated successfully")
      } else {
        await api.marketplaceIntegrations.create(body)
        toast.success("Integration created successfully")
      }

      resetForm()
      setShowNewForm(false)
      loadIntegrations()
    } catch (err: any) {
      toast.error(err.message || "Failed to save integration")
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(id: string) {
    try {
      await api.marketplaceIntegrations.toggle(id)
      toast.success("Integration status updated")
      loadIntegrations()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle integration")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this integration?")) return
    try {
      await api.marketplaceIntegrations.delete(id)
      toast.success("Integration deleted")
      loadIntegrations()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete integration")
    }
  }

  async function handleTest(id: string) {
    setTesting(id)
    try {
      const res = await api.marketplaceIntegrations.test(id)
      if (res.data?.ok) {
        toast.success("Connection successful — provider is reachable")
      } else {
        toast.error(res.data?.error || res.message || "Connection failed")
      }
    } catch (err: any) {
      toast.error(err.message || "Connection test failed")
    } finally {
      setTesting(null)
    }
  }

  function copyWebhookUrl(providerName: string) {
    const url = `${window.location.origin}/api/v1/marketplace-integrations/webhooks/${providerName.toLowerCase()}`
    navigator.clipboard.writeText(url)
    toast.success("Webhook URL copied to clipboard")
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/dashboard/settings" },
      { label: "Marketplace Integrations" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Marketplace Integrations"
          description="Connect with external marketplace providers to receive and fulfill orders"
          actions={
            <Button onClick={() => { resetForm(); setShowNewForm(!showNewForm) }}>
              {showNewForm ? (
                <><HugeiconsIcon icon={Cancel01Icon} className="size-4" />Cancel</>
              ) : (
                <><HugeiconsIcon icon={PlusIcon} className="size-4" />Add Integration</>
              )}
            </Button>
          }
        />

        {/* New/Edit Form */}
        {showNewForm && (
          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b px-5 py-4">
              <HugeiconsIcon icon={Settings02Icon} className="size-5 text-primary" />
              <h2 className="text-base font-semibold">
                {editingId ? "Edit Integration" : "New Integration"}
              </h2>
            </div>
            <div className="space-y-4 p-5">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Integration Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DHL Marketplace" />
                </div>
                <div>
                  <Label htmlFor="provider">Provider *</Label>
                  <Input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. DHL" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="apiBaseUrl">API Base URL *</Label>
                  <Input id="apiBaseUrl" value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)} placeholder="https://provider.example/api" />
                </div>
                <div>
                  <Label htmlFor="outboundWebhookUrl">Outbound Webhook URL</Label>
                  <Input id="outboundWebhookUrl" value={outboundWebhookUrl} onChange={(e) => setOutboundWebhookUrl(e.target.value)} placeholder="https://provider.example/webhooks/xerin" />
                </div>
              </div>

              <Separator />

              {/* Authentication */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">Authentication</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Auth Type</Label>
                    <Select value={authType} onValueChange={(v) => setAuthType(v ?? "API_KEY")}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="API_KEY">API Key</SelectItem>
                        <SelectItem value="BEARER_TOKEN">Bearer Token</SelectItem>
                        <SelectItem value="NONE">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="apiKeyHeader">API Key Header</Label>
                    <Input id="apiKeyHeader" value={apiKeyHeader} onChange={(e) => setApiKeyHeader(e.target.value)} placeholder="X-API-Key" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="credentialEnvRef">Credential Environment Reference</Label>
                  <Input id="credentialEnvRef" value={credentialEnvRef} onChange={(e) => setCredentialEnvRef(e.target.value)} placeholder="DHL_API_KEY" />
                </div>
                <div>
                  <Label htmlFor="webhookSecretRef">Webhook Secret Reference</Label>
                  <Input id="webhookSecretRef" value={webhookSecretRef} onChange={(e) => setWebhookSecretRef(e.target.value)} placeholder="DHL_WEBHOOK_SECRET" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key"
                      className="pe-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <HugeiconsIcon icon={showApiKey ? ViewOffIcon : ViewIcon} className="size-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="webhookSecret">Webhook Secret</Label>
                  <div className="relative">
                    <Input
                      id="webhookSecret"
                      type={showWebhookSecret ? "text" : "password"}
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      placeholder="Enter your webhook secret"
                      className="pe-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <HugeiconsIcon icon={showWebhookSecret ? ViewOffIcon : ViewIcon} className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded border-input"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Integration active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { resetForm(); setShowNewForm(false) }}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving || !provider || !apiBaseUrl}>
                  {saving ? "Saving..." : editingId ? "Update Integration" : "Create Integration"}
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Integrations List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </Card>
            ))}
          </div>
        ) : integrations.length === 0 ? (
          <Card className="p-0">
            <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted/50">
                <HugeiconsIcon icon={Globe02Icon} className="size-7 text-muted-foreground/40" />
              </div>
              <div>
                <h3 className="text-base font-semibold">No integrations configured</h3>
                <p className="mt-1 text-sm text-muted-foreground">Add your first marketplace provider to start receiving orders</p>
              </div>
              <Button onClick={() => setShowNewForm(true)}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                Add Integration
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="overflow-hidden p-0">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <HugeiconsIcon icon={Globe02Icon} className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{integration.name}</h3>
                        <StatusBadge status={integration.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground">{integration.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(integration.id)}
                      disabled={testing === integration.id}
                    >
                      <HugeiconsIcon icon={RefreshIcon} className="size-4" />
                      {testing === integration.id ? "Testing..." : "Test"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(integration.id)}
                    >
                      {integration.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(integration)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(integration.id)}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Configuration Details */}
                <div className="divide-y">
                  {/* API Configuration */}
                  <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">API Base URL</Label>
                      <p className="mt-1 font-mono text-sm">{integration.apiBaseUrl || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Outbound Webhook URL</Label>
                      <p className="mt-1 font-mono text-sm">{integration.outboundWebhookUrl || "—"}</p>
                    </div>
                  </div>

                  {/* Authentication */}
                  <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Auth Type</Label>
                      <p className="mt-1 text-sm">{integration.authType || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">API Key Header</Label>
                      <p className="mt-1 font-mono text-sm">{integration.apiKeyHeader || "—"}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Credential Env Reference</Label>
                      <p className="mt-1 font-mono text-sm">{integration.credentialEnvRef || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Webhook Secret Reference</Label>
                      <p className="mt-1 font-mono text-sm">{integration.webhookSecretRef || "—"}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">API Key</Label>
                      <p className="mt-1 font-mono text-sm">{integration.apiKey || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Webhook Secret</Label>
                      <p className="mt-1 font-mono text-sm">{integration.webhookSecret || "Not set"}</p>
                    </div>
                  </div>

                  {/* Inbound Webhook URL */}
                  <div className="px-5 py-4">
                    <Label className="text-xs text-muted-foreground">Inbound Webhook URL (give this to the provider)</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 truncate rounded-lg bg-muted/50 px-3 py-2 font-mono text-sm">
                        {typeof window !== "undefined" ? `${window.location.origin}/api/v1/marketplace-integrations/webhooks/${integration.provider.toLowerCase()}` : `/api/v1/marketplace-integrations/webhooks/${integration.provider.toLowerCase()}`}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyWebhookUrl(integration.provider)}
                      >
                        <span className="text-xs">Copy</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
