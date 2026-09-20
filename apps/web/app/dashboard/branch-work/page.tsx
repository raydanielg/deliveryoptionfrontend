"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { PageHeader } from "@/components/shared/page-header"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { formatRelative } from "@/lib/format"
import { toast } from "sonner"

const KIND: Record<string, string> = { CLEARING: "Clearing", FORWARDING: "Forwarding", RECEIVING: "Receiving" }
const EM_TYPES = ["ACCIDENT", "THEFT", "FIRE", "VEHICLE_BREAKDOWN", "CARGO_DAMAGE", "SAFETY_THREAT", "OTHER"]
const SEVERITY_TONE: Record<string, string> = { LOW: "secondary", MEDIUM: "secondary", HIGH: "destructive", CRITICAL: "destructive" }
const pretty = (s: string) => s.replaceAll("_", " ").toLowerCase()

// ---------------------------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------------------------
function TasksTab({ canAssign, isAgent }: { canAssign: boolean; isAgent: boolean }) {
  const [tasks, setTasks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [assignOpen, setAssignOpen] = React.useState(false)
  const [finishing, setFinishing] = React.useState<any>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try { setTasks((await api.branches.tasks()).data || []) } catch (e: any) { toast.error(e.message || "Failed to load tasks") } finally { setLoading(false) }
  }, [])
  React.useEffect(() => { load() }, [load])

  async function setStatus(t: any, status: string, resultNotes?: string) {
    try { await api.branches.updateTask(t.id, { status, ...(resultNotes ? { resultNotes } : {}) }); toast.success("Task updated"); setFinishing(null); load() }
    catch (e: any) { toast.error(e.message || "Could not update the task") }
  }

  return (
    <div className="space-y-4">
      {canAssign && <div className="flex justify-end"><Button onClick={() => setAssignOpen(true)}>Assign a task</Button></div>}
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-muted/30 text-left">
              {["Shipment", "Work", "Route", isAgent ? "Notes" : "Agent", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>
              {loading ? Array.from({ length: 4 }).map((_, i) => <tr key={i}><td className="px-4 py-3" colSpan={6}><Skeleton className="h-5 w-full" /></td></tr>)
                : tasks.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">{isAgent ? "Nothing has been assigned to you yet" : "No tasks yet — assign clearing, forwarding or receiving work to an agent"}</td></tr>
                : tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{t.shipment?.trackingNumber}</td>
                    <td className="px-4 py-3">{KIND[t.kind] ?? t.kind}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.shipment?.fromAddress?.city} → {t.shipment?.toAddress?.city}</td>
                    <td className="px-4 py-3 text-muted-foreground">{isAgent ? (t.notes || "—") : (t.assignedTo?.name || "—")}{t.resultNotes ? <span className="block text-xs">Result: {t.resultNotes}</span> : null}</td>
                    <td className="px-4 py-3"><Badge variant={t.status === "DONE" ? "default" : "secondary"}>{pretty(t.status)}</Badge><span className="block text-xs text-muted-foreground">{formatRelative(t.createdAt)}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {isAgent && t.status === "PENDING" && <Button size="sm" variant="outline" onClick={() => setStatus(t, "IN_PROGRESS")}>Start</Button>}
                        {isAgent && (t.status === "PENDING" || t.status === "IN_PROGRESS") && <Button size="sm" onClick={() => setFinishing(t)}>Complete</Button>}
                        {canAssign && (t.status === "PENDING" || t.status === "IN_PROGRESS") && <Button size="sm" variant="ghost" onClick={() => setStatus(t, "CANCELLED")}>Cancel</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <AssignSheet open={assignOpen} onClose={() => setAssignOpen(false)} onDone={load} />
      <FinishSheet task={finishing} onClose={() => setFinishing(null)} onSubmit={(notes) => setStatus(finishing, "DONE", notes)} />
    </div>
  )
}

function AssignSheet({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [agents, setAgents] = React.useState<any[]>([])
  const [shipments, setShipments] = React.useState<any[]>([])
  const [shipmentId, setShipmentId] = React.useState("")
  const [agentId, setAgentId] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    api.branches.agents().then((r: any) => setAgents(r.data || [])).catch(() => setAgents([]))
    api.shipments.list("limit=100").then((r: any) => setShipments(r.data || [])).catch(() => setShipments([]))
  }, [open])

  const agent = agents.find((a) => a.id === agentId)
  async function submit() {
    if (!shipmentId || !agentId) { toast.error("Choose a shipment and an agent"); return }
    setSaving(true)
    try {
      await api.branches.createTask({ shipmentId, agentId, kind: agent?.agentKind, notes: notes.trim() || undefined })
      toast.success("Task assigned"); setShipmentId(""); setAgentId(""); setNotes(""); onDone(); onClose()
    } catch (e: any) { toast.error(e.message || "Could not assign the task") } finally { setSaving(false) }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader><SheetTitle>Assign a task</SheetTitle><SheetDescription>The kind of work follows the agent's speciality.</SheetDescription></SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          <div className="grid gap-1.5"><Label>Shipment</Label>
            <Select value={shipmentId || undefined} onValueChange={(v) => setShipmentId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Choose a shipment" /></SelectTrigger>
              <SelectContent>{shipments.map((s) => <SelectItem key={s.id} value={s.id}>{s.trackingNumber} — {s.fromAddress?.city} → {s.toAddress?.city}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label>Agent</Label>
            <Select value={agentId || undefined} onValueChange={(v) => setAgentId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder={agents.length ? "Choose an agent" : "No agents yet — add one under Users"} /></SelectTrigger>
              <SelectContent>{agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} — {KIND[a.agentKind] ?? "no kind"}{a.branch ? ` (${a.branch.code || a.branch.name})` : ""}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label>Instructions (optional)</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} placeholder="What should the agent do?" /></div>
          <Button className="w-full" onClick={submit} loading={saving}>Assign{agent?.agentKind ? ` ${KIND[agent.agentKind]?.toLowerCase()} task` : ""}</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function FinishSheet({ task, onClose, onSubmit }: { task: any; onClose: () => void; onSubmit: (notes: string) => void }) {
  const [notes, setNotes] = React.useState("")
  React.useEffect(() => setNotes(""), [task?.id])
  if (!task) return null
  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader><SheetTitle>Complete task</SheetTitle><SheetDescription>{KIND[task.kind]} · {task.shipment?.trackingNumber}. Say what was done — the branch manager sees this.</SheetDescription></SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          <div className="grid gap-1.5"><Label>What was done <span className="text-destructive">*</span></Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} autoFocus placeholder="e.g. Cleared, released to depot" /></div>
          <Button className="w-full" disabled={!notes.trim()} onClick={() => onSubmit(notes.trim())}>Mark as done</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------------------------
// Emergencies
// ---------------------------------------------------------------------------------------------
function EmergenciesTab({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [raiseOpen, setRaiseOpen] = React.useState(false)
  const [resolving, setResolving] = React.useState<any>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try { setRows((await api.emergencies.list()).data || []) } catch (e: any) { toast.error(e.message || "Failed to load emergencies") } finally { setLoading(false) }
  }, [])
  React.useEffect(() => { load() }, [load])

  async function ack(e: any) {
    try { await api.emergencies.update(e.id, { status: "ACKNOWLEDGED" }); load() } catch (err: any) { toast.error(err.message || "Failed") }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button variant="destructive" onClick={() => setRaiseOpen(true)}>Report an emergency</Button></div>
      {loading ? <Skeleton className="h-24 w-full" /> : rows.length === 0 ? (
        <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">No emergencies. If something urgent happens — accident, theft, fire, breakdown — report it here and the branch manager and admins are told immediately.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((e) => (
            <div key={e.id} className={`rounded-lg border p-4 ${e.status !== "RESOLVED" && (e.severity === "CRITICAL" || e.severity === "HIGH") ? "border-destructive/40 bg-destructive/5" : ""}`}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={(SEVERITY_TONE[e.severity] as any) ?? "secondary"}>{e.severity}</Badge>
                <span className="font-semibold capitalize">{pretty(e.type)}</span>
                <Badge variant={e.status === "RESOLVED" ? "outline" : "secondary"}>{pretty(e.status)}</Badge>
                <span className="ml-auto text-xs text-muted-foreground">{formatRelative(e.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm">{e.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {e.reportedBy?.name}{e.branch ? ` · ${e.branch.name}` : ""}{e.shipment ? ` · shipment ${e.shipment.trackingNumber}` : ""}{e.location ? ` · ${e.location}` : ""}
              </p>
              {e.resolution && <p className="mt-2 rounded bg-muted/40 p-2 text-sm">Resolved: {e.resolution}</p>}
              {canManage && e.status !== "RESOLVED" && (
                <div className="mt-3 flex gap-2">
                  {e.status === "OPEN" && <Button size="sm" variant="outline" onClick={() => ack(e)}>Acknowledge</Button>}
                  <Button size="sm" onClick={() => setResolving(e)}>Resolve</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <RaiseSheet open={raiseOpen} onClose={() => setRaiseOpen(false)} onDone={load} />
      <ResolveSheet emergency={resolving} onClose={() => setResolving(null)} onDone={load} />
    </div>
  )
}

function RaiseSheet({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [type, setType] = React.useState("ACCIDENT")
  const [severity, setSeverity] = React.useState("HIGH")
  const [description, setDescription] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [shipmentId, setShipmentId] = React.useState("")
  const [shipments, setShipments] = React.useState<any[]>([])
  const [saving, setSaving] = React.useState(false)
  React.useEffect(() => { if (open) api.shipments.list("limit=100").then((r: any) => setShipments(r.data || [])).catch(() => setShipments([])) }, [open])

  async function submit() {
    if (description.trim().length < 5) { toast.error("Describe what happened (a few words at least)"); return }
    setSaving(true)
    try {
      const r: any = await api.emergencies.raise({ type, severity, description: description.trim(), ...(location.trim() ? { location: location.trim() } : {}), ...(shipmentId ? { shipmentId } : {}) })
      toast.success(r.message || "Emergency raised"); setDescription(""); setLocation(""); setShipmentId(""); onDone(); onClose()
    } catch (e: any) { toast.error(e.message || "Could not raise the emergency") } finally { setSaving(false) }
  }
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader><SheetTitle>Report an emergency</SheetTitle><SheetDescription>The branch manager and Super Admin / Operations are notified straight away.</SheetDescription></SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          <div className="grid gap-1.5"><Label>What kind</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? "OTHER")}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{EM_TYPES.map((t) => <SelectItem key={t} value={t}>{pretty(t)}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid gap-1.5"><Label>How serious</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v ?? "HIGH")}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid gap-1.5"><Label>What happened <span className="text-destructive">*</span></Label><Input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1500} placeholder="Short and clear" /></div>
          <div className="grid gap-1.5"><Label>Where</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={200} placeholder="Place or landmark" /></div>
          <div className="grid gap-1.5"><Label>Related shipment (optional)</Label>
            <Select value={shipmentId || undefined} onValueChange={(v) => setShipmentId(v ?? "")}><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>{shipments.map((s) => <SelectItem key={s.id} value={s.id}>{s.trackingNumber}</SelectItem>)}</SelectContent></Select></div>
          <Button className="w-full" variant="destructive" onClick={submit} loading={saving}>Send alert</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ResolveSheet({ emergency, onClose, onDone }: { emergency: any; onClose: () => void; onDone: () => void }) {
  const [resolution, setResolution] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  React.useEffect(() => setResolution(""), [emergency?.id])
  if (!emergency) return null
  async function submit() {
    setSaving(true)
    try { await api.emergencies.update(emergency.id, { status: "RESOLVED", resolution: resolution.trim() }); toast.success("Marked as resolved"); onDone(); onClose() }
    catch (e: any) { toast.error(e.message || "Could not resolve") } finally { setSaving(false) }
  }
  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader><SheetTitle>Resolve emergency</SheetTitle><SheetDescription className="capitalize">{pretty(emergency.type)} — {emergency.description}</SheetDescription></SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          <div className="grid gap-1.5"><Label>How it was resolved <span className="text-destructive">*</span></Label><Input value={resolution} onChange={(e) => setResolution(e.target.value)} maxLength={1500} autoFocus /></div>
          <Button className="w-full" disabled={!resolution.trim()} onClick={submit} loading={saving}>Resolve</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function BranchWorkPage() {
  const { user } = useAuth()
  const params = useSearchParams()
  const role = user?.role
  const isSuper = role === "SUPER_ADMIN" || role === "OPERATIONS_MANAGER"
  const canSeeTasks = isSuper || role === "BRANCH_MANAGER" || role === "AGENT"
  // The role is only known once the user has loaded, so the default tab is derived, not stored.
  const [picked, setTab] = React.useState<string | null>(null)
  const tab = picked ?? (params.get("tab") === "emergencies" || !canSeeTasks ? "emergencies" : "tasks")

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tasks & Emergencies" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader title="Tasks & Emergencies" description={role === "AGENT" ? "Work assigned to you, and urgent reports" : "Agent work at the branch, and urgent situations that need a decision"} />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {canSeeTasks && <TabsTrigger value="tasks">{role === "AGENT" ? "My tasks" : "Agent tasks"}</TabsTrigger>}
            <TabsTrigger value="emergencies">Emergencies</TabsTrigger>
          </TabsList>
          {canSeeTasks && <TabsContent value="tasks" className="mt-4"><TasksTab canAssign={isSuper || role === "BRANCH_MANAGER"} isAgent={role === "AGENT"} /></TabsContent>}
          <TabsContent value="emergencies" className="mt-4"><EmergenciesTab canManage={isSuper || role === "BRANCH_MANAGER"} /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
