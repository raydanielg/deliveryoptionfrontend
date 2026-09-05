"use client"

import * as React from "react"
import Link from "next/link"
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
  Settings02Icon, Building02Icon, SecurityCheckIcon, TruckIcon,
  Notification03Icon, QrCodeIcon, SaveIcon, Refresh01Icon,
  MapIcon, ArrowRight01Icon, UserGroupIcon,
  LockIcon, Globe02Icon,
} from "@hugeicons/core-free-icons"

type TabId = "business" | "security" | "delivery" | "notifications" | "system"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("business")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [settings, setSettings] = React.useState<any>(null)

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const res = await api.settings.getBusinessSettings()
      setSettings(res.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      await api.settings.updateBusinessSettings(settings)
      toast.success("Settings saved successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  function update<K extends keyof any>(key: string, value: any) {
    setSettings((prev: any) => ({ ...prev, [key]: value }))
  }

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: "business", label: "Business Info", icon: Building02Icon },
    { id: "security", label: "Security & Rate Limits", icon: SecurityCheckIcon },
    { id: "delivery", label: "Delivery & Operations", icon: TruckIcon },
    { id: "notifications", label: "Notifications", icon: Notification03Icon },
    { id: "system", label: "System Management", icon: Settings02Icon },
  ]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="⚙️ General Settings"
          description="Business configuration, system management, security, and operational settings."
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

        {/* Quick nav cards to other settings pages */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/dashboard/settings/map" className="group rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <HugeiconsIcon icon={MapIcon} className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Map & API Keys</h3>
                <p className="text-xs text-muted-foreground">Configure map providers and API keys</p>
              </div>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>
          <Link href="/dashboard/settings/team" className="group rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <HugeiconsIcon icon={UserGroupIcon} className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Team Management</h3>
                <p className="text-xs text-muted-foreground">Manage team members and roles</p>
              </div>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>
          <Link href="/dashboard/settings/notifications" className="group rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <HugeiconsIcon icon={Notification03Icon} className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Notification Settings</h3>
                <p className="text-xs text-muted-foreground">Configure notification channels and providers</p>
              </div>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-1.5 border-b pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={tab.icon} className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {loading || !settings ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
          </div>
        ) : (
          <>
            {/* Business Info */}
            {activeTab === "business" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <SettingsCard title="Business Information" icon={Building02Icon}>
                  <Field label="Platform Name" value={settings.platformName} onChange={(v) => update("platformName", v)} />
                  <Field label="Support Email" value={settings.supportEmail} onChange={(v) => update("supportEmail", v)} />
                  <Field label="Support Phone" value={settings.supportPhone} onChange={(v) => update("supportPhone", v)} />
                  <Field label="Website URL" value={settings.websiteUrl} onChange={(v) => update("websiteUrl", v)} />
                  <Field label="Business Address" value={settings.businessAddress} onChange={(v) => update("businessAddress", v)} />
                  <Field label="Logo URL" value={settings.logoUrl || ""} onChange={(v) => update("logoUrl", v)} placeholder="https://..." />
                </SettingsCard>

                <SettingsCard title="Localization & Currency" icon={Globe02Icon}>
                  <SelectField label="Default Currency" value={settings.defaultCurrency} onChange={(v) => update("defaultCurrency", v)} options={[
                    { value: "TZS", label: "Tanzanian Shilling (TZS)" },
                    { value: "KES", label: "Kenyan Shilling (KES)" },
                    { value: "UGX", label: "Ugandan Shilling (UGX)" },
                    { value: "USD", label: "US Dollar (USD)" },
                    { value: "SAR", label: "Saudi Riyal (SAR)" },
                    { value: "AED", label: "UAE Dirham (AED)" },
                  ]} />
                  <SelectField label="Timezone" value={settings.timezone} onChange={(v) => update("timezone", v)} options={[
                    { value: "Africa/Dar_es_Salaam", label: "Africa/Dar es Salaam" },
                    { value: "Africa/Nairobi", label: "Africa/Nairobi" },
                    { value: "Africa/Kampala", label: "Africa/Kampala" },
                    { value: "Asia/Riyadh", label: "Asia/Riyadh" },
                    { value: "Asia/Dubai", label: "Asia/Dubai" },
                    { value: "UTC", label: "UTC" },
                  ]} />
                  <SelectField label="Language" value={settings.language} onChange={(v) => update("language", v)} options={[
                    { value: "en", label: "English" },
                    { value: "sw", label: "Swahili" },
                    { value: "ar", label: "Arabic" },
                    { value: "fr", label: "French" },
                  ]} />
                </SettingsCard>
              </div>
            )}

            {/* Security & Rate Limits */}
            {activeTab === "security" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <SettingsCard title="Rate Limits & Login Security" icon={LockIcon}>
                  <NumberField label="API Rate Limit (per minute)" value={settings.apiRateLimitPerMinute} onChange={(v) => update("apiRateLimitPerMinute", v)} />
                  <NumberField label="Max Login Attempts" value={settings.authLoginMaxAttempts} onChange={(v) => update("authLoginMaxAttempts", v)} />
                  <NumberField label="Lockout Duration (minutes)" value={settings.authLockoutDurationMinutes} onChange={(v) => update("authLockoutDurationMinutes", v)} />
                  <NumberField label="OTP Max Requests (per hour)" value={settings.otpMaxRequestsPerHour} onChange={(v) => update("otpMaxRequestsPerHour", v)} />
                  <NumberField label="OTP Expiry (minutes)" value={settings.otpExpiryMinutes} onChange={(v) => update("otpExpiryMinutes", v)} />
                </SettingsCard>

                <SettingsCard title="Password & JWT Policy" icon={SecurityCheckIcon}>
                  <NumberField label="Password Min Length" value={settings.passwordMinLength} onChange={(v) => update("passwordMinLength", v)} />
                  <ToggleField label="Require Uppercase" description="Passwords must contain uppercase letters" checked={settings.passwordRequireUppercase} onChange={(v) => update("passwordRequireUppercase", v)} />
                  <ToggleField label="Require Special Character" description="Passwords must contain special characters" checked={settings.passwordRequireSpecialChar} onChange={(v) => update("passwordRequireSpecialChar", v)} />
                  <ToggleField label="Require Number" description="Passwords must contain numbers" checked={settings.passwordRequireNumber} onChange={(v) => update("passwordRequireNumber", v)} />
                  <Separator />
                  <NumberField label="JWT Expiry (hours)" value={settings.jwtExpiryHours} onChange={(v) => update("jwtExpiryHours", v)} />
                  <NumberField label="Refresh Token Expiry (days)" value={settings.refreshTokenExpiryDays} onChange={(v) => update("refreshTokenExpiryDays", v)} />
                  <ToggleField label="Two-Factor Authentication" description="Enable 2FA for admin accounts" checked={settings.enableTwoFactorAuth} onChange={(v) => update("enableTwoFactorAuth", v)} />
                  <ToggleField label="Enforce HTTPS" description="Force all connections over HTTPS" checked={settings.enforceHttps} onChange={(v) => update("enforceHttps", v)} />
                </SettingsCard>
              </div>
            )}

            {/* Delivery & Operations */}
            {activeTab === "delivery" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <SettingsCard title="Proof of Delivery" icon={QrCodeIcon}>
                  <ToggleField label="QR Code Proof of Delivery" description="Require QR code scan for delivery confirmation" checked={settings.enableQrCodeProofOfDelivery} onChange={(v) => update("enableQrCodeProofOfDelivery", v)} />
                  <ToggleField label="Photo Proof of Delivery" description="Drivers must upload a photo as proof" checked={settings.enablePhotoProofOfDelivery} onChange={(v) => update("enablePhotoProofOfDelivery", v)} />
                  <ToggleField label="Signature Proof of Delivery" description="Require customer signature on delivery" checked={settings.enableSignatureProofOfDelivery} onChange={(v) => update("enableSignatureProofOfDelivery", v)} />
                  <ToggleField label="OTP Verification" description="Require OTP code for pickup and delivery" checked={settings.enableOtpVerification} onChange={(v) => update("enableOtpVerification", v)} />
                  <ToggleField label="Parcel Delivery Proof" description="Enable proof for parcel deliveries" checked={settings.enableParcelDeliveryProof} onChange={(v) => update("enableParcelDeliveryProof", v)} />
                </SettingsCard>

                <SettingsCard title="Delivery Operations" icon={TruckIcon}>
                  <ToggleField label="Scheduled Deliveries" description="Allow customers to schedule deliveries" checked={settings.enableScheduledDeliveries} onChange={(v) => update("enableScheduledDeliveries", v)} />
                  <ToggleField label="Auto-Assign Drivers" description="Automatically assign nearest available driver" checked={settings.autoAssignDrivers} onChange={(v) => update("autoAssignDrivers", v)} />
                  <NumberField label="Driver Acceptance Timeout (minutes)" value={settings.driverAcceptanceTimeoutMinutes} onChange={(v) => update("driverAcceptanceTimeoutMinutes", v)} />
                  <Separator />
                  <ToggleField label="Allow Cancellations" description="Customers can cancel shipments" checked={settings.cancellationAllowed} onChange={(v) => update("cancellationAllowed", v)} />
                  <NumberField label="Max Cancellation Time (minutes)" value={settings.maxCancellationTimeMinutes} onChange={(v) => update("maxCancellationTimeMinutes", v)} />
                  <Separator />
                  <ToggleField label="Surge Pricing" description="Enable dynamic surge pricing" checked={settings.enableSurgePricing} onChange={(v) => update("enableSurgePricing", v)} />
                  <ToggleField label="Tips" description="Allow customers to add tips" checked={settings.enableTips} onChange={(v) => update("enableTips", v)} />
                  <SelectField label="Default Payer" value={settings.defaultPayer} onChange={(v) => update("defaultPayer", v)} options={[
                    { value: "SENDER", label: "Sender pays" },
                    { value: "RECEIVER", label: "Receiver pays" },
                  ]} />
                </SettingsCard>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <SettingsCard title="Notification Channels" icon={Notification03Icon}>
                  <ToggleField label="Email Notifications" description="Send email alerts for shipments and status changes" checked={settings.enableEmailNotifications} onChange={(v) => update("enableEmailNotifications", v)} />
                  <ToggleField label="SMS Notifications" description="Send SMS to customers on status changes" checked={settings.enableSmsNotifications} onChange={(v) => update("enableSmsNotifications", v)} />
                  <ToggleField label="Push Notifications" description="Driver app push notifications for new assignments" checked={settings.enablePushNotifications} onChange={(v) => update("enablePushNotifications", v)} />
                  <ToggleField label="Webhook Notifications" description="Send webhook events to external systems" checked={settings.enableWebhookNotifications} onChange={(v) => update("enableWebhookNotifications", v)} />
                </SettingsCard>

                <SettingsCard title="Notification Providers & Retries" icon={Settings02Icon}>
                  <SelectField label="SMS Provider" value={settings.smsProvider} onChange={(v) => update("smsProvider", v)} options={[
                    { value: "africastalking", label: "Africa's Talking" },
                    { value: "twilio", label: "Twilio" },
                    { value: "selcom", label: "Selcom" },
                    { value: "azampesa", label: "AzamPesa" },
                  ]} />
                  <SelectField label="Email Provider" value={settings.emailProvider} onChange={(v) => update("emailProvider", v)} options={[
                    { value: "smtp", label: "SMTP" },
                    { value: "sendgrid", label: "SendGrid" },
                    { value: "mailgun", label: "Mailgun" },
                    { value: "ses", label: "Amazon SES" },
                  ]} />
                  <Separator />
                  <NumberField label="Retry Attempts" value={settings.notificationRetryAttempts} onChange={(v) => update("notificationRetryAttempts", v)} />
                  <NumberField label="Retry Delay (minutes)" value={settings.notificationRetryDelayMinutes} onChange={(v) => update("notificationRetryDelayMinutes", v)} />
                </SettingsCard>
              </div>
            )}

            {/* System Management */}
            {activeTab === "system" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <SettingsCard title="System Status" icon={Settings02Icon}>
                  <ToggleField
                    label="Maintenance Mode"
                    description="Take the platform offline for maintenance"
                    checked={settings.enableMaintenanceMode}
                    onChange={(v) => update("enableMaintenanceMode", v)}
                    highlight={settings.enableMaintenanceMode ? "warning" : undefined}
                  />
                  <Field label="Maintenance Message" value={settings.maintenanceMessage} onChange={(v) => update("maintenanceMessage", v)} />
                  <Separator />
                  <ToggleField label="New Registrations" description="Allow new user registrations" checked={settings.enableNewRegistrations} onChange={(v) => update("enableNewRegistrations", v)} />
                  <ToggleField label="Customer Self-Booking" description="Customers can book their own shipments" checked={settings.enableCustomerSelfBooking} onChange={(v) => update("enableCustomerSelfBooking", v)} />
                  <ToggleField label="Driver Onboarding" description="Allow new driver applications" checked={settings.enableDriverOnboarding} onChange={(v) => update("enableDriverOnboarding", v)} />
                </SettingsCard>

                <SettingsCard title="Data & Security" icon={SecurityCheckIcon}>
                  <ToggleField label="Audit Log" description="Track all system actions and changes" checked={settings.enableAuditLog} onChange={(v) => update("enableAuditLog", v)} />
                  <ToggleField label="Backup Notifications" description="Send alerts for backup status" checked={settings.enableBackupNotifications} onChange={(v) => update("enableBackupNotifications", v)} />
                  <Separator />
                  <NumberField label="Max File Upload Size (MB)" value={settings.maxFileUploadSizeMb} onChange={(v) => update("maxFileUploadSizeMb", v)} />
                  <NumberField label="Data Retention (days)" value={settings.dataRetentionDays} onChange={(v) => update("dataRetentionDays", v)} />
                  <NumberField label="Session Timeout (minutes)" value={settings.sessionTimeoutMinutes} onChange={(v) => update("sessionTimeoutMinutes", v)} />
                </SettingsCard>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

// Helper components
function SettingsCard({ title, icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <HugeiconsIcon icon={icon} className="size-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  )
}

function ToggleField({ label, description, checked, onChange, highlight }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void; highlight?: "warning" }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 pr-4">
        <Label className="text-xs font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className={highlight === "warning" && checked ? "data-[state=checked]:bg-orange-500" : ""}
      />
    </div>
  )
}
