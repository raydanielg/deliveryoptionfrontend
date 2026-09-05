import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { ArrowDownRight02Icon, ArrowUpRight02Icon, MinusSignIcon, TrendingUpIcon, TrendingDownIcon } from "@hugeicons/core-free-icons"

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
  subtitle,
  change,
  positive,
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
  subtitle?: string
  change?: string
  positive?: boolean
  loading?: boolean
  className?: string
}) {
  const hasDelta = delta !== null && delta !== undefined && Number.isFinite(delta)
  const rising = hasDelta && delta > 0
  const flat = hasDelta && delta === 0
  const good = rising === positiveIsGood

  const deltaIcon = flat ? MinusSignIcon : rising ? ArrowUpRight02Icon : ArrowDownRight02Icon

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        {iconName ? (
          <HugeiconsIcon icon={iconName} className="size-4 shrink-0 text-muted-foreground" />
        ) : null}
      </div>

      {loading ? (
        <Skeleton className="mt-1.5 h-7 w-28" />
      ) : (
        <p className="mt-1 text-xl font-semibold tabular-nums">
          {value}
        </p>
      )}

      <div className="mt-1 flex min-h-4 items-center gap-1 text-xs">
        {loading ? (
          <Skeleton className="h-3.5 w-24" />
        ) : change ? (
          <>
            {positive !== undefined && (
              <HugeiconsIcon
                icon={positive ? TrendingUpIcon : TrendingDownIcon}
                className={cn("size-3", positive ? "text-emerald-600" : "text-red-600")}
              />
            )}
            <span className={positive === false ? "text-red-600" : "text-emerald-600"}>{change}</span>
          </>
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
              <HugeiconsIcon icon={deltaIcon} className="size-3" aria-hidden />
              {Math.abs(delta).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{deltaLabel}</span>
          </>
        ) : subtitle ? (
          <span className="text-muted-foreground">{subtitle}</span>
        ) : hint ? (
          <span className="text-muted-foreground">{hint}</span>
        ) : null}
      </div>
    </div>
  )
}
