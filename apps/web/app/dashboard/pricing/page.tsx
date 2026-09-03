"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Switch } from "@workspace/ui/components/switch"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { CoinsIcon } from "@hugeicons/core-free-icons"

export default function PricingRulesPage() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadRules() }, [])

  async function loadRules() {
    try {
      const result = await api.pricing.listRules()
      setRules(result.data || [])
    } catch (err) {
      console.error(err)
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

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pricing", href: "/dashboard/pricing" }, { label: "Rules" }]}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pricing Rules</h1>
          <p className="text-sm text-muted-foreground">Manage pricing rules and surcharges</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Code</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Transport</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Base Fare</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Surcharges</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>)}
                    </tr>
                  ))
                ) : rules.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
                    No pricing rules found
                  </td></tr>
                ) : (
                  rules.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.code}</td>
                      <td className="px-4 py-3"><Badge variant="secondary">{r.type}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.category || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.transportMode || "—"}</td>
                      <td className="px-4 py-3 font-medium">{Number(r.baseFare || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.surcharges?.length || 0}</td>
                      <td className="px-4 py-3">
                        <Switch checked={r.isActive} onCheckedChange={() => toggleRule(r.id)} />
                      </td>
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
