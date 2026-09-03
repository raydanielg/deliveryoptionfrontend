"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { TruckIcon } from "@hugeicons/core-free-icons"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadVehicles() }, [])

  async function loadVehicles() {
    try {
      const result = await api.vehicles.list()
      setVehicles(result.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Fleet", href: "/dashboard/fleet" }, { label: "Vehicles" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
        <p className="text-sm text-muted-foreground">Fleet vehicle management</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Registration</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Carrier</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Capacity (kg)</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>)}
                    </tr>
                  ))
                ) : vehicles.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <HugeiconsIcon icon={TruckIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
                    No vehicles found
                  </td></tr>
                ) : (
                  vehicles.map((v) => (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{v.registrationNo}</td>
                      <td className="px-4 py-3"><Badge variant="secondary">{v.type}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{v.carrier?.name || "—"}</td>
                      <td className="px-4 py-3">{v.capacityKg} kg</td>
                      <td className="px-4 py-3"><Badge variant={v.status === "ACTIVE" ? "default" : "secondary"}>{v.status}</Badge></td>
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
