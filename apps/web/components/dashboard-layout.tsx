"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Toaster } from "@workspace/ui/components/sonner"
import { api } from "@/lib/api"

interface DashboardLayoutProps {
  children: React.ReactNode
  breadcrumbs: { label: string; href?: string }[]
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function DashboardLayout({ children, breadcrumbs }: DashboardLayoutProps) {
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<any[]>([])
  const notifRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    api.notifications.list()
      .then((res) => setNotifications(res.data || []))
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const recentNotifs = notifications.slice(0, 8)

  async function handleMarkAllRead() {
    try {
      await api.notifications.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {}
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/40 bg-white/95 px-4 shadow-sm backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 dark:bg-slate-950/95">
          {/* Left: Sidebar trigger + Breadcrumbs */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ms-1 text-foreground" />
            <Separator
              orientation="vertical"
              className="me-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    <BreadcrumbItem className="hidden md:block">
                      {crumb.href ? (
                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: Search + Notifications */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:flex items-center">
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-48 rounded-lg border border-border/60 bg-muted/30 px-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground focus:w-64 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10 dark:focus:bg-slate-900"
              />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex size-9 items-center justify-center rounded-lg border border-border/40 bg-white text-foreground transition-all duration-200 hover:bg-muted/40 hover:shadow-sm dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <span className="text-sm">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-border/50 bg-white shadow-xl shadow-black/5 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                    <span className="text-sm font-semibold text-foreground">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[10px] font-medium text-primary hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {recentNotifs.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-muted-foreground">No notifications</p>
                      </div>
                    ) : (
                      recentNotifs.map((n) => (
                        <div key={n.id} className={`flex gap-3 border-b border-border/30 px-4 py-3 transition-colors hover:bg-muted/30 ${n.isRead ? "opacity-60" : ""}`}>
                          <div className={`mt-1 flex size-2 shrink-0 rounded-full ${n.isRead ? "bg-muted-foreground/30" : "bg-primary"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5">{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-border/40 px-4 py-2.5">
                    <a href="/dashboard/notifications" className="text-xs font-medium text-primary hover:underline">View all notifications</a>
                  </div>
                </div>
              )}
            </div>

            <Separator
              orientation="vertical"
              className="data-vertical:h-6 data-vertical:self-auto"
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
