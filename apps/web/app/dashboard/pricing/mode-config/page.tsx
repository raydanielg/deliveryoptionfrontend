"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { CoinsIcon, TruckIcon, Train01Icon, Airplane01Icon, SaveIcon } from "@hugeicons/core-free-icons"

const MODES = [
  { key: "ROAD", label: "Road", icon: TruckIcon, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { key: "RAIL", label: "SGR Rail", icon: Train01Icon, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  { key: "AIR", label: "Air Cargo", icon: Airplane01Icon, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
]

interface ModeConfig {
  baseRate: number
  perKgRate: number
  insuranceRate: number
  taxRate: number
  currency: string
  rules: any[]
}

export default function ModePricingConfigPage() {
  const [activeMode, setActiveMode] = useState("ROAD")
  const [config, setConfig] = useState<ModeConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    baseRate: "",
    perKgRate: "",
    insuranceRate: "",
    taxRate: "",
  })

  useEffect(() => { loadConfig(activeMode) }, [activeMode])

  async function loadConfig(mode: string) {
    setLoading(true)
    try {
      const result = await api.pricing.getModeConfig(mode)
      const data = result.data || result
      setConfig(data)
      setForm({
        baseRate: String(data.baseRate ?? data.defaults?.baseRate ?? ""),
        perKgRate: String(data.perKgRate ?? data.defaults?.perKgRate ?? ""),
        insuranceRate: String(data.insuranceRate ?? data.defaults?.insuranceRate ?? ""),
        taxRate: String(data.taxRate ?? data.defaults?.taxRate ?? ""),
      })
    } catch (err) {
      console.error(err)
      toast.error("Failed to load pricing config")
    } finally {
      setLoading(false)
    }
  }

  async function saveConfig() {
    setSaving(true)
    try {
      await api.pricing.updateModeConfig(activeMode, {
        baseRate: parseFloat(form.baseRate) || 0,
        perKgRate: parseFloat(form.perKgRate) || 0,
        insuranceRate: parseFloat(form.insuranceRate) || 0,
        taxRate: parseFloat(form.taxRate) || 0,
      })
      toast.success(`${activeMode} pricing updated`)
      loadConfig(activeMode)
    } catch (err: any) {
      toast.error(err.message || "Failed to update pricing")
    } finally {
      setSaving(false)
    }
  }

  const activeModeData = MODES.find((m) => m.key === activeMode)!

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pricing", href: "/dashboard/pricing" }, { label: "Mode Pricing" }]}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mode-Specific Pricing</h1>
          <p className="text-sm text-muted-foreground">Configure base rates, per-kg rates, insurance and tax for each transport mode</p>
        </div>
      </div>

      {/* Mode selector tabs */}
      <div className="flex gap-2">
        {MODES.map((mode) => (
          <button
            key={mode.key}
            onClick={() => setActiveMode(mode.key)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeMode === mode.key
                ? `${mode.bg} ${mode.border} ${mode.color}`
                : "border-border bg-white text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <HugeiconsIcon icon={mode.icon} strokeWidth={2} className="size-4" />
            {mode.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Config form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={activeModeData.icon} strokeWidth={2} className={`size-5 ${activeModeData.color}`} />
                {activeModeData.label} Pricing Configuration
              </CardTitle>
              <CardDescription>
                Set the base rate and per-kg rate for {activeModeData.label} shipments. These values are used by the pricing engine when no specific pricing rule matches.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="baseRate">Base Rate (TZS)</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    value={form.baseRate}
                    onChange={(e) => setForm({ ...form, baseRate: e.target.value })}
                    placeholder="e.g. 2500"
                  />
                  <p className="text-xs text-muted-foreground">Flat fee applied to every shipment</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perKgRate">Per Kg Rate (TZS)</Label>
                  <Input
                    id="perKgRate"
                    type="number"
                    value={form.perKgRate}
                    onChange={(e) => setForm({ ...form, perKgRate: e.target.value })}
                    placeholder="e.g. 1500"
                  />
                  <p className="text-xs text-muted-foreground">Rate per kg of chargeable weight</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceRate">Insurance Rate (%)</Label>
                  <Input
                    id="insuranceRate"
                    type="number"
                    step="0.01"
                    value={form.insuranceRate}
                    onChange={(e) => setForm({ ...form, insuranceRate: e.target.value })}
                    placeholder="e.g. 2.0"
                  />
                  <p className="text-xs text-muted-foreground">Percentage of declared value</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={form.taxRate}
                    onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                    placeholder="e.g. 18.0"
                  />
                  <p className="text-xs text-muted-foreground">VAT applied to subtotal</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveConfig} disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-2"><span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Saving...</span>
                  ) : (
                    <span className="flex items-center gap-2"><HugeiconsIcon icon={SaveIcon} strokeWidth={2} className="size-4" /> Save Configuration</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active rules sidebar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active {activeModeData.label} Rules</CardTitle>
              <CardDescription>Pricing rules currently active for this mode</CardDescription>
            </CardHeader>
            <CardContent>
              {config?.rules && config.rules.length > 0 ? (
                <div className="space-y-3">
                  {config.rules.map((rule: any, i: number) => (
                    <div key={rule.id || i} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">{rule.name}</span>
                        <Badge variant="secondary" className="text-xs">{rule.serviceLevel || "ALL"}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {rule.baseFare && <div>Base: {rule.currency || "TZS"} {rule.baseFare}</div>}
                        {rule.perKgRate && <div>Per kg: {rule.currency || "TZS"} {rule.perKgRate}</div>}
                        {rule.perKmRate && <div>Per km: {rule.currency || "TZS"} {rule.perKmRate}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} className="size-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active rules for this mode. Default rates will be used.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
