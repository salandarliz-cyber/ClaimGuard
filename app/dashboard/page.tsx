"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NavBar } from '@/components/nav-bar'
import { CalendarHeatmap } from '@/components/calendar-heatmap'
import { TrendCharts } from '@/components/trend-charts'
import { DisclaimerBanner } from '@/components/disclaimer-banner'
import { getEntries, getSettings, getStreakDays } from '@/lib/storage'
import { SYMPTOM_TAGS_DEFAULT } from '@/lib/constants'
import { LogEntry, UserSettings, CompanionId } from '@/types'
import { getCompanion, getDailyOpening } from '@/lib/companions'
import { Plus, Activity, Calendar, Shield, Flame, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

function streakMsg(n: number): string {
  if (n === 0)   return 'Start your streak — log today! 🔥'
  if (n === 1)   return '1-day streak — keep it up! 🔥'
  if (n < 7)     return `${n}-day streak! You&apos;re building evidence! 🔥`
  if (n < 30)    return `${n}-day streak! Unstoppable documentation machine 🔥🔥`
  return         `${n}-day LEGEND streak! Your ALJ will be impressed 🏆🔥`
}

export default function DashboardPage() {
  const [entries,       setEntries]       = useState<LogEntry[]>([])
  const [settings,      setSettings]      = useState<UserSettings | null>(null)
  const [streak,        setStreak]        = useState(0)
  const [currentMonth,  setCurrentMonth]  = useState(new Date())
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null)
  const [mounted,       setMounted]       = useState(false)
  const [companionMsg,  setCompanionMsg]  = useState<string>('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    setMounted(true)
    setEntries(getEntries())
    setSettings(getSettings())
    setStreak(getStreakDays())
    const s = getSettings()
    const allEntries = getEntries()
    const opening = getDailyOpening(s.companionId ?? 'neutral', s.userName ?? '', allEntries)
    setCompanionMsg(opening)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F1F7FA] flex items-center justify-center">
        <div className="text-7xl animate-pulse">🛡️</div>
      </div>
    )
  }

  const companion = settings ? getCompanion(settings.companionId ?? 'neutral') : null

  const todayEntry  = entries.find(e => e.date === today)
  const recent30    = entries.slice(0, 30)
  const avgSeverity = recent30.length
    ? (recent30.reduce((s, e) => s + e.overallSeverity, 0) / recent30.length).toFixed(1)
    : '—'
  const highSevDays = entries.filter(e => e.overallSeverity >= 7).length

  return (
    <div className="min-h-screen pb-24">
      {/* ── Header */}
      <div className="bg-gradient-to-b from-[#1E7F94]/10 to-transparent px-4 pt-8 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-4xl select-none">🛡️</span>
            <div>
              <h1 className="text-xl font-bold text-[#13293D]">
                Hey{settings?.userName ? `, ${settings.userName}` : ''}!
              </h1>
              <p className="text-[#7B95A8] text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Companion opening message */}
          {companionMsg && companion && companion.id !== 'neutral' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-3 flex items-start gap-3 rounded-xl px-3 py-3 border"
              style={{
                backgroundColor: `${companion.accentHex}12`,
                borderColor: `${companion.accentHex}35`,
              }}
            >
              <span className="text-xl flex-shrink-0">{companion.emoji}</span>
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: companion.accentHex }}>
                  {companion.name}
                </p>
                <p className="text-sm text-[#475A72] leading-relaxed">{companionMsg}</p>
              </div>
            </motion.div>
          )}

          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 bg-[#FDF3DC] border border-[#E8C070] rounded-xl px-3 py-2"
            >
              <Flame className="h-4 w-4 text-[#C47F1A] flex-shrink-0" />
              <span className="text-sm text-[#C47F1A]">{streakMsg(streak)}</span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4 pb-4">
        {/* ── Today CTA / Today's entry */}
        {!todayEntry ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1E7F94]/12 to-[#4A9C7E]/08 border border-[#1E7F94]/25 rounded-2xl p-5"
          >
            <h2 className="text-lg font-bold text-[#13293D]">Log Today&apos;s Chaos 📝</h2>
            <p className="text-[#7B95A8] text-sm mt-1 mb-4">
              Takes under 2 minutes. Your future self (and your attorney) will thank you.
            </p>
            <Link href="/log">
              <Button className="w-full bg-[#1E7F94] hover:bg-[#165F6E] text-white min-h-[52px] text-base font-semibold shadow-lg shadow-[#1E7F94]/25">
                <Plus className="mr-2 h-5 w-5" />Log Today
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFFFFF] border border-[#C8D8E0] rounded-2xl p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-semibold text-[#13293D]">✅ Today logged!</p>
                <p className="text-sm text-[#7B95A8] mt-0.5">
                  Overall {todayEntry.overallSeverity}/10 · Pain {todayEntry.painLevel}/10 · Fatigue {todayEntry.fatigueLevel}/10
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {todayEntry.overallSeverity >= 9 ? '💀' :
                   todayEntry.overallSeverity >= 7 ? '😭' :
                   todayEntry.overallSeverity >= 5 ? '😣' :
                   todayEntry.overallSeverity >= 3 ? '😕' : '😐'}
                </span>
                <Link href="/log">
                  <Button variant="outline" size="sm" className="border-[#C8D8E0] text-[#475A72] hover:bg-[#EAF2F6]">Edit</Button>
                </Link>
              </div>
            </div>
            {(todayEntry.symptomTags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2.5">
                {todayEntry.symptomTags.slice(0, 3).map(id => {
                  const tag = SYMPTOM_TAGS_DEFAULT.find(t => t.id === id)
                  return (
                    <Badge key={id} variant="secondary" className="bg-[#EAF2F6] text-[#7B95A8] text-xs">
                      {tag?.label.replace(/^[^\s]+ /, '') || id}
                    </Badge>
                  )
                })}
                {todayEntry.symptomTags.length > 3 && (
                  <Badge variant="secondary" className="bg-[#EAF2F6] text-[#9CB3C2] text-xs">
                    +{todayEntry.symptomTags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Days Logged', value: entries.length.toString(), icon: Calendar,   color: 'text-[#1E7F94]' },
            { label: 'Avg Severity',value: `${avgSeverity}/10`,       icon: Activity,   color: 'text-[#1E7F94]' },
            { label: '≥7 Severity', value: `${highSevDays}d`,         icon: TrendingUp, color: 'text-red-600' },
          ].map(s => (
            <Card key={s.label} className="bg-[#FFFFFF] border-[#C8D8E0]">
              <CardContent className="p-3 text-center">
                <s.icon className={cn('h-4 w-4 mx-auto mb-1', s.color)} />
                <div className="text-lg font-bold text-[#13293D] tabular-nums">{s.value}</div>
                <div className="text-xs text-[#9CB3C2] leading-tight">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Calendar heatmap */}
        <Card className="bg-[#FFFFFF] border-[#C8D8E0]">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[#475A72]">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm"
                  onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                  className="h-7 w-7 p-0 text-[#9CB3C2] hover:text-[#13293D]">‹</Button>
                <Button variant="ghost" size="sm"
                  onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                  className="h-7 w-7 p-0 text-[#9CB3C2] hover:text-[#13293D]">›</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <CalendarHeatmap
              entries={entries}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onDayClick={date => setSelectedEntry(entries.find(e => e.date === date) ?? null)}
            />
          </CardContent>
        </Card>

        {/* ── Selected day detail */}
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFFFFF] border border-violet-700/40 rounded-xl p-4"
          >
            <div className="flex justify-between items-start">
              <p className="font-medium text-[#13293D]">
                {new Date(selectedEntry.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric'
                })}
              </p>
              <button onClick={() => setSelectedEntry(null)} className="text-[#9CB3C2] hover:text-[#475A72] text-lg leading-none">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
              <div><span className="text-[#9CB3C2]">Overall </span><span className="text-[#13293D] font-bold">{selectedEntry.overallSeverity}/10</span></div>
              <div><span className="text-[#9CB3C2]">Pain </span><span className="text-[#13293D] font-bold">{selectedEntry.painLevel || 0}/10</span></div>
              <div><span className="text-[#9CB3C2]">Fatigue </span><span className="text-[#13293D] font-bold">{selectedEntry.fatigueLevel || 0}/10</span></div>
            </div>
            {(selectedEntry.symptomTags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedEntry.symptomTags.slice(0, 4).map(id => {
                  const tag = SYMPTOM_TAGS_DEFAULT.find(t => t.id === id)
                  return <Badge key={id} variant="secondary" className="bg-[#EAF2F6] text-xs">{tag?.label.replace(/^[^\s]+ /, '') || id}</Badge>
                })}
              </div>
            )}
            {selectedEntry.notes && (
              <p className="text-xs text-[#9CB3C2] italic mt-2 line-clamp-2">&ldquo;{selectedEntry.notes}&rdquo;</p>
            )}
          </motion.div>
        )}

        {/* ── Trend chart */}
        {entries.length > 1 && (
          <Card className="bg-[#FFFFFF] border-[#C8D8E0]">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-[#475A72]">30-Day Symptom Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendCharts entries={entries} days={30} />
            </CardContent>
          </Card>
        )}

        {/* ── Reports CTA */}
        <Card className="bg-[#FFFFFF] border-[#C8D8E0]">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#1E7F94] flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-[#13293D]">Claim-Ready Reports</p>
              <p className="text-xs text-[#7B95A8] mt-0.5">Export professional PDFs for your attorney or doctor.</p>
            </div>
            <Link href="/reports">
              <Button size="sm" className="bg-[#1E7F94] hover:bg-[#165F6E] text-white">Export</Button>
            </Link>
          </CardContent>
        </Card>

        <DisclaimerBanner compact />
      </div>

      <NavBar />
    </div>
  )
}
