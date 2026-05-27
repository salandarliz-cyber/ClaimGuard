import { LogEntry } from '@/types'
import { EMOJI_SCALE, SYMPTOM_TAGS_DEFAULT } from '@/lib/constants'

/**
 * Converts fun/informal log inputs into professional functional-limitation language
 * suitable for SSA reviewers, ALJs, and disability attorneys.
 */
export function generateProfessionalSummary(entry: Partial<LogEntry>): string {
  const lines: string[] = []
  const date = entry.date || new Date().toISOString().split('T')[0]
  const severity = entry.overallSeverity ?? 5

  // ── Overall severity
  const severityDesc = EMOJI_SCALE[severity]?.professional
    || 'moderate symptoms with functional limitation'
  lines.push(`On ${formatDateLong(date)}, claimant reported ${severityDesc}.`)

  // ── Symptom tags
  const tags = entry.symptomTags || []
  if (tags.length > 0) {
    const mapped = tags.map(id => {
      if (id.startsWith('custom-')) return `${id.replace('custom-', '')} (claimant-described symptom)`
      return SYMPTOM_TAGS_DEFAULT.find(t => t.id === id)?.professional
    }).filter((x): x is string => Boolean(x))
    if (mapped.length > 0) {
      lines.push(`Reported symptoms included: ${mapped.join('; ')}.`)
    }
  }

  // ── Pain & Fatigue
  const parts: string[] = []
  if (entry.painLevel) parts.push(`pain rated ${entry.painLevel}/10`)
  if (entry.fatigueLevel) parts.push(`fatigue rated ${entry.fatigueLevel}/10`)
  if (parts.length) lines.push(`Claimant rated ${parts.join(' and ')}.`)

  // ── Mobility
  const mob = entry.mobilityScore ?? 0
  if (mob > 0) {
    const walk = entry.walkDuration || 'limited duration'
    if (mob >= 8) {
      lines.push(
        `Mobility severely limited; claimant was largely unable to ambulate independently. ` +
        `Walking tolerated for approximately ${walk} before requiring rest.`
      )
    } else if (mob >= 5) {
      lines.push(`Mobility significantly impaired; walking limited to approximately ${walk} before requiring rest.`)
    } else if (mob >= 3) {
      lines.push(`Moderate mobility limitations noted; walking capacity reduced to approximately ${walk}.`)
    }
  }

  // ── Self-Care
  const sc = entry.selfCareScore ?? 0
  if (sc > 0) {
    const adlItems: string[] = []
    if ((entry.dressingDifficulty ?? 0) >= 6) adlItems.push('difficulty dressing independently')
    if ((entry.bathingDifficulty ?? 0) >= 6)  adlItems.push('difficulty bathing independently')
    if ((entry.cookingDifficulty ?? 0) >= 6)  adlItems.push('unable to prepare meals')
    if (entry.canDrive === false)              adlItems.push('unable to operate a motor vehicle')
    if (adlItems.length > 0) {
      lines.push(`Self-care limitations documented: ${adlItems.join('; ')}.`)
    } else if (sc >= 7) {
      lines.push(
        `Significant self-care deficits reported; claimant required assistance or was unable to ` +
        `complete personal hygiene and grooming tasks independently.`
      )
    }
  }

  // ── Cognitive
  const cog = entry.cognitiveScore ?? 0
  if (cog > 0) {
    const cogItems: string[] = []
    const conc = entry.concentrationMinutes
    if (conc !== undefined) {
      if (conc <= 5)  cogItems.push('unable to sustain concentration for more than 5 minutes')
      else if (conc <= 15) cogItems.push(`concentration limited to approximately ${conc} minutes before fatigue or error`)
      else if (conc <= 30) cogItems.push(`sustained focus limited to approximately ${conc} minutes`)
    }
    if (entry.hasMemoryIssues) cogItems.push('significant short-term memory deficits')
    if (entry.canReadToday === false) cogItems.push('unable to read or process written information')
    if (cogItems.length > 0) {
      lines.push(`Cognitive limitations documented: ${cogItems.join('; ')}.`)
    } else if (cog >= 7) {
      lines.push(
        `Significant cognitive impairment reported, affecting claimant's ability to concentrate, ` +
        `remember, and complete complex tasks.`
      )
    }
  }

  // ── Social / Work
  if (entry.missedActivities) {
    lines.push(`Claimant was unable to fulfill planned activities or social obligations due to symptom severity.`)
  }
  const maxMin = entry.maxSustainedActivityMinutes
  if (maxMin !== undefined && maxMin > 0) {
    lines.push(`Maximum sustained activity tolerance: approximately ${maxMin} minutes before requiring rest.`)
  }

  // ── Sleep
  if (entry.sleepHours !== undefined) {
    const sq = entry.sleepQuality ?? 5
    const nap = entry.napHours ?? 0
    if (entry.sleepHours < 5) {
      lines.push(`Sleep severely disrupted; approximately ${entry.sleepHours} hours obtained. Sleep quality rated ${sq}/10.`)
    } else if (sq >= 7) {
      lines.push(`Sleep non-restorative; ${entry.sleepHours} hours reported with quality rated ${sq}/10.`)
    } else {
      lines.push(`Sleep: ${entry.sleepHours} hours; quality rated ${sq}/10.`)
    }
    if (nap > 0) {
      lines.push(`Claimant required approximately ${nap} hour(s) of daytime rest or napping due to fatigue.`)
    }
  }

  // ── Medications
  if ((entry.medicationsTaken || []).length > 0) {
    lines.push(`Medications taken as prescribed: ${entry.medicationsTaken!.join(', ')}.`)
  }
  if ((entry.missedMedications || []).length > 0) {
    lines.push(`Medications missed: ${entry.missedMedications!.join(', ')}.`)
  }
  if (entry.sideEffects) {
    lines.push(`Reported medication side effects: ${entry.sideEffects}.`)
  }

  // ── Triggers / Relief
  if ((entry.triggers || []).length > 0) {
    lines.push(`Identified contributing factors: ${entry.triggers!.join(', ')}.`)
  }
  if ((entry.reliefFactors || []).length > 0) {
    lines.push(`Relief measures attempted: ${entry.reliefFactors!.join(', ')}.`)
  }

  // ── Free-text notes
  if (entry.notes) {
    lines.push(`Additional claimant notes: ${entry.notes}`)
  }

  return lines.join(' ')
}

function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  })
}
