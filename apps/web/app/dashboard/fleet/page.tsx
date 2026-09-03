"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { TruckIcon, UserGroupIcon, Route02Icon } from "@hugeicons/core-free-icons"

export default function FleetPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Fleet" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fleet Management</h1>
        <p className="text-sm text-muted-foreground">Manage drivers, vehicles, and carriers</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/drivers">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">Drivers</CardTitle>
              </div>
              <CardDescription>Manage driver accounts and status</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/vehicles">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={TruckIcon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">Vehicles</CardTitle>
              </div>
              <CardDescription>Fleet vehicle management</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/carriers">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Route02Icon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">Carriers</CardTitle>
              </div>
              <CardDescription>Xerin and partner carriers</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  )
}
