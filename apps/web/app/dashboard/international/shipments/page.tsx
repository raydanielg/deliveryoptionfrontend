"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Globe02Icon } from "@hugeicons/core-free-icons"

export default function IntlShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const result = await api.shipments.list("category=INTERNATIONAL")
        setShipments(result.data || [])
      } catch {
        setShipments([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "International", href: "/dashboard/international" }, { label: "Int'l Shipments" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">International Shipments</h1>
        <p className="text-sm text-muted-foreground">Cross-border and international deliveries</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Transport</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>)}
                    </tr>
                  ))
                ) : shipments.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
                    No international shipments
                  </td></tr>
                ) : (
                  shipments.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{s.trackingNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.fromAddress?.city}, {s.fromAddress?.country} → {s.toAddress?.city}, {s.toAddress?.country}</td>
                      <td className="px-4 py-3"><Badge variant="secondary">{s.transportMode}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="secondary">{s.status?.replace(/_/g, " ")}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
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
