"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NavBar } from '@/components/nav-bar'
import { getEntries } from '@/lib/storage'
import { LogEntry } from '@/types'
import { SYMPTOM_TAGS_DEFAULT } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Edit } from 'lucide-react'

const SEV_COLOR = (s: number) =>
  s >= 8 ? 'text-red-600' : s >= 6 ? 'text-orange-400' : s >= 4 ? 'text-yellow-400' : 'text-[#4A9C7E]'

const BORDER_COLOR = (s: number) =>
  s >= 8 ? 'border-l-red-500' : s >= 6 ? 'border-l-orange-500' : s >= 4 ? 'border-l-yellow-500' : 'border-l-green-500'

const EMOJI = (s: number) =>
  s >= 9 ? '💀' : s >= 7 ? '😭' : s >= 5 ? '😣' : s >= 3 ? '😕' : '😐'

export default function HistoryPage() {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setEntries(getEntries())
  }, [])

  if (!mounted) return <div className="min-h-screen bg-[#F1F7FA]" />

  return (
    <div className="min-h-screen bg-[#F1F7FA] pb-24">
      <div className="bg-[#FFFFFF] border-b border-[#C8D8E0] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#13293D]">📅 History</h1>
            <p className="text-xs text-[#9CB3C2] mt-0.5">{entries.length} entries logged</p>
          </div>
          {entries.length > 0 && (
            <Badge variant="secondary" className="bg-[#EAF2F6] text-[#475A72]">
              {entries.length} total
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-6xl">📝</div>
            <div>
              <p className="font-semibold text-[#475A72]">No entries yet</p>
              <p className="text-sm text-[#9CB3C2] mt-1">Start logging to build your evidence record.</p>
            </div>
            <Link href="/log">
              <Button className="bg-[#1E7F94] hover:bg-[#165F6E] text-white">Log Today</Button>
            </Link>
          </div>
        ) : (
          entries.map((entry, i) => {
            const tagLabels = (entry.symptomTags ?? []).slice(0, 2).map(id => {
              const tag = SYMPTOM_TAGS_DEFAULT.find(t => t.id === id)
              return tag?.label.replace(/^[^\s]+ /, '') || id
            })

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <Card className={cn(
                  'bg-[#FFFFFF] border-[#C8D8E0] border-l-4 transition-all',
                  BORDER_COLOR(entry.overallSeverity)
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#13293D]">
                          {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          <span className={cn('text-xs font-bold tabular-nums', SEV_COLOR(entry.overallSeverity))}>
                            Overall {entry.overallSeverity}/10
                          </span>
                          {entry.painLevel > 0 && (
                            <span className="text-xs text-[#9CB3C2] tabular-nums">Pain {entry.painLevel}/10</span>
                          )}
                          {entry.fatigueLevel > 0 && (
                            <span className="text-xs text-[#9CB3C2] tabular-nums">Fatigue {entry.fatigueLevel}/10</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl select-none" aria-hidden>{EMOJI(entry.overallSeverity)}</span>
                        <Link href="/log">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9CB3C2] hover:text-[#475A72]">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {tagLabels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tagLabels.map((l, j) => (
                          <Badge key={j} variant="secondary" className="bg-[#EAF2F6] text-[#7B95A8] text-xs py-0.5">{l}</Badge>
                        ))}
                        {(entry.symptomTags ?? []).length > 2 && (
                          <Badge variant="secondary" className="bg-[#EAF2F6] text-[#9CB3C2] text-xs py-0.5">
                            +{entry.symptomTags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {entry.notes && (
                      <p className="text-xs text-[#9CB3C2] italic mt-2 line-clamp-2">
                        &ldquo;{entry.notes}&rdquo;
                      </p>
                    )}

                    <div className="flex gap-3 mt-2 text-xs text-[#9CB3C2] flex-wrap">
                      {entry.sleepHours > 0 && <span>😴 {entry.sleepHours}h sleep</span>}
                      {entry.missedActivities && <span className="text-red-500">❌ Missed activities</span>}
                      {(entry.medicationsTaken ?? []).length > 0 && <span>💊 Meds taken</span>}
                      {(entry.missedMedications ?? []).length > 0 && (
                        <span className="text-[#C47F1A]">⚠️ Meds missed</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      <NavBar />
    </div>
  )
}
