import { SignUpForm } from "@workspace/ui/components/sign-up-form"
import { Toaster } from "@workspace/ui/components/sonner"
import { AuthBackground } from "@/components/auth-background"

export default function SignUpPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Branding panel */}
      <div className="relative hidden flex-col bg-primary/5 lg:flex">
        <AuthBackground />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-2.5 text-lg font-semibold text-white">
            <img src="/assets/m%20app2.png" alt="Xerin" className="size-9 rounded-lg object-cover" />
            <span>Xerin Express</span>
          </div>

          {/* Hero content */}
          <div className="max-w-md space-y-6">
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white">
              Join Xerin Express,
              <br />
              ship with confidence.
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              Create your account and start managing shipments, tracking deliveries in real-time, and growing your logistics business.
            </p>

            {/* Feature highlights */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                </div>
                <span className="text-sm text-white/70">Real-time shipment tracking with GPS precision</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <span className="text-sm text-white/70">Comprehensive analytics and delivery reports</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span className="text-sm text-white/70">Bank-grade security for every shipment</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm text-white/60">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 lg:hidden">
          <AuthBackground />
        </div>
        <SignUpForm className="relative z-10 w-full max-w-md shadow-2xl" />
        <p className="relative z-10 mt-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Xerin Delivery Express. All rights reserved.
        </p>
        <Toaster />
      </div>
    </div>
  )
}
