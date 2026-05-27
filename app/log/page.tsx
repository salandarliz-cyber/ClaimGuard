"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { NavBar } from '@/components/nav-bar'
import { DisclaimerBanner } from '@/components/disclaimer-banner'
import { EmojiScale } from '@/components/emoji-scale'
import { SymptomTags } from '@/components/symptom-tags'
import { LogEntry, CompanionId } from '@/types'
import { CompanionReaction } from '@/components/companion-reaction'
import { saveEntry, getSettings, getEntryByDate } from '@/lib/storage'
import { generateProfessionalSummary } from '@/lib/translation'
import { TRIGGERS_DEFAULT, RELIEF_FACTORS_DEFAULT } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ArrowRight, ArrowLeft, Save, CheckCircle2 } from 'lucide-react'

type Step = 0 | 1 | 2 | 3

interface StepMeta {
  title: string
  emoji: string
  subtitle: string
}

const STEPS: StepMeta[] = [
  { emoji: '📊', title: "How's the disaster?",   subtitle: 'Rate your overall severity today' },
  { emoji: '💥', title: "What's hitting?",        subtitle: 'Tag your symptoms' },
  { emoji: '🧩', title: 'What could you do?',    subtitle: 'Functional limitations (ADLs)' },
  { emoji: '😴', title: 'Sleep & Context',        subtitle: 'Rest, medications, triggers' },
]

type EntryDraft = Partial<LogEntry>

function blankDraft(): EntryDraft {
  return {
    overallSeverity:           5,
    painLevel:                 5,
    fatigueLevel:              5,
    mood:                      5,
    symptomTags:               [],
    mobilityScore:             5,
    walkDuration:              '',
    dressingDifficulty:        5,
    bathingDifficulty:         5,
    cookingDifficulty:         5,
    canDrive:                  null,
    concentrationMinutes:      30,
    hasMemoryIssues:           false,
    canReadToday:              null,
    missedActivities:          false,
    maxSustainedActivityMinutes: 30,
    sleepHours:                7,
    sleepQuality:              5,
    napHours:                  0,
    medicationsTaken:          [],
    missedMedications:         [],
    sideEffects:               '',
    triggers:                  [],
    reliefFactors:             [],
    notes:                     '',
  }
}

// Helper: toggle item in string array
function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
}

// Mini horizontal score slider
function ScoreMini({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  const color =
    value >= 8 ? 'text-red-600' :
    value >= 6 ? 'text-orange-400' :
    value >= 4 ? 'text-yellow-400' : 'text-[#4A9C7E]'
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-xs text-[#7B95A8]">{label}</span>
        <span className={cn('text-xs font-bold tabular-nums', color)}>{value}/10</span>
      </div>
      <input
        type="range" min={1} max={10} step={1} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#1E7F94] bg-[#DDE6EB]"
        aria-label={label}
      />
    </div>
  )
}

export default function LogPage() {
  const router = useRouter()
  const today  = new Date().toISOString().split('T')[0]

  const [step,            setStep]    = useState<Step>(0)
  const [draft,           setDraft]   = useState<EntryDraft>(blankDraft())
  const [meds,            setMeds]    = useState<string[]>([])
  const [existingId,      setExistingId] = useState<string | undefined>()
  const [saved,           setSaved]   = useState(false)
  const [companionId,     setCompanionId] = useState<CompanionId>('neutral')

  useEffect(() => {
    const s = getSettings()
    setMeds(s.defaultMedications || [])
    setCompanionId(s.companionId ?? 'neutral')
    const existing = getEntryByDate(today)
    if (existing) {
      setExistingId(existing.id)
      setDraft(existing)
    }
  }, [today])

  const upd = useCallback((changes: Partial<LogEntry>) => {
    setDraft(prev => ({ ...prev, ...changes }))
  }, [])

  const handleSave = () => {
    const d = draft

    // Compute derived domain scores from sub-fields
    const selfCareScore = Math.round(
      ((d.dressingDifficulty ?? 5) + (d.bathingDifficulty ?? 5) + (d.cookingDifficulty ?? 5)) / 3
    )
    const cognitiveScore = (d.concentrationMinutes !== undefined)
      ? Math.max(1, Math.min(10, Math.round(10 - d.concentrationMinutes / 13)))
      : 5
    const socialScore = d.missedActivities
      ? Math.max(6, Math.min(10, Math.round(10 - (d.maxSustainedActivityMinutes ?? 30) / 24)))
      : Math.max(1, Math.min(5, Math.round(10 - (d.maxSustainedActivityMinutes ?? 60) / 24)))

    const finalEntry: LogEntry = {
      id:                         existingId || crypto.randomUUID(),
      date:                       today,
      timestamp:                  new Date().toISOString(),
      overallSeverity:            d.overallSeverity ?? 5,
      painLevel:                  d.painLevel ?? 5,
      fatigueLevel:               d.fatigueLevel ?? 5,
      mood:                       d.mood ?? 5,
      symptomTags:                d.symptomTags ?? [],
      mobilityScore:              d.mobilityScore ?? 5,
      walkDuration:               d.walkDuration ?? '',
      standDuration:              '',
      liftAbility:                '',
      selfCareScore,
      dressingDifficulty:         d.dressingDifficulty ?? 5,
      bathingDifficulty:          d.bathingDifficulty ?? 5,
      cookingDifficulty:          d.cookingDifficulty ?? 5,
      canDrive:                   d.canDrive ?? null,
      cognitiveScore,
      concentrationMinutes:       d.concentrationMinutes ?? 30,
      hasMemoryIssues:            d.hasMemoryIssues ?? false,
      canReadToday:               d.canReadToday ?? null,
      socialScore,
      missedActivities:           d.missedActivities ?? false,
      maxSustainedActivityMinutes: d.maxSustainedActivityMinutes ?? 30,
      sleepHours:                 d.sleepHours ?? 7,
      sleepQuality:               d.sleepQuality ?? 5,
      napHours:                   d.napHours ?? 0,
      medicationsTaken:           d.medicationsTaken ?? [],
      missedMedications:          d.missedMedications ?? [],
      sideEffects:                d.sideEffects ?? '',
      triggers:                   d.triggers ?? [],
      reliefFactors:              d.reliefFactors ?? [],
      notes:                      d.notes ?? '',
      professionalSummary:        '',
    }
    finalEntry.professionalSummary = generateProfessionalSummary(finalEntry)

    saveEntry(finalEntry)
    setSaved(true)
    setTimeout(() => router.push('/dashboard'), 2200)
  }

  // ── Save success screen
  if (saved) {
    return (
      <div className="min-h-screen bg-[#F1F7FA] flex flex-col items-center justify-center gap-5 p-4">
        <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}>
          <span className="text-8xl select-none">🎉</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
          <h2 className="text-2xl font-bold text-[#13293D]">Logged! 💪</h2>
          <p className="text-[#7B95A8] mt-1">Your chaos has been professionally documented.</p>
          <p className="text-[#9CB3C2] text-sm mt-2">Evidence: acquired. Reviewers: warned.</p>
        </motion.div>
        <CheckCircle2 className="h-8 w-8 text-[#4A9C7E]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F1F7FA] pb-28">
      {/* ── Sticky header */}
      <div className="sticky top-0 z-10 bg-[#FFFFFF]/95 backdrop-blur border-b border-b border-[#C8D8E0] px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-base font-bold text-[#13293D]">{STEPS[step].emoji} {STEPS[step].title}</h1>
              <p className="text-xs text-[#9CB3C2]">{STEPS[step].subtitle}</p>
            </div>
            <span className="text-xs text-[#9CB3C2] bg-[#EAF2F6] px-2 py-1 rounded-full tabular-nums">
              {step + 1}/{STEPS.length}
            </span>
          </div>
          <div className="h-1.5 bg-[#EAF2F6] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#1E7F94] to-[#4A9C7E] rounded-full"
              initial={false}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* ── Main content */}
      <div className="max-w-md mx-auto px-4 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* ═══ STEP 0: Overall severity ═══ */}
            {step === 0 && (
              <div className="space-y-6">
                <EmojiScale label="Overall Severity"
                  value={draft.overallSeverity ?? 5}
                  onChange={v => upd({ overallSeverity: v })}
                  description="The full-picture vibe check. How wrecked are you today?"
                />
                <CompanionReaction
                  companionId={companionId}
                  severity={draft.overallSeverity ?? null}
                  className="mt-2"
                />
                <div className="border-t border-[#C8D8E0] pt-5">
                  <EmojiScale label="Pain Level"
                    value={draft.painLevel ?? 5}
                    onChange={v => upd({ painLevel: v })}
                    description="Physical pain specifically — joints, nerves, muscles, all of it."
                  />
                </div>
                <div className="border-t border-[#C8D8E0] pt-5">
                  <EmojiScale label="Fatigue Level"
                    value={draft.fatigueLevel ?? 5}
                    onChange={v => upd({ fatigueLevel: v })}
                    description="Energy tank reading — how depleted are you?"
                  />
                </div>
                <div className="border-t border-[#C8D8E0] pt-5">
                  <EmojiScale label="Mood"
                    value={draft.mood ?? 5}
                    onChange={v => upd({ mood: v })}
                    description="Mental/emotional state. Just data, no judgment."
                  />
                </div>
              </div>
            )}

            {/* ═══ STEP 1: Symptoms ═══ */}
            {step === 1 && (
              <div className="space-y-5">
                <p className="text-sm text-[#7B95A8]">
                  Tap everything that applies today. These get auto-translated to professional functional-limitation
                  language in your reports.
                </p>
                <SymptomTags
                  selectedTags={draft.symptomTags ?? []}
                  onChange={tags => upd({ symptomTags: tags })}
                />
                <div>
                  <Label className="text-[#475A72] text-sm">Anything else to document? (optional)</Label>
                  <Textarea
                    placeholder="That weird thing that happened, a bad reaction, the TV remote was too heavy — whatever is worth noting."
                    value={draft.notes ?? ''}
                    onChange={e => upd({ notes: e.target.value })}
                    className="mt-2 bg-[#EAF2F6] border-[#C8D8E0] text-[#13293D] placeholder:text-[#9CB3C2] min-h-[90px] text-sm"
                  />
                </div>
              </div>
            )}

            {/* ═══ STEP 2: ADLs ═══ */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Mobility */}
                <div className="bg-[#FFFFFF] rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold text-[#13293D]">🚶 Mobility</h3>
                  <ScoreMini
                    label="Mobility limitation (10 = couldn't leave couch)"
                    value={draft.mobilityScore ?? 5}
                    onChange={v => upd({ mobilityScore: v })}
                  />
                  <div>
                    <Label className="text-xs text-[#7B95A8]">How far / long could you walk? (free-text)</Label>
                    <input
                      type="text"
                      placeholder='e.g. "5 minutes", "to bathroom only", "not at all"'
                      value={draft.walkDuration ?? ''}
                      onChange={e => upd({ walkDuration: e.target.value })}
                      className="mt-1.5 w-full bg-[#EAF2F6] border border-[#C8D8E0] text-[#13293D] placeholder:text-[#9CB3C2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7F94]"
                    />
                  </div>
                </div>

                {/* Self-care */}
                <div className="bg-[#FFFFFF] rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold text-[#13293D]">🧴 Self-Care (ADLs)</h3>
                  <p className="text-xs text-[#9CB3C2]">Rate difficulty 1 (easy) → 10 (couldn&apos;t do it)</p>
                  <ScoreMini label="Dressing difficulty" value={draft.dressingDifficulty ?? 5} onChange={v => upd({ dressingDifficulty: v })} />
                  <ScoreMini label="Bathing / hygiene difficulty" value={draft.bathingDifficulty ?? 5} onChange={v => upd({ bathingDifficulty: v })} />
                  <ScoreMini label="Cooking / meal prep difficulty" value={draft.cookingDifficulty ?? 5} onChange={v => upd({ cookingDifficulty: v })} />
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="canDrive"
                      checked={draft.canDrive === false}
                      onCheckedChange={v => upd({ canDrive: v ? false : null })}
                    />
                    <Label htmlFor="canDrive" className="text-sm text-[#475A72] cursor-pointer">Could not drive today</Label>
                  </div>
                </div>

                {/* Cognitive */}
                <div className="bg-[#FFFFFF] rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold text-[#13293D]">🧠 Cognitive</h3>
                  <div>
                    <Label className="text-xs text-[#7B95A8]">
                      Max minutes you could concentrate before stopping / making errors
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="range" min={0} max={120} step={5}
                        value={draft.concentrationMinutes ?? 30}
                        onChange={e => upd({ concentrationMinutes: parseInt(e.target.value) })}
                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-[#1E7F94] bg-[#DDE6EB]"
                        aria-label="Concentration minutes"
                      />
                      <span className="text-sm text-[#13293D] tabular-nums w-20 text-right">
                        {draft.concentrationMinutes ?? 30} min
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="memIssues"
                      checked={draft.hasMemoryIssues ?? false}
                      onCheckedChange={v => upd({ hasMemoryIssues: v === true })}
                    />
                    <Label htmlFor="memIssues" className="text-sm text-[#475A72] cursor-pointer">Notable memory / recall issues today</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="cantRead"
                      checked={draft.canReadToday === false}
                      onCheckedChange={v => upd({ canReadToday: v ? false : null })}
                    />
                    <Label htmlFor="cantRead" className="text-sm text-[#475A72] cursor-pointer">Could not read or process written information</Label>
                  </div>
                </div>

                {/* Social / Work */}
                <div className="bg-[#FFFFFF] rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold text-[#13293D]">👥 Social & Work Capacity</h3>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="missed"
                      checked={draft.missedActivities ?? false}
                      onCheckedChange={v => upd({ missedActivities: v === true })}
                    />
                    <Label htmlFor="missed" className="text-sm text-[#475A72] cursor-pointer">Missed planned activities / obligations</Label>
                  </div>
                  <div>
                    <Label className="text-xs text-[#7B95A8]">
                      Max minutes of sustained activity before needing to rest
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="range" min={0} max={240} step={5}
                        value={draft.maxSustainedActivityMinutes ?? 30}
                        onChange={e => upd({ maxSustainedActivityMinutes: parseInt(e.target.value) })}
                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-[#1E7F94] bg-[#DDE6EB]"
                        aria-label="Max sustained activity minutes"
                      />
                      <span className="text-sm text-[#13293D] tabular-nums w-20 text-right">
                        {draft.maxSustainedActivityMinutes ?? 30} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ STEP 3: Sleep, Meds, Triggers ═══ */}
            {step === 3 && (
              <div className="space-y-4">
                {/* Sleep */}
                <div className="bg-[#FFFFFF] rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold text-[#13293D]">😴 Sleep</h3>
                  <div>
                    <Label className="text-xs text-[#7B95A8]">Total sleep hours (including broken / interrupted sleep)</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="range" min={0} max={16} step={0.5}
                        value={draft.sleepHours ?? 7}
                        onChange={e => upd({ sleepHours: parseFloat(e.target.value) })}
                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-[#1E7F94] bg-[#DDE6EB]"
                        aria-label="Sleep hours"
                      />
                      <span className="text-sm text-[#13293D] tabular-nums w-14 text-right">{draft.sleepHours ?? 7}h</span>
                    </div>
                  </div>
                  <EmojiScale
                    label="Sleep Quality"
                    value={draft.sleepQuality ?? 5}
                    onChange={v => upd({ sleepQuality: v })}
                    description="1 = slept like a rock, 10 = might as well have just stared at the ceiling"
                  />
                  <div>
                    <Label className="text-xs text-[#7B95A8]">Daytime napping / rest hours needed</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="range" min={0} max={8} step={0.5}
                        value={draft.napHours ?? 0}
                        onChange={e => upd({ napHours: parseFloat(e.target.value) })}
                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-[#1E7F94] bg-[#DDE6EB]"
                        aria-label="Nap hours"
                      />
                      <span className="text-sm text-[#13293D] tabular-nums w-14 text-right">{draft.napHours ?? 0}h</span>
                    </div>
                  </div>
                </div>

                {/* Medications */}
                {meds.length > 0 && (
                  <div className="bg-[#FFFFFF] rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold text-[#13293D]">💊 Medications</h3>
                    <div className="space-y-2">
                      {meds.map(med => {
                        const taken  = (draft.medicationsTaken ?? []).includes(med)
                        const missed = (draft.missedMedications ?? []).includes(med)
                        return (
                          <div key={med} className="flex items-center justify-between bg-[#EAF2F6] rounded-lg px-3 py-2.5">
                            <span className="text-sm text-[#475A72] flex-1 mr-2">{med}</span>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => upd({
                                  medicationsTaken: toggle(draft.medicationsTaken ?? [], med),
                                  missedMedications: (draft.missedMedications ?? []).filter(m => m !== med),
                                })}
                                className={cn(
                                  'px-2.5 py-1 rounded text-xs font-medium transition-colors min-h-[32px]',
                                  taken ? 'bg-[#4A9C7E] text-white' : 'bg-[#DDE6EB] text-[#7B95A8] hover:bg-[#4A9C7E]/20'
                                )}
                              >✓ Taken</button>
                              <button
                                onClick={() => upd({
                                  missedMedications: toggle(draft.missedMedications ?? [], med),
                                  medicationsTaken: (draft.medicationsTaken ?? []).filter(m => m !== med),
                                })}
                                className={cn(
                                  'px-2.5 py-1 rounded text-xs font-medium transition-colors min-h-[32px]',
                                  missed ? 'bg-red-500 text-red-100' : 'bg-[#DDE6EB] text-[#7B95A8] hover:bg-red-800/60'
                                )}
                              >✗ Missed</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div>
                      <Label className="text-xs text-[#7B95A8]">Side effects today (if any)</Label>
                      <input
                        type="text"
                        placeholder="Nausea, drowsiness, dizziness..."
                        value={draft.sideEffects ?? ''}
                        onChange={e => upd({ sideEffects: e.target.value })}
                        className="mt-1.5 w-full bg-[#EAF2F6] border border-[#C8D8E0] text-[#13293D] placeholder:text-[#9CB3C2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7F94]"
                      />
                    </div>
                  </div>
                )}

                {/* Triggers */}
                <div className="bg-[#FFFFFF] rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-[#13293D]">⚡ Triggers Today</h3>
                  <div className="flex flex-wrap gap-2">
                    {TRIGGERS_DEFAULT.map(t => {
                      const active = (draft.triggers ?? []).includes(t)
                      return (
                        <button key={t}
                          onClick={() => upd({ triggers: toggle(draft.triggers ?? [], t) })}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs border transition-all min-h-[36px]',
                            active
                              ? 'bg-rose-50 border-rose-400 text-rose-700'
                              : 'bg-[#EAF2F6] border-[#C8D8E0] text-[#7B95A8] hover:border-rose-400'
                          )}
                        >{t}</button>
                      )
                    })}
                  </div>
                </div>

                {/* Relief */}
                <div className="bg-[#FFFFFF] rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-[#13293D]">🌿 What Helped (if anything)</h3>
                  <div className="flex flex-wrap gap-2">
                    {RELIEF_FACTORS_DEFAULT.map(r => {
                      const active = (draft.reliefFactors ?? []).includes(r)
                      return (
                        <button key={r}
                          onClick={() => upd({ reliefFactors: toggle(draft.reliefFactors ?? [], r) })}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs border transition-all min-h-[36px]',
                            active
                              ? 'bg-teal-50 border-teal-400 text-teal-700'
                              : 'bg-[#EAF2F6] border-[#C8D8E0] text-[#7B95A8] hover:border-teal-400'
                          )}
                        >{r}</button>
                      )
                    })}
                  </div>
                </div>

                <DisclaimerBanner compact />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(s => (s - 1) as Step)}
              className="border-[#C8D8E0] text-[#475A72] hover:bg-[#EAF2F6] min-h-[52px]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(s => (s + 1) as Step)}
              className="bg-[#1E7F94] hover:bg-[#165F6E] text-white min-h-[52px] ml-auto flex-1"
            >
              Next<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              className="bg-[#4A9C7E] hover:bg-[#3A7D65] text-white min-h-[52px] ml-auto flex-1 text-base"
            >
              <Save className="mr-2 h-5 w-5" />Save Today&apos;s Log
            </Button>
          )}
        </div>
      </div>

      <NavBar />
    </div>
  )
}
