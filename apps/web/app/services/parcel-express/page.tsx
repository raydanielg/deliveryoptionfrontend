"use client"

import Link from "next/link"
import { LandingHeader, LandingFooter } from "@/components/landing-sections"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Rocket01Icon,
  Package02Icon,
  FlashIcon,
  Shield01Icon,
  MapIcon,
  Clock01Icon,
  Route02Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  Wallet01Icon,
  CallIcon,
  Location02Icon,
  SmartphoneIcon,
  CreditCard01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@workspace/ui/components/badge"

const features = [
  { icon: FlashIcon, title: "Lightning Fast", desc: "Same-day delivery in Dar es Salaam and next-day to major cities across Tanzania." },
  { icon: Rocket01Icon, title: "Express Priority", desc: "Your parcel gets top priority handling, jumping ahead of standard shipments." },
  { icon: Shield01Icon, title: "Secure & Tracked", desc: "Real-time GPS tracking, OTP verification, and proof of delivery on every parcel." },
  { icon: Wallet01Icon, title: "Transparent Pricing", desc: "Know your price upfront. No surge fees, no hidden charges. Pay your way." },
]

const steps = [
  { icon: Package02Icon, title: "Book in Seconds", desc: "Enter pickup and delivery details. Get an instant express quote." },
  { icon: FlashIcon, title: "Priority Pickup", desc: "Our nearest driver is dispatched immediately to collect your parcel." },
  { icon: Rocket01Icon, title: "Express Delivery", desc: "Your parcel is delivered fast — same day within the city, next day nationwide." },
  { icon: CheckmarkCircle02Icon, title: "Delivered & Confirmed", desc: "Recipient confirms with OTP. You get instant proof of delivery." },
]

const serviceLevels = [
  { icon: Rocket01Icon, title: "Same Day", desc: "Within hours in Dar es Salaam", badge: "Fastest", color: "from-red-500 to-orange-500" },
  { icon: FlashIcon, title: "Next Day", desc: "Overnight delivery nationwide", badge: "Fast", color: "from-orange-500 to-yellow-500" },
  { icon: Clock01Icon, title: "Express", desc: "1-2 day priority delivery", badge: "Popular", color: "from-yellow-500 to-amber-500" },
]

const paymentMethods = [
  { icon: SmartphoneIcon, title: "Mobile Money", desc: "M-Pesa, Tigo Pesa, Airtel Money" },
  { icon: CreditCard01Icon, title: "Card Payment", desc: "Visa, Mastercard" },
  { icon: Wallet01Icon, title: "Cash on Delivery", desc: "Pay when you receive" },
]

export default function ParcelExpressPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge className="mb-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Parcel Express</Badge>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                When You Need It <span className="text-yellow-400">There Fast</span>
              </h1>
              <p className="mt-6 text-lg text-slate-400">
                Same-day, next-day, and express delivery for urgent parcels. Priority handling,
                real-time tracking, and OTP-verified delivery. When speed matters, Parcel Express
                gets your package where it needs to be — fast.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/ship"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-yellow-600 px-6 text-sm font-medium text-white transition-colors hover:bg-yellow-500"
                >
                  Send an Express Parcel
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
                </Link>
                <Link
                  href="/track"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/15 px-6 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-4" />
                  Track a Parcel
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 blur-3xl" />
              <div className="relative rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                    <HugeiconsIcon icon={Rocket01Icon} strokeWidth={2} className="size-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Parcel Express</h3>
                    <p className="text-sm text-slate-400">Fastest delivery</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Same-Day", value: "Within hours (Dar es Salaam)" },
                    { label: "Next-Day", value: "Overnight nationwide" },
                    { label: "Tracking", value: "Real-time GPS + OTP" },
                    { label: "Priority", value: "Top-priority handling" },
                    { label: "Payment", value: "M-Pesa, Card, COD" },
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
            <h2 className="text-3xl font-bold tracking-tight text-white">Why Parcel Express?</h2>
            <p className="mt-3 text-slate-400">Speed, reliability, and transparency</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-yellow-500/30 hover:bg-slate-900">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 transition-colors group-hover:bg-yellow-500 group-hover:text-white">
                  <HugeiconsIcon icon={f.icon} strokeWidth={2} className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Levels */}
      <section className="border-b border-white/8 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">Choose Your Speed</h2>
            <p className="mt-3 text-slate-400">Pick the delivery speed that fits your urgency</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {serviceLevels.map((s) => (
              <div key={s.title} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-8 transition-all hover:border-yellow-500/30">
                <div className="absolute right-4 top-4">
                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">{s.badge}</Badge>
                </div>
                <div className={`mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white`}>
                  <HugeiconsIcon icon={s.icon} strokeWidth={2} className="size-7" />
                </div>
                <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-white/8 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">How Express Delivery Works</h2>
            <p className="mt-3 text-slate-400">From booking to delivery in record time</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                    <HugeiconsIcon icon={s.icon} strokeWidth={2} className="size-6" />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-yellow-500/10 text-xs font-bold text-yellow-400">{i + 1}</span>
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

      {/* Payment Methods */}
      <section className="border-b border-white/8 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">Flexible Payment Options</h2>
            <p className="mt-3 text-slate-400">Pay the way that works for you</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {paymentMethods.map((p) => (
              <div key={p.title} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-yellow-500/30">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 transition-colors group-hover:bg-yellow-500 group-hover:text-white">
                  <HugeiconsIcon icon={p.icon} strokeWidth={2} className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{p.title}</h3>
                  <p className="text-sm text-slate-400">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-yellow-600/20 via-slate-900 to-slate-950 p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.15),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white">Need It There Fast?</h2>
              <p className="mt-3 text-slate-400">Book an express delivery now and get your parcel moving in minutes.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/ship" className="inline-flex h-12 items-center gap-2 rounded-lg bg-yellow-600 px-6 text-sm font-medium text-white transition-colors hover:bg-yellow-500">
                  <HugeiconsIcon icon={Rocket01Icon} strokeWidth={2} className="size-4" />
                  Send Express Now
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
