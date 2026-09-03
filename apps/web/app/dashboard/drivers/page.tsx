"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserGroupIcon } from "@hugeicons/core-free-icons"

const driverStatusColors: Record<string, "default" | "secondary" | "destructive"> = {
  AVAILABLE: "default",
  ON_TRIP: "secondary",
  OFFLINE: "secondary",
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDrivers() }, [])

  async function loadDrivers() {
    try {
      const result = await api.drivers.list()
      setDrivers(result.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Fleet", href: "/dashboard/fleet" }, { label: "Drivers" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Drivers</h1>
        <p className="text-sm text-muted-foreground">All registered drivers</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : drivers.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="py-12 text-center text-muted-foreground">
              <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
              No drivers found
            </CardContent>
          </Card>
        ) : (
          drivers.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{d.user?.name}</p>
                    <p className="text-sm text-muted-foreground">{d.user?.phone}</p>
                  </div>
                  <Badge variant={driverStatusColors[d.status] ?? "secondary"}>{d.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">License</span>
                  <span className="font-medium">{d.licenseNumber}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deliveries</span>
                  <span className="font-medium">{d.totalDeliveries || 0}</span>
                </div>
                {d.carrier && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Carrier</span>
                    <span className="font-medium">{d.carrier.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
