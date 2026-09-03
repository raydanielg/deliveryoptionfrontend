"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { CustomerService01Icon } from "@hugeicons/core-free-icons"

export default function SupportPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Support" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="text-sm text-muted-foreground">Customer support tickets and ratings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={CustomerService01Icon} strokeWidth={2} className="size-5 text-primary" />
              <CardTitle className="text-base">Support Tickets</CardTitle>
            </div>
            <CardDescription>Manage customer support inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-8 text-center">No tickets yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Ratings</CardTitle>
            <CardDescription>Delivery satisfaction scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">—</div>
              <div className="space-y-1">
                <Badge variant="secondary">No ratings yet</Badge>
                <p className="text-sm text-muted-foreground">Ratings will appear after deliveries are completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
