import { SignUpForm } from "@workspace/ui/components/sign-up-form"
import { Toaster } from "@workspace/ui/components/sonner"
import { AuthBackground } from "@/components/auth-background"

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center p-6">
      <AuthBackground />
      <SignUpForm className="relative z-10 w-full max-w-md shadow-2xl" />
      <Toaster />
    </div>
  )
}
