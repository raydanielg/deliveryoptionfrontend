"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { formatMoney, formatNumber, formatDate } from "@/lib/format"
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
  QrCode01Icon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { QrCode } from "@/components/shared/qr-code"
import { exportToPDF } from "@/lib/pdf-export"

const MODE_ICONS: Record<string, any> = {
  ROAD: TruckIcon,
  RAIL: Train01Icon,
  AIR: Airplane01Icon,
}

export default function QuotesPage() {
  const [quotes, setQuotes] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [selectedQuote, setSelectedQuote] = React.useState<any | null>(null)

  React.useEffect(() => {
    async function load() {
      try {
        const result = await api.quotes.list()
        const rawQuotes = result.data?.quotes || result.data
      setQuotes(Array.isArray(rawQuotes) ? rawQuotes : [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = quotes.filter((q) => {
    if (!search) return true
    const qry = search.toLowerCase()
    return q.quoteNumber?.toLowerCase().includes(qry) ||
      q.originCity?.toLowerCase().includes(qry) ||
      q.destinationCity?.toLowerCase().includes(qry) ||
      q.id?.toLowerCase().includes(qry)
  })

  const totalValue = quotes.reduce((s, q) => s + Number(q.total || 0), 0)
  const avgValue = quotes.length > 0 ? totalValue / quotes.length : 0
  const totalWeight = quotes.reduce((s, q) => s + Number(q.chargeableWeightKg || 0), 0)
  const modeCount = new Set(quotes.map((q) => q.transportMode).filter(Boolean)).size

  function handleExportPDF() {
    exportToPDF({
      title: "Quotes Report",
      subtitle: "All saved quotes with route details, weights, and totals",
      columns: [
        { header: "Quote #", key: "quoteNumber" },
        { header: "Route", key: "route" },
        { header: "Mode", key: "mode" },
        { header: "Weight (kg)", key: "weight" },
        { header: "Total (TZS)", key: "total" },
        { header: "ETA (days)", key: "eta" },
        { header: "Date", key: "date" },
      ],
      rows: filtered.map((q) => ({
        quoteNumber: q.quoteNumber || q.id?.slice(0, 8) || "—",
        route: `${q.originCity || "—"} → ${q.destinationCity || "—"}`,
        mode: q.transportMode || "—",
        weight: String(q.chargeableWeightKg || 0),
        total: formatMoney(Number(q.total || 0), undefined, { showCode: false }),
        eta: q.etaMin && q.etaMax ? `${q.etaMin}–${q.etaMax}` : "—",
        date: formatDate(q.createdAt),
      })),
      meta: [
        { label: "Total Quotes", value: String(quotes.length) },
        { label: "Total Value", value: formatMoney(totalValue, undefined, { compact: true }) },
        { label: "Avg Quote", value: formatMoney(avgValue, undefined, { compact: true }) },
      ],
    })
  }

  function handleSinglePDF(q: any) {
    exportToPDF({
      title: `Quote ${q.quoteNumber || q.id?.slice(0, 8)}`,
      subtitle: `${q.originCity || "—"} → ${q.destinationCity || "—"}`,
      columns: [
        { header: "Field", key: "field" },
        { header: "Value", key: "value" },
      ],
      rows: [
        { field: "Quote Number", value: q.quoteNumber || q.id?.slice(0, 8) || "—" },
        { field: "Origin", value: q.originCity || "—" },
        { field: "Destination", value: q.destinationCity || "—" },
        { field: "Transport Mode", value: q.transportMode || "—" },
        { field: "Chargeable Weight", value: `${q.chargeableWeightKg || 0} kg` },
        { field: "Base Fare", value: formatMoney(Number(q.baseFare || 0), undefined, { showCode: false }) },
        { field: "Per Kg Charge", value: formatMoney(Number(q.perKgCharge || 0), undefined, { showCode: false }) },
        { field: "Surcharges", value: formatMoney(Number(q.surchargesTotal || 0), undefined, { showCode: false }) },
        { field: "Insurance", value: formatMoney(Number(q.insurance || 0), undefined, { showCode: false }) },
        { field: "Subtotal", value: formatMoney(Number(q.subtotal || 0), undefined, { showCode: false }) },
        { field: "Tax (VAT)", value: formatMoney(Number(q.tax || 0), undefined, { showCode: false }) },
        { field: "Total", value: formatMoney(Number(q.total || 0)) },
        { field: "ETA", value: q.etaMin && q.etaMax ? `${q.etaMin}–${q.etaMax} days` : "—" },
        { field: "Date", value: formatDate(q.createdAt) },
      ],
    })
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pricing", href: "/dashboard/pricing" }, { label: "Quotes" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Quotes"
          icon={<HugeiconsIcon icon={CoinsIcon} className="size-6 text-primary" />}
          description="Saved quotes and quote requests — view details, download PDFs, and scan QR codes."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export All PDF
            </Button>
          }
        />

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Quotes" value={formatNumber(quotes.length)} icon={CoinsIcon} hint="All saved" />
          <MetricCard label="Total Value" value={formatMoney(totalValue, undefined, { compact: true })} icon={CoinsIcon} hint="Sum of all quotes" />
          <MetricCard label="Avg Quote" value={formatMoney(avgValue, undefined, { compact: true })} icon={CheckmarkCircle02Icon} hint="Per quote" />
          <MetricCard label="Total Weight" value={`${formatNumber(totalWeight)} kg`} icon={TruckIcon} hint="Chargeable" />
        </div>

        {/* Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search quote #, origin, destination..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No quotes found</p>
          </div>
        ) : (
          <>
            {/* Quote Cards with QR */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, 12).map((q) => {
                const qrValue = `QUOTE:${q.quoteNumber || q.id}|ROUTE:${q.originCity}→${q.destinationCity}|TOTAL:${q.total}|DATE:${q.createdAt}`
                return (
                  <div key={q.id} className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">{q.quoteNumber || q.id?.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{q.originCity || "—"} → {q.destinationCity || "—"}</p>
                      </div>
                      {q.transportMode && MODE_ICONS[q.transportMode] && (
                        <HugeiconsIcon icon={MODE_ICONS[q.transportMode]} className="size-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="mt-3 flex items-start gap-3">
                      <div className="flex-1 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Weight</span>
                          <span className="font-medium tabular-nums">{q.chargeableWeightKg || 0} kg</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-bold tabular-nums">{formatMoney(Number(q.total || 0), undefined, { compact: true })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">ETA</span>
                          <span className="font-medium">{q.etaMin && q.etaMax ? `${q.etaMin}–${q.etaMax} days` : "—"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-medium">{formatDate(q.createdAt)}</span>
                        </div>
                      </div>
                      <QrCode value={qrValue} size={80} />
                    </div>

                    <div className="mt-3 flex gap-2 border-t pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setSelectedQuote(q)}
                      >
                        <HugeiconsIcon icon={QrCode01Icon} className="size-3.5" />
                        View QR
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleSinglePDF(q)}
                      >
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
                        PDF
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Full Table */}
            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Quote #</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Mode</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Weight</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Total</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">ETA</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((q) => (
                      <tr key={q.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{q.quoteNumber || q.id?.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{q.originCity || "—"} → {q.destinationCity || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            {q.transportMode && MODE_ICONS[q.transportMode] && (
                              <HugeiconsIcon icon={MODE_ICONS[q.transportMode]} className="size-3.5" />
                            )}
                            {q.transportMode || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{q.chargeableWeightKg || 0} kg</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">{formatMoney(Number(q.total || 0), undefined, { showCode: false })}</td>
                        <td className="px-4 py-3 text-muted-foreground">{q.etaMin && q.etaMax ? `${q.etaMin}–${q.etaMax} days` : "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(q.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleSinglePDF(q)}
                            className="text-xs text-primary hover:underline"
                          >
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* QR Modal */}
        {selectedQuote && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedQuote(null)}
          >
            <div
              className="rounded-xl border bg-card p-6 shadow-lg max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-lg font-bold">Quote QR Code</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedQuote.quoteNumber || selectedQuote.id?.slice(0, 8)}</p>
              </div>

              <div className="mt-4 flex justify-center">
                <QrCode
                  value={`QUOTE:${selectedQuote.quoteNumber || selectedQuote.id}|ROUTE:${selectedQuote.originCity}→${selectedQuote.destinationCity}|TOTAL:${selectedQuote.total}|DATE:${selectedQuote.createdAt}`}
                  size={200}
                />
              </div>

              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span className="font-medium">{selectedQuote.originCity || "—"} → {selectedQuote.destinationCity || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">{formatMoney(Number(selectedQuote.total || 0))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">{selectedQuote.chargeableWeightKg || 0} kg</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedQuote(null)}>
                  Close
                </Button>
                <Button size="sm" className="flex-1" onClick={() => handleSinglePDF(selectedQuote)}>
                  <HugeiconsIcon icon={Download01Icon} className="size-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
