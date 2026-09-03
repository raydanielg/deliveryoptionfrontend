"use client"

import {
  LandingHeader,
  Hero,
  Services,
  Coverage,
  HowItWorks,
  WhyChooseUs,
  CTASection,
  LandingFooter,
} from "@/components/landing-sections"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Services />
        <Coverage />
        <HowItWorks />
        <WhyChooseUs />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
