"use client"

import { useMemo, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DAY_COLORS, getDayRating } from "@/lib/constants"
import type { LogEntry } from "@/types"
import { cn } from "@/lib/utils"

interface CalendarHeatmapProps {
  entries: LogEntry[]
  currentMonth: Date
  onMonthChange: (d: Date) => void
  onDayClick: (date: string) => void
  selectedDate?: string
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Serene Oasis day color mapping (light, accessible)
const SO_DAY_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  great:    { bg: '#D4EDDF', border: '#4A9C7E', label: 'Great day' },
  good:     { bg: '#E0F2F5', border: '#1E7F94', label: 'Good day' },
  moderate: { bg: '#FDF3DC', border: '#D9A23C', label: 'Moderate day' },
  hard:     { bg: '#FFE5E5', border: '#D64040', label: 'Hard day' },
  none:     { bg: 'transparent', border: 'var(--so-border-soft)', label: 'No entry' },
}

function getDayColors(entry: LogEntry | undefined) {
  if (!entry) return SO_DAY_COLORS.none
  const rating = getDayRating(entry)
  if (rating >= 8) return SO_DAY_COLORS.hard
  if (rating >= 6) return SO_DAY_COLORS.moderate
  if (rating >= 4) return SO_DAY_COLORS.good
  return SO_DAY_COLORS.great
}

export function CalendarHeatmap({
  entries,
  currentMonth,
  onMonthChange,
  onDayClick,
  selectedDate,
}: CalendarHeatmapProps) {
  if (!currentMonth) return null

  const entryMap = useMemo(() => {
    const m: Record<string, LogEntry> = {}
    entries.forEach(e => { m[e.date] = e })
    return m
  }, [entries])

  const { year, month, days } = useMemo(() => {
    const y = currentMonth.getFullYear()
    const m = currentMonth.getMonth()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const firstDow = new Date(y, m, 1).getDay()
    return { year: y, month: m, days: daysInMonth, firstDow }
    // eslint-disable-next-line
  }, [currentMonth])

  const { firstDow } = useMemo(() => {
    const y = currentMonth.getFullYear()
    const m = currentMonth.getMonth()
    const firstDow = new Date(y, m, 1).getDay()
    return { firstDow }
  }, [currentMonth])

  const [today, setToday] = useState<string>('')
  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10))
  }, [])

  const monthLabel = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div
      className="rounded-2xl p-4"
      style={{ backgroundColor: 'var(--so-card)', border: '1px solid var(--so-border)' }}
      role="region"
      aria-label={`Calendar heatmap for ${monthLabel}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ color: 'var(--so-text-3)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--so-card-alt)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-semibold" style={{ color: 'var(--so-text)' }}>
          {monthLabel}
        </p>
        <button
          onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ color: 'var(--so-text-3)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--so-card-alt)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div
            key={d}
            className="text-center text-xs font-medium py-1"
            style={{ color: 'var(--so-text-hint)' }}
            aria-hidden
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`pad-${i}`} aria-hidden />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const entry = entryMap[dateStr]
          const colors = getDayColors(entry)
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate

          return (
            <button
              key={dateStr}
              onClick={() => entry && onDayClick(dateStr)}
              disabled={!entry}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                entry ? "hover:scale-105 active:scale-95 cursor-pointer" : "cursor-default"
              )}
              style={{
                backgroundColor: colors.bg,
                border: isSelected
                  ? '2px solid var(--so-primary)'
                  : isToday
                    ? '2px solid var(--so-primary)'
                    : `1px solid ${colors.border}`,
                color: entry ? 'var(--so-text)' : 'var(--so-text-hint)',
                boxShadow: isSelected ? '0 0 0 2px rgba(30,127,148,0.2)' : 'none',
                fontWeight: isToday ? 700 : undefined,
              }}
              aria-label={`${dateStr}${entry ? `: severity ${entry.overallSeverity}/10, ${colors.label}` : ': no entry'}`}
              aria-pressed={isSelected}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 pt-3 flex-wrap" style={{ borderTop: '1px solid var(--so-border-soft)' }}>
        {Object.entries(SO_DAY_COLORS).filter(([k]) => k !== 'none').map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--so-text-3)' }}>
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: val.bg, border: `1px solid ${val.border}` }}
              aria-hidden
            />
            {val.label}
          </div>
        ))}
      </div>
    </div>
  )
}
