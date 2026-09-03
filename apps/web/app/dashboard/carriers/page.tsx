"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { TruckIcon } from "@hugeicons/core-free-icons"

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCarriers() }, [])

  async function loadCarriers() {
    try {
      const result = await api.carriers.list()
      setCarriers(result.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Fleet", href: "/dashboard/fleet" }, { label: "Carriers" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Carriers</h1>
        <p className="text-sm text-muted-foreground">Xerin and partner carriers</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : carriers.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="py-12 text-center text-muted-foreground">
              <HugeiconsIcon icon={TruckIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
              No carriers found
            </CardContent>
          </Card>
        ) : (
          carriers.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{c.name}</p>
                  <Badge variant={c.type === "XERIN" ? "default" : "secondary"}>{c.type}</Badge>
                </div>
                {c.email && <p className="text-sm text-muted-foreground">{c.email}</p>}
                {c.phone && <p className="text-sm text-muted-foreground">{c.phone}</p>}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Drivers</span>
                  <span className="font-medium">{c._count?.drivers || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vehicles</span>
                  <span className="font-medium">{c._count?.vehicles || 0}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
