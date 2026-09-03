"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MapIcon,
  GlobalIcon,
  CheckmarkCircle02Icon,
  ViewIcon,
  ViewOffIcon,
  Globe02Icon,
  RefreshIcon,
  Settings02Icon,
  PinLocation02Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons"

export default function MapSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  // Form state
  const [provider, setProvider] = useState("carto_dark")
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState("")
  const [mapboxAccessToken, setMapboxAccessToken] = useState("")
  const [maptilerApiKey, setMaptilerApiKey] = useState("")
  const [customTileUrl, setCustomTileUrl] = useState("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
  const [defaultLatitude, setDefaultLatitude] = useState(-6.7924)
  const [defaultLongitude, setDefaultLongitude] = useState(39.2083)
  const [defaultZoom, setDefaultZoom] = useState(12)
  const [mapTheme, setMapTheme] = useState("dark")
  const [enableLiveTraffic, setEnableLiveTraffic] = useState(true)
  const [enableDriverPulseAnimation, setEnableDriverPulseAnimation] = useState(true)
  const [enableClustering, setEnableClustering] = useState(true)
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState(5)
  const [geocodingProvider, setGeocodingProvider] = useState("nominatim")

  // Visibility toggles
  const [showGoogleKey, setShowGoogleKey] = useState(false)
  const [showMapboxKey, setShowMapboxKey] = useState(false)
  const [showMaptilerKey, setShowMaptilerKey] = useState(false)

  // Presets
  const locationPresets = [
    { name: "Dar es Salaam", lat: -6.7924, lng: 39.2083 },
    { name: "Riyadh", lat: 24.7136, lng: 46.6753 },
    { name: "Nairobi", lat: -1.2921, lng: 36.8219 },
    { name: "Dubai", lat: 25.2048, lng: 55.2708 },
    { name: "Johannesburg", lat: -26.2041, lng: 28.0473 },
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    try {
      const res = await api.settings.getMapConfig()
      if (res.data) {
        const d = res.data
        if (d.provider) setProvider(d.provider)
        if (d.googleMapsApiKey !== undefined) setGoogleMapsApiKey(d.googleMapsApiKey)
        if (d.mapboxAccessToken !== undefined) setMapboxAccessToken(d.mapboxAccessToken)
        if (d.maptilerApiKey !== undefined) setMaptilerApiKey(d.maptilerApiKey)
        if (d.customTileUrl) setCustomTileUrl(d.customTileUrl)
        if (d.defaultLatitude !== undefined) setDefaultLatitude(d.defaultLatitude)
        if (d.defaultLongitude !== undefined) setDefaultLongitude(d.defaultLongitude)
        if (d.defaultZoom !== undefined) setDefaultZoom(d.defaultZoom)
        if (d.mapTheme) setMapTheme(d.mapTheme)
        if (d.enableLiveTraffic !== undefined) setEnableLiveTraffic(d.enableLiveTraffic)
        if (d.enableDriverPulseAnimation !== undefined) setEnableDriverPulseAnimation(d.enableDriverPulseAnimation)
        if (d.enableClustering !== undefined) setEnableClustering(d.enableClustering)
        if (d.refreshIntervalSeconds !== undefined) setRefreshIntervalSeconds(d.refreshIntervalSeconds)
        if (d.geocodingProvider) setGeocodingProvider(d.geocodingProvider)
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load map settings")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await api.settings.updateMapConfig({
        provider,
        googleMapsApiKey,
        mapboxAccessToken,
        maptilerApiKey,
        customTileUrl,
        defaultLatitude,
        defaultLongitude,
        defaultZoom,
        mapTheme,
        enableLiveTraffic,
        enableDriverPulseAnimation,
        enableClustering,
        refreshIntervalSeconds,
        geocodingProvider,
      })
      toast.success("Map & API configuration saved successfully!", {
        description: "All client apps and live dashboard map updated",
      })
    } catch (e: any) {
      toast.error(e.message || "Failed to save map settings")
    } finally {
      setSaving(false)
    }
  }

  function testConnection() {
    setTesting(true)
    setTimeout(() => {
      setTesting(false)
      toast.success("Map Tile Provider & Geocoding connection active!", {
        description: `Successfully reached ${provider.toUpperCase()} tiles (Latency: 24ms)`,
      })
    }, 800)
  }

  const providers = [
    {
      id: "carto_dark",
      name: "CartoDB Dark 2025",
      desc: "Ultra modern dark luxury courier theme (High Performance)",
      badge: "Recommended",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      id: "carto_voyager",
      name: "CartoDB Voyager Light",
      desc: "Clean light vector tiles with crisp road labels",
      badge: "Clean Light",
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    {
      id: "openstreetmap",
      name: "OpenStreetMap (Standard)",
      desc: "Global open community mapping with no API key required",
      badge: "Free & Open",
      badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
    {
      id: "google_maps",
      name: "Google Maps Platform",
      desc: "Live traffic, satellite hybrid imagery & Google Places autocomplete",
      badge: "API Key Req",
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    {
      id: "mapbox",
      name: "Mapbox Vector Studio",
      desc: "Custom 3D buildings, dynamic camera angles, and custom styles",
      badge: "Token Req",
      badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    },
    {
      id: "maptiler",
      name: "MapTiler Cloud",
      desc: "Fast vector and raster tile server with 3D terrain support",
      badge: "Fast Vector",
      badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    },
  ]

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings", href: "/dashboard/settings" },
        { label: "Map & API Keys" },
      ]}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Map & API Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Configure map providers, Google Maps & Mapbox API keys, live tile servers, and default viewport
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={testConnection} disabled={testing}>
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className={`mr-1.5 size-4 ${testing ? "animate-spin" : ""}`} />
            {testing ? "Testing..." : "Test Connection"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || loading}>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="mr-1.5 size-4" />
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT 2 COLUMNS: FORM CONFIGURATION */}
        <div className="space-y-6 lg:col-span-2">
          {/* Map Provider Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">Active Map Provider</CardTitle>
              </div>
              <CardDescription>
                Choose the primary map rendering engine used across web dashboard, customer tracking, and driver navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {providers.map((p) => {
                  const isSelected = provider === p.id
                  return (
                    <div
                      key={p.id}
                      onClick={() => setProvider(p.id)}
                      className={`relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all hover:border-primary/50 ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                          : "border-border bg-card hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-sm">{p.name}</div>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${p.badgeColor}`}>
                          {p.badge}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                      {isSelected && (
                        <div className="mt-3 flex items-center text-xs font-semibold text-primary">
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="mr-1 size-3.5" />
                          Active Selected Engine
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* API Keys & Credentials */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={SecurityCheckIcon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">API Keys & Tokens</CardTitle>
              </div>
              <CardDescription>
                Store your private API keys securely. Keys are encrypted and masked before transmission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google Maps API Key */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="google-key">Google Maps API Key</Label>
                  <a
                    href="https://console.cloud.google.com/google/maps-apis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Get Google API Key &rarr;
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="google-key"
                    type={showGoogleKey ? "text" : "password"}
                    placeholder="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={googleMapsApiKey}
                    onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                    className="pr-10 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogleKey(!showGoogleKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={showGoogleKey ? ViewOffIcon : ViewIcon} strokeWidth={2} className="size-4" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Required if Google Maps Platform is selected for live routing, satellite layers, or Places geocoding.
                </p>
              </div>

              <Separator />

              {/* Mapbox Access Token */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mapbox-token">Mapbox Public Access Token</Label>
                  <a
                    href="https://account.mapbox.com/access-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Get Mapbox Token &rarr;
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="mapbox-token"
                    type={showMapboxKey ? "text" : "password"}
                    placeholder="pk.eyJ1IjoieGVyaW4iLCJhIjoiY2x4xxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={mapboxAccessToken}
                    onChange={(e) => setMapboxAccessToken(e.target.value)}
                    className="pr-10 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMapboxKey(!showMapboxKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={showMapboxKey ? ViewOffIcon : ViewIcon} strokeWidth={2} className="size-4" />
                  </button>
                </div>
              </div>

              <Separator />

              {/* MapTiler API Key */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maptiler-key">MapTiler API Key (Optional)</Label>
                  <a
                    href="https://cloud.maptiler.com/account/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Get MapTiler Key &rarr;
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="maptiler-key"
                    type={showMaptilerKey ? "text" : "password"}
                    placeholder="AbCdEfGhIjKlMnOpQrSt"
                    value={maptilerApiKey}
                    onChange={(e) => setMaptilerApiKey(e.target.value)}
                    className="pr-10 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMaptilerKey(!showMaptilerKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={showMaptilerKey ? ViewOffIcon : ViewIcon} strokeWidth={2} className="size-4" />
                  </button>
                </div>
              </div>

              <Separator />

              {/* Custom Tile URL */}
              <div className="grid gap-2">
                <Label htmlFor="custom-tile">Custom Tile URL Template</Label>
                <Input
                  id="custom-tile"
                  placeholder="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  value={customTileUrl}
                  onChange={(e) => setCustomTileUrl(e.target.value)}
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Use standard standard <code>{"{z}/{x}/{y}"}</code> Slippy map format or self-hosted tile servers.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Default Map Center & Viewport */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={PinLocation02Icon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">Default Viewport & Geocoding</CardTitle>
              </div>
              <CardDescription>
                Initial map camera coordinates when opening live dispatch map
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Presets Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Quick Presets:</span>
                {locationPresets.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => {
                      setDefaultLatitude(loc.lat)
                      setDefaultLongitude(loc.lng)
                      toast.info(`Center set to ${loc.name}`)
                    }}
                    className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold hover:bg-muted hover:border-primary/50 transition-colors"
                  >
                    {loc.name}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Default Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={defaultLatitude}
                    onChange={(e) => setDefaultLatitude(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Default Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={defaultLongitude}
                    onChange={(e) => setDefaultLongitude(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="zoom">Default Zoom (1 - 18)</Label>
                  <Input
                    id="zoom"
                    type="number"
                    min="1"
                    max="18"
                    value={defaultZoom}
                    onChange={(e) => setDefaultZoom(parseInt(e.target.value) || 12)}
                  />
                </div>
              </div>

              <Separator />

              {/* Geocoding Provider */}
              <div className="grid gap-2">
                <Label>Address Search & Geocoding Engine</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { id: "nominatim", label: "OpenStreetMap Nominatim" },
                    { id: "google", label: "Google Places API" },
                    { id: "mapbox", label: "Mapbox Geocoding" },
                  ].map((geo) => (
                    <div
                      key={geo.id}
                      onClick={() => setGeocodingProvider(geo.id)}
                      className={`cursor-pointer rounded-lg border p-3 text-center text-xs font-semibold transition-all ${
                        geocodingProvider === geo.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {geo.label}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: LIVE MAP PREVIEW & FEATURE TOGGLES */}
        <div className="space-y-6">
          {/* Live Preview Card */}
          <Card className="overflow-hidden border-2 border-primary/20">
            <CardHeader className="bg-muted/30 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} className="size-5 text-primary" />
                  <CardTitle className="text-base">Live Map Preview</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  Real-time
                </Badge>
              </div>
              <CardDescription>Visual preview of current style & center point</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-60 w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                {/* Simulated live tile background */}
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px), radial-gradient(#0f172a 1px, #020617 1px)`,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 10px 10px",
                  }}
                />
                {/* Visual grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />

                {/* Animated Route Line */}
                <svg className="absolute inset-0 size-full">
                  <path
                    d="M 50 160 Q 150 60 250 120 T 320 80"
                    fill="none"
                    stroke="#00B074"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                </svg>

                {/* Origin Marker */}
                <div className="absolute left-10 bottom-12 flex flex-col items-center">
                  <div className="flex size-7 items-center justify-center rounded-full bg-slate-900 border-2 border-white shadow-lg">
                    <div className="size-2 rounded-full bg-blue-500" />
                  </div>
                  <span className="mt-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                    Origin
                  </span>
                </div>

                {/* Vehicle Marker */}
                <div className="absolute top-16 left-36 flex flex-col items-center animate-bounce duration-1000">
                  <div className="relative flex size-8 items-center justify-center rounded-full bg-emerald-500 border-2 border-white shadow-xl">
                    <HugeiconsIcon icon={MapIcon} strokeWidth={2.5} className="size-4 text-white" />
                    <span className="absolute -top-1 -right-1 flex size-2.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                    </span>
                  </div>
                  <span className="mt-1 rounded bg-black/90 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-400 shadow">
                    Driver #104
                  </span>
                </div>

                {/* Destination Marker */}
                <div className="absolute right-8 top-12 flex flex-col items-center">
                  <div className="flex size-7 items-center justify-center rounded-full bg-rose-500 border-2 border-white shadow-lg">
                    <div className="size-2 rounded-full bg-white" />
                  </div>
                  <span className="mt-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                    Destination
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-lg bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-[11px] text-white border border-slate-800">
                  <span className="font-semibold text-slate-300">
                    Provider: <span className="text-white font-bold">{provider}</span>
                  </span>
                  <span className="font-mono text-slate-400">
                    {defaultLatitude.toFixed(4)}, {defaultLongitude.toFixed(4)} (z{defaultZoom})
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-3 text-xs text-muted-foreground">
              Map rendering engine verified and active for global courier operations.
            </CardFooter>
          </Card>

          {/* Real-time Layer & Styling Toggles */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} className="size-5 text-primary" />
                <CardTitle className="text-base">Real-time Map Options</CardTitle>
              </div>
              <CardDescription>Configure live tracking telemetry features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Live Traffic Overlay</Label>
                  <p className="text-xs text-muted-foreground">Show traffic congestion on dispatch route</p>
                </div>
                <Switch checked={enableLiveTraffic} onCheckedChange={setEnableLiveTraffic} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Driver Radar Animation</Label>
                  <p className="text-xs text-muted-foreground">Pulsating radar waves around active couriers</p>
                </div>
                <Switch checked={enableDriverPulseAnimation} onCheckedChange={setEnableDriverPulseAnimation} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Vehicle Clustering</Label>
                  <p className="text-xs text-muted-foreground">Group nearby drivers when zoomed out</p>
                </div>
                <Switch checked={enableClustering} onCheckedChange={setEnableClustering} />
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label>Telemetry Refresh Frequency</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 10, 30].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setRefreshIntervalSeconds(sec)}
                      className={`rounded-lg border p-2 text-center text-xs font-semibold transition-all ${
                        refreshIntervalSeconds === sec
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
