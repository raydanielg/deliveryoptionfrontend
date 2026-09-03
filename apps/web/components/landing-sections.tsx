"use client"

import { useState, useEffect } from "react"
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
import { NetworkBackground } from "@/components/network-background"

/* ───────────────────────────── Header ───────────────────────────── */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <img src="/assets/social-media.png" alt="Xerin" className="size-8 rounded-lg object-cover" />
          <span className="text-base font-semibold tracking-tight">Xerin Express</span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {[
            { label: "Ship a Package", href: "/ship" },
            { label: "Services", href: "#services" },
            { label: "Coverage", href: "#coverage" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Why Us", href: "#why-us" },
            { label: "Track", href: "/track" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/auth"
            className="hidden text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground sm:block"
          >
            Sign In
          </a>
          <a
            href="/auth/sign-up"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
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
        <NetworkBackground />
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

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-[fade-in_0.8s_ease-out_0.4s_both]">
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

/* ───────────────────────────── Trust Strip ───────────────────────────── */
const trustItems = [
  "Real-time Tracking",
  "OTP Verification",
  "Proof of Delivery",
  "Multi-carrier Fleet",
  "Online Payments",
]

export function TrustStrip() {
  return (
    <section className="border-b border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="flex flex-col items-center gap-6 py-8 lg:flex-row lg:justify-between">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {trustItems.map((cap) => (
                <span
                  key={cap}
                  className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {cap}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              Dar es Salaam, Tanzania
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}

/* ───────────────────────────── Who We Are ───────────────────────────── */
export function WhoWeAre() {
  return (
    <section id="who-we-are" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Who We Are
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              Built for <span className="text-primary">modern logistics</span>
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Xerin Express is a technology-driven delivery platform combining intelligent routing,
              real-time tracking, and seamless payments. We serve businesses and individuals across
              Tanzania and beyond with reliable, transparent, and affordable delivery services.
            </p>
            <a
              href="/auth/sign-up"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-6 text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:bg-muted/30"
            >
              Create an Account
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
            </a>
          </div>
        </RevealOnScroll>
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
    <section id="services" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-16 max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Our Services
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              Everything you need to ship and deliver
            </h2>
          </div>
        </RevealOnScroll>

        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => (
            <RevealOnScroll key={service.number} delay={idx * 60} className="h-full">
              <div className="group flex h-full flex-col gap-4 bg-background p-8 transition-all duration-300 hover:bg-muted/30 hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                    <HugeiconsIcon icon={service.icon} strokeWidth={2} className="size-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground/50">
                    {service.number}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.desc}</p>
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
const domesticCities = [
  { name: "Dar es Salaam", tag: "Hub", x: 52, y: 78 },
  { name: "Dodoma", tag: "Capital", x: 48, y: 58 },
  { name: "Arusha", tag: "Gateway", x: 55, y: 32 },
  { name: "Mwanza", tag: "Lake", x: 38, y: 28 },
  { name: "Zanzibar", tag: "Island", x: 60, y: 82 },
  { name: "Mbeya", tag: "Highland", x: 42, y: 88 },
  { name: "Tanga", tag: "Coast", x: 58, y: 48 },
  { name: "Morogoro", tag: "Crossroad", x: 50, y: 65 },
]

const internationalCountries = [
  { name: "Kenya", flag: "🇰🇪", x: 68, y: 30 },
  { name: "Uganda", flag: "🇺🇬", x: 55, y: 18 },
  { name: "Rwanda", flag: "🇷🇼", x: 48, y: 42 },
  { name: "Burundi", flag: "🇧🇮", x: 45, y: 52 },
  { name: "Zambia", flag: "🇿🇲", x: 35, y: 72 },
  { name: "Malawi", flag: "🇲🇼", x: 52, y: 72 },
  { name: "Mozambique", flag: "🇲🇿", x: 58, y: 88 },
  { name: "DRC", flag: "🇨🇩", x: 25, y: 48 },
  { name: "South Sudan", flag: "🇸🇸", x: 50, y: 8 },
  { name: "Ethiopia", flag: "🇪🇹", x: 62, y: 12 },
]

const coverageStats = [
  { value: "8", label: "Domestic Cities", sub: "Across Tanzania" },
  { value: "10", label: "Countries", sub: "East & Central Africa" },
  { value: "24/7", label: "Operations", sub: "Day & Night Dispatch" },
  { value: "50+", label: "Routes", sub: "Active delivery lanes" },
]

export function Coverage() {
  return (
    <section id="coverage" className="relative overflow-hidden bg-slate-950 py-20 lg:py-28">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 size-[400px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/3 size-[350px] rounded-full bg-emerald-500/8 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <RevealOnScroll>
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Coverage Area
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
              Connecting Tanzania to the world
            </h2>
            <p className="mt-4 text-base text-white/50 text-pretty">
              From Dar es Salaam to Nairobi, Kigali to Addis Ababa — our logistics network spans
              the nation and reaches across East Africa.
            </p>
          </div>
        </RevealOnScroll>

        {/* Stats bar */}
        <RevealOnScroll delay={100}>
          <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {coverageStats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-xl border border-white/8 bg-white/[0.03] p-5 text-center transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.06]"
              >
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm font-medium text-primary">{stat.label}</div>
                <div className="mt-0.5 text-xs text-white/40">{stat.sub}</div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </RevealOnScroll>

        {/* Map visualization */}
        <RevealOnScroll delay={200}>
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-slate-900/80 via-slate-950/60 to-slate-900/80 p-6 sm:p-8 lg:p-10">
            {/* Grid background */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />

            {/* Tanzania map area with domestic cities */}
            <div className="relative z-10 grid gap-8 lg:grid-cols-2">
              {/* Left: Domestic map */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Tanzania Network</h3>
                </div>

                {/* Map container */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/5 bg-slate-950/40">
                  {/* SVG routes */}
                  <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Dar es Salaam as hub — routes to all cities */}
                    {domesticCities
                      .filter((c) => c.name !== "Dar es Salaam")
                      .map((city) => (
                        <line
                          key={city.name}
                          x1={52}
                          y1={78}
                          x2={city.x}
                          y2={city.y}
                          stroke="rgba(99,102,241,0.2)"
                          strokeWidth="0.3"
                          strokeDasharray="1.5 1"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="3"
                            to="0"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </line>
                      ))}
                  </svg>

                  {/* City pins */}
                  {domesticCities.map((city) => (
                    <div
                      key={city.name}
                      className="group absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${city.x}%`, top: `${city.y}%` }}
                    >
                      {/* Pulse for hub */}
                      {city.tag === "Hub" && (
                        <div className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 size-4 rounded-full bg-primary/30">
                          <div className="size-full animate-ping rounded-full bg-primary/40" />
                        </div>
                      )}
                      <div
                        className={`relative size-2.5 rounded-full border-2 transition-all duration-300 group-hover:scale-150 ${
                          city.tag === "Hub"
                            ? "border-primary bg-primary shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                            : "border-white/40 bg-white/20 group-hover:border-primary group-hover:bg-primary/60"
                        }`}
                      />
                      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-center transition-all duration-300">
                        <div className="text-[10px] font-medium text-white/70 group-hover:text-white">{city.name}</div>
                        <div className="text-[8px] uppercase tracking-wide text-primary/60 group-hover:text-primary">{city.tag}</div>
                      </div>
                    </div>
                  ))}

                  {/* Label */}
                  <div className="absolute bottom-3 left-3 rounded-md bg-slate-950/60 px-2 py-1 text-[10px] font-medium text-white/40 backdrop-blur-sm">
                    Domestic Routes
                  </div>
                </div>
              </div>

              {/* Right: International map */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-500">East Africa Network</h3>
                </div>

                {/* Map container */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/5 bg-slate-950/40">
                  {/* SVG routes from Tanzania center */}
                  <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Tanzania center point ~ 52, 78 */}
                    {internationalCountries.map((country) => (
                      <line
                        key={country.name}
                        x1={52}
                        y1={78}
                        x2={country.x}
                        y2={country.y}
                        stroke="rgba(16,185,129,0.15)"
                        strokeWidth="0.3"
                        strokeDasharray="1.5 1"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="3"
                          to="0"
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                      </line>
                    ))}
                  </svg>

                  {/* Country pins */}
                  {internationalCountries.map((country) => (
                    <div
                      key={country.name}
                      className="group absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${country.x}%`, top: `${country.y}%` }}
                    >
                      <div className="relative size-2.5 rounded-full border-2 border-emerald-500/50 bg-emerald-500/20 transition-all duration-300 group-hover:scale-150 group-hover:border-emerald-500 group-hover:bg-emerald-500/60" />
                      <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-center transition-all duration-300">
                        <div className="text-[10px] font-medium text-white/70 group-hover:text-white">
                          {country.flag} {country.name}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Tanzania hub label */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: "52%", top: "78%" }}
                  >
                    <div className="size-3 rounded-full border-2 border-primary bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-primary">
                      Tanzania
                    </div>
                  </div>

                  {/* Label */}
                  <div className="absolute bottom-3 left-3 rounded-md bg-slate-950/60 px-2 py-1 text-[10px] font-medium text-white/40 backdrop-blur-sm">
                    International Routes
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: City chips */}
            <div className="relative z-10 mt-8 space-y-4">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Domestic Cities</div>
                <div className="flex flex-wrap gap-2">
                  {domesticCities.map((city) => (
                    <span
                      key={city.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70 transition-all duration-300 hover:border-primary/30 hover:bg-primary/10 hover:text-white"
                    >
                      <span className="size-1.5 rounded-full bg-primary" />
                      {city.name}
                      <span className="text-[10px] text-primary/50">{city.tag}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">International</div>
                <div className="flex flex-wrap gap-2">
                  {internationalCountries.map((country) => (
                    <span
                      key={country.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70 transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-white"
                    >
                      <span>{country.flag}</span>
                      {country.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
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
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Get Started Today
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
              Ready to ship smarter?
            </h2>
            <p className="max-w-xl text-lg text-white/60 text-pretty">
              Join thousands of businesses and individuals who trust Xerin Express for their delivery
              needs. Create your free account in minutes.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <a
                href="/auth/sign-up"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                Create Free Account
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
              </a>
              <a
                href="/track"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/20 px-8 text-sm font-medium text-white transition-all duration-300 hover:bg-white/5"
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
