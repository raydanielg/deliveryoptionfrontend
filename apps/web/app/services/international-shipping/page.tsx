"use client"

import Link from "next/link"
import { LandingHeader, LandingFooter } from "@/components/landing-sections"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Airplane01Icon,
  Package02Icon,
  Globe02Icon,
  Shield01Icon,
  MapIcon,
  FlashIcon,
  Route02Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  Wallet01Icon,
  Call01Icon,
  Location02Icon,
  ShipIcon,
  File02Icon,
  Building03Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@workspace/ui/components/badge"

const features = [
  { icon: Globe02Icon, title: "Global Reach", desc: "Ship to and from East Africa to destinations worldwide via our trusted carrier network." },
  { icon: Airplane01Icon, title: "Air & Sea Freight", desc: "Choose air freight for speed or sea freight for cost-effective bulk shipping." },
  { icon: Shield01Icon, title: "Customs Handling", desc: "We manage customs documentation, declarations, and compliance for smooth cross-border delivery." },
  { icon: File02Icon, title: "Full Documentation", desc: "Commercial invoices, waybills, and export/import paperwork handled by our team." },
]

const steps = [
  { icon: Package02Icon, title: "Prepare & Book", desc: "Provide shipment details, destination country, and contents. We generate all required documents." },
  { icon: File02Icon, title: "Customs Clearance", desc: "Our team handles export/import declarations and ensures compliance with regulations." },
  { icon: Airplane01Icon, title: "International Transit", desc: "Your shipment moves via air or sea with full tracking at every checkpoint." },
  { icon: CheckmarkCircle02Icon, title: "Delivered Abroad", desc: "Last-mile delivery by our international partners. Proof of delivery provided." },
]

const transportModes = [
  { icon: Airplane01Icon, title: "Air Freight", desc: "Fastest international option — 3-7 days to most destinations.", badge: "Fastest" },
  { icon: FlashIcon, title: "Sea Freight", desc: "Cost-effective for heavy and bulk shipments — 15-45 days.", badge: "Best Value" },
  { icon: Route02Icon, title: "Courier Express", desc: "Door-to-door express courier for urgent international packages — 2-5 days.", badge: "Premium" },
]

export default function InternationalShippingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/20">International Shipping</Badge>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Cross-Border Delivery to <span className="text-purple-400">Anywhere in the World</span>
              </h1>
              <p className="mt-6 text-lg text-slate-400">
                Send packages from Tanzania to global destinations with confidence. Air freight, sea freight,
                and express courier options with full customs handling, documentation, and real-time tracking
                from origin to destination.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/ship"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-purple-600 px-6 text-sm font-medium text-white transition-colors hover:bg-purple-500"
                >
                  Ship Internationally
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/15 px-6 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-4" />
                  Track a Shipment
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-3xl" />
              <div className="relative rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} className="size-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">International Shipping</h3>
                    <p className="text-sm text-slate-400">Cross-border delivery</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Destinations", value: "Worldwide" },
                    { label: "Air Freight", value: "3-7 days" },
                    { label: "Sea Freight", value: "15-45 days" },
                    { label: "Customs", value: "Fully handled" },
                    { label: "Tracking", value: "End-to-end" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0">
                      <span className="text-sm text-slate-400">{item.label}</span>
                      <span className="text-sm font-medium text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-white/8 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">Why Choose International Shipping?</h2>
            <p className="mt-3 text-slate-400">Complete cross-border logistics solutions</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-purple-500/30 hover:bg-slate-900">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                  <HugeiconsIcon icon={f.icon} strokeWidth={2} className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transport Modes */}
      <section className="border-b border-white/8 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">Choose Your Transport Mode</h2>
            <p className="mt-3 text-slate-400">Air, sea, or express — pick what fits your needs</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {transportModes.map((mode) => (
              <div key={mode.title} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-8 transition-all hover:border-purple-500/30">
                <div className="absolute right-4 top-4">
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">{mode.badge}</Badge>
                </div>
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <HugeiconsIcon icon={mode.icon} strokeWidth={2} className="size-7" />
                </div>
                <h3 className="text-xl font-semibold text-white">{mode.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-white/8 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">How International Shipping Works</h2>
            <p className="mt-3 text-slate-400">From Tanzania to the world in four steps</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    <HugeiconsIcon icon={s.icon} strokeWidth={2} className="size-6" />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-purple-500/10 text-xs font-bold text-purple-400">{i + 1}</span>
                    <h3 className="text-base font-semibold text-white">{s.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-5 text-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-slate-900 to-slate-950 p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white">Ready to Ship Internationally?</h2>
              <p className="mt-3 text-slate-400">Get a quote and send your package anywhere in the world.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/ship" className="inline-flex h-12 items-center gap-2 rounded-lg bg-purple-600 px-6 text-sm font-medium text-white transition-colors hover:bg-purple-500">
                  <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-4" />
                  Ship a Package
                </Link>
                <a href="tel:+255792810292" className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/15 px-6 text-sm font-medium text-white transition-colors hover:bg-white/5">
                  <HugeiconsIcon icon={Call01Icon} strokeWidth={2} className="size-4" />
                  Contact Us
                </a>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
                <HugeiconsIcon icon={Location02Icon} strokeWidth={2} className="size-4" />
                Dar es Salaam, Tanzania
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
