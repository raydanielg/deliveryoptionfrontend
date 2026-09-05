"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserGroupIcon,
  Search01Icon,
  TruckIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CallIcon,
  AlertCircleIcon,
  IdCardIcon,
  Package02Icon,
  PlusIcon,
  Refresh01Icon,
  Mail01Icon,
  PhoneIcon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { formatNumber, formatDate } from "@/lib/format"
import { toast } from "sonner"
import { useLang } from "@/lib/i18n"

export default function DriversPage() {
  const { t } = useLang()
  const [drivers, setDrivers] = React.useState<any[]>([])
  const [carriers, setCarriers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<any | null>(null)
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", password: "", licenseNumber: "", licenseExpiry: "", carrierId: "" })

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const [driversRes, carriersRes] = await Promise.all([
        api.drivers.list(),
        api.carriers.list(),
      ])
      const rawDrivers = driversRes.data?.drivers || driversRes.data
      setDrivers(Array.isArray(rawDrivers) ? rawDrivers : [])
      const rawCarriers = carriersRes.data?.carriers || carriersRes.data
      setCarriers(Array.isArray(rawCarriers) ? rawCarriers : [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const filtered = drivers.filter((d) => {
    if (statusFilter !== "ALL" && d.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return d.user?.name?.toLowerCase().includes(q) ||
      d.user?.phone?.toLowerCase().includes(q) ||
      d.user?.email?.toLowerCase().includes(q) ||
      d.licenseNumber?.toLowerCase().includes(q)
  })

  const available = drivers.filter((d) => d.status === "AVAILABLE").length
  const onTrip = drivers.filter((d) => d.status === "ON_TRIP").length
  const offline = drivers.filter((d) => d.status === "OFFLINE").length
  const totalDeliveries = drivers.reduce((s, d) => s + (d.totalDeliveries || 0), 0)

  const STATUS_FILTERS = [
    { value: "ALL", label: t("filter.allDrivers") },
    { value: "AVAILABLE", label: t("filter.available") },
    { value: "ON_TRIP", label: t("filter.onTrip") },
    { value: "OFFLINE", label: t("filter.offline") },
  ]

  async function handleAddDriver(e: React.FormEvent) {
    e.preventDefault()
    try {
      const body: Record<string, any> = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        licenseNumber: form.licenseNumber,
      }
      if (form.licenseExpiry) body.licenseExpiry = new Date(form.licenseExpiry).toISOString()
      if (form.carrierId) body.carrierId = form.carrierId
      await api.drivers.create(body)
      toast.success(t("toast.driverAdded"))
      setDialogOpen(false)
      setForm({ name: "", email: "", phone: "", password: "", licenseNumber: "", licenseExpiry: "", carrierId: "" })
      load()
    } catch (err: any) {
      toast.error(err.message || t("toast.driverAddFailed"))
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await api.drivers.updateStatus(id, { status })
      toast.success(t("toast.statusUpdated"))
      load()
    } catch (err: any) {
      toast.error(err.message || t("toast.statusUpdateFailed"))
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: t("breadcrumb.dashboard"), href: "/dashboard" }, { label: t("breadcrumb.fleet"), href: "/dashboard/fleet" }, { label: t("page.drivers") }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title={t("page.drivers")}
          icon={<HugeiconsIcon icon={UserGroupIcon} className="size-6 text-primary" />}
          description={t("page.driversDesc")}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={load}>
                <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
                {t("common.refresh")}
              </Button>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                {t("page.addDriver")}
              </Button>
            </div>
          }
        />

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={t("common.totalDrivers")} value={formatNumber(drivers.length)} icon={UserGroupIcon} hint={t("common.allRegistered")} />
          <MetricCard label={t("common.available")} value={formatNumber(available)} icon={CheckmarkCircle02Icon} hint={t("common.readyForDispatch")} />
          <MetricCard label={t("common.onTrip")} value={formatNumber(onTrip)} icon={TruckIcon} hint={t("common.currentlyDelivering")} />
          <MetricCard label={t("common.totalDeliveries")} value={formatNumber(totalDeliveries)} icon={Package02Icon} hint={t("common.allTime")} />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("common.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  statusFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="mt-3 h-16 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">{t("common.noData")}</p>
          </div>
        ) : (
          <>
            {/* Driver Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, 12).map((d) => (
                <div key={d.id} className="cursor-pointer rounded-lg border bg-card p-4 transition-shadow hover:shadow-md" onClick={() => setSelected(d)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted/40">
                        <HugeiconsIcon icon={UserGroupIcon} className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{d.user?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{d.user?.phone || "—"}</p>
                      </div>
                    </div>
                    <StatusBadge status={d.status || "OFFLINE"} size="sm" />
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    {d.licenseNumber && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <HugeiconsIcon icon={IdCardIcon} className="size-3" />
                          {t("common.license")}
                        </span>
                        <span className="font-mono font-medium">{d.licenseNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("common.deliveries")}</span>
                      <span className="font-medium tabular-nums">{d.totalDeliveries || 0}</span>
                    </div>
                    {d.carrier && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("nav.carriers")}</span>
                        <span className="font-medium">{d.carrier.name}</span>
                      </div>
                    )}
                    {d.user?.createdAt && (
                      <div className="flex items-center justify-between border-t pt-1.5">
                        <span className="text-muted-foreground">{t("common.joined")}</span>
                        <span className="font-medium">{formatDate(d.user.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  {d.user?.phone && (
                    <a
                      href={`tel:${d.user.phone}`}
                      className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/30"
                    >
                      <HugeiconsIcon icon={CallIcon} className="size-3.5" />
                      {t("common.callDriver")}
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Full Table */}
            <div className="overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.driver")}</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.phone")}</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.license")}</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.carrier")}</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">{t("common.deliveries")}</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d) => (
                      <tr key={d.id} className="cursor-pointer transition-colors hover:bg-muted/20" onClick={() => setSelected(d)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={UserGroupIcon} className="size-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{d.user?.name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{d.user?.email || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{d.user?.phone || "—"}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{d.licenseNumber || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{d.carrier?.name || "—"}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">{d.totalDeliveries || 0}</td>
                        <td className="px-4 py-3"><StatusBadge status={d.status || "OFFLINE"} size="sm" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Driver Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {selected.user?.name?.charAt(0)?.toUpperCase() || "D"}
                  </div>
                  {selected.user?.name || t("common.driver")}
                </SheetTitle>
                <SheetDescription>{selected.user?.email || t("common.noEmail")}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-muted-foreground">{t("common.status")}</span>
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    value={selected.status || "OFFLINE"}
                    onChange={(e) => {
                      handleStatusChange(selected.id, e.target.value)
                      setSelected({ ...selected, status: e.target.value })
                    }}
                  >
                    <option value="AVAILABLE">{t("filter.available")}</option>
                    <option value="ON_TRIP">{t("filter.onTrip")}</option>
                    <option value="OFFLINE">{t("filter.offline")}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><HugeiconsIcon icon={Mail01Icon} className="size-3" /> {t("common.email")}</p>
                    <p className="mt-1 text-sm font-medium">{selected.user?.email || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><HugeiconsIcon icon={PhoneIcon} className="size-3" /> {t("common.phone")}</p>
                    <p className="mt-1 text-sm font-medium">{selected.user?.phone || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><HugeiconsIcon icon={IdCardIcon} className="size-3" /> {t("common.license")}</p>
                    <p className="mt-1 text-sm font-mono font-medium">{selected.licenseNumber || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{t("common.carrier")}</p>
                    <p className="mt-1 text-sm font-medium">{selected.carrier?.name || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{t("common.deliveries")}</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.totalDeliveries || 0}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{t("common.joined")}</p>
                    <p className="mt-1 text-sm font-medium">{selected.user?.createdAt ? formatDate(selected.user.createdAt) : "—"}</p>
                  </div>
                </div>

                {selected.user?.phone && (
                  <a href={`tel:${selected.user.phone}`} className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/30">
                    <HugeiconsIcon icon={CallIcon} className="size-4" />
                    {t("common.callDriver")}
                  </a>
                )}

                <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>{t("common.close")}</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Driver Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("page.addDriver")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDriver} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common.fullName")} {t("common.required")}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.email")} {t("common.required")}</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{t("common.phone")} {t("common.required")}</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+255..." required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.password")} {t("common.required")}</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
              </div>
              <div className="space-y-2">
                <Label>{t("common.licenseNumber")} {t("common.required")}</Label>
                <Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.licenseExpiry")}</Label>
                <Input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("common.carrier")}</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.carrierId} onChange={(e) => setForm({ ...form, carrierId: e.target.value })}>
                  <option value="">{t("common.noCarrier")}</option>
                  {carriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit">{t("page.addDriver")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
