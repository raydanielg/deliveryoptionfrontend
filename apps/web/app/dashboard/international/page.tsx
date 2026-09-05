"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { formatMoney } from "@/lib/format"
import { HugeiconsIcon } from "@hugeicons/react"
import { Globe02Icon } from "@hugeicons/core-free-icons"

export default function InternationalPage() {
  const [customs, setCustoms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustoms()
  }, [])

  async function loadCustoms() {
    try {
      const result = await api.customs.get("")
      setCustoms(result.data || [])
    } catch {
      setCustoms([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "International" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">International</h1>
        <p className="text-sm text-muted-foreground">Customs declarations, documents, and international shipments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <span className="text-sm text-muted-foreground">Pending Customs</span>
              <p className="text-2xl font-bold">{customs.filter(c => c.status === "PENDING").length}</p>
            </div>
            <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} className="size-8 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <span className="text-sm text-muted-foreground">Cleared</span>
              <p className="text-2xl font-bold">{customs.filter(c => c.status === "CLEARED").length}</p>
            </div>
            <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} className="size-8 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <span className="text-sm text-muted-foreground">On Hold</span>
              <p className="text-2xl font-bold">{customs.filter(c => c.status === "HELD").length}</p>
            </div>
            <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} className="size-8 text-primary" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customs Declarations</CardTitle>
          <CardDescription>All customs declarations across international shipments</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Shipment</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Declared Value</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Origin</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>)}
                    </tr>
                  ))
                ) : customs.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
                    No customs declarations
                  </td></tr>
                ) : (
                  customs.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{c.shipment?.trackingNumber || c.shipmentId}</td>
                      <td className="px-4 py-3"><Badge variant="secondary">{c.importExportType}</Badge></td>
                      <td className="px-4 py-3 font-medium">{formatMoney(Number(c.declaredValue || 0))}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.countryOfOrigin || "—"}</td>
                      <td className="px-4 py-3"><Badge variant={c.status === "CLEARED" ? "default" : c.status === "HELD" ? "destructive" : "secondary"}>{c.status}</Badge></td>
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
