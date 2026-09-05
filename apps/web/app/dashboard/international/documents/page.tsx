"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  File02Icon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  AlertCircleIcon, ClockIcon, TrashIcon, EyeIcon,
} from "@hugeicons/core-free-icons"

export default function DocumentsPage() {
  const [documents, setDocuments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.documents.list()
      const rawDocs = result.data?.documents || result.data
      setDocuments(Array.isArray(rawDocs) ? rawDocs : [])
    } catch {
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = documents.filter((d) => {
    if (statusFilter !== "ALL" && d.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return d.documentNumber?.toLowerCase().includes(q) ||
      d.fileName?.toLowerCase().includes(q) ||
      d.type?.toLowerCase().includes(q)
  })

  const pendingCount = documents.filter((d) => d.status === "PENDING").length
  const verifiedCount = documents.filter((d) => d.status === "VERIFIED").length
  const rejectedCount = documents.filter((d) => d.status === "REJECTED").length

  function openDetail(d: any) {
    setSelected(d)
  }

  async function verifyDocument(status: string) {
    if (!selected) return
    try {
      await api.documents.verify(selected.id, { status })
      toast.success(`Document ${status.toLowerCase()}`)
      setSelected(null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to verify document")
    }
  }

  async function deleteDocument(id: string) {
    if (!confirm("Delete this document?")) return
    try {
      await api.documents.delete(id)
      toast.success("Document deleted")
      setSelected(null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  function handleExportPDF() {
    exportToPDF({
      title: "International Documents Report",
      subtitle: "Shipment documents and verification status",
      columns: [
        { header: "Type", key: "type" },
        { header: "Document #", key: "docNum" },
        { header: "File", key: "file" },
        { header: "Status", key: "status" },
        { header: "Uploaded", key: "uploaded" },
      ],
      rows: filtered.map((d) => ({
        type: d.type?.replace(/_/g, " ") || "—",
        docNum: d.documentNumber || "—",
        file: d.fileName || "—",
        status: d.status || "—",
        uploaded: d.createdAt ? formatDate(d.createdAt) : "—",
      })),
      meta: [
        { label: "Total Documents", value: String(documents.length) },
        { label: "Verified", value: String(verifiedCount) },
        { label: "Pending", value: String(pendingCount) },
      ],
    })
  }

  const statusFilters = ["ALL", "PENDING", "VERIFIED", "REJECTED"]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "International", href: "/dashboard/international" },
      { label: "Documents" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Documents"
          icon={<HugeiconsIcon icon={File02Icon} className="size-6 text-primary" />}
          description="Shipment documents — commercial invoices, packing lists, certificates of origin, and verification."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Documents" value={formatNumber(documents.length)} icon={File02Icon} hint="All uploaded" />
          <MetricCard label="Pending" value={formatNumber(pendingCount)} icon={ClockIcon} hint="Awaiting review" />
          <MetricCard label="Verified" value={formatNumber(verifiedCount)} icon={CheckmarkCircle02Icon} hint="Approved" />
          <MetricCard label="Rejected" value={formatNumber(rejectedCount)} icon={AlertCircleIcon} hint="Needs resubmission" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search doc #, file name, type..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {s === "ALL" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No documents found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Document #</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">File</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Uploaded</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr
                      key={d.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => openDetail(d)}
                    >
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <HugeiconsIcon icon={File02Icon} className="size-4 text-muted-foreground" />
                          <span className="font-medium">{d.type?.replace(/_/g, " ") || "—"}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums">{d.documentNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.fileName || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} size="sm" /></td>
                      <td className="px-4 py-3 text-muted-foreground">{d.createdAt ? formatDate(d.createdAt) : "—"}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); openDetail(d) }}>
                          <HugeiconsIcon icon={EyeIcon} className="size-3.5" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail / Action Drawer */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={File02Icon} className="size-5 text-primary" />
                  {selected.type?.replace(/_/g, " ") || "Document"}
                </SheetTitle>
                <SheetDescription>
                  {selected.documentNumber || selected.fileName || "Document"}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                {/* Status */}
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <StatusBadge status={selected.status} size="sm" />
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Document Type</p>
                    <p className="mt-1 text-sm font-medium">{selected.type?.replace(/_/g, " ") || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Document Number</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.documentNumber || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">File Name</p>
                    <p className="mt-1 text-sm font-medium truncate">{selected.fileName || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Uploaded</p>
                    <p className="mt-1 text-sm font-medium">{selected.createdAt ? formatDate(selected.createdAt) : "—"}</p>
                  </div>
                </div>

                {/* File preview */}
                {selected.fileUrl && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-2">File</p>
                    {selected.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img src={selected.fileUrl} alt={selected.fileName} className="w-full rounded-md" />
                    ) : (
                      <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
                        Open file →
                      </a>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                  {selected.status === "PENDING" && (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 text-destructive border-destructive/30"
                        onClick={() => verifyDocument("REJECTED")}
                      >
                        <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
                        Reject
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => verifyDocument("VERIFIED")}
                      >
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                        Verify
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => deleteDocument(selected.id)}
                  >
                    <HugeiconsIcon icon={TrashIcon} className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
