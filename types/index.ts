export type ClaimType = 'SSDI' | 'SSI' | 'LTD' | 'VA' | 'Other'

export type CompanionId = 'coach' | 'bestie' | 'therapist' | 'sage' | 'cheerleader' | 'neutral'

export interface ChatMessage {
  id: string
  role: 'user' | 'companion'
  text: string
  timestamp: string
}

export interface LogEntry {
  id: string
  date: string       // YYYY-MM-DD
  timestamp: string  // ISO full datetime

  // Overall scores
  overallSeverity: number // 1-10
  painLevel: number       // 1-10
  fatigueLevel: number    // 1-10
  mood: number            // 1-10

  // Symptom tags
  symptomTags: string[]
  notes: string

  // Mobility & self-care
  mobilityScore: number   // 1-10
  walkDuration: string
  standDuration: string
  liftAbility: string
  selfCareScore: number   // derived avg
  dressingDifficulty: number  // 1-10
  bathingDifficulty: number   // 1-10
  cookingDifficulty: number   // 1-10
  canDrive: boolean | null

  // Cognitive
  cognitiveScore: number  // derived
  concentrationMinutes: number
  hasMemoryIssues: boolean
  canReadToday: boolean | null

  // Social / activity
  socialScore: number     // derived
  missedActivities: boolean
  maxSustainedActivityMinutes: number

  // Sleep
  sleepHours: number
  sleepQuality: number    // 1-10
  napHours: number

  // Medications
  medicationsTaken: string[]
  missedMedications: string[]
  sideEffects: string

  // Contextual
  triggers: string[]
  reliefFactors: string[]

  // Generated professional summary
  professionalSummary: string
}

export interface UserSettings {
  onboardingComplete: boolean
  userName: string
  claimType: ClaimType
  defaultMedications: string[]
  startDate: string
  reminderEnabled: boolean
  biometricEnabled: boolean
  companionId: CompanionId
}

export interface AppData {
  settings: UserSettings
  entries: LogEntry[]
  version: string
}

export type ViewType = 'home' | 'checkin' | 'trends' | 'export'
