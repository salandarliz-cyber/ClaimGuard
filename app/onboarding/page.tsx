"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Plus, X, Check, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { saveSettings, getSettings } from "@/lib/storage"
import { COMPANIONS } from "@/lib/companions"
import type { ClaimType, CompanionId } from "@/types"

const CLAIM_TYPES: { value: ClaimType; label: string; description: string }[] = [
  { value: "SSDI", label: "SSDI", description: "Social Security Disability Insurance" },
  { value: "SSI",  label: "SSI",  description: "Supplemental Security Income" },
  { value: "LTD",  label: "LTD",  description: "Long-Term Disability (employer/private)" },
  { value: "VA",   label: "VA",   description: "Veterans Affairs disability benefits" },
  { value: "Other",label: "Other",description: "Other or multiple claim types" },
]

const TOTAL_STEPS = 5

export default function OnboardingPage() {
  const router = useRouter()
  const existing = getSettings()

  const [step, setStep] = useState(0)
  const [userName, setUserName] = useState(existing.userName ?? "")
  const [claimType, setClaimType] = useState<ClaimType>(existing.claimType ?? "SSDI")
  const [medications, setMedications] = useState<string[]>(existing.defaultMedications ?? [])
  const [medInput, setMedInput] = useState("")
  const [disclaimerChecked, setDisclaimerChecked] = useState(false)
  const [companionId, setCompanionId] = useState<CompanionId>(existing.companionId ?? "neutral")

  function addMed() {
    const trimmed = medInput.trim()
    if (trimmed && !medications.includes(trimmed)) {
      setMedications([...medications, trimmed])
    }
    setMedInput("")
  }

  function removeMed(med: string) {
    setMedications(medications.filter(m => m !== med))
  }

  function canAdvance(): boolean {
    if (step === 0) return userName.trim().length > 0
    if (step === 3) return disclaimerChecked
    return true
  }

  function handleNext() {
    if (step < TOTAL_STEPS - 1) setStep(step + 1)
    else handleFinish()
  }

  function handleFinish() {
    saveSettings({
      userName: userName.trim(),
      claimType,
      defaultMedications: medications,
      onboardingComplete: true,
      companionId,
    })
    router.push("/dashboard")
  }

  const variants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  }

  return (
    <div className="min-h-screen bg-[#F1F7FA] flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-[#EAF2F6]">
        <motion.div
          className="h-full bg-[#1E7F94]"
          animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Step 0: Welcome & Name */}
          {step === 0 && (
            <motion.div key="s0" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex-1 flex flex-col">
              <div className="mb-8">
                <p className="text-5xl mb-4">🛡️</p>
                <h1 className="text-2xl font-bold text-[#13293D] mb-2">Welcome to ClaimGuard</h1>
                <p className="text-[#7B95A8] text-sm leading-relaxed">
                  Your private daily symptom tracker, built to help document your disability claim with professional-grade language — no cloud, no accounts, always on your device.
                </p>
              </div>
              <div className="space-y-2 mb-8">
                {[
                  "📊 Daily logs translated to SSA-ready language",
                  "📅 Calendar heatmap & trend charts",
                  "📄 Printable PDF + CSV reports",
                  "🔒 100% local — your data never leaves your device",
                  "🤝 Optional companion for daily encouragement",
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-[#475A72]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1E7F94] flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-auto space-y-2">
                <Label htmlFor="uname" className="text-[#475A72]">What should we call you?</Label>
                <Input
                  id="uname"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="Your first name or nickname"
                  className="bg-[#EAF2F6] border-[#C8D8E0] text-[#13293D] placeholder:text-[#9CB3C2]"
                  onKeyDown={e => { if (e.key === "Enter" && canAdvance()) handleNext() }}
                  autoFocus
                />
              </div>
            </motion.div>
          )}

          {/* Step 1: Claim Type */}
          {step === 1 && (
            <motion.div key="s1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-[#13293D] mb-2">What type of claim?</h2>
              <p className="text-[#7B95A8] text-sm mb-6">This helps tailor the professional language in your reports.</p>
              <div className="space-y-3">
                {CLAIM_TYPES.map(ct => (
                  <button
                    key={ct.value}
                    onClick={() => setClaimType(ct.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      claimType === ct.value
                        ? "border-[#1E7F94] bg-[#1E7F94]/10"
                        : "border-[#C8D8E0] bg-[#F1F7FA]/50 hover:border-[#C8D8E0]"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      claimType === ct.value ? "border-[#1E7F94] bg-[#1E7F94]" : "border-[#C8D8E0]"
                    }`}>
                      {claimType === ct.value && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-[#13293D]">{ct.label}</p>
                      <p className="text-xs text-[#7B95A8]">{ct.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Medications */}
          {step === 2 && (
            <motion.div key="s2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-[#13293D] mb-2">Your Medications</h2>
              <p className="text-[#7B95A8] text-sm mb-6">Add medications you take regularly. You&apos;ll track compliance and side effects in your daily log. (Skip if none.)</p>
              <div className="flex gap-2 mb-4">
                <Input
                  value={medInput}
                  onChange={e => setMedInput(e.target.value)}
                  placeholder="e.g. Metformin 500mg"
                  className="bg-[#EAF2F6] border-[#C8D8E0] text-[#13293D] placeholder:text-[#9CB3C2]"
                  onKeyDown={e => { if (e.key === "Enter") addMed() }}
                />
                <Button onClick={addMed} size="sm" className="bg-[#1E7F94] hover:bg-[#165F6E] h-10 px-3 flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {medications.map(med => (
                  <div key={med} className="flex items-center justify-between bg-[#EAF2F6] rounded-lg px-3 py-2.5">
                    <span className="text-[#13293D] text-sm">{med}</span>
                    <button onClick={() => removeMed(med)} className="text-[#9CB3C2] hover:text-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {medications.length === 0 && (
                  <p className="text-[#9CB3C2] text-sm text-center py-4">No medications added yet</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Disclaimer */}
          {step === 3 && (
            <motion.div key="s3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-[#C47F1A]" />
                <h2 className="text-xl font-bold text-[#13293D]">Important Disclaimer</h2>
              </div>
              <div className="bg-[#FDF3DC] border border-[#E8C070]/60 rounded-xl p-4 mb-6 space-y-3 text-sm text-[#475A72] leading-relaxed">
                <p><strong className="text-[#C47F1A]">ClaimGuard is NOT a medical or legal tool.</strong></p>
                <p>This app helps you organize your own observations and experiences for personal documentation purposes only.</p>
                <p>The professional language generated by this app is a <strong className="text-[#C47F1A]">starting point</strong>, not a finished legal document. Always work with a qualified disability attorney, advocate, or licensed medical professional for your actual claim.</p>
                <p>This app does <strong className="text-[#C47F1A]">not provide medical advice, legal advice, or guarantee any claim outcome.</strong></p>
                <p>All data is stored only on your device. We have no access to your information.</p>
              </div>
              <div className="flex items-start gap-3 mt-auto">
                <Checkbox
                  id="disclaimer"
                  checked={disclaimerChecked}
                  onCheckedChange={c => setDisclaimerChecked(c === true)}
                  className="mt-0.5"
                />
                <label htmlFor="disclaimer" className="text-sm text-[#475A72] leading-relaxed cursor-pointer">
                  I understand this app is for personal documentation only and does not constitute medical or legal advice.
                </label>
              </div>
            </motion.div>
          )}

          {/* Step 4: Choose Companion */}
          {step === 4 && (
            <motion.div key="s4" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-[#13293D] mb-1">Choose Your Companion</h2>
              <p className="text-[#7B95A8] text-sm mb-4">
                Your companion reacts during logging and chats with you in the Chat tab. Scripted — not real AI — and 100% private.
              </p>
              <div className="space-y-2.5 overflow-y-auto flex-1">
                {COMPANIONS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCompanionId(c.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      companionId === c.id
                        ? "border-[#1E7F94] bg-[#1E7F94]/10"
                        : "border-[#C8D8E0] bg-[#F1F7FA]/40 hover:border-[#C8D8E0]"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${c.avatarBg}`}
                    >
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#13293D] text-sm">{c.name}</p>
                        <span className="text-xs text-[#9CB3C2]">{c.tagline}</span>
                      </div>
                      <p className="text-xs text-[#7B95A8] truncate">{c.description}</p>
                    </div>
                    {companionId === c.id && (
                      <div className="w-5 h-5 rounded-full bg-[#1E7F94] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-6 flex-shrink-0">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="border-[#C8D8E0] text-[#475A72] h-12"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="flex-1 bg-[#1E7F94] hover:bg-[#165F6E] text-white h-12 font-semibold"
          >
            {step === TOTAL_STEPS - 1 ? "Get Started" : (
              <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
        <p className="text-center text-xs text-[#9CB3C2] mt-3">Step {step + 1} of {TOTAL_STEPS}</p>
      </div>
    </div>
  )
}
