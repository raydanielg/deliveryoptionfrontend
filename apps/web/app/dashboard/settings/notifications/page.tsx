"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification03Icon, SaveIcon, Refresh01Icon, Settings02Icon,
  MailIcon, MessageIcon, BellIcon, WebhookIcon,
} from "@hugeicons/core-free-icons"

export default function NotificationSettingsPage() {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [settings, setSettings] = React.useState<any>(null)

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const res = await api.settings.getBusinessSettings()
      setSettings(res.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load notification settings")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      await api.settings.updateBusinessSettings(settings)
      toast.success("Notification settings saved")
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  function update(key: string, value: any) {
    setSettings((prev: any) => ({ ...prev, [key]: value }))
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/dashboard/settings" },
      { label: "Notifications" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="🔔 Notification Settings"
          description="Configure notification channels, providers, and delivery retry policies."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={load}>
                <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
                Reload
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !settings}>
                <HugeiconsIcon icon={SaveIcon} className="size-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          }
        />

        {loading || !settings ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Channel Toggles */}
            <div className="rounded-lg border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <HugeiconsIcon icon={Notification03Icon} className="size-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">Notification Channels</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1 pr-4">
                    <HugeiconsIcon icon={MailIcon} className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-xs font-medium">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Send email alerts for new shipments and status changes</p>
                    </div>
                  </div>
                  <Switch checked={settings.enableEmailNotifications} onCheckedChange={(v) => update("enableEmailNotifications", v)} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1 pr-4">
                    <HugeiconsIcon icon={MessageIcon} className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-xs font-medium">SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Send SMS to customers on shipment status changes</p>
                    </div>
                  </div>
                  <Switch checked={settings.enableSmsNotifications} onCheckedChange={(v) => update("enableSmsNotifications", v)} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1 pr-4">
                    <HugeiconsIcon icon={BellIcon} className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-xs font-medium">Push Notifications</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Driver app push notifications for new assignments</p>
                    </div>
                  </div>
                  <Switch checked={settings.enablePushNotifications} onCheckedChange={(v) => update("enablePushNotifications", v)} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1 pr-4">
                    <HugeiconsIcon icon={WebhookIcon} className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-xs font-medium">Webhook Notifications</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Send webhook events to external systems</p>
                    </div>
                  </div>
                  <Switch checked={settings.enableWebhookNotifications} onCheckedChange={(v) => update("enableWebhookNotifications", v)} />
                </div>
              </div>
            </div>

            {/* Provider Configuration */}
            <div className="rounded-lg border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <HugeiconsIcon icon={Settings02Icon} className="size-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">Provider Configuration</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">SMS Provider</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={settings.smsProvider} onChange={(e) => update("smsProvider", e.target.value)}>
                    <option value="africastalking">Africa's Talking</option>
                    <option value="twilio">Twilio</option>
                    <option value="selcom">Selcom</option>
                    <option value="azampesa">AzamPesa</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email Provider</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={settings.emailProvider} onChange={(e) => update("emailProvider", e.target.value)}>
                    <option value="smtp">SMTP</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="ses">Amazon SES</option>
                  </select>
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <Label className="text-xs">Retry Attempts</Label>
                  <Input type="number" value={settings.notificationRetryAttempts} onChange={(e) => update("notificationRetryAttempts", Number(e.target.value))} />
                  <p className="text-xs text-muted-foreground">Number of times to retry failed notifications</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Retry Delay (minutes)</Label>
                  <Input type="number" value={settings.notificationRetryDelayMinutes} onChange={(e) => update("notificationRetryDelayMinutes", Number(e.target.value))} />
                  <p className="text-xs text-muted-foreground">Wait time between retry attempts</p>
                </div>
              </div>
            </div>

            {/* Notification Events */}
            <div className="rounded-lg border bg-card p-5 lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <HugeiconsIcon icon={Notification03Icon} className="size-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">Notification Events & Triggers</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "New Shipment Created", desc: "Notify customer when a shipment is booked" },
                  { label: "Driver Assigned", desc: "Notify customer when a driver is assigned" },
                  { label: "Shipment Picked Up", desc: "Notify customer when parcel is picked up" },
                  { label: "Shipment In Transit", desc: "Notify customer when shipment is on the way" },
                  { label: "Out for Delivery", desc: "Notify customer when shipment is out for delivery" },
                  { label: "Delivered", desc: "Notify customer when shipment is delivered" },
                  { label: "Delivery Failed", desc: "Notify customer and admin on failed delivery" },
                  { label: "Return Initiated", desc: "Notify customer when a return is started" },
                ].map((event, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex-1 pr-3">
                      <p className="text-xs font-medium">{event.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.desc}</p>
                    </div>
                    <Switch defaultChecked={i < 6} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
