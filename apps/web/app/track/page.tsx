"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  Package02Icon,
  TruckIcon,
  MapIcon,
  CheckmarkCircle02Icon,
  ClockIcon,
  ArrowRight01Icon,
  CancelCircleIcon,
  Route02Icon,
  UserIcon,
  PhoneIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"
import { api, ApiError } from "@/lib/api"
import { toast } from "sonner"

function TrackContent() {
  const searchParams = useSearchParams()
  const [trackingNumber, setTrackingNumber] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleTrack(num?: string) {
    const number = num || trackingNumber.trim()
    if (!number) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await api.tracking.trackShipment(number)
      setResult(res.data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setResult(null)
        toast.error("Shipment not found. Check your tracking number.")
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to track shipment")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const num = searchParams.get("number")
    if (num) {
      setTrackingNumber(num)
      handleTrack(num)
    }
  }, [searchParams])

  // Xerin's internal ShipmentStatus enum has ~30 granular values (customs, warehouse,
  // rail/air specific, etc.) — the customer-facing timeline groups them into the 8
  // milestones the tracking spec calls for, so every real status maps to *some* correct
  // step instead of silently defaulting to step 0 the way the old lookup-by-exact-key did.
  const MILESTONES = [
    { label: "Booking Created", icon: Package02Icon, statuses: ["PENDING", "QUOTE_CREATED", "BOOKED", "PAYMENT_PENDING"] },
    { label: "Payment Confirmed", icon: CheckmarkCircle02Icon, statuses: ["PAYMENT_CONFIRMED"] },
    { label: "Cargo Received", icon: Package02Icon, statuses: ["AWAITING_PICKUP", "DRIVER_ASSIGNED", "ACCEPTED", "OUT_FOR_PICKUP", "RECEIVED_AT_STATION", "VERIFIED_WEIGHED", "CONSOLIDATED", "READY_FOR_DISPATCH", "LOADED_FOR_DISPATCH"] },
    { label: "Picked Up", icon: TruckIcon, statuses: ["PICKED_UP"] },
    { label: "In Transit", icon: Route02Icon, statuses: ["IN_TRANSIT", "ONGOING"] },
    { label: "Arrived", icon: MapIcon, statuses: ["ARRIVED_DESTINATION", "ARRIVED_COUNTRY", "CUSTOMS_REVIEW", "CUSTOMS_CLEARED", "READY_FOR_COLLECTION", "WAREHOUSE"] },
    { label: "Out for Delivery", icon: TruckIcon, statuses: ["OUT_FOR_DELIVERY"] },
    { label: "Delivered", icon: CheckmarkCircle02Icon, statuses: ["DELIVERED"] },
  ]
  const EXCEPTION_STATUSES = ["DELIVERY_FAILED", "RETURNING", "RETURNED", "FAILED", "CANCELLED"]

  function getMilestoneIndex(status: string) {
    return MILESTONES.findIndex((m) => m.statuses.includes(status))
  }

  // For an exception status (cancelled/failed/returned), the happy-path stepper can't show
  // "where" the shipment is — instead freeze it at the last milestone actually reached,
  // using the real status history, rather than resetting progress to zero.
  function getFrozenIndexFromHistory(timeline: any[]) {
    for (const entry of timeline || []) {
      const idx = getMilestoneIndex(entry.status)
      if (idx !== -1) return idx
    }
    return 0
  }

  const statusColors: Record<string, string> = {
    DELIVERED: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
    IN_TRANSIT: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
    ONGOING: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
    OUT_FOR_DELIVERY: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
    PICKED_UP: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
    CANCELLED: "text-red-600 bg-red-50 dark:bg-red-950/50",
    DELIVERY_FAILED: "text-red-600 bg-red-50 dark:bg-red-950/50",
    FAILED: "text-red-600 bg-red-50 dark:bg-red-950/50",
    RETURNING: "text-orange-600 bg-orange-50 dark:bg-orange-950/50",
    RETURNED: "text-orange-600 bg-orange-50 dark:bg-orange-950/50",
    BOOKED: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
    PENDING: "text-muted-foreground bg-muted",
    DRIVER_ASSIGNED: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/assets/m%20app2.png" alt="Xerin" className="size-9 rounded-lg object-cover" />
            <span className="text-lg font-bold tracking-tight">Xerin Express</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/track" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Track</a>
            <a href="/auth" className="text-sm font-medium hover:text-primary transition-colors">Sign In</a>
            <a href="/auth/sign-up" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Get Started</a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Track Your Shipment</h1>
          <p className="mt-2 text-muted-foreground">Enter your tracking number to see real-time status and delivery updates</p>
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleTrack() }}
          className="flex items-center gap-2 rounded-xl border bg-card p-2 shadow-sm"
        >
          <div className="relative flex-1">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number (e.g. XRD-2026-000928)"
              className="h-12 w-full rounded-lg border-0 bg-transparent pl-10 pr-3 text-base outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !trackingNumber.trim()}
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Tracking..." : "Track"}
            {!loading && <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />}
          </button>
        </form>

        {/* Results */}
        {searched && !loading && (
          <div className="mt-8">
            {!result ? (
              <div className="rounded-xl border bg-card p-12 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <HugeiconsIcon icon={AlertCircleIcon} className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Shipment Not Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  We couldn&apos;t find a shipment with that tracking number. Please check and try again.
                </p>
              </div>
            ) : (
              (() => {
                const shipment = result.shipment
                const events = result.events || []
                const isException = EXCEPTION_STATUSES.includes(shipment.status)
                const milestoneIndex = isException
                  ? getFrozenIndexFromHistory(result.timeline)
                  : getMilestoneIndex(shipment.status)
                const currentIndex = milestoneIndex === -1 ? 0 : milestoneIndex

                return (
                  <div className="space-y-6">
                    {/* Shipment Info Card */}
                    <div className="rounded-xl border bg-card p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Tracking Number</p>
                          <p className="text-xl font-bold">{shipment.trackingNumber}</p>
                        </div>
                        <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${statusColors[shipment.status] || "text-muted-foreground bg-muted"}`}>
                          <span className="size-2 rounded-full bg-current" />
                          {shipment.status?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs text-muted-foreground">From</p>
                          <p className="text-sm font-medium">{shipment.fromAddress?.city || "—"}</p>
                          <p className="text-xs text-muted-foreground">{shipment.fromAddress?.country || ""}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">To</p>
                          <p className="text-sm font-medium">{shipment.toAddress?.city || "—"}</p>
                          <p className="text-xs text-muted-foreground">{shipment.toAddress?.country || ""}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Service Type</p>
                          <p className="text-sm font-medium">{shipment.serviceLevel || "Standard"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Transport Mode</p>
                          <p className="text-sm font-medium">{shipment.transportMode || "Road"}</p>
                        </div>
                      </div>

                      {shipment.driver && (
                        <div className="mt-4 flex items-center gap-3 rounded-lg border p-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                            <HugeiconsIcon icon={UserIcon} className="size-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{shipment.driver.user?.name || "Driver assigned"}</p>
                            <p className="text-xs text-muted-foreground">Your delivery driver</p>
                          </div>
                          {shipment.driver.user?.phone && (
                            <a href={`tel:${shipment.driver.user.phone}`} className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                              <HugeiconsIcon icon={PhoneIcon} className="size-4 text-primary" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Exception Notice (cancelled / failed / returned) */}
                    {isException && (
                      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50">
                        <HugeiconsIcon icon={CancelCircleIcon} className="size-6 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-700 dark:text-red-400">
                            {shipment.status === "CANCELLED" ? "This shipment has been cancelled" :
                             shipment.status === "DELIVERY_FAILED" ? "Delivery attempt failed" :
                             shipment.status === "RETURNING" ? "This shipment is being returned" :
                             shipment.status === "RETURNED" ? "This shipment was returned" :
                             "This shipment has an issue that needs attention"}
                          </p>
                          {shipment.cancellationReason && (
                            <p className="text-xs text-red-600 dark:text-red-500">Reason: {shipment.cancellationReason}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status Timeline */}
                    <div className="rounded-xl border bg-card p-6">
                      <h3 className="mb-6 text-sm font-semibold">Delivery Progress</h3>
                      <div className="relative">
                        {MILESTONES.map((step, idx) => {
                          const isComplete = idx < currentIndex
                          const isCurrent = idx === currentIndex && !isException

                          return (
                            <div key={step.label} className="flex gap-4 pb-8 last:pb-0">
                              {idx < MILESTONES.length - 1 && (
                                <div className="absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 bg-border" />
                              )}
                              <div className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 ${
                                isComplete ? "border-emerald-500 bg-emerald-500 text-white" :
                                isCurrent ? "border-primary bg-primary text-primary-foreground" :
                                "border-border bg-background text-muted-foreground"
                              }`}>
                                <HugeiconsIcon icon={step.icon} className="size-5" />
                              </div>
                              <div className="pt-1.5">
                                <p className={`text-sm font-medium ${
                                  isComplete ? "text-emerald-600" :
                                  isCurrent ? "text-primary" :
                                  "text-muted-foreground"
                                }`}>
                                  {step.label}
                                </p>
                                {isCurrent && <p className="text-xs text-muted-foreground">Current status</p>}
                                {isComplete && <p className="text-xs text-emerald-600">Completed</p>}
                              </div>
                            </div>
                          )
                        })}

                        {/* POD Available — only meaningful once actually delivered */}
                        <div className="flex gap-4">
                          <div className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 ${
                            result.podAvailable ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-background text-muted-foreground"
                          }`}>
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5" />
                          </div>
                          <div className="pt-1.5">
                            <p className={`text-sm font-medium ${result.podAvailable ? "text-emerald-600" : "text-muted-foreground"}`}>Proof of Delivery</p>
                            <p className="text-xs text-muted-foreground">
                              {result.podAvailable ? "Available — sign in to your dashboard to view it" : "Not yet available"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tracking Events */}
                    {events.length > 0 && (
                      <div className="rounded-xl border bg-card p-6">
                        <h3 className="mb-4 text-sm font-semibold">Tracking History</h3>
                        <div className="space-y-3">
                          {events.map((event: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <HugeiconsIcon icon={MapIcon} className="size-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{event.description || event.event?.replace(/_/g, " ")}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {event.location && <span>{event.location}</span>}
                                  <span className="flex items-center gap-1">
                                    <HugeiconsIcon icon={ClockIcon} className="size-3" />
                                    {new Date(event.createdAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()
            )}
          </div>
        )}

        {/* Initial state - not searched yet */}
        {!searched && !loading && (
          <div className="mt-8 rounded-xl border bg-card p-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <HugeiconsIcon icon={Package02Icon} className="size-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Enter a tracking number</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your tracking number was provided when you booked your shipment. It looks like XRD-2026-XXXXXX.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-svh items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <TrackContent />
    </Suspense>
  )
}
