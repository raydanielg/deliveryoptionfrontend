"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CoinsIcon,
  Search01Icon,
  AlertCircleIcon,
  Download01Icon,
  CheckmarkCircle02Icon,
  PlusIcon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { formatNumber, formatMoney } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"

export default function SurchargesPage() {
  const [surcharges, setSurcharges] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    async function load() {
      try {
        const result = await api.pricing.listSurcharges()
        setSurcharges(result.data || [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function deleteSurcharge(id: string) {
    if (!confirm("Delete this surcharge?")) return
    try {
      await api.pricing.deleteSurcharge(id)
      toast.success("Surcharge deleted")
      setSurcharges((prev) => prev.filter((s) => s.id !== id))
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  const filtered = surcharges.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.name?.toLowerCase().includes(q) ||
      s.code?.toLowerCase().includes(q) ||
      s.type?.toLowerCase().includes(q)
  })

  const activeCount = surcharges.filter((s) => s.isActive).length
  const totalValue = surcharges.reduce((s, c) => s + Number(c.amount || 0), 0)
  const percentageCount = surcharges.filter((s) => s.type === "PERCENTAGE").length

  function handleExportPDF() {
    exportToPDF({
      title: "Surcharges Report",
      subtitle: "All additional fees and surcharges configured in the system",
      columns: [
        { header: "Name", key: "name" },
        { header: "Code", key: "code" },
        { header: "Type", key: "type" },
        { header: "Amount", key: "amount" },
        { header: "Applies To", key: "appliesTo" },
        { header: "Status", key: "status" },
      ],
      rows: filtered.map((s) => ({
        name: s.name || "—",
        code: s.code || "—",
        type: s.type || "—",
        amount: s.type === "PERCENTAGE" ? `${s.amount}%` : formatMoney(Number(s.amount || 0), undefined, { showCode: false }),
        appliesTo: s.transportMode || s.serviceLevel || "ALL",
        status: s.isActive ? "Active" : "Inactive",
      })),
      meta: [
        { label: "Total Surcharges", value: String(surcharges.length) },
        { label: "Active", value: String(activeCount) },
        { label: "Total Value", value: formatMoney(totalValue, undefined, { compact: true }) },
      ],
    })
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pricing", href: "/dashboard/pricing" }, { label: "Surcharges" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="💸 Surcharges"
          description="Additional fees and surcharges applied to shipments — fuel, handling, insurance, etc."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Surcharges" value={formatNumber(surcharges.length)} icon={CoinsIcon} hint="All configured" />
          <MetricCard label="Active" value={formatNumber(activeCount)} icon={CheckmarkCircle02Icon} hint="Currently applied" />
          <MetricCard label="Percentage-based" value={formatNumber(percentageCount)} icon={CoinsIcon} hint="Rate-based fees" />
          <MetricCard label="Total Value" value={formatMoney(totalValue, undefined, { compact: true })} icon={CoinsIcon} hint="Sum of fixed fees" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, code, type..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No surcharges found</p>
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
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Applies To</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{s.name || "—"}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{s.code || "—"}</td>
                      <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{s.type || "—"}</Badge></td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {s.type === "PERCENTAGE" ? `${s.amount}%` : formatMoney(Number(s.amount || 0), undefined, { showCode: false })}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.transportMode || s.serviceLevel || "ALL"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={s.isActive ? "default" : "secondary"} className="text-xs">
                          {s.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteSurcharge(s.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Delete
                        </button>
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
