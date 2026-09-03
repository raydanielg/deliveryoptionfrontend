"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MapIcon,
  SearchIcon,
  TruckIcon,
  BikeIcon,
  ClockIcon,
  CallIcon,
  BubbleChatIcon,
  ViewIcon,
  ArrowRight01Icon,
  RefreshIcon,
  PlayIcon,
  PauseIcon,
  PinLocation02Icon,
  Layers01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

// Dynamic Leaflet import for SSR compatibility
let L: any = null

interface DriverVehicle {
  id: string
  name: string
  phone: string
  vehicleType: "van" | "bike" | "truck"
  plateNumber: string
  status: "IN_TRANSIT" | "DELIVERING" | "IDLE" | "PICKING_UP"
  trackingNumber: string
  fromCity: string
  toCity: string
  speed: number
  heading: number
  lat: number
  lng: number
  eta: string
  battery: number
  routePoints: [number, number][]
}

export default function TrackingMapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<{ [key: string]: any }>({})
  const polylinesRef = useRef<{ [key: string]: any }>({})

  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<DriverVehicle | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [activeTileLayer, setActiveTileLayer] = useState<string>("carto_dark")
  const [isLiveSimulating, setIsLiveSimulating] = useState(true)

  // Real mock vehicles with coordinates centered on Dar es Salaam & regional routes
  const [vehicles, setVehicles] = useState<DriverVehicle[]>([
    {
      id: "drv-1",
      name: "Khalid Omor",
      phone: "+255 712 345 678",
      vehicleType: "van",
      plateNumber: "T 482 DFP",
      status: "IN_TRANSIT",
      trackingNumber: "XRD-2026-849102",
      fromCity: "City Center, Dar",
      toCity: "Mlimani City, Dar",
      speed: 46,
      heading: 45,
      lat: -6.7824,
      lng: 39.2283,
      eta: "18 mins",
      battery: 92,
      routePoints: [
        [-6.8162, 39.2804],
        [-6.7924, 39.2483],
        [-6.7824, 39.2283],
        [-6.7714, 39.2155],
      ],
    },
    {
      id: "drv-2",
      name: "Ahmad Kawsar",
      phone: "+255 754 889 012",
      vehicleType: "bike",
      plateNumber: "MC 918 ABX",
      status: "DELIVERING",
      trackingNumber: "XRD-2026-302918",
      fromCity: "Kariakoo Hub",
      toCity: "Mikocheni B",
      speed: 32,
      heading: 120,
      lat: -6.7645,
      lng: 39.2467,
      eta: "7 mins",
      battery: 78,
      routePoints: [
        [-6.8211, 39.2745],
        [-6.7912, 39.2561],
        [-6.7645, 39.2467],
        [-6.7550, 39.2410],
      ],
    },
    {
      id: "drv-3",
      name: "Juma Rashid",
      phone: "+255 688 112 334",
      vehicleType: "truck",
      plateNumber: "T 190 EAA",
      status: "IN_TRANSIT",
      trackingNumber: "XRD-2026-994012",
      fromCity: "Port Logistics Yard",
      toCity: "Kibaha Industrial",
      speed: 58,
      heading: 270,
      lat: -6.8124,
      lng: 39.1824,
      eta: "42 mins",
      battery: 85,
      routePoints: [
        [-6.8300, 39.2900],
        [-6.8200, 39.2400],
        [-6.8124, 39.1824],
        [-6.7700, 38.9900],
      ],
    },
    {
      id: "drv-4",
      name: "Baraka Mwamba",
      phone: "+255 789 445 667",
      vehicleType: "van",
      plateNumber: "T 612 CKK",
      status: "PICKING_UP",
      trackingNumber: "XRD-2026-118833",
      fromCity: "Masaki Peninsula",
      toCity: "Oysterbay Post",
      speed: 24,
      heading: 180,
      lat: -6.7450,
      lng: 39.2780,
      eta: "12 mins",
      battery: 64,
      routePoints: [
        [-6.7380, 39.2820],
        [-6.7450, 39.2780],
        [-6.7620, 39.2650],
      ],
    },
    {
      id: "drv-5",
      name: "Said Hassan",
      phone: "+255 765 221 990",
      vehicleType: "bike",
      plateNumber: "MC 412 ZZZ",
      status: "IDLE",
      trackingNumber: "XRD-2026-009182",
      fromCity: "Sinza Hub",
      toCity: "Available",
      speed: 0,
      heading: 0,
      lat: -6.7850,
      lng: 39.2150,
      eta: "Ready",
      battery: 98,
      routePoints: [[-6.7850, 39.2150]],
    },
  ])

  // Initialize Leaflet Map
  useEffect(() => {
    let mounted = true

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return
      if (!L) {
        L = (await import("leaflet")).default
        // Inject Leaflet CSS
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link")
          link.id = "leaflet-css"
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }
      }

      if (!mapInstanceRef.current && mapContainerRef.current) {
        let defaultLat = -6.7924
        let defaultLng = 39.2483
        let defaultZoom = 13

        try {
          const cfg = await api.settings.getPublicMapConfig()
          if (cfg.data?.defaultLatitude) defaultLat = cfg.data.defaultLatitude
          if (cfg.data?.defaultLongitude) defaultLng = cfg.data.defaultLongitude
          if (cfg.data?.defaultZoom) defaultZoom = cfg.data.defaultZoom
        } catch (_) {}

        const map = L.map(mapContainerRef.current, {
          center: [defaultLat, defaultLng],
          zoom: defaultZoom,
          zoomControl: false,
        })

        const tileLayer = getTileLayer(activeTileLayer)
        if (tileLayer) tileLayer.addTo(map)

        L.control.zoom({ position: "topright" }).addTo(map)

        mapInstanceRef.current = map
        if (mounted) setMapLoaded(true)
      }
    }

    initMap()

    return () => {
      mounted = false
    }
  }, [])

  function getTileLayer(layerKey: string) {
    if (!L) return null
    switch (layerKey) {
      case "carto_dark":
        return L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: "&copy; CartoDB &copy; OpenStreetMap",
          maxZoom: 19,
        })
      case "carto_voyager":
        return L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: "&copy; CartoDB &copy; OpenStreetMap",
          maxZoom: 19,
        })
      case "osm":
        return L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        })
      case "satellite":
        return L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "&copy; Esri &copy; Earthstar Geographics",
            maxZoom: 18,
          }
        )
      default:
        return L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 })
    }
  }

  function handleTileChange(layerKey: string) {
    setActiveTileLayer(layerKey)
    if (!mapInstanceRef.current || !L) return
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current.removeLayer(layer)
      }
    })
    const newLayer = getTileLayer(layerKey)
    if (newLayer) newLayer.addTo(mapInstanceRef.current)
  }

  // Update Markers & Polylines on Map
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !L) return

    const map = mapInstanceRef.current

    Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m))
    Object.values(polylinesRef.current).forEach((p: any) => map.removeLayer(p))
    markersRef.current = {}
    polylinesRef.current = {}

    vehicles.forEach((veh) => {
      const isSelected = selectedDriver?.id === veh.id
      const markerColor =
        veh.status === "DELIVERING"
          ? "#10B981"
          : veh.status === "IN_TRANSIT"
          ? "#3B82F6"
          : veh.status === "PICKING_UP"
          ? "#F59E0B"
          : "#64748B"

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="position: relative; width: 38px; height: 38px; border-radius: 50%; background: ${
              isSelected ? "#FFFFFF" : "#0F172A"
            }; border: 2.5px solid ${markerColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.5); transform: ${
          isSelected ? "scale(1.2)" : "scale(1)"
        }; transition: all 0.3s ease;">
              <span style="color: ${
                isSelected ? "#0F172A" : "#FFFFFF"
              }; font-size: 14px; font-weight: bold;">
                ${veh.vehicleType === "bike" ? "🏍️" : veh.vehicleType === "truck" ? "🚛" : "🚐"}
              </span>
              ${
                veh.speed > 0
                  ? `<span style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; border-radius: 50%; background: ${markerColor}; border: 1.5px solid #FFFFFF; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
                  : ""
              }
            </div>
            <div style="margin-top: 4px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(4px); color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
              ${veh.name}
            </div>
          </div>
        `,
        iconSize: [38, 55],
        iconAnchor: [19, 45],
      })

      const marker = L.marker([veh.lat, veh.lng], { icon: customIcon }).addTo(map)
      marker.on("click", () => {
        setSelectedDriver(veh)
        map.flyTo([veh.lat, veh.lng], 15, { animate: true, duration: 1 })
      })

      markersRef.current[veh.id] = marker

      if (veh.routePoints && veh.routePoints.length > 1) {
        const polyline = L.polyline(veh.routePoints, {
          color: markerColor,
          weight: isSelected ? 4 : 2.5,
          opacity: isSelected ? 0.9 : 0.4,
          dashArray: isSelected ? "8, 6" : undefined,
        }).addTo(map)
        polylinesRef.current[veh.id] = polyline
      }
    })
  }, [mapLoaded, vehicles, selectedDriver])

  // Real-time Simulation Engine
  useEffect(() => {
    if (!isLiveSimulating) return

    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status === "IDLE") return v
          const deltaLat = (Math.random() - 0.48) * 0.0006
          const deltaLng = (Math.random() - 0.48) * 0.0006
          const newSpeed = Math.max(15, Math.min(75, v.speed + Math.floor((Math.random() - 0.5) * 6)))

          return {
            ...v,
            lat: v.lat + deltaLat,
            lng: v.lng + deltaLng,
            speed: newSpeed,
          }
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [isLiveSimulating])

  const filteredVehicles = vehicles.filter((v) => {
    const matchesQuery =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter
    return matchesQuery && matchesStatus
  })

  const stats = {
    total: vehicles.length,
    inTransit: vehicles.filter((v) => v.status === "IN_TRANSIT").length,
    delivering: vehicles.filter((v) => v.status === "DELIVERING").length,
    idle: vehicles.filter((v) => v.status === "IDLE").length,
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Tracking", href: "/dashboard/tracking" },
        { label: "Live Dispatch Map" },
      ]}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Dispatch Map</h1>
          <p className="text-sm text-muted-foreground">
            Real-time multi-carrier fleet tracking, telemetry & active delivery routes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold shadow-sm">
            <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
            <span>{stats.inTransit} In Transit</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold shadow-sm">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>{stats.delivering} Delivering</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold shadow-sm">
            <span className="size-2 rounded-full bg-slate-400" />
            <span>{stats.idle} Available</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLiveSimulating(!isLiveSimulating)}
            className="h-8 gap-1 text-xs"
          >
            <HugeiconsIcon icon={isLiveSimulating ? PauseIcon : PlayIcon} strokeWidth={2} className="size-3.5" />
            {isLiveSimulating ? "Live Streaming" : "Paused"}
          </Button>
        </div>
      </div>

      <div className="relative h-[calc(100vh-210px)] min-h-[580px] w-full overflow-hidden rounded-2xl border border-border bg-slate-950 shadow-2xl">
        <div ref={mapContainerRef} className="absolute inset-0 size-full z-0" />

        <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1 shadow-xl">
            {[
              { id: "carto_dark", label: "🌙 Dark 2025" },
              { id: "carto_voyager", label: "☀️ Clean Light" },
              { id: "satellite", label: "🛰️ Satellite" },
              { id: "osm", label: "🗺️ Streets" },
            ].map((tile) => (
              <button
                key={tile.id}
                onClick={() => handleTileChange(tile.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeTileLayer === tile.id
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tile.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([-6.7924, 39.2483], 13, { duration: 1 })
                toast.info("Map recentered to dispatch hub")
              }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white shadow-xl transition-all"
          >
            <HugeiconsIcon icon={PinLocation02Icon} strokeWidth={2} className="size-4 text-primary" />
            Recenter
          </button>
        </div>

        <div className="absolute top-16 left-4 bottom-4 z-10 w-80 max-w-[calc(100vw-32px)] flex flex-col rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="p-3.5 border-b border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-1.5">
                <HugeiconsIcon icon={TruckIcon} strokeWidth={2} className="size-4 text-emerald-400" />
                Active Fleet ({filteredVehicles.length})
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Feed
              </span>
            </div>

            <div className="relative">
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search driver, plate, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-slate-950/80 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {["ALL", "IN_TRANSIT", "DELIVERING", "IDLE"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-md px-2 py-0.5 font-semibold transition-colors shrink-0 ${
                    statusFilter === st
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {st === "ALL" ? "All" : st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 divide-y divide-slate-800/40">
            {filteredVehicles.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No active drivers match your filter
              </div>
            ) : (
              filteredVehicles.map((veh) => {
                const isSelected = selectedDriver?.id === veh.id
                return (
                  <div
                    key={veh.id}
                    onClick={() => {
                      setSelectedDriver(veh)
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([veh.lat, veh.lng], 15, { animate: true, duration: 1 })
                      }
                    }}
                    className={`group cursor-pointer rounded-xl p-2.5 transition-all pt-2 ${
                      isSelected
                        ? "bg-slate-800/90 border border-primary/50 shadow-md"
                        : "hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-sm">
                          {veh.vehicleType === "bike" ? "🏍️" : veh.vehicleType === "truck" ? "🚛" : "🚐"}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white group-hover:text-primary transition-colors">
                            {veh.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{veh.plateNumber}</div>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0.5 border ${
                          veh.status === "DELIVERING"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : veh.status === "IN_TRANSIT"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : veh.status === "PICKING_UP"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-slate-700/50 text-slate-400 border-slate-600"
                        }`}
                      >
                        {veh.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[150px]">{veh.toCity}</span>
                      <span className="font-bold text-emerald-400">{veh.speed} km/h</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {selectedDriver && (
          <div className="absolute bottom-4 right-4 z-20 w-96 max-w-[calc(100vw-32px)] rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-4 shadow-2xl text-white animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-xl">
                  {selectedDriver.vehicleType === "bike" ? "🏍️" : selectedDriver.vehicleType === "truck" ? "🚛" : "🚐"}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white">{selectedDriver.name}</div>
                  <div className="text-[11px] text-slate-400">{selectedDriver.plateNumber} • Courier</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedDriver(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-xl bg-slate-950/70 p-2.5 border border-slate-800/80 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-medium">Speed</span>
                <div className="font-bold text-xs text-emerald-400">{selectedDriver.speed} km/h</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium">ETA</span>
                <div className="font-bold text-xs text-blue-400">{selectedDriver.eta}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium">Battery</span>
                <div className="font-bold text-xs text-amber-400">{selectedDriver.battery}%</div>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tracking ID:</span>
                <span className="font-mono font-bold text-primary">{selectedDriver.trackingNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Route:</span>
                <span className="font-medium text-slate-200">
                  {selectedDriver.fromCity} &rarr; {selectedDriver.toCity}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <a
                href={`tel:${selectedDriver.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <HugeiconsIcon icon={CallIcon} strokeWidth={2} className="size-3.5" />
                Call Driver
              </a>
              <a
                href={`/dashboard/shipments`}
                className="flex items-center justify-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
              >
                View Shipment &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
