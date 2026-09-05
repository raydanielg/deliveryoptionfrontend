"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Separator } from "@workspace/ui/components/separator"
import { api } from "@/lib/api"
import { formatMoney } from "@/lib/format"
import { HugeiconsIcon } from "@hugeicons/react"
import { CoinsIcon } from "@hugeicons/core-free-icons"

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadQuotes() }, [])

  async function loadQuotes() {
    try {
      const result = await api.quotes.list()
      setQuotes(result.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pricing", href: "/dashboard/pricing" }, { label: "Quotes" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quotes</h1>
        <p className="text-sm text-muted-foreground">Saved quotes and quote requests</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Quote #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Weight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">ETA</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>)}
                    </tr>
                  ))
                ) : quotes.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
                    No saved quotes found
                  </td></tr>
                ) : (
                  quotes.map((q) => (
                    <tr key={q.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{q.quoteNumber || q.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{q.originCity} → {q.destinationCity}</td>
                      <td className="px-4 py-3">{q.chargeableWeightKg} kg</td>
                      <td className="px-4 py-3 font-medium">{formatMoney(Number(q.total || 0))}</td>
                      <td className="px-4 py-3 text-muted-foreground">{q.etaMin}–{q.etaMax} days</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
