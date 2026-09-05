"use client"

import { LoginForm as LoginFormBase } from "@workspace/ui/components/login-form"
import { useLang } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Toaster } from "@workspace/ui/components/sonner"

export function LoginForm() {
  const { t } = useLang()

  return (
    <div className="relative z-10 w-full max-w-md shadow-2xl">
      <div className="mb-3 flex justify-end">
        <LanguageSwitcher />
      </div>
      <LoginFormBase
        title={t("auth.title")}
        subtitle={t("auth.subtitle")}
        emailLabel={t("auth.email")}
        emailPlaceholder={t("auth.emailPlaceholder")}
        passwordLabel={t("auth.password")}
        passwordPlaceholder={t("auth.passwordPlaceholder")}
        forgotPassword={t("auth.forgotPassword")}
        submitLabel={t("auth.login")}
        successMessage={t("auth.loginSuccess")}
        errorMessage={t("auth.loginFailed")}
        noAccountText={t("auth.noAccount")}
        signUpText={t("auth.signUp")}
      />
      <p className="mt-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Xerin Express. {t("auth.rights")}
      </p>
      <Toaster />
    </div>
  )
}
