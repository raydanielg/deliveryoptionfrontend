"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  TruckIcon,
  Package02Icon,
  Globe02Icon,
  MapIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Route02Icon,
  CustomerService01Icon,
  ShieldKeyIcon,
  ClockIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

export default function LandingPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const router = useRouter()

  function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    if (trackingNumber.trim()) {
      router.push(`/track?number=${encodeURIComponent(trackingNumber.trim())}`)
    }
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <img src="/assets/social-media.png" alt="Xerin" className="size-9 rounded-lg object-cover" />
            <span className="text-lg font-bold tracking-tight">Xerin Express</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="/track" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Track Shipment</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/auth" className="text-sm font-medium hover:text-primary transition-colors">Sign In</a>
            <a href="/auth/sign-up" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Get Started</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/assets/41714.jpg" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Trusted by 2,800+ businesses across East Africa
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Deliver smarter,
              <br />
              <span className="text-primary">ship faster.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Domestic and international logistics, real-time tracking, and seamless delivery management — all in one platform built for Africa.
            </p>

            {/* Track Input */}
            <form onSubmit={handleTrack} className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl border bg-card p-2 shadow-lg">
              <div className="relative flex-1">
                <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g. XRD-2026-000928)"
                  className="h-11 w-full rounded-lg border-0 bg-transparent pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Track
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">No account needed — tracking is public and instant</p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 lg:grid-cols-4 lg:px-8">
          {[
            { label: "Shipments delivered", value: "2.8M+" },
            { label: "Cities covered", value: "120+" },
            { label: "Active drivers", value: "850+" },
            { label: "On-time delivery", value: "96.8%" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Our Services</h2>
          <p className="mt-2 text-muted-foreground">Comprehensive logistics solutions for every need</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: TruckIcon, title: "Domestic Delivery", desc: "Same-day and next-day delivery across all major cities in Tanzania and East Africa." },
            { icon: Globe02Icon, title: "International Shipping", desc: "Cross-border freight and parcel delivery with customs clearance handled for you." },
            { icon: Package02Icon, title: "Parcel & Freight", desc: "From small parcels to large freight shipments — flexible options for every size." },
          ].map((s) => (
            <div key={s.title} className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <HugeiconsIcon icon={s.icon} className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Why choose Xerin Express?</h2>
            <p className="mt-2 text-muted-foreground">Built for businesses that value speed and reliability</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MapIcon, title: "Real-time Tracking", desc: "Track your shipment live from pickup to delivery with GPS precision." },
              { icon: ShieldKeyIcon, title: "Secure & Insured", desc: "Every shipment is insured and monitored with bank-grade security." },
              { icon: ClockIcon, title: "Fast Delivery", desc: "Average delivery time of 4.2 hours for domestic shipments." },
              { icon: CustomerService01Icon, title: "24/7 Support", desc: "Our support team is available round the clock to assist you." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6">
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <HugeiconsIcon icon={f.icon} className="size-5 text-primary" />
                </div>
                <h3 className="mb-1.5 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-2 text-muted-foreground">Ship in 3 simple steps</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { step: "01", title: "Book your shipment", desc: "Create a shipment online in under 2 minutes. Choose your service level and transport mode." },
            { step: "02", title: "We pick it up", desc: "A driver comes to your location to collect your package and provide a tracking number." },
            { step: "03", title: "Track & receive", desc: "Follow your shipment in real-time until it reaches its destination safely." },
          ].map((s) => (
            <div key={s.step} className="relative">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-4xl font-bold text-primary/20">{s.step}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">Ready to ship?</h2>
          <p className="mt-3 text-muted-foreground">Create an account and start sending packages today.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a href="/auth/sign-up" className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Create Account
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 size-4" />
            </a>
            <a href="/auth" className="inline-flex h-11 items-center rounded-lg border bg-background px-6 text-sm font-medium hover:bg-muted transition-colors">
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <img src="/assets/social-media.png" alt="Xerin" className="size-7 rounded object-cover" />
                <span className="font-bold">Xerin Express</span>
              </div>
              <p className="text-sm text-muted-foreground">Multipurpose logistics & delivery management platform for domestic, international, and freight operations.</p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/track" className="hover:text-foreground">Track Shipment</a></li>
                <li><a href="#services" className="hover:text-foreground">Domestic Delivery</a></li>
                <li><a href="#services" className="hover:text-foreground">International Shipping</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="/auth" className="hover:text-foreground">Sign In</a></li>
                <li><a href="/auth/sign-up" className="hover:text-foreground">Get Started</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@xerinexpress.com</li>
                <li>+255 700 000 000</li>
                <li>Dar es Salaam, Tanzania</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Xerin Delivery Express. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
