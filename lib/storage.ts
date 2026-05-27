import { LogEntry, UserSettings, AppData } from '@/types'

const STORAGE_KEY = 'claimguard_v1'
const APP_VERSION = '1.2.0'

const DEFAULT_SETTINGS: UserSettings = {
  onboardingComplete: false,
  userName: '',
  claimType: 'SSDI',
  defaultMedications: [],
  startDate: new Date().toISOString().split('T')[0],
  reminderEnabled: false,
  biometricEnabled: false,
  companionId: 'neutral',
}

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function loadData(): AppData {
  if (!isClient()) return { settings: DEFAULT_SETTINGS, entries: [], version: APP_VERSION }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { settings: DEFAULT_SETTINGS, entries: [], version: APP_VERSION }
    const parsed = JSON.parse(raw) as AppData
    return {
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      entries: parsed.entries || [],
      version: parsed.version || APP_VERSION,
    }
  } catch {
    return { settings: DEFAULT_SETTINGS, entries: [], version: APP_VERSION }
  }
}

export function saveData(data: AppData): void {
  if (!isClient()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getSettings(): UserSettings {
  return loadData().settings
}

export function saveSettings(settings: Partial<UserSettings>): void {
  const data = loadData()
  data.settings = { ...data.settings, ...settings }
  saveData(data)
}

export function getEntries(): LogEntry[] {
  return [...loadData().entries].sort((a, b) => b.date.localeCompare(a.date))
}

export function getEntryByDate(date: string): LogEntry | undefined {
  return loadData().entries.find(e => e.date === date)
}

export function saveEntry(entry: LogEntry): void {
  const data = loadData()
  const idx = data.entries.findIndex(e => e.id === entry.id)
  if (idx >= 0) {
    data.entries[idx] = entry
  } else {
    data.entries.push(entry)
  }
  saveData(data)
}

export function deleteEntry(id: string): void {
  const data = loadData()
  data.entries = data.entries.filter(e => e.id !== id)
  saveData(data)
}

export function getStreakDays(): number {
  const data = loadData()
  if (data.entries.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today.getTime() - 86400000)

  const dateSet = new Set(data.entries.map(e => e.date))
  const todayStr = today.toISOString().split('T')[0]
  const yestStr = yesterday.toISOString().split('T')[0]

  // Streak must include today or yesterday
  if (!dateSet.has(todayStr) && !dateSet.has(yestStr)) return 0

  let streak = 0
  let cursor = dateSet.has(todayStr) ? today : yesterday

  while (true) {
    const ds = cursor.toISOString().split('T')[0]
    if (!dateSet.has(ds)) break
    streak++
    cursor = new Date(cursor.getTime() - 86400000)
  }
  return streak
}

export function exportAllDataJSON(): string {
  return JSON.stringify(loadData(), null, 2)
}

export function clearAllData(): void {
  if (!isClient()) return
  localStorage.removeItem(STORAGE_KEY)
}
