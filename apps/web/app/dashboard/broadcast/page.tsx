"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  MessageIcon,
  SentIcon,
  UserGroupIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

export default function BroadcastPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "OPERATIONS_MANAGER"

  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("CUSTOMER")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [channels, setChannels] = useState<string[]>(["EMAIL"])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    loadUsers()
  }, [isAdmin])

  useEffect(() => {
    let filtered = users
    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q)
      )
    }
    setFilteredUsers(filtered)
  }, [users, search, roleFilter])

  async function loadUsers() {
    try {
      const res = await api.users.list("limit=500")
      setUsers(res.data || [])
      setFilteredUsers((res.data || []).filter((u: any) => u.role === "CUSTOMER"))
    } catch (err: any) {
      toast.error(err.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredUsers.map((u) => u.id)))
    }
  }

  function toggleChannel(channel: string) {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    )
  }

  async function handleSend() {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one recipient")
      return
    }
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter a title and message")
      return
    }
    if (channels.length === 0) {
      toast.error("Please select at least one channel")
      return
    }

    setSending(true)
    try {
      await api.notificationService.bulk({
        userIds: Array.from(selectedIds),
        title,
        message,
        channels,
      })
      toast.success(`Notification sent to ${selectedIds.size} recipients!`)
      setTitle("")
      setMessage("")
      setSelectedIds(new Set())
    } catch (err: any) {
      toast.error(err.message || "Failed to send notification")
    } finally {
      setSending(false)
    }
  }

  if (!isAdmin) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Broadcast" }]}>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">You don&apos;t have permission to access this page.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Broadcast" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Broadcast Center</h1>
        <p className="text-sm text-muted-foreground">Send promotional emails and SMS to your customers</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recipient Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Select Recipients</CardTitle>
                  <CardDescription className="text-xs">
                    {selectedIds.size > 0
                      ? `${selectedIds.size} selected of ${filteredUsers.length} shown`
                      : `${filteredUsers.length} users found`}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedIds.size === filteredUsers.length && filteredUsers.length > 0
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="ps-9"
                  />
                </div>
                <select
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="CUSTOMER">Customers</option>
                  <option value="DRIVER">Drivers</option>
                  <option value="SUPER_ADMIN">Super Admins</option>
                  <option value="OPERATIONS_MANAGER">Operations</option>
                  <option value="DISPATCHER">Dispatchers</option>
                  <option value="">All Roles</option>
                </select>
              </div>

              {/* User List */}
              <div className="max-h-[400px] overflow-y-auto rounded-lg border">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 border-b p-3 last:border-0">
                      <Skeleton className="size-5" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <HugeiconsIcon icon={UserGroupIcon} className="size-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <label
                      key={u.id}
                      className={`flex cursor-pointer items-center gap-3 border-b p-3 last:border-0 transition-colors hover:bg-muted/40 ${
                        selectedIds.has(u.id) ? "bg-primary/5" : ""
                      }`}
                    >
                      <Checkbox
                        checked={selectedIds.has(u.id)}
                        onCheckedChange={() => toggleSelect(u.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{u.name}</p>
                          <Badge variant="secondary" className="text-[10px]">{u.role?.replace(/_/g, " ").toLowerCase()}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {u.email && <span className="truncate">{u.email}</span>}
                          {u.phone && <span>{u.phone}</span>}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compose & Send */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compose Message</CardTitle>
              <CardDescription className="text-xs">Write your promotional message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Channel Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Delivery Channels</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleChannel("EMAIL")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                      channels.includes("EMAIL")
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <HugeiconsIcon icon={Mail01Icon} className="size-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleChannel("SMS")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                      channels.includes("SMS")
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <HugeiconsIcon icon={MessageIcon} className="size-4" />
                    SMS
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-medium">Title / Subject</Label>
                <Input
                  id="title"
                  placeholder="e.g. Special Offer - 20% Off Shipping"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-medium">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your promotional message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                />
                {channels.includes("SMS") && (
                  <p className="text-[10px] text-muted-foreground">
                    SMS: {message.length}/160 characters
                    {message.length > 160 && <span className="text-amber-600"> (will use multiple SMS)</span>}
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Recipients</span>
                  <span className="font-medium">{selectedIds.size} selected</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Channels</span>
                  <span className="font-medium">{channels.join(", ") || "None"}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={sending || selectedIds.size === 0 || !title.trim() || !message.trim() || channels.length === 0}
                onClick={handleSend}
              >
                <HugeiconsIcon icon={SentIcon} className="size-4" />
                {sending ? "Sending..." : `Send to ${selectedIds.size} recipients`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
