"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { LogEntry } from "@/types"
import { useMemo } from "react"

interface TrendChartsProps {
  entries: LogEntry[]
  days?: number
}

const COLORS = {
  overall:  { stroke: '#1E7F94', fill: '#1E7F94' },
  pain:     { stroke: '#D64040', fill: '#D64040' },
  fatigue:  { stroke: '#D9A23C', fill: '#D9A23C' },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl p-3 text-sm shadow-lg min-w-[140px]"
      style={{
        backgroundColor: 'var(--so-card)',
        border: '1px solid var(--so-border)',
        color: 'var(--so-text)',
      }}
    >
      <p className="font-semibold mb-2 text-xs" style={{ color: 'var(--so-text-3)' }}>{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.stroke }} />
            <span style={{ color: 'var(--so-text-3)' }}>{entry.name}</span>
          </div>
          <span className="font-bold" style={{ color: 'var(--so-text)' }}>{entry.value}/10</span>
        </div>
      ))}
    </div>
  )
}

export function TrendCharts({ entries, days = 30 }: TrendChartsProps) {
  const data = useMemo(() => {
    const recent = entries.slice(0, days).reverse()
    return recent.map(e => ({
      date: new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Overall: e.overallSeverity,
      Pain: e.painLevel,
      Fatigue: e.fatigueLevel,
    }))
  }, [entries, days])

  if (!data.length) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ backgroundColor: 'var(--so-card)', border: '1px solid var(--so-border)' }}
      >
        <p className="text-4xl mb-2">📈</p>
        <p className="text-sm font-medium" style={{ color: 'var(--so-text-3)' }}>Log entries to see your trends</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{ backgroundColor: 'var(--so-card)', border: '1px solid var(--so-border)' }}
      role="img"
      aria-label={`Trend chart: severity, pain, and fatigue over the last ${days} days`}
    >
      <p className="text-sm font-semibold mb-4" style={{ color: 'var(--so-text)' }}>
        {days}-Day Trends
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            {Object.entries(COLORS).map(([key, { fill }]) => (
              <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fill} stopOpacity={0.25} />
                <stop offset="100%" stopColor={fill} stopOpacity={0.03} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--so-border-soft)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'var(--so-text-hint)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--so-border)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 10, fill: 'var(--so-text-hint)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          <Area type="monotone" dataKey="Overall" name="Overall" stroke={COLORS.overall.stroke} fill={`url(#grad-overall)`} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Area type="monotone" dataKey="Pain" name="Pain" stroke={COLORS.pain.stroke} fill={`url(#grad-pain)`} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          <Area type="monotone" dataKey="Fatigue" name="Fatigue" stroke={COLORS.fatigue.stroke} fill={`url(#grad-fatigue)`} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
