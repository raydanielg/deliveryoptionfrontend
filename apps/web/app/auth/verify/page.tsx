import { OtpForm } from "@workspace/ui/components/otp-form"
import { Toaster } from "@workspace/ui/components/sonner"
import { AuthBackground } from "@/components/auth-background"

export default function OtpPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center p-6">
      <AuthBackground />
      <OtpForm className="relative z-10 w-full max-w-md shadow-2xl" />
      <Toaster />
    </div>
  )
}
