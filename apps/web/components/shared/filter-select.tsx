"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  const ALL = "__all__"

  return (
    <Select
      value={value === "" ? ALL : value}
      onValueChange={(next) => onChange(next === ALL || next === null ? "" : next)}
    >
      <SelectTrigger size="sm" className={className} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: all</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const SHIPMENT_STATUS_OPTIONS = [
  { value: "BOOKED", label: "Booked" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_TRANSIT", label: "In transit" },
  { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "FAILED", label: "Failed" },
]

export const NOTIFICATION_CHANNEL_OPTIONS = [
  { value: "SMS", label: "SMS" },
  { value: "EMAIL", label: "Email" },
  { value: "PUSH", label: "Push" },
  { value: "IN_APP", label: "In-app" },
]

export const NOTIFICATION_STATUS_OPTIONS = [
  { value: "SENT", label: "Sent" },
  { value: "FAILED", label: "Failed" },
  { value: "PENDING", label: "Pending" },
  { value: "DELIVERED", label: "Delivered" },
]

export const PAYMENT_STATUS_OPTIONS = [
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "REFUNDED", label: "Refunded" },
]
