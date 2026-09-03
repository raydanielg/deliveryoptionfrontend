import { LoginForm } from "@workspace/ui/components/login-form"
import { Toaster } from "@workspace/ui/components/sonner"

export default function AuthPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center p-6">
      <img
        src="/assets/41714.jpg"
        alt="Delivery Background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-black/60 to-slate-900/40 backdrop-blur-[1.5px]" />
      <LoginForm className="relative z-10 w-full max-w-md shadow-2xl" />
      <p className="absolute bottom-4 left-0 right-0 z-10 text-center text-xs text-white/50">
        &copy; {new Date().getFullYear()} Xerin Express. All rights reserved.
      </p>
      <Toaster />
    </div>
  )
}
