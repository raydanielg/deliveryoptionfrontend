"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Switch } from "@workspace/ui/components/switch"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CoinsIcon,
  Search01Icon,
  AlertCircleIcon,
  Download01Icon,
  CheckmarkCircle02Icon,
  TruckIcon,
  Train01Icon,
  Airplane01Icon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatMoney, formatNumber } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"

const MODE_ICONS: Record<string, any> = {
  ROAD: TruckIcon,
  RAIL: Train01Icon,
  AIR: Airplane01Icon,
}

export default function PricingRulesPage() {
  const [rules, setRules] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [modeFilter, setModeFilter] = React.useState("ALL")

  React.useEffect(() => { loadRules() }, [])

  async function loadRules() {
    try {
      const result = await api.pricing.listRules()
      const rawRules = result.data?.rules || result.data
      setRules(Array.isArray(rawRules) ? rawRules : [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  async function toggleRule(id: string) {
    try {
      await api.pricing.toggleRule(id)
      toast.success("Rule toggled")
      loadRules()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle rule")
    }
  }

  const filtered = rules.filter((r) => {
    if (modeFilter !== "ALL" && r.transportMode !== modeFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return r.name?.toLowerCase().includes(q) ||
      r.code?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q)
  })

  const activeCount = rules.filter((r) => r.isActive).length
  const totalSurcharges = rules.reduce((s, r) => s + (r.surcharges?.length || 0), 0)
  const avgBaseFare = rules.length > 0 ? rules.reduce((s, r) => s + Number(r.baseFare || 0), 0) / rules.length : 0

  const MODE_FILTERS = [
    { value: "ALL", label: "All Modes" },
    { value: "ROAD", label: "Road" },
    { value: "RAIL", label: "SGR Rail" },
    { value: "AIR", label: "Air Cargo" },
  ]

  function handleExportPDF() {
    exportToPDF({
      title: "Pricing Rules Report",
      subtitle: "All pricing rules with base fares, surcharges, and transport modes",
      columns: [
        { header: "Name", key: "name" },
        { header: "Code", key: "code" },
        { header: "Type", key: "type" },
        { header: "Category", key: "category" },
        { header: "Transport", key: "transportMode" },
        { header: "Base Fare (TZS)", key: "baseFare" },
        { header: "Surcharges", key: "surchargeCount" },
        { header: "Status", key: "status" },
      ],
      rows: filtered.map((r) => ({
        name: r.name || "—",
        code: r.code || "—",
        type: r.type || "—",
        category: r.category || "—",
        transportMode: r.transportMode || "ALL",
        baseFare: formatMoney(Number(r.baseFare || 0), undefined, { showCode: false }),
        surchargeCount: String(r.surcharges?.length || 0),
        status: r.isActive ? "Active" : "Inactive",
      })),
      meta: [
        { label: "Total Rules", value: String(rules.length) },
        { label: "Active", value: String(activeCount) },
        { label: "Avg Base Fare", value: formatMoney(avgBaseFare, undefined, { compact: true }) },
      ],
    })
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pricing", href: "/dashboard/pricing" }, { label: "Rules" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Pricing Rules"
          icon={<HugeiconsIcon icon={CoinsIcon} className="size-6 text-primary" />}
          description="Manage pricing rules, base fares, surcharges, and transport mode configurations."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Rules" value={formatNumber(rules.length)} icon={CoinsIcon} hint="All configured" />
          <MetricCard label="Active" value={formatNumber(activeCount)} icon={CheckmarkCircle02Icon} hint="Currently in use" />
          <MetricCard label="Avg Base Fare" value={formatMoney(avgBaseFare, undefined, { compact: true })} icon={CoinsIcon} hint="Across all rules" />
          <MetricCard label="Surcharges" value={formatNumber(totalSurcharges)} icon={CoinsIcon} hint="Linked to rules" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, code, category..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1">
            {MODE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setModeFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  modeFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No pricing rules found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Code</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Transport</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Base Fare</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Surcharges</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{r.name || "—"}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{r.code || "—"}</td>
                      <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{r.type || "—"}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.category || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          {r.transportMode && MODE_ICONS[r.transportMode] && (
                            <HugeiconsIcon icon={MODE_ICONS[r.transportMode]} className="size-3.5" />
                          )}
                          {r.transportMode || "ALL"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">{formatMoney(Number(r.baseFare || 0), undefined, { showCode: false })}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{r.surcharges?.length || 0}</td>
                      <td className="px-4 py-3">
                        <Switch checked={r.isActive} onCheckedChange={() => toggleRule(r.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
