import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, InboxIcon, LockPasswordIcon, RefreshCcwIcon } from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

export function EmptyState({
  icon: iconName = InboxIcon,
  title,
  description,
  action,
  className,
}: {
  icon?: IconSvgElement
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-muted">
        <HugeiconsIcon icon={iconName} className="size-5 text-muted-foreground" />
      </span>
      <p className="mt-4 text-sm font-medium">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function ErrorState({
  status,
  message,
  onRetry,
  className,
}: {
  status?: number
  message?: string
  onRetry?: () => void
  className?: string
}) {
  const forbidden = status === 403

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-16 text-center",
        className,
      )}
    >
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-destructive/10">
        {forbidden ? (
          <HugeiconsIcon icon={LockPasswordIcon} className="size-5 text-destructive" />
        ) : (
          <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-destructive" />
        )}
      </span>
      <p className="mt-4 text-sm font-medium">
        {forbidden ? "You don't have access to this" : "Couldn't load this"}
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {message ??
          (forbidden
            ? "Ask an administrator to grant you the relevant permission."
            : "The request failed. This is usually temporary.")}
      </p>
      {!forbidden && onRetry ? (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <HugeiconsIcon icon={RefreshCcwIcon} className="size-4" />
          Try again
        </Button>
      ) : null}
    </div>
  )
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-2 py-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn("h-4", c === 0 ? "w-32" : c === cols - 1 ? "w-20" : "flex-1")}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
