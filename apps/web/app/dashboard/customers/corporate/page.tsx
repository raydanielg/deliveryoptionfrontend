"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { UsersIcon } from "@hugeicons/core-free-icons"

export default function CorporateAccountsPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Customers", href: "/dashboard/customers" }, { label: "Corporate" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Corporate Accounts</h1>
        <p className="text-sm text-muted-foreground">Business and corporate customer accounts</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={UsersIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
          Corporate account management coming soon
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
