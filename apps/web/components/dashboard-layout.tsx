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
import { HugeiconsIcon } from "@hugeicons/react"
import { Bell01Icon, Search01Icon } from "@hugeicons/core-free-icons"

interface DashboardLayoutProps {
  children: React.ReactNode
  breadcrumbs: { label: string; href?: string }[]
}

export function DashboardLayout({ children, breadcrumbs }: DashboardLayoutProps) {
  const [notifOpen, setNotifOpen] = React.useState(false)
  const notifRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

          {/* Right: Search + Notifications + User avatar */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:flex items-center">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="absolute left-3 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-48 rounded-lg border border-border/60 bg-muted/30 pl-9 pr-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground focus:w-64 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10 dark:focus:bg-slate-900"
              />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex size-9 items-center justify-center rounded-lg border border-border/40 bg-white text-foreground transition-all duration-200 hover:bg-muted/40 hover:shadow-sm dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <HugeiconsIcon icon={Bell01Icon} strokeWidth={2} className="size-4.5" />
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                  3
                </span>
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-border/50 bg-white shadow-xl shadow-black/5 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                    <span className="text-sm font-semibold text-foreground">Notifications</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">3 new</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {[
                      { title: "New shipment created", desc: "Shipment #XL-2401 from Dar es Salaam", time: "2m ago" },
                      { title: "Payment received", desc: "TSh 45,000 via Selcom", time: "15m ago" },
                      { title: "Driver assigned", desc: "Khalid O. assigned to shipment #XL-2398", time: "1h ago" },
                    ].map((n, i) => (
                      <div key={i} className="flex gap-3 border-b border-border/30 px-4 py-3 transition-colors hover:bg-muted/30">
                        <div className="mt-1 flex size-2 shrink-0 rounded-full bg-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{n.desc}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
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
