import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { ArrowDownRight02Icon, ArrowUpRight02Icon, MinusSignIcon } from "@hugeicons/core-free-icons"

import { Card } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

export function MetricCard({
  label,
  value,
  delta,
  deltaLabel = "vs last period",
  positiveIsGood = true,
  icon: iconName,
  hint,
  loading,
  className,
}: {
  label: string
  value: React.ReactNode
  delta?: number | null
  deltaLabel?: string
  positiveIsGood?: boolean
  icon?: IconSvgElement
  hint?: string
  loading?: boolean
  className?: string
}) {
  const hasDelta = delta !== null && delta !== undefined && Number.isFinite(delta)
  const rising = hasDelta && delta > 0
  const flat = hasDelta && delta === 0
  const good = rising === positiveIsGood

  const deltaIcon = flat ? MinusSignIcon : rising ? ArrowUpRight02Icon : ArrowDownRight02Icon

  return (
    <Card className={cn("gap-0 p-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {iconName ? (
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <HugeiconsIcon icon={iconName} className="size-5 shrink-0 text-primary" />
          </div>
        ) : null}
      </div>

      {loading ? (
        <Skeleton className="mt-4 h-10 w-36" />
      ) : (
        <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
          {value}
        </p>
      )}

      <div className="mt-3 flex min-h-5 items-center gap-2 text-xs">
        {loading ? (
          <Skeleton className="h-4 w-28" />
        ) : hasDelta ? (
          <>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                flat
                  ? "text-muted-foreground"
                  : good
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
              )}
            >
              <HugeiconsIcon icon={deltaIcon} className="size-3.5" aria-hidden />
              {Math.abs(delta).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{deltaLabel}</span>
          </>
        ) : hint ? (
          <span className="text-muted-foreground">{hint}</span>
        ) : null}
      </div>
    </Card>
  )
}
