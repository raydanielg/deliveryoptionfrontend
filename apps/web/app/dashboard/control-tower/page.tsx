"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Radar02Icon, TruckIcon, Train01Icon, Airplane01Icon, WarehouseIcon, AlertCircleIcon, Dollar01Icon, Clock01Icon, TrendingUp01Icon, AlertTriangleIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export default function ControlTowerPage() {
  const [capacity, setCapacity] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [sgrStats, setSgrStats] = useState<any>(null)
  const [airCargoStats, setAirCargoStats] = useState<any>(null)
  const [warehouseStats, setWarehouseStats] = useState<any>(null)
  const [shipmentStats, setShipmentStats] = useState<any>(null)
  const [exceptionStats, setExceptionStats] = useState<any>(null)
  const [exceptions, setExceptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modeFilter, setModeFilter] = useState<string>("ALL")

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [capRes, alertsRes, sgrRes, airRes, whRes, shipRes, excRes, excListRes] = await Promise.all([
        api.capacity.overview(),
        api.capacity.alerts(),
        api.sgr.stats(),
        api.airCargo.stats(),
        api.warehouse.stats(),
        api.shipments.stats(),
        api.exceptions.stats(),
        api.exceptions.list("?limit=10"),
      ])
      setCapacity(capRes.data)
      setAlerts(alertsRes.data || [])
      setSgrStats(sgrRes.data)
      setAirCargoStats(airRes.data)
      setWarehouseStats(whRes.data)
      setShipmentStats(shipRes.data)
      setExceptionStats(excRes.data)
      setExceptions(excListRes.data || [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load control tower data")
    } finally {
      setLoading(false)
    }
  }

  const modeColors: Record<string, string> = {
    ROAD: "from-blue-500 to-cyan-500",
    RAIL: "from-green-500 to-emerald-600",
    AIR: "from-purple-500 to-pink-500",
  }

  const filteredExceptions = modeFilter === "ALL" ? exceptions : exceptions.filter((e: any) => e.transportMode === modeFilter)

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Control Tower" }]}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Control Tower</h1>
          <p className="text-sm text-muted-foreground">Unified multimodal operations overview</p>
        </div>
        <Button onClick={() => loadData()}>
          <HugeiconsIcon icon={Radar02Icon} className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Mode Filter */}
      <div className="mt-4 flex gap-2 flex-wrap">
        {["ALL", "ROAD", "RAIL", "AIR"].map((m) => (
          <Button
            key={m}
            variant={modeFilter === m ? "default" : "outline"}
            size="sm"
            onClick={() => setModeFilter(m)}
          >
            {m === "ALL" ? "All Modes" : m === "ROAD" ? "Road" : m === "RAIL" ? "SGR Rail" : "Air Cargo"}
          </Button>
        ))}
      </div>

      {/* Mode Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Road Delivery", icon: TruckIcon, color: "from-blue-500 to-cyan-500", stats: { "Active": capacity?.road?.active ?? 0, "Delivered": capacity?.road?.delivered ?? 0 } },
          { label: "SGR Parcel", icon: Train01Icon, color: "from-green-500 to-emerald-600", stats: { "Total": sgrStats?.total ?? 0, "In Transit": sgrStats?.inTransit ?? 0 } },
          { label: "Air Cargo", icon: Airplane01Icon, color: "from-purple-500 to-pink-500", stats: { "Total": airCargoStats?.total ?? 0, "In Transit": airCargoStats?.inTransit ?? 0 } },
          { label: "Warehouse", icon: WarehouseIcon, color: "from-orange-500 to-amber-500", stats: { "In WH": warehouseStats?.total ?? 0, "Released": warehouseStats?.released ?? 0 } },
        ].map((mode, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${mode.color} text-white`}>
                  <HugeiconsIcon icon={mode.icon} className="size-5" />
                </div>
                <div className="font-semibold">{mode.label}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(mode.stats).map(([key, val]) => (
                  <div key={key} className="rounded-lg bg-muted/50 p-2">
                    <div className="text-lg font-bold">{val as number}</div>
                    <div className="text-xs text-muted-foreground">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-orange-500" />
            Capacity & Operations Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : alerts.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No active alerts — all systems normal</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${alert.severity === "critical" ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" : "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"}`}>
                      <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{alert.title || alert.message}</div>
                      <div className="text-xs text-muted-foreground">{alert.type} — {alert.station || alert.manifest || ""}</div>
                    </div>
                  </div>
                  <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capacity Overview */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Station Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : capacity?.stations ? (
              <div className="space-y-2">
                {capacity.stations.map((st: any, i: number) => (
                  <div key={i} className="flex items-center justify-between border-b last:border-0 pb-2">
                    <div>
                      <div className="text-sm font-medium">{st.name}</div>
                      <div className="text-xs text-muted-foreground">{st.type} — {st.city}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{st.utilizedKg || 0} / {st.capacityKg || 0} kg</div>
                      <div className="text-xs text-muted-foreground">{st.utilizationPercent || 0}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-muted-foreground">No station data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "SGR Shipments Today", value: sgrStats?.today ?? 0, color: "text-green-600" },
                { label: "Air Cargo Today", value: airCargoStats?.today ?? 0, color: "text-purple-600" },
                { label: "Warehouse Received Today", value: warehouseStats?.receivedToday ?? 0, color: "text-orange-600" },
                { label: "Warehouse Released Today", value: warehouseStats?.releasedToday ?? 0, color: "text-blue-600" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Performance Metrics */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                <HugeiconsIcon icon={Dollar01Icon} className="size-5" />
              </div>
              <div className="font-semibold">Revenue</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">KSh {shipmentStats?.totalRevenue?.toLocaleString() ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Road</span>
                <span className="font-medium">KSh {shipmentStats?.roadRevenue?.toLocaleString() ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SGR</span>
                <span className="font-medium">KSh {sgrStats?.totalRevenue?.toLocaleString() ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Air</span>
                <span className="font-medium">KSh {airCargoStats?.totalRevenue?.toLocaleString() ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <HugeiconsIcon icon={TrendingUp01Icon} className="size-5" />
              </div>
              <div className="font-semibold">On-Time Performance</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Road</span>
                <span className="font-bold text-green-600">{shipmentStats?.onTimeRate ?? "—"}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SGR</span>
                <span className="font-bold text-green-600">{sgrStats?.onTimeRate ?? "—"}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Air</span>
                <span className="font-bold text-green-600">{airCargoStats?.onTimeRate ?? "—"}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall</span>
                <span className="font-bold">{shipmentStats?.overallOnTimeRate ?? "—"}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                <HugeiconsIcon icon={Clock01Icon} className="size-5" />
              </div>
              <div className="font-semibold">Delays</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Road</span>
                <span className="font-bold text-amber-600">{shipmentStats?.delayed ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SGR</span>
                <span className="font-bold text-amber-600">{sgrStats?.delayed ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Air</span>
                <span className="font-bold text-amber-600">{airCargoStats?.delayed ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Delayed</span>
                <span className="font-bold">{(shipmentStats?.delayed ?? 0) + (sgrStats?.delayed ?? 0) + (airCargoStats?.delayed ?? 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white">
                <HugeiconsIcon icon={AlertTriangleIcon} className="size-5" />
              </div>
              <div className="font-semibold">Exceptions</div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Open</span>
                <span className="font-bold text-red-600">{exceptionStats?.open ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Escalated</span>
                <span className="font-bold text-red-600">{exceptionStats?.escalated ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Resolved</span>
                <span className="font-bold text-green-600">{exceptionStats?.resolved ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">{exceptionStats?.total ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Exceptions */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={AlertTriangleIcon} className="size-5 text-red-500" />
            Recent Exceptions {modeFilter !== "ALL" && `(${modeFilter})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filteredExceptions.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No exceptions recorded</p>
          ) : (
            <div className="space-y-2">
              {filteredExceptions.map((exc: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${exc.status === "RESOLVED" ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" : exc.status === "ESCALATED" ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" : "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"}`}>
                      <HugeiconsIcon icon={exc.status === "RESOLVED" ? CheckmarkCircle02Icon : AlertTriangleIcon} className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{exc.type?.replace(/_/g, " ") || exc.description || "Exception"}</div>
                      <div className="text-xs text-muted-foreground">
                        {exc.trackingNumber && <span>{exc.trackingNumber} — </span>}
                        {exc.transportMode && <span>{exc.transportMode}</span>}
                      </div>
                    </div>
                  </div>
                  <Badge variant={exc.status === "RESOLVED" ? "default" : exc.status === "ESCALATED" ? "destructive" : "secondary"}>
                    {exc.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
