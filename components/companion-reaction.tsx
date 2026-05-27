"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getCompanion, getSeverityReaction } from "@/lib/companions"
import type { CompanionId } from "@/types"

interface CompanionReactionProps {
  companionId: CompanionId
  severity: number | null
  className?: string
}

export function CompanionReaction({ companionId, severity, className }: CompanionReactionProps) {
  const [reaction, setReaction] = useState<string>("")
  const [visible, setVisible] = useState(false)
  const companion = getCompanion(companionId)

  useEffect(() => {
    if (severity === null || companionId === "neutral") {
      setVisible(false)
      return
    }
    const text = getSeverityReaction(companionId, severity)
    if (!text) {
      setVisible(false)
      return
    }
    setReaction(text)
    setVisible(true)
  }, [companionId, severity])

  if (companionId === "neutral") return null

  return (
    <AnimatePresence mode="wait">
      {visible && reaction && (
        <motion.div
          key={reaction}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={className}
        >
          <div
            className="flex items-start gap-3 rounded-xl p-3 border"
            style={{
              backgroundColor: `${companion.accentHex}12`,
              borderColor: `${companion.accentHex}30`,
            }}
          >
            <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden>{companion.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold mb-0.5" style={{ color: companion.accentHex }}>
                {companion.name}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--so-text-2)' }}>
                {reaction}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
