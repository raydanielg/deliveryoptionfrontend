"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { File02Icon } from "@hugeicons/core-free-icons"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDocuments() }, [])

  async function loadDocuments() {
    try {
      const result = await api.documents.list()
      setDocuments(result.data || [])
    } catch {
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "International", href: "/dashboard/international" }, { label: "Documents" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground">Shipment documents and verification</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Document #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">File</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>)}
                    </tr>
                  ))
                ) : documents.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <HugeiconsIcon icon={File02Icon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
                    No documents found
                  </td></tr>
                ) : (
                  documents.map((d) => (
                    <tr key={d.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3"><Badge variant="secondary">{d.type?.replace(/_/g, " ")}</Badge></td>
                      <td className="px-4 py-3 font-medium">{d.documentNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.fileName || "—"}</td>
                      <td className="px-4 py-3"><Badge variant={d.status === "VERIFIED" ? "default" : d.status === "REJECTED" ? "destructive" : "secondary"}>{d.status}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
