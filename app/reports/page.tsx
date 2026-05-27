"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NavBar } from '@/components/nav-bar'
import { DisclaimerBanner } from '@/components/disclaimer-banner'
import { getEntries, getSettings } from '@/lib/storage'
import { LogEntry, UserSettings } from '@/types'
import { generatePDFReport } from '@/lib/pdf-export'
import { FileText, Download, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Range = 'last7' | 'last30' | 'last90' | 'all'

const RANGES: Array<{ value: Range; label: string; emoji: string }> = [
  { value: 'last7',  label: 'Last 7 Days',  emoji: '📅' },
  { value: 'last30', label: 'Last 30 Days', emoji: '📆' },
  { value: 'last90', label: 'Last 90 Days', emoji: '🗓️' },
  { value: 'all',    label: 'All Time',     emoji: '📋' },
]

export default function ReportsPage() {
  const [entries,      setEntries]      = useState<LogEntry[]>([])
  const [settings,     setSettings]     = useState<UserSettings | null>(null)
  const [range,        setRange]        = useState<Range>('last30')
  const [generating,   setGenerating]   = useState(false)
  const [pdfDone,      setPdfDone]      = useState(false)
  const [mounted,      setMounted]      = useState(false)

  useEffect(() => {
    setMounted(true)
    setEntries(getEntries())
    setSettings(getSettings())
  }, [])

  const { start, end } = useMemo(() => {
    const e = new Date().toISOString().split('T')[0]
    if (range === 'all') {
      const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
      return { start: sorted[0]?.date ?? e, end: e }
    }
    const days = range === 'last7' ? 7 : range === 'last30' ? 30 : 90
    const d = new Date()
    d.setDate(d.getDate() - days)
    return { start: d.toISOString().split('T')[0], end: e }
  }, [range, entries])

  const filtered = useMemo(
    () => entries.filter(e => e.date >= start && e.date <= end),
    [entries, start, end]
  )

  const stats = useMemo(() => {
    if (!filtered.length) return null
    const avgSev  = filtered.reduce((s, e) => s + e.overallSeverity, 0) / filtered.length
    const avgPain = filtered.reduce((s, e) => s + (e.painLevel || 0), 0) / filtered.length
    const avgFat  = filtered.reduce((s, e) => s + (e.fatigueLevel || 0), 0) / filtered.length
    const highDays   = filtered.filter(e => e.overallSeverity >= 7).length
    const missedDays = filtered.filter(e => e.missedActivities).length
    const sleepEntries = filtered.filter(e => e.sleepHours > 0)
    const avgSleep = sleepEntries.length
      ? sleepEntries.reduce((s, e) => s + e.sleepHours, 0) / sleepEntries.length
      : 0
    return { avgSev, avgPain, avgFat, highDays, missedDays, avgSleep }
  }, [filtered])

  const fmtDate = (ds: string) =>
    new Date(ds + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const handlePDF = async () => {
    if (!settings || !filtered.length) return
    setGenerating(true)
    setPdfDone(false)
    try {
      await generatePDFReport({ startDate: start, endDate: end, settings, entries: filtered })
      setPdfDone(true)
      setTimeout(() => setPdfDone(false), 3000)
    } catch (err) {
      console.error('PDF error:', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleCSV = () => {
    if (!filtered.length) return
    const headers = [
      'Date','Overall','Pain','Fatigue','Mobility','SelfCare','Cognitive','Social',
      'SleepHours','SleepQuality','NapHours','MissedActivities','Symptoms','Notes',
    ]
    const rows = filtered
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => [
        e.date,
        e.overallSeverity,
        e.painLevel || 0,
        e.fatigueLevel || 0,
        e.mobilityScore || 0,
        e.selfCareScore || 0,
        e.cognitiveScore || 0,
        e.socialScore || 0,
        e.sleepHours || 0,
        e.sleepQuality || 0,
        e.napHours || 0,
        e.missedActivities ? 'Yes' : 'No',
        `"${(e.symptomTags || []).join('|')}"`,
        `"${(e.notes || '').replace(/"/g, "'")}"`,
      ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `ClaimGuard_${start}_to_${end}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!mounted) return <div className="min-h-screen bg-[#F1F7FA]" />

  return (
    <div className="min-h-screen bg-[#F1F7FA] pb-24">
      <div className="bg-[#FFFFFF] border-b border-[#C8D8E0] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-[#13293D]">📋 Reports</h1>
          <p className="text-sm text-[#7B95A8] mt-0.5">Export claim-ready documentation</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 space-y-5">
        <DisclaimerBanner />

        {/* ── Date range picker */}
        <Card className="bg-[#FFFFFF] border-[#C8D8E0]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#475A72]">Reporting Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {RANGES.map(r => (
                <button key={r.value}
                  onClick={() => setRange(r.value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-all min-h-[52px]',
                    range === r.value
                      ? 'bg-[#1E7F94]/15 border-[#1E7F94] text-[#E6F0F5]'
                      : 'bg-[#EAF2F6] border-[#C8D8E0] text-[#7B95A8] hover:border-[#C8D8E0]'
                  )}
                >
                  <span className="text-lg">{r.emoji}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
            {start && end && (
              <p className="text-xs text-[#9CB3C2] mt-3 text-center">
                {fmtDate(start)} → {fmtDate(end)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Preview stats */}
        <Card className="bg-[#FFFFFF] border-[#C8D8E0]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#475A72]">Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-[#9CB3C2]">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No entries in this period</p>
                <p className="text-xs mt-1">Start logging to generate reports</p>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Days Logged',        value: filtered.length.toString(),            color: 'text-[#1E7F94]' },
                  { label: 'Avg Severity',        value: `${stats.avgSev.toFixed(1)}/10`,       color: 'text-[#1E7F94]' },
                  { label: 'Avg Pain',            value: `${stats.avgPain.toFixed(1)}/10`,      color: 'text-red-600' },
                  { label: 'Avg Fatigue',         value: `${stats.avgFat.toFixed(1)}/10`,       color: 'text-orange-400' },
                  { label: 'High Severity Days',  value: `${stats.highDays}d`,                  color: 'text-red-600' },
                  { label: 'Missed Activities',   value: `${stats.missedDays}d`,                color: 'text-[#C47F1A]' },
                  { label: 'Avg Sleep',           value: stats.avgSleep > 0 ? `${stats.avgSleep.toFixed(1)}h` : '—', color: 'text-cyan-400' },
                  { label: 'Coverage',            value: `${filtered.length} entries`,          color: 'text-[#4A9C7E]' },
                ].map(s => (
                  <div key={s.label} className="bg-[#EAF2F6] rounded-xl p-3">
                    <div className={cn('text-xl font-bold tabular-nums', s.color)}>{s.value}</div>
                    <div className="text-xs text-[#9CB3C2] mt-0.5 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* ── What's included */}
        {filtered.length > 0 && (
          <Card className="bg-[#FFFFFF] border-[#C8D8E0]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#475A72]">PDF Report Includes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#7B95A8]">
                {[
                  'Executive summary with key metrics',
                  'SSA RFC Functional Limitations table (4 domains)',
                  'Complete daily log with severity scoring',
                  'Professional-language daily summaries (auto-translated)',
                  'Prominent disclaimer watermarks on every page',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#4A9C7E] mt-0.5 flex-shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* ── Export buttons */}
        <div className="space-y-3">
          <Button
            onClick={handlePDF}
            disabled={filtered.length === 0 || generating}
            className="w-full bg-[#1E7F94] hover:bg-[#165F6E] text-white min-h-[56px] text-base font-semibold shadow-lg shadow-violet-700/20"
          >
            {generating ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating PDF…</>
            ) : pdfDone ? (
              <><CheckCircle className="mr-2 h-5 w-5 text-green-300" />PDF Downloaded! ✓</>
            ) : (
              <><FileText className="mr-2 h-5 w-5" />Export Claim-Ready PDF</>
            )}
          </Button>

          <Button
            onClick={handleCSV}
            disabled={filtered.length === 0}
            variant="outline"
            className="w-full border-[#C8D8E0] text-[#475A72] hover:bg-[#EAF2F6] min-h-[52px]"
          >
            <Download className="mr-2 h-5 w-5" />Export Raw CSV Data
          </Button>
        </div>

        {/* ── Legal note */}
        <div className="flex items-start gap-2 text-xs text-[#9CB3C2] bg-[#FFFFFF] rounded-xl p-3 border border-[#C8D8E0]">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-[#C47F1A]" />
          <p>
            All exported reports include prominent disclaimers stating they are user-generated symptom logs,
            not medical records or legal documents. Share reports through your attorney when submitting
            to SSA, insurance, or the VA.
          </p>
        </div>
      </div>

      <NavBar />
    </div>
  )
}
