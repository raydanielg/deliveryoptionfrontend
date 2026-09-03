"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  TruckIcon,
  BikeIcon,
  Store02Icon,
  Package02Icon,
  Route02Icon,
  BoxIcon,
  Globe02Icon,
  ShieldCheckIcon,
  Search01Icon,
  ArrowRight01Icon,
  ArrowUpRightIcon,
  CallIcon,
  Mail01Icon,
  Location02Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { RevealOnScroll } from "@/components/reveal-on-scroll"
import { TextRotator } from "@/components/text-rotator"

/* ───────────────────────────── Header ───────────────────────────── */
const navLinks = [
  { label: "Ship a Package", href: "/ship", icon: Package02Icon },
  { label: "Services", href: "#services", icon: TruckIcon },
  { label: "Coverage", href: "#coverage", icon: Globe02Icon },
  { label: "How It Works", href: "#how-it-works", icon: Route02Icon },
  { label: "Why Us", href: "#why-us", icon: ShieldCheckIcon },
  { label: "Track", href: "/track", icon: Search01Icon },
]

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <img src="/assets/social-media.png" alt="Xerin" className="size-9 rounded-lg object-cover ring-1 ring-primary/20" />
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">Xerin Express</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-primary/70">Logistics Platform</span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
            >
              {link.label}
              <span className="absolute inset-x-3 -bottom-px h-px scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/auth"
            className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            Sign In
          </a>
          <a
            href="/ship"
            className="inline-flex h-9 items-center gap-1.5 justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
          >
            <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-4" />
            Ship Now
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`flex size-10 items-center justify-center rounded-lg border transition-all duration-300 lg:hidden ${
            mobileOpen
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border text-foreground hover:border-primary/30 hover:bg-muted/40"
          }`}
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-[5px]">
            <span className={`h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-out ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`h-[2px] w-5 rounded-full bg-current transition-all duration-200 ease-out ${mobileOpen ? "scale-x-0 opacity-0" : ""}`} />
            <span className={`h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-out ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu — smooth slide-down */}
      <div
        className={`overflow-hidden border-border bg-background/95 backdrop-blur-xl transition-all duration-300 ease-out lg:hidden ${
          mobileOpen ? "max-h-[480px] border-t opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
          {navLinks.map((link, idx) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/8 hover:text-foreground ${
                mobileOpen ? "animate-[fade-in_0.3s_ease-out_both]" : ""
              }`}
              style={mobileOpen ? { animationDelay: `${idx * 50}ms` } : undefined}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors duration-200 group-hover:bg-primary/15 group-hover:text-primary">
                <HugeiconsIcon icon={link.icon} strokeWidth={2} className="size-4" />
              </span>
              {link.label}
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-auto size-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2.5 border-t border-border pt-4">
            <a
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted/40 hover:text-foreground"
            >
              Sign In
            </a>
            <a
              href="/ship"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
            >
              <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-4" />
              Ship Now
            </a>
          </div>
        </nav>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-16 z-[-1] bg-slate-950/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </header>
  )
}

/* ───────────────────────────── Trust Marquee ───────────────────────────── */
const marqueeItems = [
  "Real-time Tracking",
  "OTP Verification",
  "Proof of Delivery",
  "Multi-carrier Fleet",
  "Online Payments",
  "Dar es Salaam, Tanzania",
]

export function TrustMarquee() {
  return (
    <section className="relative overflow-hidden border-y border-border/40 bg-background">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      <div
        className="flex w-max items-center gap-8 py-3.5"
        style={{ animation: "marquee 25s linear infinite" }}
      >
        {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 whitespace-nowrap">
            <span className="size-1.5 rounded-full bg-primary/60" />
            <span className="text-sm font-medium text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ───────────────────────────── Hero ───────────────────────────── */
const heroImages = [
  "/assets/2149095908.jpg",
  "/assets/2149095941.jpg",
  "/assets/41714.jpg",
]

export function Hero() {
  const router = useRouter()
  const [trackingNumber, setTrackingNumber] = useState("")
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingNumber.trim()) {
      router.push(`/track?number=${encodeURIComponent(trackingNumber.trim())}`)
    }
  }

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Rotating background images */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((src, idx) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
            style={{
              opacity: idx === bgIndex ? 1 : 0,
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/60 via-transparent to-primary/5" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-col gap-8 animate-[fade-in_0.8s_ease-out]">
          <div className="flex flex-col items-center gap-6">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary animate-[fade-in_0.6s_ease-out]">
              Tanzania &amp; East Africa
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl animate-[fade-in_0.8s_ease-out_0.1s_both]">
              Smart logistics for{" "}
              <br className="hidden sm:block" />
              <TextRotator />.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground text-pretty animate-[fade-in_0.8s_ease-out_0.2s_both]">
              Xerin Express is a multipurpose logistics &amp; delivery platform for domestic,
              international, and freight operations. Track, ship, and deliver with confidence.
            </p>
          </div>

          {/* Tracking input */}
          <form
            onSubmit={handleTrack}
            className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-border bg-background/80 p-2 shadow-sm backdrop-blur-sm animate-[fade-in_0.8s_ease-out_0.3s_both]"
          >
            <div className="flex flex-1 items-center gap-2 px-3">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="size-5 text-muted-foreground" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number..."
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              Track
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
            </button>
          </form>

          <div className="flex flex-row flex-nowrap items-center justify-center gap-4 animate-[fade-in_0.8s_ease-out_0.4s_both]">
            <a
              href="/ship"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              Ship a Package
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
            </a>
            <a
              href="#services"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-6 text-sm font-medium transition-all duration-300 hover:bg-muted/30"
            >
              Explore Services
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────── Services ───────────────────────────── */
const services = [
  { number: "01", icon: TruckIcon, title: "Domestic Delivery", desc: "Same-day and next-day delivery across all major cities in Tanzania with real-time tracking." },
  { number: "02", icon: Globe02Icon, title: "International Shipping", desc: "Cross-border logistics to East Africa and global destinations with customs handling." },
  { number: "03", icon: BoxIcon, title: "Freight Forwarding", desc: "Bulk freight solutions for businesses — FCL, LCL, and air freight with end-to-end visibility." },
  { number: "04", icon: Package02Icon, title: "Parcel Express", desc: "Fast, affordable parcel delivery with categorized pricing by weight and size tiers." },
  { number: "05", icon: BikeIcon, title: "Last-Mile Delivery", desc: "Reliable last-mile fulfillment for e-commerce, restaurants, and on-demand businesses." },
  { number: "06", icon: Store02Icon, title: "E-commerce Fulfillment", desc: "Integrated fulfillment with order management, warehousing, and automated dispatch." },
  { number: "07", icon: Wallet01Icon, title: "Online Payments", desc: "Integrated payment gateways — Selcom, Azampesa, and mobile money for seamless checkout." },
  { number: "08", icon: Route02Icon, title: "Scheduled Delivery", desc: "Plan and schedule shipments in advance with flexible time slots and recurring pickups." },
  { number: "09", icon: ShieldCheckIcon, title: "Insurance & Proof", desc: "OTP verification, proof of delivery photos, and shipment insurance for high-value items." },
]

export function Services() {
  return (
    <section id="services" className="relative bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-14 flex flex-col items-start gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Our Services
            </span>
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              Everything you need to ship and deliver
            </h2>
            <p className="max-w-xl text-base text-muted-foreground">
              From domestic parcels to international freight — powerful logistics tools built for speed, reliability, and scale.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-5 sm:grid-cols-2">
          {services.map((service, idx) => (
            <RevealOnScroll key={service.number} delay={idx * 50} className="h-full">
              <div className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 lg:p-8">
                {/* Hover gradient glow */}
                <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-primary/5 blur-3xl transition-opacity duration-500 group-hover:bg-primary/10" />

                <div className="relative flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:ring-primary/20">
                    <HugeiconsIcon icon={service.icon} strokeWidth={2} className="size-6 text-primary" />
                  </div>
                  <span className="text-3xl font-bold tabular-nums text-muted-foreground/15 transition-colors duration-300 group-hover:text-primary/20">
                    {service.number}
                  </span>
                </div>

                <div className="relative flex flex-col gap-2">
                  <h3 className="text-lg font-semibold tracking-tight transition-colors duration-200 group-hover:text-primary">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {service.desc}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div className="relative mt-auto flex items-center gap-2 pt-3">
                  <span className="h-px flex-1 bg-border transition-all duration-300 group-hover:bg-primary/30" />
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────── Coverage ───────────────────────────── */
let L: any = null

const coverageLocations = [
  { name: "Dar es Salaam", lat: -6.79, lng: 39.28, type: "hub" as const, flag: "" },
  { name: "Dodoma", lat: -6.17, lng: 35.74, type: "domestic" as const, flag: "" },
  { name: "Arusha", lat: -3.37, lng: 36.69, type: "domestic" as const, flag: "" },
  { name: "Mwanza", lat: -2.52, lng: 32.90, type: "domestic" as const, flag: "" },
  { name: "Zanzibar", lat: -6.13, lng: 39.32, type: "domestic" as const, flag: "" },
  { name: "Mbeya", lat: -8.91, lng: 33.46, type: "domestic" as const, flag: "" },
  { name: "Tanga", lat: -5.07, lng: 39.10, type: "domestic" as const, flag: "" },
  { name: "Morogoro", lat: -6.83, lng: 37.66, type: "domestic" as const, flag: "" },
  { name: "Nairobi", lat: -1.29, lng: 36.82, type: "international" as const, flag: "🇰🇪" },
  { name: "Kampala", lat: 0.35, lng: 32.58, type: "international" as const, flag: "🇺🇬" },
  { name: "Kigali", lat: -1.94, lng: 30.06, type: "international" as const, flag: "🇷🇼" },
  { name: "Bujumbura", lat: -3.36, lng: 29.36, type: "international" as const, flag: "🇧🇮" },
  { name: "Lusaka", lat: -15.39, lng: 28.33, type: "international" as const, flag: "🇿🇲" },
  { name: "Lilongwe", lat: -13.96, lng: 33.79, type: "international" as const, flag: "🇲🇼" },
  { name: "Maputo", lat: -25.97, lng: 32.57, type: "international" as const, flag: "🇲🇿" },
  { name: "Kinshasa", lat: -4.32, lng: 15.31, type: "international" as const, flag: "🇨🇩" },
  { name: "Juba", lat: 4.86, lng: 31.57, type: "international" as const, flag: "🇸🇸" },
  { name: "Addis Ababa", lat: 9.03, lng: 38.74, type: "international" as const, flag: "🇪🇹" },
]

const DAR_HUB = { lat: -6.79, lng: 39.28 }

export function Coverage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    let mounted = true

    async function initMap() {
      if (typeof window === "undefined" || !mapRef.current) return
      if (!L) {
        L = (await import("leaflet")).default
        if (!document.getElementById("leaflet-coverage-css")) {
          const link = document.createElement("link")
          link.id = "leaflet-coverage-css"
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }
      }
      if (!mounted || !mapRef.current) return

      const map = L.map(mapRef.current, {
        center: [DAR_HUB.lat, DAR_HUB.lng],
        zoom: 5,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
        dragging: true,
        doubleClickZoom: true,
      })

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: "topright" }).addTo(map)

      // Draw animated polylines from Dar hub to all other locations
      coverageLocations.forEach((loc, idx) => {
        if (loc.type === "hub") return

        const isDomestic = loc.type === "domestic"
        const color = isDomestic ? "#f59e0b" : "#10b981"
        const opacity = isDomestic ? 0.5 : 0.35

        // Curved line using intermediate points
        const lat1 = DAR_HUB.lat
        const lng1 = DAR_HUB.lng
        const lat2 = loc.lat
        const lng2 = loc.lng

        const midLat = (lat1 + lat2) / 2 + (lat2 - lat1) * 0.15
        const midLng = (lng1 + lng2) / 2 + (lng2 - lng1) * 0.15

        const polyline = L.polyline(
          [
            [lat1, lng1],
            [midLat, midLng],
            [lat2, lng2],
          ],
          {
            color,
            weight: 1.5,
            opacity,
            dashArray: "6 8",
            className: "coverage-route",
          }
        ).addTo(map)

        // Animate dash offset
        let offset = 0
        const animate = () => {
          offset -= 0.5
          const el = (polyline as any)._path
          if (el) {
            el.style.strokeDashoffset = String(offset)
          }
        }
        setInterval(animate, 50)

        // Marker for the location
        const markerHtml =
          loc.type === "international"
            ? `<div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
                 <div style="width:10px;height:10px;border-radius:50%;background:#10b981;border:2px solid #064e3b;box-shadow:0 0 8px rgba(16,185,129,0.6);"></div>
                 <div style="margin-top:4px;font-size:10px;font-weight:600;color:#10b981;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.8);">${loc.flag} ${loc.name}</div>
               </div>`
            : `<div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
                 <div style="width:8px;height:8px;border-radius:50%;background:#f59e0b;border:2px solid #78350f;box-shadow:0 0 6px rgba(245,158,11,0.5);"></div>
                 <div style="margin-top:3px;font-size:10px;font-weight:500;color:#fbbf24;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.8);">${loc.name}</div>
               </div>`

        L.marker([loc.lat, loc.lng], {
          icon: L.divIcon({
            className: "coverage-marker",
            html: markerHtml,
            iconSize: [60, 30],
            iconAnchor: [30, 15],
          }),
        }).addTo(map)
      })

      // Pulsing hub marker for Dar es Salaam
      const hubHtml = `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(245,158,11,0.2);animation:coverage-pulse 2s ease-out infinite;"></div>
        <div style="position:relative;width:14px;height:14px;border-radius:50%;background:#f59e0b;border:3px solid #fff;box-shadow:0 0 16px rgba(245,158,11,0.8);"></div>
        <div style="margin-top:4px;font-size:11px;font-weight:700;color:#f59e0b;white-space:nowrap;text-shadow:0 1px 6px rgba(0,0,0,0.9);">Dar es Salaam</div>
      </div>`

      L.marker([DAR_HUB.lat, DAR_HUB.lng], {
        icon: L.divIcon({
          className: "coverage-hub-marker",
          html: hubHtml,
          iconSize: [80, 40],
          iconAnchor: [40, 20],
        }),
      }).addTo(map)

      setMapReady(true)
    }

    initMap()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section id="coverage" className="relative overflow-hidden bg-slate-950 py-20 lg:py-28">
      <div className="pointer-events-none absolute left-1/4 top-1/3 size-[400px] rounded-full bg-amber-500/8 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/3 size-[350px] rounded-full bg-emerald-500/6 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-amber-400">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Coverage Area
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
              Connecting Tanzania to the world
            </h2>
            <p className="mt-4 text-base text-white/50 text-pretty">
              From Dar es Salaam to Nairobi, Kigali to Addis Ababa — our logistics network spans
              the nation and reaches across East & Central Africa.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-2xl">
            {/* Map container */}
            <div ref={mapRef} className="h-[500px] w-full sm:h-[560px] lg:h-[620px]" />

            {/* Loading overlay */}
            {!mapReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
                  <span className="text-sm text-white/40">Loading map...</span>
                </div>
              </div>
            )}

            {/* Top-left legend overlay */}
            <div className="pointer-events-none absolute left-4 top-4 z-[400] flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-950/80 p-3 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                <span className="text-xs font-medium text-white/80">Tanzania Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-amber-500/60" />
                <span className="text-xs text-white/60">Domestic Cities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500/60" />
                <span className="text-xs text-white/60">International Routes</span>
              </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/60 to-transparent" />
          </div>
        </RevealOnScroll>

        {/* City chips */}
        <RevealOnScroll delay={200}>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-400/80">Domestic Cities</div>
              <div className="flex flex-wrap gap-2">
                {coverageLocations.filter((l) => l.type === "domestic" || l.type === "hub").map((city) => (
                  <span
                    key={city.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/15 bg-amber-500/5 px-3 py-1.5 text-xs font-medium text-amber-200/80 transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-100"
                  >
                    <span className={`size-1.5 rounded-full ${city.type === "hub" ? "bg-amber-500" : "bg-amber-500/50"}`} />
                    {city.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400/80">International</div>
              <div className="flex flex-wrap gap-2">
                {coverageLocations.filter((l) => l.type === "international").map((country) => (
                  <span
                    key={country.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-200/80 transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-100"
                  >
                    <span>{country.flag}</span>
                    {country.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>

      <style>{`
        @keyframes coverage-pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .coverage-route {
          animation: coverage-dash 1.5s linear infinite;
        }
        @keyframes coverage-dash {
          to { stroke-dashoffset: -14; }
        }
        .leaflet-container {
          background: #0f172a;
        }
        .coverage-marker > div > div:first-child {
          transition: transform 0.2s;
        }
        .coverage-marker:hover > div > div:first-child {
          transform: scale(1.4);
        }
      `}</style>
    </section>
  )
}

/* ───────────────────────────── How It Works ───────────────────────────── */
const steps = [
  { number: "01", title: "Book a Shipment", desc: "Create an account, select your service type, and enter pickup & delivery details in seconds." },
  { number: "02", title: "Get a Quote", desc: "Instant pricing based on weight, distance, and service level. Pay online via Selcom or Azampesa." },
  { number: "03", title: "Driver Assigned", desc: "A nearby driver is automatically assigned. Receive driver details and OTP for pickup verification." },
  { number: "04", title: "Track in Real-time", desc: "Follow your shipment live on the map with status updates from pickup to delivery." },
  { number: "05", title: "Delivered with Proof", desc: "OTP-verified delivery with photo proof. Rate your experience and access full delivery history." },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-16 max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              How It Works
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              From booking to delivery in 5 steps
            </h2>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 lg:grid-cols-5">
          {steps.map((step, idx) => (
            <RevealOnScroll key={step.number} delay={idx * 100}>
              <div className="group flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold text-primary transition-transform duration-300 group-hover:scale-110">
                    {step.number}
                  </span>
                  {idx < steps.length - 1 && (
                    <span className="hidden h-px flex-1 bg-border lg:block" />
                  )}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────── Why Choose Us ───────────────────────────── */
const reasons = [
  { title: "Real-time Visibility", desc: "Track every shipment live on an interactive map with status history and estimated arrival times." },
  { title: "Secure & Verified", desc: "OTP-based pickup and delivery verification ensures your packages reach the right hands every time." },
  { title: "Flexible Payment Options", desc: "Pay with Selcom, Azampesa, or mobile money. Sender-pays or receiver-pays options available." },
  { title: "Multi-carrier Fleet", desc: "Vans, trucks, and bikes — automatically matched to your shipment size and urgency for optimal delivery." },
  { title: "Scalable for Business", desc: "From single parcels to bulk freight, our platform scales with your business needs and volume." },
  { title: "24/7 Customer Support", desc: "Dedicated support team available round the clock via phone, email, and in-app chat for all your needs." },
]

export function WhyChooseUs() {
  return (
    <section id="why-us" className="bg-slate-950 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-16 max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Why Choose Us
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
              The Xerin advantage
            </h2>
          </div>
        </RevealOnScroll>

        <div className="grid gap-px overflow-hidden rounded-xl border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, idx) => (
            <RevealOnScroll key={reason.title} delay={idx * 70}>
              <div className="flex h-full flex-col gap-3 bg-slate-950 p-8 transition-colors duration-300 hover:bg-white/[0.03]">
                <h3 className="text-lg font-semibold text-white">{reason.title}</h3>
                <p className="text-sm text-white/50">{reason.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────────── Stats ───────────────────────────── */
export function StatsSection() {
  return null
}

/* ───────────────────────────── CTA ───────────────────────────── */
export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-3xl"
          style={{ animation: "glow-pulse 6s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/[0.06] blur-3xl"
          style={{ animation: "glow-pulse 6s ease-in-out infinite", animationDelay: "1.5s" }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="flex flex-col items-center gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Get Started Today
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
              Ready to ship smarter?
            </h2>
            <p className="max-w-xl text-lg text-white/60 text-pretty">
              Join thousands of businesses and individuals who trust Xerin Express for their delivery
              needs. Create your free account in minutes.
            </p>
            <div className="flex flex-row flex-nowrap items-center justify-center gap-4">
              <a
                href="/auth/sign-up"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/30 sm:px-8"
              >
                Create Free Account
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
              </a>
              <a
                href="/track"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/10 sm:px-8"
              >
                Track a Shipment
              </a>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}

/* ───────────────────────────── Footer ───────────────────────────── */
const footerSections = [
  {
    title: "Services",
    links: [
      { label: "Ship a Package", href: "/ship" },
      { label: "Domestic Delivery", href: "#services" },
      { label: "International Shipping", href: "#services" },
      { label: "Freight Forwarding", href: "#services" },
      { label: "Parcel Express", href: "#services" },
      { label: "E-commerce Fulfillment", href: "#services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#who-we-are" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Coverage Area", href: "#coverage" },
      { label: "Why Choose Us", href: "#why-us" },
      { label: "Track Shipment", href: "/track" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/auth" },
      { label: "Sign Up", href: "/auth/sign-up" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Notifications", href: "/dashboard/notifications" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-slate-950">
      {/* Giant watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden leading-none"
      >
        <span className="block translate-y-[18%] text-center text-[22vw] font-bold tracking-tighter text-white/[0.03] sm:text-[18vw] lg:text-[16vw]">
          XERIN
        </span>
      </div>

      {/* CTA strip */}
      <RevealOnScroll>
        <div className="relative border-b border-white/8">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6 lg:flex-row lg:justify-between lg:text-left lg:px-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-semibold tracking-tight text-white text-balance sm:text-3xl">
                Have a question? We&apos;re here to help.
              </h3>
              <p className="text-sm text-white/50">
                Reach out to our team for custom logistics solutions and enterprise pricing.
              </p>
            </div>
            <a
              href="mailto:info@xerinexpress.co.tz"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-primary/20 hover:border-primary/60"
            >
              Contact Us
              <HugeiconsIcon icon={ArrowUpRightIcon} strokeWidth={2} className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </RevealOnScroll>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_3fr]">
          {/* Brand */}
          <RevealOnScroll>
            <div className="flex flex-col gap-5">
              <a href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                <img src="/assets/social-media.png" alt="Xerin" className="size-8 rounded-lg object-cover" />
                <span className="text-lg font-semibold tracking-tight text-white">Xerin Express</span>
              </a>
              <p className="max-w-xs text-sm text-white/50 text-pretty">
                Multipurpose logistics &amp; delivery management platform for domestic, international,
                and freight operations across Tanzania and East Africa.
              </p>
              <div className="flex flex-col gap-2.5 text-sm text-white/50">
                <span className="flex items-center gap-2">
                  <HugeiconsIcon icon={Location02Icon} strokeWidth={2} className="size-4 shrink-0 text-primary" />
                  Dar es Salaam, Tanzania
                </span>
                <a href="mailto:info@xerinexpress.co.tz" className="flex items-center gap-2 transition-colors hover:text-white">
                  <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-4 shrink-0 text-primary" />
                  info@xerinexpress.co.tz
                </a>
                <a href="tel:+255700000000" className="flex items-center gap-2 transition-colors hover:text-white">
                  <HugeiconsIcon icon={CallIcon} strokeWidth={2} className="size-4 shrink-0 text-primary" />
                  +255 700 000 000
                </a>
              </div>
            </div>
          </RevealOnScroll>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerSections.map((section, idx) => (
              <RevealOnScroll key={section.title} delay={idx * 80}>
                <div className="flex flex-col gap-3">
                  <h4 className="group relative text-sm font-semibold text-white">
                    {section.title}
                    <span className="absolute -bottom-1 left-0 h-px w-6 bg-primary/60 transition-all duration-300 group-hover:w-full" />
                  </h4>
                  <ul className="flex flex-col gap-2.5">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="group flex items-center gap-0.5 text-sm text-white/50 transition-colors duration-200 hover:text-white"
                        >
                          <span className="relative">
                            {link.label}
                            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>

        <div className="relative mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Xerin Express. All rights reserved.
          </p>
          <p className="text-sm text-white/40">
            Dar es Salaam, Tanzania
          </p>
        </div>
      </div>
    </footer>
  )
}
