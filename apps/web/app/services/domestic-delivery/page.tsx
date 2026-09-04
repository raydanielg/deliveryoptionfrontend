"use client"

import Link from "next/link"
import { LandingHeader, LandingFooter } from "@/components/landing-sections"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  TruckIcon,
  Package02Icon,
  Clock01Icon,
  Shield01Icon,
  MapIcon,
  FlashIcon,
  Route02Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  Wallet01Icon,
  CallIcon,
  Location02Icon,
  Home02Icon,
  Building03Icon,
  Store01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@workspace/ui/components/badge"

const features = [
  { icon: FlashIcon, title: "Same-Day & Next-Day", desc: "Urgent deliveries within Dar es Salaam and major cities delivered the same day or next morning." },
  { icon: Route02Icon, title: "Nationwide Coverage", desc: "From Dar es Salaam to Mwanza, Arusha, Mbeya, and every region in between — we reach all of Tanzania." },
  { icon: Shield01Icon, title: "Safe & Insured", desc: "Every domestic shipment is handled with care. Optional insurance for high-value items." },
  { icon: Wallet01Icon, title: "Affordable Pricing", desc: "Transparent, competitive rates with no hidden fees. Pay via mobile money, card, or cash on delivery." },
]

const steps = [
  { icon: Package02Icon, title: "Book Your Shipment", desc: "Enter pickup and delivery details online or via our app. Get an instant quote." },
  { icon: TruckIcon, title: "We Pick Up", desc: "Our driver collects your package from your doorstep or chosen pickup point." },
  { icon: Route02Icon, title: "In Transit", desc: "Track your package in real-time as it moves across the country to its destination." },
  { icon: CheckmarkCircle02Icon, title: "Delivered", desc: "Recipient confirms with OTP. Proof of delivery provided instantly." },
]

const fulfillmentOptions = [
  { icon: Home02Icon, title: "Door to Door", desc: "Pickup from home, delivered to the recipient's door." },
  { icon: Store01Icon, title: "Door to Pickup Point", desc: "Delivered to a nearby pickup station for collection." },
  { icon: Building03Icon, title: "Pickup to Door", desc: "Drop at our station, we deliver to the recipient's door." },
  { icon: Store01Icon, title: "Pickup to Pickup", desc: "Station-to-station for maximum savings." },
]

export default function DomesticDeliveryPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">Domestic Delivery</Badge>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Fast, Reliable Delivery Across <span className="text-blue-400">All of Tanzania</span>
              </h1>
              <p className="mt-6 text-lg text-slate-400">
                From Dar es Salaam to Mwanza, Arusha to Mbeya — send packages anywhere in the country with
                same-day, next-day, and standard delivery options. Real-time tracking, OTP-verified delivery,
                and affordable pricing.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/ship"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Ship a Package Now
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
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 blur-3xl" />
              <div className="relative rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <HugeiconsIcon icon={TruckIcon} strokeWidth={2} className="size-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Domestic Delivery</h3>
                    <p className="text-sm text-slate-400">Within Tanzania</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Same-Day Delivery", value: "Available in major cities" },
                    { label: "Coverage", value: "All 31 regions of Tanzania" },
                    { label: "Tracking", value: "Real-time GPS + OTP" },
                    { label: "Insurance", value: "Optional coverage" },
                    { label: "Payment", value: "M-Pesa, Card, Bank, COD" },
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
            <h2 className="text-3xl font-bold tracking-tight text-white">Why Choose Domestic Delivery?</h2>
            <p className="mt-3 text-slate-400">Built for speed, reliability, and affordability across Tanzania</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-blue-500/30 hover:bg-slate-900"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                  <HugeiconsIcon icon={f.icon} strokeWidth={2} className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-white/8 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">How It Works</h2>
            <p className="mt-3 text-slate-400">Ship in four simple steps</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <HugeiconsIcon icon={s.icon} strokeWidth={2} className="size-6" />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">{i + 1}</span>
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

      {/* Fulfillment Options */}
      <section className="border-b border-white/8 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">Flexible Fulfillment Options</h2>
            <p className="mt-3 text-slate-400">Choose how you send and receive</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {fulfillmentOptions.map((opt) => (
              <div
                key={opt.title}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-center transition-all hover:border-blue-500/30"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                  <HugeiconsIcon icon={opt.icon} strokeWidth={2} className="size-6" />
                </div>
                <h3 className="text-base font-semibold text-white">{opt.title}</h3>
                <p className="text-sm text-slate-400">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-950 p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white">Ready to Send a Package?</h2>
              <p className="mt-3 text-slate-400">Get an instant quote and ship anywhere in Tanzania today.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/ship"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-4" />
                  Ship a Package
                </Link>
                <a
                  href="tel:+255792810292"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/15 px-6 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
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
