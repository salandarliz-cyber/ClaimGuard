"use client"

import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DisclaimerBannerProps {
  compact?: boolean
  className?: string
}

export function DisclaimerBanner({ compact, className }: DisclaimerBannerProps) {
  if (compact) {
    return (
      <div
        className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-xs", className)}
        style={{
          backgroundColor: 'var(--so-warning-lt)',
          border: '1px solid var(--so-warning-border)',
          color: 'var(--so-text-3)',
        }}
        role="note"
        aria-label="Legal disclaimer"
      >
        <AlertCircle
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{ color: 'var(--so-warning)' }}
          aria-hidden
        />
        <span>
          <strong style={{ color: 'var(--so-warning)' }}>Not legal or medical advice.</strong>{" "}
          For personal documentation only. Always work with a qualified disability attorney.
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn("rounded-xl p-4 space-y-2", className)}
      style={{
        backgroundColor: 'var(--so-warning-lt)',
        border: '1px solid var(--so-warning-border)',
      }}
      role="note"
      aria-label="Legal disclaimer"
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--so-warning)' }} aria-hidden />
        <p className="text-sm font-semibold" style={{ color: 'var(--so-text)' }}>
          Important Disclaimer
        </p>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--so-text-3)' }}>
        ClaimGuard is <strong style={{ color: 'var(--so-text-2)' }}>not a medical or legal tool</strong>.
        It helps organize your personal observations for documentation purposes only. Always work with a
        qualified disability attorney, advocate, or licensed medical professional for your actual claim.
        This app does <strong style={{ color: 'var(--so-text-2)' }}>not guarantee any claim outcome.</strong>
      </p>
    </div>
  )
}
