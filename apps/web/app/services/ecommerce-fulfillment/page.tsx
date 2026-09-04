"use client"

import Link from "next/link"
import { LandingHeader, LandingFooter } from "@/components/landing-sections"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Store02Icon,
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
  BoxIcon,
  Globe02Icon,
  Building03Icon,
  FlashIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@workspace/ui/components/badge"

const features = [
  { icon: Store02Icon, title: "Order Fulfillment", desc: "We pick, pack, and ship your online orders automatically as they come in." },
  { icon: BoxIcon, title: "Inventory Storage", desc: "Store your products in our warehouse. Real-time stock levels and alerts." },
  { icon: Route02Icon, title: "Last-Mile Delivery", desc: "Fast, tracked delivery to your customers across Tanzania and East Africa." },
  { icon: Shield01Icon, title: "Returns Management", desc: "Handle returns and exchanges smoothly with our integrated reverse logistics." },
]

const steps = [
  { icon: BoxIcon, title: "Send Us Inventory", desc: "Ship your products to our warehouse. We catalog and store them securely." },
  { icon: Store02Icon, title: "Orders Come In", desc: "Customer places an order on your store. Our system receives it instantly." },
  { icon: Package02Icon, title: "Pick, Pack & Ship", desc: "We pick the items, pack them securely, and dispatch for delivery." },
  { icon: CheckmarkCircle02Icon, title: "Customer Receives", desc: "Your customer gets their order fast with tracking and proof of delivery." },
]

const integrations = [
  { icon: Globe02Icon, title: "Online Stores", desc: "Shopify, WooCommerce, custom websites" },
  { icon: Building03Icon, title: "Marketplaces", desc: "Jumia, Kilimall, social media shops" },
  { icon: FlashIcon, title: "API Integration", desc: "Automated order sync via our REST API" },
  { icon: Wallet01Icon, title: "Payment Sync", desc: "Automatic payment confirmation & invoicing" },
]

export default function EcommerceFulfillmentPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">E-commerce Fulfillment</Badge>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Fulfill Your Online Orders <span className="text-emerald-400">Effortlessly</span>
              </h1>
              <p className="mt-6 text-lg text-slate-400">
                Store your inventory in our warehouse, and we'll handle the rest — pick, pack, and ship
                every order automatically. Integrated with your online store for seamless order fulfillment,
                real-time tracking, and returns management. Focus on growing your business, we handle logistics.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/ship"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-600 px-6 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                >
                  Get Started
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
                </Link>
                <a
                  href="mailto:info@xerinexpress.co.tz"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/15 px-6 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  <HugeiconsIcon icon={CallIcon} strokeWidth={2} className="size-4" />
                  Talk to Sales
                </a>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-3xl" />
              <div className="relative rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    <HugeiconsIcon icon={Store02Icon} strokeWidth={2} className="size-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">E-commerce Fulfillment</h3>
                    <p className="text-sm text-slate-400">End-to-end order logistics</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Warehousing", value: "Secure storage" },
                    { label: "Order Sync", value: "Automatic from your store" },
                    { label: "Pick & Pack", value: "Professional handling" },
                    { label: "Delivery", value: "Nationwide + international" },
                    { label: "Returns", value: "Reverse logistics included" },
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
            <h2 className="text-3xl font-bold tracking-tight text-white">Everything You Need to Scale</h2>
            <p className="mt-3 text-slate-400">Complete e-commerce logistics under one roof</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition-all hover:border-emerald-500/30 hover:bg-slate-900">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
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
            <h2 className="text-3xl font-bold tracking-tight text-white">How E-commerce Fulfillment Works</h2>
            <p className="mt-3 text-slate-400">From warehouse to customer's door</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    <HugeiconsIcon icon={s.icon} strokeWidth={2} className="size-6" />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400">{i + 1}</span>
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

      {/* Integrations */}
      <section className="border-b border-white/8 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">Integrates With Your Store</h2>
            <p className="mt-3 text-slate-400">Connect your sales channels seamlessly</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {integrations.map((i) => (
              <div key={i.title} className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-center transition-all hover:border-emerald-500/30">
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                  <HugeiconsIcon icon={i.icon} strokeWidth={2} className="size-6" />
                </div>
                <h3 className="text-base font-semibold text-white">{i.title}</h3>
                <p className="text-sm text-slate-400">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-600/20 via-slate-900 to-slate-950 p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white">Ready to Scale Your E-commerce?</h2>
              <p className="mt-3 text-slate-400">Let us handle fulfillment so you can focus on growing your business.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/ship" className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-600 px-6 text-sm font-medium text-white transition-colors hover:bg-emerald-500">
                  <HugeiconsIcon icon={Store02Icon} strokeWidth={2} className="size-4" />
                  Get Started
                </Link>
                <a href="mailto:info@xerinexpress.co.tz" className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/15 px-6 text-sm font-medium text-white transition-colors hover:bg-white/5">
                  <HugeiconsIcon icon={CallIcon} strokeWidth={2} className="size-4" />
                  Talk to Sales
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
