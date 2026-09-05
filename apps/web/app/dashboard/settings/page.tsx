"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { MapIcon, ArrowRight01Icon, SecurityCheckIcon } from "@hugeicons/core-free-icons"

export default function SettingsPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and platform settings</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">General</CardTitle>
            <CardDescription>Platform-wide settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Platform Name</Label>
              <Input defaultValue="Xerin Express" />
            </div>
            <div className="grid gap-2">
              <Label>Support Email</Label>
              <Input defaultValue="support@xerinexpress.com" />
            </div>
            <div className="grid gap-2">
              <Label>Default Currency</Label>
              <Input defaultValue="TZS" />
            </div>
            <Button onClick={() => toast.success("Settings saved")}>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Map & API Keys Quick Card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-5 text-primary" />
              <CardTitle className="text-base">Map & API Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure Google Maps API Key, Mapbox Access Tokens, and Live Dispatch Map Settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Set your live tile server, default latitude/longitude coordinates for dispatch, and enable traffic & driver radar overlays.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Link href="/dashboard/settings/map">
                <Button className="gap-1 text-xs">
                  Configure Map & API Keys
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5" />
                </Button>
              </Link>
              <Link href="/dashboard/tracking/map">
                <Button variant="outline" className="text-xs">
                  Open Live Map
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email alerts for new shipments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Send SMS to customers on status change</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Driver push notifications</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
