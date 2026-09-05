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
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-slate-950 px-4 shadow-lg shadow-black/20 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          {/* Left: Sidebar trigger + Breadcrumbs */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ms-1 text-slate-300 hover:text-white" />
            <Separator
              orientation="vertical"
              className="me-2 data-vertical:h-4 data-vertical:self-auto bg-white/15"
            />
            <Breadcrumb>
              <BreadcrumbList className="text-slate-400">
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <BreadcrumbSeparator className="hidden md:block text-slate-600" />}
                    <BreadcrumbItem className="hidden md:block">
                      {crumb.href ? (
                        <BreadcrumbLink href={crumb.href} className="text-slate-400 hover:text-white">{crumb.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="text-white">{crumb.label}</BreadcrumbPage>
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
                className="h-9 w-48 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-500 focus:w-64 focus:border-white/20 focus:bg-white/10 focus:ring-2 focus:ring-white/10"
              />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                <span className="text-sm">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-xl shadow-black/30">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[10px] font-medium text-orange-400 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {recentNotifs.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-slate-500">No notifications</p>
                      </div>
                    ) : (
                      recentNotifs.map((n) => (
                        <div key={n.id} className={`flex gap-3 border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/5 ${n.isRead ? "opacity-50" : ""}`}>
                          <div className={`mt-1 flex size-2 shrink-0 rounded-full ${n.isRead ? "bg-slate-600" : "bg-orange-500"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{n.title}</p>
                            <p className="text-xs text-slate-400 truncate">{n.message}</p>
                            <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-white/10 px-4 py-2.5">
                    <a href="/dashboard/notifications" className="text-xs font-medium text-orange-400 hover:underline">View all notifications</a>
                  </div>
                </div>
              )}
            </div>

            <Separator
              orientation="vertical"
              className="data-vertical:h-6 data-vertical:self-auto bg-white/15"
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
