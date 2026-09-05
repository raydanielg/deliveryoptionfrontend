"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { FilterSelect } from "@/components/shared/filter-select"
import { EmptyState } from "@/components/shared/states"
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
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"

const ROLE_OPTIONS = [
  { value: "CUSTOMER", label: "Customers" },
  { value: "DRIVER", label: "Drivers" },
  { value: "SUPER_ADMIN", label: "Super Admins" },
  { value: "OPERATIONS_MANAGER", label: "Operations" },
  { value: "DISPATCHER", label: "Dispatchers" },
]

export default function BroadcastPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "OPERATIONS_MANAGER"

  const [users, setUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("CUSTOMER")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [title, setTitle] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [channels, setChannels] = React.useState<string[]>(["EMAIL"])
  const [sending, setSending] = React.useState(false)

  React.useEffect(() => {
    if (!isAdmin) return
    loadUsers()
  }, [isAdmin])

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const filteredUsers = React.useMemo(() => {
    let filtered = users
    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q),
      )
    }
    return filtered
  }, [users, debouncedSearch, roleFilter])

  async function loadUsers() {
    try {
      const res = await api.users.list("limit=500")
      const rawUsers = res.data?.users || res.data
      setUsers(Array.isArray(rawUsers) ? rawUsers : [])
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
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel],
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
        <div className="p-4 lg:p-6">
          <EmptyState
            title="Access restricted"
            description="You don't have permission to access this page."
            className="max-w-md mx-auto mt-12"
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Broadcast" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Broadcast Center"
          description="Send promotional emails and SMS to your customers"
          actions={
            <Badge variant="secondary" className="gap-1.5">
              <HugeiconsIcon icon={UserGroupIcon} className="size-3.5" />
              {filteredUsers.length} users
            </Badge>
          }
        />

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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:max-w-xs">
                    <HugeiconsIcon
                      icon={Search01Icon}
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search by name, email, or phone…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-9"
                      aria-label="Search users"
                    />
                    {search ? (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <FilterSelect
                    label="Role"
                    value={roleFilter}
                    onChange={(v) => setRoleFilter(v)}
                    options={ROLE_OPTIONS}
                  />
                </div>

                {/* User List */}
                <div className="max-h-[400px] overflow-y-auto rounded-lg border border-border/60">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 border-b border-border/40 p-3 last:border-0">
                        <Skeleton className="size-5" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <EmptyState
                      title="No users found"
                      description="Try a different role filter or search term."
                      className="border-0"
                    />
                  ) : (
                    filteredUsers.map((u) => (
                      <label
                        key={u.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 border-b border-border/40 p-3 last:border-0 transition-colors hover:bg-muted/40",
                          selectedIds.has(u.id) && "bg-primary/5",
                        )}
                      >
                        <Checkbox
                          checked={selectedIds.has(u.id)}
                          onCheckedChange={() => toggleSelect(u.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium">{u.name}</p>
                            <Badge variant="secondary" className="text-[10px]">
                              {u.role?.replace(/_/g, " ").toLowerCase()}
                            </Badge>
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
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                        channels.includes("EMAIL")
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input text-muted-foreground hover:bg-muted/40",
                      )}
                    >
                      <HugeiconsIcon icon={Mail01Icon} className="size-4" />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleChannel("SMS")}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                        channels.includes("SMS")
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input text-muted-foreground hover:bg-muted/40",
                      )}
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
                    placeholder="Write your promotional message here…"
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
                    <span className="font-medium tabular-nums">{selectedIds.size} selected</span>
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
                  {sending ? "Sending…" : `Send to ${selectedIds.size} recipients`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
