"use client"

import { cn } from "@/lib/utils"
import { EMOJI_SCALE } from "@/lib/constants"

interface EmojiScaleProps {
  label: string
  value: number // 1–10
  onChange: (v: number) => void
  description?: string
  className?: string
  invertLabels?: boolean
}

export function EmojiScale({ label, value, onChange, description, className, invertLabels }: EmojiScaleProps) {
  const entry = EMOJI_SCALE[value] ?? EMOJI_SCALE[5]

  // Color ramp: green (1) → amber (5-6) → red (8-10)
  const textColor =
    value >= 8 ? '#D64040' :
    value >= 6 ? '#D9A23C' :
    value >= 4 ? '#D9A23C' : '#4A9C7E'

  const bgColor =
    value >= 8 ? '#FDEAEA' :
    value >= 6 ? '#FDF3DC' :
    value >= 4 ? '#FDF3DC' : '#D4EDDF'

  const fillPct = ((value - 1) / 9) * 100

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold" style={{ color: 'var(--so-text)' }}>
          {label}
        </label>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          <span aria-hidden>{entry?.emoji}</span>
          <span>{value}/10</span>
        </div>
      </div>

      {description && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--so-text-hint)' }}>
          {description}
        </p>
      )}

      {/* Emoji row */}
      <div className="flex justify-between px-0.5" aria-hidden>
        {Object.entries(EMOJI_SCALE)
          .filter((_, i) => i % 2 === 0)
          .map(([key, e]) => (
            <span key={key} className="text-xl leading-none">{e.emoji}</span>
          ))}
      </div>

      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          accentColor: 'var(--so-primary)',
          background: `linear-gradient(to right, var(--so-primary) ${fillPct}%, var(--so-border) ${fillPct}%)`,
        }}
        aria-label={`${label}: ${value} out of 10 — ${entry?.label}`}
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={value}
        aria-valuetext={`${value} — ${entry?.label}`}
      />

      <div className="flex justify-between text-xs" style={{ color: 'var(--so-text-hint)' }}>
        <span>{invertLabels ? 'Severe' : 'None / minimal'}</span>
        <span>{invertLabels ? 'None' : 'Severe / max'}</span>
      </div>
    </div>
  )
}
