"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { File02Icon } from "@hugeicons/core-free-icons"

export default function InvoicesPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Payments", href: "/dashboard/payments" }, { label: "Invoices" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">Customer invoices</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={File02Icon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
          Invoice management coming soon
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
