import Link from "next/link"
import { LandingHeader, LandingFooter } from "@/components/landing-sections"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingHeader />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <HugeiconsIcon icon={Search01Icon} className="size-8 text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">404</h1>
            <p className="text-lg text-muted-foreground">Page not found</p>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
            Try tracking a shipment or go back to the homepage.
          </p>
          <div className="flex flex-row gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              Go Home
            </Link>
            <Link
              href="/track"
              className="inline-flex h-11 items-center rounded-lg border border-border px-6 text-sm font-medium transition-all hover:bg-muted/30"
            >
              Track a Shipment
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
