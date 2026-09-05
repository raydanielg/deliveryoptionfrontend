export function formatMoney(value: number | null | undefined, currency = "TZS", opts?: { compact?: boolean; showCode?: boolean }) {
  if (value === null || value === undefined) return "—"
  const compact = opts?.compact ?? false
  const showCode = opts?.showCode ?? true

  let formatted: string
  if (compact) {
    if (Math.abs(value) >= 1_000_000_000) formatted = `${(value / 1_000_000_000).toFixed(1)}B`
    else if (Math.abs(value) >= 1_000_000) formatted = `${(value / 1_000_000).toFixed(1)}M`
    else if (Math.abs(value) >= 1_000) formatted = `${(value / 1_000).toFixed(1)}K`
    else formatted = String(Math.round(value))
  } else {
    formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)
  }

  return showCode ? `${currency} ${formatted}` : formatted
}

export function formatNumber(value: number | null | undefined, opts?: { compact?: boolean }) {
  if (value === null || value === undefined) return "—"
  if (opts?.compact) {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat("en-US").format(value)
}

export function formatPercent(value: number | null | undefined, decimals = 1) {
  if (value === null || value === undefined) return "—"
  return `${value.toFixed(decimals)}%`
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export function formatRelative(value: string | null | undefined) {
  if (!value) return "—"
  const now = Date.now()
  const then = new Date(value).getTime()
  const diff = Math.round((now - then) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(value)
}
