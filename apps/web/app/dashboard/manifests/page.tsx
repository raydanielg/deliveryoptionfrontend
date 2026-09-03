"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Package02Icon } from "@hugeicons/core-free-icons"

export default function ManifestsPage() {
  const [manifests, setManifests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadManifests() }, [])

  async function loadManifests() {
    try {
      const result = await api.manifests.list()
      setManifests(result.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Operations", href: "/dashboard/operations" }, { label: "Manifests" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manifests</h1>
        <p className="text-sm text-muted-foreground">Bulk shipment manifests</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Manifest #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Driver</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Shipments</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Total Weight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>)}
                    </tr>
                  ))
                ) : manifests.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
                    No manifests found
                  </td></tr>
                ) : (
                  manifests.map((m) => (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{m.manifestNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {m.route ? `${m.route.fromCity?.name} → ${m.route.toCity?.name}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.driver?.user?.name || "—"}</td>
                      <td className="px-4 py-3">{m.totalShipments || 0}</td>
                      <td className="px-4 py-3">{Number(m.totalWeightKg || 0).toFixed(1)} kg</td>
                      <td className="px-4 py-3"><Badge variant="secondary">{m.status}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</td>
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
