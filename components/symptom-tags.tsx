"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { SYMPTOM_TAGS_DEFAULT } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface SymptomTagsProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
}

export function SymptomTags({ selectedTags, onChange }: SymptomTagsProps) {
  const [customInput, setCustomInput] = useState("")

  function toggle(id: string) {
    if (selectedTags.includes(id)) {
      onChange(selectedTags.filter(t => t !== id))
    } else {
      onChange([...selectedTags, id])
    }
  }

  function addCustom() {
    const trimmed = customInput.trim()
    if (!trimmed) return
    const id = `custom-${trimmed.toLowerCase().replace(/\s+/g, '-')}`
    if (!selectedTags.includes(id)) onChange([...selectedTags, id])
    setCustomInput("")
  }

  // Custom tags that were added
  const customTags = selectedTags.filter(t => t.startsWith("custom-"))

  return (
    <div className="space-y-4">
      {/* Default tags */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Symptom tags">
        {SYMPTOM_TAGS_DEFAULT.map(tag => {
          const active = selectedTags.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all min-h-[36px]"
              style={{
                backgroundColor: active ? 'var(--so-primary)' : 'var(--so-card)',
                borderColor: active ? 'var(--so-primary)' : 'var(--so-border)',
                color: active ? '#ffffff' : 'var(--so-text-3)',
                boxShadow: active ? '0 1px 6px rgba(30,127,148,0.25)' : 'none',
              }}
              aria-pressed={active}
            >
              {tag.label}
            </button>
          )
        })}
      </div>

      {/* Custom tags (already added) */}
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customTags.map(id => {
            const label = id.replace("custom-", "").replace(/-/g, " ")
            return (
              <span
                key={id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'var(--so-primary)',
                  color: '#ffffff',
                }}
              >
                {label}
                <button
                  type="button"
                  onClick={() => onChange(selectedTags.filter(t => t !== id))}
                  className="hover:opacity-70 transition-opacity"
                  aria-label={`Remove ${label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Add custom */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom() } }}
          placeholder="Add custom symptom…"
          className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 min-h-[40px]"
          style={{
            backgroundColor: 'var(--so-input)',
            border: '1px solid var(--so-border)',
            color: 'var(--so-text)',
          }}
          aria-label="Custom symptom tag"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customInput.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors disabled:opacity-40"
          style={{ backgroundColor: 'var(--so-primary)', color: '#ffffff' }}
          aria-label="Add custom symptom"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
