"use client"

import * as React from "react"
import { api, ApiError } from "./api"

export interface ShipmentStats {
  total: number
  active: number
  delivered: number
  cancelled: number
  inTransit: number
  scheduled: number
}

export interface ShipmentVolumePoint {
  date: string
  shipments: number
  delivered: number
}

export interface RoutePerformance {
  route: string
  shipments: number
  avgTimeHours: number
  successRate: number
}

export interface RecentShipment {
  id: string
  trackingNumber: string
  status: string
  totalAmount: number
  currency: string
  createdAt: string
  fromCity: string
  toCity: string
  customerName: string
}


export function useShipmentStats() {
  const [data, setData] = React.useState<ShipmentStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<ApiError | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        setIsLoading(true)
        const res = await api.shipments.stats()
        if (!cancelled) {
          setData(res.data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err as ApiError)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [])

  return { data, isLoading, error }
}

export function useShipmentVolume(range: string) {
  const [data, setData] = React.useState<ShipmentVolumePoint[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<ApiError | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        setIsLoading(true)
        const res = await api.shipments.list(`?page=1&limit=100&range=${range}`)
        if (!cancelled) {
          const shipments = res.data?.shipments || res.data || []
          const grouped: Record<string, { shipments: number; delivered: number }> = {}
          for (const s of shipments) {
            const d = (s.createdAt || s.created_at || "").slice(0, 10)
            if (!d) continue
            if (!grouped[d]) grouped[d] = { shipments: 0, delivered: 0 }
            grouped[d].shipments++
            if (s.status === "DELIVERED") grouped[d].delivered++
          }
          const points = Object.entries(grouped)
            .map(([date, v]) => ({ date, ...v }))
            .sort((a, b) => a.date.localeCompare(b.date))
          if (points.length > 0) {
            setData(points)
          }
        }
      } catch {
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [range])

  return { data, isLoading, error }
}

export function useRoutePerformance() {
  const [data, setData] = React.useState<RoutePerformance[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        setIsLoading(true)
        const res = await api.shipments.list("?page=1&limit=500")
        if (!cancelled) {
          const shipments = res.data?.shipments || res.data || []
          const routeMap: Record<string, { total: number; delivered: number; times: number[] }> = {}
          for (const s of shipments) {
            const from = s.fromAddress?.city || s.fromAddress?.address || "Unknown"
            const to = s.toAddress?.city || s.toAddress?.address || "Unknown"
            const route = `${from} → ${to}`
            if (!routeMap[route]) routeMap[route] = { total: 0, delivered: 0, times: [] }
            routeMap[route].total++
            if (s.status === "DELIVERED") routeMap[route].delivered++
            if (s.deliveredAt && s.createdAt) {
              const diff = (new Date(s.deliveredAt).getTime() - new Date(s.createdAt).getTime()) / 3600000
              if (diff > 0 && diff < 720) routeMap[route].times.push(diff)
            }
          }
          const routes = Object.entries(routeMap)
            .map(([route, v]) => ({
              route,
              shipments: v.total,
              avgTimeHours: v.times.length > 0 ? v.times.reduce((a, b) => a + b, 0) / v.times.length : 0,
              successRate: v.total > 0 ? (v.delivered / v.total) * 100 : 0,
            }))
            .sort((a, b) => b.shipments - a.shipments)
          if (routes.length > 0) setData(routes)
        }
      } catch {
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [])

  return { data, isLoading }
}

export function useRecentShipments(limit = 8) {
  const [data, setData] = React.useState<RecentShipment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<ApiError | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        setIsLoading(true)
        const res = await api.shipments.list(`?page=1&limit=${limit}`)
        if (!cancelled) {
          const shipments = res.data?.shipments || res.data || []
          const mapped = shipments.map((s: any) => ({
            id: s.id,
            trackingNumber: s.trackingNumber,
            status: s.status,
            totalAmount: Number(s.totalAmount || 0),
            currency: s.currency || "TZS",
            createdAt: s.createdAt,
            fromCity: s.fromAddress?.city || "—",
            toCity: s.toAddress?.city || "—",
            customerName: s.customer?.name || s.customer?.user?.name || "—",
          }))
          setData(mapped)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err as ApiError)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [limit])

  return { data, isLoading, error }
}

export function useUserStats() {
  const [data, setData] = React.useState<{ total: number; active: number; inactive: number; drivers: number; customers: number; byRole: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        setIsLoading(true)
        const res = await api.users.stats()
        if (!cancelled) {
          const raw = res.data
          const byRole = raw?.byRole || {}
          setData({
            total: raw?.total || 0,
            active: raw?.active || 0,
            inactive: raw?.inactive || 0,
            drivers: byRole.DRIVER || 0,
            customers: byRole.CUSTOMER || 0,
            byRole,
          })
        }
      } catch {
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [])

  return { data, isLoading }
}

export interface OrderStats {
  total: number
  pending: number
  confirmed: number
  cancelled: number
  totalRevenue: number
}

export function useOrderStats() {
  const [data, setData] = React.useState<OrderStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        setIsLoading(true)
        const res = await api.orders.stats()
        if (!cancelled) setData(res.data)
      } catch {
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [])

  return { data, isLoading }
}

export interface ExceptionStats {
  total: number
  open: number
  resolved: number
  byStatus: Array<{ status: string; _count: { status: number } }>
  byType: Array<{ type: string; _count: { type: number } }>
}

export function useExceptionStats() {
  const [data, setData] = React.useState<ExceptionStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        setIsLoading(true)
        const res = await api.exceptions.stats()
        if (!cancelled) setData(res.data)
      } catch {
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [])

  return { data, isLoading }
}

export interface CapacitySummary {
  totalManifests: number
  totalReservedKg: number
  totalUsedKg: number
  totalRemainingKg: number
  overallUtilization: number
  overCapacityCount: number
  nearCapacityCount: number
}

export function useCapacityOverview() {
  const [data, setData] = React.useState<{ manifests: any[]; summary: CapacitySummary } | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        setIsLoading(true)
        const res = await api.capacity.overview()
        if (!cancelled) setData(res.data)
      } catch {
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [])

  return { data, isLoading }
}
