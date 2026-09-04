import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  AlertCircleIcon,
  BanIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  HelpCircleIcon,
  HourglassIcon,
  MinusSignIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@workspace/ui/lib/utils"

type Tone = "good" | "warning" | "serious" | "critical" | "neutral" | "info"

const TONE_CLASS: Record<Tone, string> = {
  good: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-400",
  serious: "bg-orange-500/10 text-orange-700 ring-orange-500/25 dark:text-orange-400",
  critical: "bg-red-500/10 text-red-700 ring-red-500/25 dark:text-red-400",
  info: "bg-sky-500/10 text-sky-700 ring-sky-500/25 dark:text-sky-400",
  neutral: "bg-muted text-muted-foreground ring-border",
}

interface StatusMeta {
  tone: Tone
  icon: IconSvgElement
  label?: string
}

const STATUS: Record<string, StatusMeta> = {
  // shipment statuses
  BOOKED: { tone: "neutral", icon: MinusSignIcon },
  PENDING: { tone: "warning", icon: HourglassIcon },
  ACCEPTED: { tone: "info", icon: CheckmarkCircle02Icon },
  PICKED_UP: { tone: "info", icon: CheckmarkCircle02Icon, label: "Picked up" },
  IN_TRANSIT: { tone: "info", icon: Clock01Icon, label: "In transit" },
  OUT_FOR_DELIVERY: { tone: "info", icon: Clock01Icon, label: "Out for delivery" },
  DELIVERED: { tone: "good", icon: CheckmarkCircle02Icon },
  CANCELLED: { tone: "neutral", icon: BanIcon },
  RETURNING: { tone: "warning", icon: RotateCcwIcon },
  RETURNED: { tone: "warning", icon: RotateCcwIcon },
  FAILED: { tone: "critical", icon: Cancel01Icon },
  ON_HOLD: { tone: "warning", icon: Clock01Icon, label: "On hold" },

  // payment statuses
  PAID: { tone: "good", icon: CheckmarkCircle02Icon },
  PENDING_PAYMENT: { tone: "warning", icon: HourglassIcon, label: "Pending payment" },
  REFUNDED: { tone: "info", icon: RotateCcwIcon },
  PARTIALLY_PAID: { tone: "warning", icon: HourglassIcon, label: "Partially paid" },

  // notification statuses
  SENT: { tone: "good", icon: CheckmarkCircle02Icon },

  // user/role statuses
  ACTIVE: { tone: "good", icon: CheckmarkCircle02Icon },
  INACTIVE: { tone: "neutral", icon: MinusSignIcon },
  SUSPENDED: { tone: "critical", icon: ShieldAlertIcon },

  // general
  PROCESSING: { tone: "info", icon: HourglassIcon },
  EXPIRED: { tone: "warning", icon: Clock01Icon },
  REJECTED: { tone: "critical", icon: Cancel01Icon },
  APPROVED: { tone: "good", icon: CheckmarkCircle02Icon },
  COMPLETED: { tone: "good", icon: CheckmarkCircle02Icon },
}

function humanise(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function StatusBadge({
  status,
  className,
  size = "default",
}: {
  status: string | null | undefined
  className?: string
  size?: "default" | "sm"
}) {
  if (!status) {
    return <span className="text-muted-foreground">—</span>
  }

  const meta = STATUS[status] ?? STATUS[status.toUpperCase()] ?? {
    tone: "neutral" as const,
    icon: HelpCircleIcon,
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        TONE_CLASS[meta.tone],
        className,
      )}
    >
      <HugeiconsIcon icon={meta.icon} className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden />
      {meta.label ?? humanise(status)}
    </span>
  )
}
