"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Switch } from "@workspace/ui/components/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { formatMoney, formatNumber } from "@/lib/format"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Location01Icon, AirplaneIcon, TruckIcon, Shield01Icon, Search01Icon, Edit01Icon } from "@hugeicons/core-free-icons"

const ADMIN_ROLES = ["SUPER_ADMIN", "OPERATIONS_MANAGER"]

type Blockable = { id: string; name: string; isBlocked: boolean; blockedReason?: string | null; isActive: boolean }

// ---------------------------------------------------------------------------------------------
// Block / unblock with a mandatory reason (customers are shown the reason).
// ---------------------------------------------------------------------------------------------
function BlockSheet({ target, kind, onClose, onDone }: {
  target: (Blockable & { scope?: "city" | "airport" | "region" }) | null
  kind: "city" | "airport" | "region"
  onClose: () => void
  onDone: () => void
}) {
  const [reason, setReason] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  React.useEffect(() => { setReason("") }, [target?.id])
  if (!target) return null
  const blocking = !target.isBlocked

  async function submit() {
    if (blocking && !reason.trim()) { toast.error("Give a reason — customers will see it"); return }
    setSaving(true)
    try {
      const body = { isBlocked: blocking, ...(blocking ? { reason: reason.trim() } : {}) }
      if (kind === "city") await api.logistics.blockCity(target!.id, body)
      else if (kind === "region") await api.logistics.blockRegion(target!.id, body)
      else await api.logistics.blockAirport(target!.id, body)
      toast.success(blocking ? `${target!.name} blocked` : `${target!.name} is open again`)
      onDone()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Could not update")
    } finally { setSaving(false) }
  }

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><HugeiconsIcon icon={Shield01Icon} className="size-5" />{blocking ? "Block" : "Reopen"} {target.name}</SheetTitle>
          <SheetDescription>
            {blocking
              ? "New bookings to or from this place are refused. Shipments already booked are not affected."
              : "The place accepts new bookings again."}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          {blocking ? (
            <div className="grid gap-2">
              <Label>Reason shown to customers <span className="text-destructive">*</span></Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="e.g. Road closed due to flooding" autoFocus />
            </div>
          ) : target.blockedReason ? (
            <p className="rounded-lg border p-3 text-sm text-muted-foreground">Currently blocked: {target.blockedReason}</p>
          ) : null}
          <Button className="w-full" variant={blocking ? "destructive" : "default"} onClick={submit} loading={saving}>
            {blocking ? "Block bookings" : "Reopen"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------------------------------
function DestinationsTab() {
  const [rows, setRows] = React.useState<any[]>([])
  const [regions, setRegions] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState("")
  const [regionId, setRegionId] = React.useState("ALL")
  const [target, setTarget] = React.useState<any>(null)
  const [kind, setKind] = React.useState<"city" | "region">("city")

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ all: "1", limit: "500" })
      if (q.trim()) params.set("q", q.trim())
      if (regionId !== "ALL") params.set("regionId", regionId)
      const [d, r] = await Promise.all([api.logistics.destinations(params.toString()), api.logistics.regions("all=1")])
      setRows(d.data || [])
      setRegions(r.data || [])
    } catch (e: any) { toast.error(e.message || "Failed to load destinations") } finally { setLoading(false) }
  }, [q, regionId])

  React.useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [load])

  async function toggleActive(row: any) {
    try { await api.logistics.setCityActive(row.id, !row.isActive); toast.success(row.isActive ? `${row.name} hidden` : `${row.name} visible`); load() }
    catch (e: any) { toast.error(e.message || "Failed") }
  }

  const blockedRegions = regions.filter((r) => r.isBlocked)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search town or region…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={regionId} onValueChange={(v) => setRegionId(v ?? "ALL")}>
          <SelectTrigger className="w-full sm:w-[220px]"><SelectValue placeholder="Region" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All regions</SelectItem>
            {regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}{r.isBlocked ? " (blocked)" : ""}</SelectItem>)}
          </SelectContent>
        </Select>
        {regionId !== "ALL" && (() => {
          const reg = regions.find((r) => r.id === regionId)
          return reg ? (
            <Button variant={reg.isBlocked ? "default" : "outline"} onClick={() => { setKind("region"); setTarget(reg) }}>
              {reg.isBlocked ? "Reopen region" : "Block whole region"}
            </Button>
          ) : null
        })()}
      </div>

      {blockedRegions.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <span className="font-medium">Blocked regions: </span>
          {blockedRegions.map((r) => r.name).join(", ")}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Destination</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Region</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Visible</th>
                <th className="px-4 py-3 font-medium text-muted-foreground" />
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 6 }).map((_, i) => <tr key={i}><td className="px-4 py-3" colSpan={6}><Skeleton className="h-5 w-full" /></td></tr>)
                : rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No destinations match</td></tr>
                : rows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{r.name}{(!r.latitude || !r.longitude) && <span className="ml-2 text-xs text-amber-600">no coordinates</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.region?.name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.kind === "REGIONAL_CAPITAL" ? "Regional capital" : "Town"}</td>
                    <td className="px-4 py-3">
                      {r.isBlocked ? <Badge variant="destructive" title={r.blockedReason || ""}>Blocked</Badge>
                        : r.region?.isBlocked ? <Badge variant="destructive">Region blocked</Badge>
                        : <Badge variant="secondary">Open</Badge>}
                    </td>
                    <td className="px-4 py-3"><Switch checked={r.isActive} onCheckedChange={() => toggleActive(r)} aria-label={`Show ${r.name} to customers`} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => { setKind("city"); setTarget(r) }}>{r.isBlocked ? "Reopen" : "Block"}</Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Blocked places stay visible so customers see why; switching “Visible” off hides a place completely. Coordinates are approximate town centres — customers can pin exact spots on the map.
      </p>
      <BlockSheet target={target} kind={kind} onClose={() => setTarget(null)} onDone={load} />
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// Airports
// ---------------------------------------------------------------------------------------------
function AirportsTab() {
  const [rows, setRows] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState("")
  const [scope, setScope] = React.useState("ALL")
  const [target, setTarget] = React.useState<any>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ all: "1", limit: "300" })
      if (q.trim()) params.set("q", q.trim())
      if (scope !== "ALL") params.set("scope", scope)
      setRows((await api.logistics.airports(params.toString())).data || [])
    } catch (e: any) { toast.error(e.message || "Failed to load airports") } finally { setLoading(false) }
  }, [q, scope])
  React.useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [load])

  async function toggleActive(a: any) {
    try { await api.logistics.setAirportActive(a.id, !a.isActive); load() } catch (e: any) { toast.error(e.message || "Failed") }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search IATA code, airport, city or country…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={scope} onValueChange={(v) => setScope(v ?? "ALL")}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All airports</SelectItem>
            <SelectItem value="TANZANIA">Tanzania</SelectItem>
            <SelectItem value="EAST_AFRICA">East Africa</SelectItem>
            <SelectItem value="WORLD">World hubs</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">IATA</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Airport</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">City</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Country</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Visible</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 6 }).map((_, i) => <tr key={i}><td className="px-4 py-3" colSpan={7}><Skeleton className="h-5 w-full" /></td></tr>)
                : rows.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No airports match</td></tr>
                : rows.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono font-semibold">{a.iata}</td>
                    <td className="px-4 py-3">{a.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.city}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.countryName}</td>
                    <td className="px-4 py-3">{a.isBlocked ? <Badge variant="destructive" title={a.blockedReason || ""}>Blocked</Badge> : <Badge variant="secondary">Open</Badge>}</td>
                    <td className="px-4 py-3"><Switch checked={a.isActive} onCheckedChange={() => toggleActive(a)} aria-label={`Show ${a.iata}`} /></td>
                    <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => setTarget({ ...a, name: `${a.name} (${a.iata})` })}>{a.isBlocked ? "Reopen" : "Block"}</Button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <BlockSheet target={target} kind="airport" onClose={() => setTarget(null)} onDone={load} />
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// Vehicle classes & rate cards
// ---------------------------------------------------------------------------------------------
const NUM_FIELDS: Array<{ key: string; label: string; hint?: string; step?: string }> = [
  { key: "maxWeightKg", label: "Max weight (kg)", hint: "Heavier loads move to a bigger class automatically" },
  { key: "maxVolumeM3", label: "Max volume (m³)" },
  { key: "maxDistanceKm", label: "Max distance (km)", hint: "Empty = no limit (e.g. boda serves short hops only)" },
  { key: "baseFare", label: "Base fare (TZS)" },
  { key: "perKm", label: "Per km (TZS)" },
  { key: "perKg", label: "Per kg beyond included (TZS)" },
  { key: "includedKg", label: "Included weight (kg)" },
  { key: "minCharge", label: "Minimum charge (TZS)" },
  { key: "avgSpeedKmh", label: "Average speed (km/h)", hint: "Drives the journey time" },
  { key: "handlingHours", label: "Handling time (hours)", hint: "Pickup, loading, sorting", step: "0.5" },
  { key: "maxDriveHoursPerDay", label: "Drive hours per day", hint: "Beyond this the trip spills into another day", step: "0.5" },
]

function VehicleSheet({ vc, onClose, onDone }: { vc: any | null; onClose: () => void; onDone: () => void }) {
  const [form, setForm] = React.useState<Record<string, string>>({})
  const [active, setActive] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  React.useEffect(() => {
    if (!vc) return
    const f: Record<string, string> = {}
    for (const n of NUM_FIELDS) f[n.key] = vc[n.key] == null ? "" : String(Number(vc[n.key]))
    setForm(f); setActive(vc.isActive)
  }, [vc])
  if (!vc) return null

  async function save() {
    const body: Record<string, any> = { isActive: active }
    for (const n of NUM_FIELDS) {
      const raw = form[n.key]?.trim()
      if (raw === "") { if (["maxVolumeM3", "maxDistanceKm", "minCharge"].includes(n.key)) body[n.key] = null; continue }
      const v = Number(raw)
      if (!Number.isFinite(v) || v < 0) { toast.error(`${n.label}: enter a valid number`); return }
      body[n.key] = v
    }
    setSaving(true)
    try { await api.logistics.updateVehicleClass(vc.id, body); toast.success(`${vc.name} updated`); onDone(); onClose() }
    catch (e: any) { toast.error(e.message || "Could not save") } finally { setSaving(false) }
  }

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><HugeiconsIcon icon={Edit01Icon} className="size-5" />{vc.name}</SheetTitle>
          <SheetDescription>{vc.code} · {vc.mode}. Price = base fare + km × per-km + extra kg × per-kg. Changes apply to new quotes immediately.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div><p className="text-sm font-medium">Offered to customers</p><p className="text-xs text-muted-foreground">Switch off to stop quoting this class</p></div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          {NUM_FIELDS.map((n) => (
            <div key={n.key} className="grid gap-1.5">
              <Label>{n.label}</Label>
              <Input type="number" min="0" step={n.step || "any"} value={form[n.key] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [n.key]: e.target.value }))} />
              {n.hint && <p className="text-xs text-muted-foreground">{n.hint}</p>}
            </div>
          ))}
          <Button className="w-full" onClick={save} loading={saving}>Save changes</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function VehiclesTab() {
  const [rows, setRows] = React.useState<any[]>([])
  const [levels, setLevels] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [edit, setEdit] = React.useState<any>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [v, s] = await Promise.all([api.logistics.vehicleClasses(true), api.logistics.serviceLevels()])
      setRows(v.data || []); setLevels(s.data || [])
    } catch (e: any) { toast.error(e.message || "Failed to load") } finally { setLoading(false) }
  }, [])
  React.useEffect(() => { load() }, [load])

  async function saveLevel(level: string, patch: Record<string, any>) {
    try { await api.logistics.updateServiceLevel(level, patch); toast.success("Saved"); load() } catch (e: any) { toast.error(e.message || "Failed") }
  }

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-left">
                {["Class", "Mode", "Carries up to", "Base", "Per km", "Per kg", "Speed", "Handling", "Offered", ""].map((h) => <th key={h} className="px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td className="px-4 py-3" colSpan={10}><Skeleton className="h-5 w-full" /></td></tr>)
                : rows.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3"><p className="font-medium">{v.name}</p><p className="text-xs text-muted-foreground">{v.nameSw || v.code}</p></td>
                    <td className="px-4 py-3 text-muted-foreground">{v.mode}</td>
                    <td className="px-4 py-3 tabular-nums">{formatNumber(Number(v.maxWeightKg))} kg{v.maxDistanceKm ? <span className="block text-xs text-muted-foreground">≤ {Number(v.maxDistanceKm)} km</span> : null}</td>
                    <td className="px-4 py-3 tabular-nums">{formatMoney(Number(v.baseFare), "TZS")}</td>
                    <td className="px-4 py-3 tabular-nums">{formatMoney(Number(v.perKm), "TZS")}</td>
                    <td className="px-4 py-3 tabular-nums">{formatMoney(Number(v.perKg), "TZS")}</td>
                    <td className="px-4 py-3 tabular-nums">{Number(v.avgSpeedKmh)} km/h</td>
                    <td className="px-4 py-3 tabular-nums">{Number(v.handlingHours)} h</td>
                    <td className="px-4 py-3">{v.isActive ? <Badge variant="secondary">Yes</Badge> : <Badge variant="destructive">Off</Badge>}</td>
                    <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => setEdit(v)}>Edit</Button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold">Service levels</h3>
        <p className="mb-3 text-xs text-muted-foreground">Time factor multiplies the journey time (0.5 = twice as fast); price factor multiplies the rate-card price.</p>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/30 text-left">{["Level", "Time factor", "Price factor", "Offered"].map((h) => <th key={h} className="px-4 py-3 font-medium text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {levels.map((l) => (
                <tr key={l.level}>
                  <td className="px-4 py-3 font-medium">{l.label}</td>
                  <td className="px-4 py-3"><FactorInput value={Number(l.etaFactor)} onSave={(v) => saveLevel(l.level, { etaFactor: v })} /></td>
                  <td className="px-4 py-3"><FactorInput value={Number(l.priceFactor)} onSave={(v) => saveLevel(l.level, { priceFactor: v })} /></td>
                  <td className="px-4 py-3"><Switch checked={l.isActive} onCheckedChange={(v) => saveLevel(l.level, { isActive: v })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <VehicleSheet vc={edit} onClose={() => setEdit(null)} onDone={load} />
    </div>
  )
}

function FactorInput({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [v, setV] = React.useState(String(value))
  React.useEffect(() => setV(String(value)), [value])
  return (
    <Input
      className="h-8 w-24 tabular-nums" type="number" min="0.05" step="0.05" value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { const n = Number(v); if (Number.isFinite(n) && n > 0 && n !== value) onSave(n); else setV(String(value)) }}
    />
  )
}

// ---------------------------------------------------------------------------------------------
// Estimator — try a route exactly as a customer would see it
// ---------------------------------------------------------------------------------------------
function EstimatorTab() {
  const [from, setFrom] = React.useState("Dar es Salaam")
  const [to, setTo] = React.useState("Dodoma")
  const [fromAir, setFromAir] = React.useState("")
  const [toAir, setToAir] = React.useState("")
  const [kg, setKg] = React.useState("20")
  const [level, setLevel] = React.useState("STANDARD")
  const [busy, setBusy] = React.useState(false)
  const [res, setRes] = React.useState<any>(null)
  const [err, setErr] = React.useState<string | null>(null)

  async function run() {
    setBusy(true); setErr(null)
    try {
      const place = (city: string, iata: string) => (iata.trim() ? { airportIata: iata.trim().toUpperCase() } : { city: city.trim() })
      const r = await api.logistics.estimate({ origin: place(from, fromAir), destination: place(to, toAir), weightKg: Number(kg), serviceLevel: level })
      setRes(r.data)
    } catch (e: any) { setRes(null); setErr(e.message || "Estimate failed") } finally { setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="grid gap-1.5"><Label>From (town)</Label><Input value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>To (town)</Label><Input value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label>From airport (IATA)</Label><Input value={fromAir} onChange={(e) => setFromAir(e.target.value)} placeholder="optional, e.g. DAR" maxLength={3} /></div>
        <div className="grid gap-1.5"><Label>To airport (IATA)</Label><Input value={toAir} onChange={(e) => setToAir(e.target.value)} placeholder="optional, e.g. NBO" maxLength={3} /></div>
        <div className="grid gap-1.5"><Label>Weight (kg)</Label><Input type="number" min="0.01" value={kg} onChange={(e) => setKg(e.target.value)} /></div>
        <div className="grid gap-1.5">
          <Label>Service</Label>
          <Select value={level} onValueChange={(v) => setLevel(v ?? "STANDARD")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["ECONOMY", "STANDARD", "EXPRESS", "PRIORITY", "NEXT_DAY", "SAME_DAY"].map((l) => <SelectItem key={l} value={l}>{l.replace("_", " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={run} loading={busy} disabled={!Number(kg)}>Estimate</Button>
      {err && <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">{err}</p>}
      {res && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{res.origin.label} → {res.destination.label}</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {res.options.map((o: any) => (
              <div key={o.vehicleClass.code} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="font-semibold">{o.vehicleClass.name}</p><p className="text-xs text-muted-foreground">{o.vehicleClass.nameSw}</p></div>
                  <Badge variant="secondary">{o.transportMode}</Badge>
                </div>
                <p className="mt-3 text-xl font-bold tabular-nums">{formatMoney(o.price, "TZS")}</p>
                <p className="text-sm text-muted-foreground">{o.distanceKm} km · {o.eta.labelEn}{o.eta.multiDay ? " (multi-day)" : ""}</p>
              </div>
            ))}
          </div>
          {res.excluded.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Not available</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {res.excluded.map((x: any) => <li key={x.code}><span className="font-medium text-foreground">{x.name}</span> — {x.reason}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function LogisticsControlPage() {
  const { user } = useAuth()
  const allowed = !!user && ADMIN_ROLES.includes(user.role)
  const [counts, setCounts] = React.useState<{ cities?: number; blocked?: number; airports?: number; classes?: number }>({})

  React.useEffect(() => {
    if (!allowed) return
    Promise.all([
      api.logistics.destinations("all=1&limit=500"), api.logistics.airports("all=1&limit=300"), api.logistics.vehicleClasses(true),
    ]).then(([d, a, v]) => setCounts({
      cities: d.data?.length, blocked: (d.data || []).filter((c: any) => c.isBlocked).length + (a.data || []).filter((x: any) => x.isBlocked).length,
      airports: a.data?.length, classes: (v.data || []).filter((c: any) => c.isActive).length,
    })).catch(() => {})
  }, [allowed])

  if (user && !allowed) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Logistics Control" }]}>
        <div className="p-4 lg:p-6"><p className="rounded-lg border p-6 text-sm text-muted-foreground">Logistics Control is for Super Admin and Operations (IT).</p></div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Logistics Control" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader title="Logistics Control" description="Where customers can ship, which vehicle carries what, what it costs and how long it takes — all editable, nothing hardcoded" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Destinations" value={formatNumber(counts.cities)} icon={Location01Icon} hint="Towns customers can pick" />
          <MetricCard label="Airports" value={formatNumber(counts.airports)} icon={AirplaneIcon} hint="Tanzania, East Africa, world hubs" />
          <MetricCard label="Vehicle classes" value={formatNumber(counts.classes)} icon={TruckIcon} hint="Offered to customers" />
          <MetricCard label="Blocked places" value={formatNumber(counts.blocked)} icon={Shield01Icon} hint="Refusing new bookings" />
        </div>
        <Tabs defaultValue="destinations">
          <TabsList>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
            <TabsTrigger value="airports">Airports</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles &amp; rates</TabsTrigger>
            <TabsTrigger value="estimator">Try an estimate</TabsTrigger>
          </TabsList>
          <TabsContent value="destinations" className="mt-4"><DestinationsTab /></TabsContent>
          <TabsContent value="airports" className="mt-4"><AirportsTab /></TabsContent>
          <TabsContent value="vehicles" className="mt-4"><VehiclesTab /></TabsContent>
          <TabsContent value="estimator" className="mt-4"><EstimatorTab /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
