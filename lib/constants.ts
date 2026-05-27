import { LogEntry } from '@/types'

export interface SymptomTag {
  id: string
  label: string
  professional: string
}

export const SYMPTOM_TAGS_DEFAULT: SymptomTag[] = [
  { id: 'brain-fog', label: '🧠 Brain Fogged AF', professional: 'significant cognitive impairment and brain fog affecting all tasks' },
  { id: 'cant-adult', label: '🛋️ Can\'t Even Adult', professional: 'unable to perform routine daily tasks or self-care activities' },
  { id: 'invisible-knife', label: '🔪 Invisible Knife Pain', professional: 'severe unexplained or neuropathic pain significantly limiting function' },
  { id: 'gravity', label: '🏋️ Gravity Increased 10x', professional: 'extreme physical fatigue and weakness affecting all movement' },
  { id: 'low-battery', label: '🪫 Operating at 15% Battery', professional: 'severe energy depletion limiting all physical and cognitive activity' },
  { id: 'body-said-no', label: '🚫 Body Said No', professional: 'physical limitations preventing planned or necessary activities' },
  { id: 'couch-prisoner', label: '🛋️ Couch Prisoner', professional: 'largely bedridden or homebound; unable to leave resting position for extended periods' },
  { id: 'time-blur', label: '⏰ Time Is A Blur', professional: 'severe disorientation and time perception difficulties' },
  { id: 'executive-offline', label: '💻 Executive Function: Offline', professional: 'executive dysfunction preventing planning, initiation, or completion of tasks' },
  { id: 'pain-dramatic', label: '🎭 Pain Level: Dramatic', professional: 'high-intensity pain severely impacting functional capacity' },
  { id: 'flare-day', label: '🔥 Certified Flare Day', professional: 'symptom flare-up exceeding personal baseline severity' },
  { id: 'anxiety-spiral', label: '🌀 Anxiety Spiral Mode', professional: 'significant anxiety and psychological distress affecting daily functioning' },
  { id: 'light-sensitive', label: '😎 Light = My Enemy', professional: 'photosensitivity preventing normal environmental exposure' },
  { id: 'nausea', label: '🤢 Nausea Achieved', professional: 'nausea limiting mobility and oral intake' },
  { id: 'joint-chaos', label: '🦴 Joint Chaos', professional: 'joint pain and instability limiting range of motion and load-bearing' },
  { id: 'headache', label: '💀 Head Full of Bees', professional: 'severe headache or migraine impacting all activity' },
  { id: 'pem', label: '🔋 PEM Hit', professional: 'post-exertional malaise following even minimal physical or cognitive activity' },
  { id: 'depression-day', label: '☁️ Full Depression Mode', professional: 'major depressive episode significantly impairing motivation and function' },
  { id: 'hypersensitive', label: '🔊 Sound/Touch Overload', professional: 'sensory hypersensitivity requiring reduced environmental stimulation' },
  { id: 'vertigo', label: '🌀 World Spinning', professional: 'vertigo or dizziness severely limiting ambulation and activity' },
]

export interface EmojiScaleEntry {
  emoji: string
  label: string
  professional: string
}

export const EMOJI_SCALE: Record<number, EmojiScaleEntry> = {
  1: { emoji: '😐', label: 'Meh, manageable', professional: 'minimal symptoms with baseline functional capacity largely maintained' },
  2: { emoji: '🙂', label: 'Not great but okay', professional: 'mild symptoms with minor functional impact on daily activities' },
  3: { emoji: '😕', label: 'Rough around the edges', professional: 'mild-to-moderate symptoms affecting some daily activities' },
  4: { emoji: '😟', label: 'Not a good day', professional: 'moderate symptoms limiting several daily activities' },
  5: { emoji: '😣', label: 'Struggling here', professional: 'moderate symptoms with significant functional limitation across multiple domains' },
  6: { emoji: '😖', label: 'Pretty bad tbh', professional: 'moderately severe symptoms preventing most planned activities' },
  7: { emoji: '😫', label: 'This sucks a lot', professional: 'severe symptoms with major functional impairment across all domains' },
  8: { emoji: '😭', label: 'I am not okay', professional: 'severe symptoms preventing nearly all daily activities; largely unable to care for self' },
  9: { emoji: '😭💀', label: 'Everything is terrible', professional: 'very severe symptoms; claimant largely bedridden and unable to perform any ADLs' },
  10: { emoji: '💀🔥😭', label: 'MAXIMUM CHAOS', professional: 'debilitating symptoms causing complete inability to perform any activities of daily living; bedridden entire day' },
}

export const TRIGGERS_DEFAULT = [
  'Overexertion', 'Poor sleep', 'Stress', 'Weather change', 'Cold/flu',
  'Social interaction', 'Screen time', 'Standing too long', 'Eating (specific food)',
  'Medication change', 'Hormonal', 'Emotional stress', 'Travel', 'Heat', 'Cold', 'Noise',
]

export const RELIEF_FACTORS_DEFAULT = [
  'Rest', 'Medication', 'Heat/ice', 'Lying down', 'Darkness/quiet',
  'Gentle movement', 'Meditation', 'Shower/bath', 'Nothing helped', 'Sleep', 'Elevation',
]

export const DAY_COLORS: Record<string, string> = {
  bad:    '#ef4444',  // red-500
  rough:  '#f97316',  // orange-500
  medium: '#eab308',  // yellow-500
  decent: '#84cc16',  // lime-500
  good:   '#22c55e',  // green-500
  none:   '#1e293b',  // slate-800
}

export function getDayRating(entry: Pick<LogEntry, 'overallSeverity'>): string {
  const s = entry.overallSeverity
  if (s >= 8) return 'bad'
  if (s >= 6) return 'rough'
  if (s >= 4) return 'medium'
  if (s >= 2) return 'decent'
  return 'good'
}
