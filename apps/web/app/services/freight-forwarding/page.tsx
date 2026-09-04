"use client"

import Link from "next/link"
import { LandingHeader, LandingFooter } from "@/components/landing-sections"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PackageProcess01Icon,
  Package02Icon,
  TruckIcon,
  Shield01Icon,
  MapIcon,
  Route02Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  Wallet01Icon,
  CallIcon,
  Location02Icon,
  ShipIcon,
  Train01Icon,
  Building03Icon,
  ScaleIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@workspace/ui/components/badge"

const features = [
  { icon: ScaleIcon, title: "Heavy & Oversized", desc: "Specialized handling for heavy machinery, equipment, and oversized cargo." },
  { icon: Route02Icon, title: "Multi-Modal Transport", desc: "Road, rail, sea, and air combinations for optimal cost and speed." },
  { icon: Shield01Icon, title: "Cargo Protection", desc: "Professional packing, loading, and insurance options for valuable freight." },
  { icon: Wallet01Icon, title: "Competitive Rates", desc: "Volume-based pricing with transparent quotes for bulk and recurring shipments." },
]

const steps = [
  { icon: Package02Icon, title: "Request a Quote", desc: "Tell us about your cargo — weight, dimensions, origin, and destination." },
  { icon: Building03Icon, title: "Plan & Schedule", desc: "We design the optimal route and transport mode, then schedule pickup." },
  { icon: TruckIcon, title: "Load & Transport", desc: "Professional loading and secure transport with tracking at every stage." },
  { icon: CheckmarkCircle02Icon, title: "Delivered", desc: "Cargo arrives at destination. Unloading and proof of delivery provided." },
]

const cargoTypes = [
  { icon: PackageProcess01Icon, title: "Heavy Machinery", desc: "Construction equipment, industrial machinery" },
  { icon: TruckIcon, title: "Vehicles & Parts", desc: "Automobiles, spare parts, automotive cargo" },
  { icon: Building03Icon, title: "Construction Materials", desc: "Steel, cement, tiles, building supplies" },
  { icon: Package02Icon, title: "Bulk Goods", desc: "Large quantity shipments, pallets, containers" },
  { icon: ShipIcon, title: "Sea Freight Cargo", desc: "Full and partial container loads" },
  { icon: Train01Icon, title: "Rail Freight", desc: "Cost-effective overland freight via rail" },
]

export default function FreightForwardingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge className="mb-4 bg-orange-500/10 text-orange-400 border-orange-500/20">Freight Forwarding</Badge>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Specialized Transport for <span className="text-orange-400">Heavy & Oversized Cargo</span>
              </h1>
              <p className="mt-6 text-lg text-slate-400">
                When your shipment is too big, too heavy, or too complex for standard delivery, our freight
                forwarding service steps in. Multi-modal transport, professional handling, and end-to-end
                logistics for industrial, construction, and bulk cargo across Tanzania and East Africa.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/ship"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-orange-600 px-6 text-sm font-medium text-white transition-colors hover:bg-orange-500"
                >
                  Request a Freight Quote
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
                </Link>
                <a
                  href="tel:+255792810292"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/15 px-6 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  <HugeiconsIcon icon={CallIcon} strokeWidth={2} className="size-4" />
                  Speak to Our Team
                </a>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/10 blur-3xl" />
              <div className="relative rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                    <HugeiconsIcon icon={PackageProcess01Icon} strokeWidth={2} className="size-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Freight Forwarding</h3>
                    <p className="text-sm text-slate-400">Special Transport</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Cargo Type", value: "Heavy & oversized" },
                    { label: "Transport Modes", value: "Road, Rail, Sea, Air" },
                    { label: "Coverage", value: "Tanzania & East Africa" },
                    { label: "Handling", value: "Professional loading" },
                    { label: "Insurance", value: "Full coverage available" },
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
            <h2 className="text-3xl font-bold tracking-tight text-white">Built for Complex Shipments</h2>
            <p className="mt-3 text-slate-400">When standard delivery isn't enough</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-orange-500/30 hover:bg-slate-900">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                  <HugeiconsIcon icon={f.icon} strokeWidth={2} className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cargo Types */}
      <section className="border-b border-white/8 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">What Can We Transport?</h2>
            <p className="mt-3 text-slate-400">We handle all types of freight</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cargoTypes.map((c) => (
              <div key={c.title} className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-orange-500/30">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                  <HugeiconsIcon icon={c.icon} strokeWidth={2} className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{c.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-white/8 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">How Freight Forwarding Works</h2>
            <p className="mt-3 text-slate-400">From quote to delivery in four steps</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                    <HugeiconsIcon icon={s.icon} strokeWidth={2} className="size-6" />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">{i + 1}</span>
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
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-orange-600/20 via-slate-900 to-slate-950 p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.15),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white">Have Heavy Cargo to Move?</h2>
              <p className="mt-3 text-slate-400">Get a customized freight quote today. Our team is ready to help.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/ship" className="inline-flex h-12 items-center gap-2 rounded-lg bg-orange-600 px-6 text-sm font-medium text-white transition-colors hover:bg-orange-500">
                  <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-4" />
                  Request a Quote
                </Link>
                <a href="tel:+255792810292" className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/15 px-6 text-sm font-medium text-white transition-colors hover:bg-white/5">
                  <HugeiconsIcon icon={CallIcon} strokeWidth={2} className="size-4" />
                  Call Us
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
