"use client"

import * as React from "react"
import { useLang } from "@/lib/i18n"
import { HugeiconsIcon } from "@hugeicons/react"
import { Globe02Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-white px-2.5 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:bg-muted/40 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Language"
          >
            <HugeiconsIcon icon={Globe02Icon} className="size-4" />
            <span className="uppercase">{lang}</span>
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setLang("en")}
          className="flex items-center justify-between"
        >
          <span className="text-sm">English</span>
          {lang === "en" && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLang("sw")}
          className="flex items-center justify-between"
        >
          <span className="text-sm">Kiswahili</span>
          {lang === "sw" && <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
