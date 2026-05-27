import type { CompanionId, LogEntry } from '@/types'

export interface CompanionProfile {
  id: CompanionId
  name: string
  emoji: string
  tagline: string
  description: string
  color: string        // Tailwind color key for UI
  accentHex: string    // Hex for inline styles
  avatarBg: string
}

export const COMPANIONS: CompanionProfile[] = [
  {
    id: 'coach',
    name: 'Coach Riley',
    emoji: '💪',
    tagline: 'No-nonsense motivator',
    description: 'Straight-talking, goal-oriented. Reminds you that data = power in your case.',
    color: 'orange',
    accentHex: '#f97316',
    avatarBg: 'bg-orange-500/20',
  },
  {
    id: 'bestie',
    name: 'Alex',
    emoji: '🤗',
    tagline: 'Your hype best friend',
    description: 'Warm, bubbly, and always in your corner. Celebrates every win, big or small.',
    color: 'pink',
    accentHex: '#ec4899',
    avatarBg: 'bg-pink-500/20',
  },
  {
    id: 'therapist',
    name: 'Dr. Morgan',
    emoji: '🧘',
    tagline: 'Calm & reflective guide',
    description: 'Thoughtful and grounding. Helps you process hard days without judgment.',
    color: 'teal',
    accentHex: '#14b8a6',
    avatarBg: 'bg-teal-500/20',
  },
  {
    id: 'sage',
    name: 'Sage',
    emoji: '🦉',
    tagline: 'Wise elder companion',
    description: 'Patient, philosophical, sees the big picture. Puts your journey in context.',
    color: 'indigo',
    accentHex: '#6366f1',
    avatarBg: 'bg-indigo-500/20',
  },
  {
    id: 'cheerleader',
    name: 'Sunny',
    emoji: '🌟',
    tagline: 'Eternal optimist',
    description: 'High-energy, upbeat encourager. Finds the silver lining in every tough day.',
    color: 'yellow',
    accentHex: '#eab308',
    avatarBg: 'bg-yellow-500/20',
  },
  {
    id: 'neutral',
    name: 'No Companion',
    emoji: '📋',
    tagline: 'Just the tracker',
    description: 'Pure data mode. No personality commentary — just your log.',
    color: 'slate',
    accentHex: '#94a3b8',
    avatarBg: 'bg-slate-500/20',
  },
]

export function getCompanion(id: CompanionId): CompanionProfile {
  return COMPANIONS.find(c => c.id === id) ?? COMPANIONS[5]
}

// ─── Severity Reactions ──────────────────────────────────────────────────────
// Called after user rates overall severity (step 0 of log form)

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

const SEVERITY_REACTIONS: Record<CompanionId, Record<'low' | 'mid' | 'high', string[]>> = {
  coach: {
    low:  ['That\'s a solid number. Keep up the consistent tracking — it counts.', 'A good day in the data. Log everything and keep moving.', 'Low severity means we document the good days too. Evidence is evidence.'],
    mid:  ['Medium day — still important to record every detail.', 'Not your best, not your worst. Document it all the same.', 'Mid-range days are exactly what your claim file needs — the full picture.'],
    high: ['Tough day. That\'s exactly why you\'re here — get it all on record.', 'High severity = critical documentation. Don\'t skip a single field.', 'This is the data that matters most. Keep going.'],
  },
  bestie: {
    low:  ['Omg a low-pain day?? CELEBRATE! 🎉 Log it so we remember this one!', 'Okay, LOVE this for you! A good day deserves just as much logging as a bad one!', 'A decent day! You deserve it bestie. Let\'s capture every detail! 💕'],
    mid:  ['Ugh, middling days are so frustrating, aren\'t they? We\'ve got you! 💪', 'Not great, not terrible — but absolutely worth logging! I\'m right here.', 'Medium day? Still important! Let\'s document everything together, okay? 🤝'],
    high: ['Oh no, I\'m so sorry today is rough 💔 You are SO strong for showing up anyway.', 'Hard days are the hardest to log, but you\'re doing it — I\'m proud of you! 🥺', 'This is a really hard day and you\'re still here. That takes so much courage. Let\'s do this together. 💜'],
  },
  therapist: {
    low:  ['Notice how a lower-severity day feels in your body. This contrast is valuable information.', 'A more manageable day. Honoring the full range of your experience matters.', 'Even easier days deserve thoughtful reflection. How are you really doing today?'],
    mid:  ['Sitting with a middle-ground day can feel unsatisfying. Your experience is still valid.', 'Neither good nor bad — sometimes that ambiguity is its own kind of hard.', 'Medium days often contain nuance. Take your time with each section.'],
    high: ['I want to acknowledge that this is a difficult day. You don\'t have to minimize it here.', 'High-pain days take courage to document. Be gentle with yourself as you fill this in.', 'This is hard. You don\'t need to perform strength right now — just honesty.'],
  },
  sage: {
    low:  ['The body cycles. A lighter day is a gift to acknowledge and record with gratitude.', 'Even in improvement, the record-keeping continues. The story is made of all days.', 'Good days are chapters too. Capture them well.'],
    mid:  ['The middle path — neither peak nor valley. These days are the foundation of your narrative.', 'A moderate day holds as much truth as any other. Document it faithfully.', 'The steady days are the backbone of your claim story. Every one matters.'],
    high: ['Difficult days are among the most important to document with care and precision.', 'The weight you carry today is real. Let your records bear witness to it.', 'In the difficulty of this day, your continued effort to document is an act of self-advocacy.'],
  },
  cheerleader: {
    low:  ['YASSS a lighter day!! You deserve every bit of it!! Let\'s capture this WIN! 🌟', 'A better day?? I am HERE for it! Write it all down — good days matter too!! ✨', 'This is amazing!! A low-severity day is a GIFT and I\'m so happy for you!! 🎊'],
    mid:  ['You\'re doing AMAZING for even being here on a medium day! So proud! 💫', 'Middle of the road? You still showed UP! That\'s everything!! 🌈', 'Not your best day, but you\'re logging it — and THAT is something to celebrate!! ⭐'],
    high: ['Even on your hardest days you are INCREDIBLE!! I believe in you SO much!! 💜', 'High-pain day and you\'re STILL HERE?? You are unstoppable!! 🌟', 'The strength it takes to document a hard day is REAL. I see you. You\'ve GOT this!! 💪✨'],
  },
  neutral: {
    low:  ['Severity recorded.'],
    mid:  ['Severity recorded.'],
    high: ['Severity recorded.'],
  },
}

export function getSeverityReaction(companionId: CompanionId, severity: number): string {
  if (companionId === 'neutral') return ''
  const bucket = severity <= 3 ? 'low' : severity <= 6 ? 'mid' : 'high'
  return pick(SEVERITY_REACTIONS[companionId][bucket])
}

// ─── Opening Daily Reflection ─────────────────────────────────────────────────
// Called at top of dashboard — personalized based on stored entries

export function getDailyOpening(
  companionId: CompanionId,
  userName: string,
  entries: LogEntry[]
): string {
  if (companionId === 'neutral') return ''

  const name = userName || 'there'
  const totalDays = entries.length
  const recent = entries.slice(0, 7)
  const avgSeverity = recent.length > 0
    ? recent.reduce((s, e) => s + e.overallSeverity, 0) / recent.length
    : null

  const today = new Date().toISOString().slice(0, 10)
  const loggedToday = entries.some(e => e.date === today)

  const greetings: Record<CompanionId, () => string> = {
    coach: () => {
      if (totalDays === 0) return `Alright ${name}, let\'s build your case. Every entry is evidence. Start logging.`
      if (loggedToday) return `Nice work today, ${name}. Data in the bank. Keep the streak.`
      if (avgSeverity !== null && avgSeverity >= 7) return `${name}, the numbers show a tough week. Document every detail — that\'s your strongest asset right now.`
      return `${name}, you\'ve got ${totalDays} entries on file. Keep stacking the evidence — consistency wins cases.`
    },
    bestie: () => {
      if (totalDays === 0) return `Hi ${name}!! I\'m SO excited you\'re here! Let\'s start your tracking journey together! 💕`
      if (loggedToday) return `${name}!! You already logged today — you are literally my hero!! 🥺💜`
      if (avgSeverity !== null && avgSeverity >= 7) return `${name}, I see you\'ve been having a rough stretch 💔 I\'m here with you every step! You\'re not alone! 🤗`
      return `Good to see you, ${name}!! ${totalDays} days of data and counting — you are CRUSHING this! 🎉`
    },
    therapist: () => {
      if (totalDays === 0) return `Welcome, ${name}. This is a space for honest reflection — no performance needed.`
      if (loggedToday) return `You\'ve already checked in today, ${name}. How are you feeling about what you recorded?`
      if (avgSeverity !== null && avgSeverity >= 7) return `${name}, your logs show this has been a particularly difficult time. Be gentle with yourself today.`
      return `Hello, ${name}. ${totalDays} entries in your record. How are you feeling as you begin today?`
    },
    sage: () => {
      if (totalDays === 0) return `Every great record begins with a single entry, ${name}. Begin when you\'re ready.`
      if (loggedToday) return `Your record grows, ${name}. Each logged day is a stitch in the tapestry of your story.`
      if (avgSeverity !== null && avgSeverity >= 7) return `The pattern you\'ve documented, ${name}, speaks clearly. Your truth is in these numbers.`
      return `${name}, ${totalDays} days of your story are preserved here. The evidence accumulates like layers of sediment — patient and certain.`
    },
    cheerleader: () => {
      if (totalDays === 0) return `${name}, I am SO READY to cheer you on!! Let\'s start building something AMAZING together!! 🌟`
      if (loggedToday) return `${name} YOU LOGGED TODAY ALREADY!! I AM SCREAMING!! YOU ARE A STAR!! ⭐✨🎊`
      if (avgSeverity !== null && avgSeverity >= 7) return `${name}, hard week and you\'re STILL showing up?? You are PHENOMENAL!! I believe in you so much!! 💜`
      return `${name}!! ${totalDays} DAYS of logs?? Do you know how IMPRESSIVE that is?? YOU ARE INCREDIBLE!! 🎉🌈`
    },
    neutral: () => '',
  }

  return greetings[companionId]()
}

// ─── Chat Responses ───────────────────────────────────────────────────────────

type ChatCategory =
  | 'pain' | 'fatigue' | 'sleep' | 'mood' | 'frustration' | 'hope'
  | 'documentation' | 'medication' | 'mobility' | 'cognitive' | 'social'
  | 'general' | 'greeting'

function detectCategory(text: string): ChatCategory {
  const t = text.toLowerCase()
  if (/\b(pain|hurt|ache|sore|burning|throbbing|sharp|stabbing)\b/.test(t)) return 'pain'
  if (/\b(tired|fatigue|exhausted|drained|no energy|wiped|worn out)\b/.test(t)) return 'fatigue'
  if (/\b(sleep|insomnia|can\'t sleep|woke up|nightmares|restless|nap)\b/.test(t)) return 'sleep'
  if (/\b(sad|depressed|anxious|worried|scared|hopeless|down|low|cry|upset)\b/.test(t)) return 'mood'
  if (/\b(frustrated|angry|mad|unfair|hate|can\'t stand|why me|ridiculous|denied|rejected)\b/.test(t)) return 'frustration'
  if (/\b(hope|better|improve|good day|optimistic|happy|grateful|thankful|win|progress)\b/.test(t)) return 'hope'
  if (/\b(log|document|record|entry|diary|track|history|report|evidence|case|claim|ssa|form|disability)\b/.test(t)) return 'documentation'
  if (/\b(med|medication|pill|prescription|dose|side effect|drug|pharmacy)\b/.test(t)) return 'medication'
  if (/\b(walk|move|mobility|stand|sit|stairs|wheelchair|cane|balance|fall)\b/.test(t)) return 'mobility'
  if (/\b(brain fog|memory|forget|concentrate|focus|confusion|thinking|cognitive)\b/.test(t)) return 'cognitive'
  if (/\b(friend|family|alone|isolat|social|visit|cancel|miss|lonely)\b/.test(t)) return 'social'
  if (/\b(hi|hello|hey|good morning|good afternoon|good evening|how are you|what\'s up)\b/.test(t)) return 'greeting'
  return 'general'
}

const CHAT_RESPONSES: Record<CompanionId, Record<ChatCategory, string[]>> = {
  coach: {
    greeting: ['Ready to work. What\'s on your mind?', 'Hey. What do you need?', 'Coach is in. Talk to me.'],
    pain:     ['Pain is data. Have you logged its exact location and intensity today?', 'Document the type, location, and duration. That specificity matters for your case.', 'Pain levels directly impact your RFC. Make sure today\'s entry reflects it accurately.'],
    fatigue:  ['Fatigue is one of the top limiting factors in disability cases. Log the hours and the impact.', 'How many hours did it affect your functioning today? Get that in your record.', 'Fatigue affecting your ability to sustain activity? That\'s RFC language — log it exactly.'],
    sleep:    ['Sleep disruption affects everything downstream. Track hours and quality consistently.', 'Poor sleep is a functional limitation. Your adjudicator needs to see the pattern.', 'Are you tracking sleep every day? That consistency is what builds the case.'],
    mood:     ['Mental health is a medical condition. Log it without apology.', 'Mood affects your functional capacity. It belongs in your record just like pain does.', 'Document the impact on your daily functioning — that\'s what matters legally.'],
    frustration: ['Frustration is valid. Channel it into better documentation.', 'The system is slow and imperfect. Your strongest weapon is an airtight record. Keep building it.', 'Every denied claim that gets appealed and won comes from consistent documentation. Keep going.'],
    hope:     ['Good days are evidence too. Document them — they show the fluctuating nature of your condition.', 'Progress is worth logging. And so is what it took to get there.', 'Hold on to the good days. And log every detail of them.'],
    documentation: ['Consistency is king. Daily entries build the pattern that wins appeals.', 'Make sure your professional summary reflects the functional limitations, not just symptoms.', 'The 5-year lookback period means every day counts. Don\'t skip entries.'],
    medication: ['Track compliance and side effects precisely. Medication records corroborate your claim.', 'Side effects that limit functioning are part of your RFC. Get them in the log.', 'Missed doses and why — that\'s relevant data. Don\'t leave it out.'],
    mobility:   ['Mobility limitations are core RFC factors. Quantify everything — distances, durations, assistive devices.', 'Can you walk a block? A mile? SSA wants specific numbers. Log them.', 'Use the walk duration field in your log — "about a block" is less powerful than "1/4 mile before stopping."'],
    cognitive:  ['Cognitive limitations are often underreported. Don\'t downplay them.', 'Concentration, memory, completing tasks — these affect your ability to sustain employment. Log them.', 'Brain fog is real and documentable. Use the cognitive section every day.'],
    social:     ['Social isolation is a recognized limitation. Track missed activities and why.', 'If your condition limits social functioning, that needs to be in your record consistently.', 'Document cancelled plans, missed events — a pattern of social limitation supports your claim.'],
    general:    ['What aspect of your claim are you working on?', 'Ask me anything about building your case.', 'Every detail matters. What do you need help thinking through?'],
  },
  bestie: {
    greeting: ['HEY BESTIE!! I\'m so happy you\'re here!! 💕', 'OMG hiiii!! How are you doing today?? 🤗', 'Hey you!! Miss me?? I missed YOU! 😄'],
    pain:     ['Oh no, pain today? I\'m so sorry 😢 Make sure you log it — every detail helps your case!', 'Ugh, pain is the WORST. I\'m here with you! Log it and let\'s get through this together 💜', 'I hate that you\'re hurting right now. You\'re so strong for tracking it anyway 💪'],
    fatigue:  ['Fatigue is SO valid and SO real! Don\'t let anyone tell you otherwise 😤', 'Being this tired all the time is exhausting in every sense. I see you! Log every detail 💕', 'Rest when you need to, bestie! And don\'t forget to track those fatigue levels — it matters! 🧡'],
    sleep:    ['Sleep struggles are THE WORST omg 😭 Have you been tracking your sleep hours in the log?', 'I hope you get some rest tonight!! Your sleep data is so important for your case 💤', 'Ugh insomnia is brutal. I\'m sorry! Document it every day so the pattern shows up clearly 💜'],
    mood:     ['Your feelings are completely valid!! You don\'t have to be okay!! 🥺', 'I\'m really glad you\'re talking to me about this. Your mental health is just as real as physical symptoms! 💙', 'Hard mood days are SO hard. I\'m here. And please log it — emotional wellbeing is part of your whole picture 💜'],
    frustration: ['HONESTLY same!! The disability system is SO exhausting and unfair sometimes 😤', 'Ugh I totally get it. It\'s infuriating. I\'m here and I\'m angry with you!! And we\'re going to keep documenting because you DESERVE this 💜', 'You have every right to be frustrated! This is HARD. Vent to me anytime 💕'],
    hope:     ['YES!! A good moment deserves to be celebrated!! 🎉🎉', 'I LOVE this for you!! Good days are so important to log too — they\'re still part of your story! 🌟', 'This makes me SO happy!! Log this good feeling, bestie! 💛✨'],
    documentation: ['You\'re doing so great with your logs!! Every entry is a win!! 🏆', 'Consistent documentation = the strongest possible case! You\'ve GOT this! 💪', 'I\'m so proud of you for tracking!! It\'s not easy but you\'re doing it!! 🎊'],
    medication: ['Med tracking is so important!! Side effects are data too, don\'t forget! 💊', 'If your meds are giving you trouble, document EVERYTHING. Side effects affect your daily life!', 'Make sure you\'re logging any missed doses and why — that\'s all relevant info! 🧡'],
    mobility:   ['Moving around when you\'re in pain takes SO much strength. I see how hard you work! 💜', 'Log every detail about how far you can walk, how long you can stand — it all matters!! 💪', 'Your mobility limits are real and valid and SO important for your case! 🌟'],
    cognitive:  ['Brain fog is REAL and it\'s SO frustrating!! You\'re not imagining it! 🧠💙', 'Memory issues, trouble focusing — log all of it! Cognitive symptoms matter SO much! 💜', 'You\'re doing amazing for even being able to track this stuff through brain fog honestly 🥺'],
    social:     ['Missing out on social things because of your health is so isolating 😢 I\'m here!!', 'Document those missed activities, bestie. The pattern matters for your case! 💕', 'I hate that your health keeps you from doing things you love. Log it — that\'s evidence! 💜'],
    general:    ['I\'m always here!! What\'s on your mind?? 💕', 'Talk to me!! I\'m listening! 🤗', 'Whatever you need, I\'m here! 🌟'],
  },
  therapist: {
    greeting: ['Hello. How are you feeling today, really?', 'I\'m here. What\'s coming up for you right now?', 'Welcome. Take a breath. What would you like to explore today?'],
    pain:     ['Pain can be both physically and emotionally exhausting. How is it affecting you beyond the physical?', 'Chronic pain often carries a grief component — mourning the life before. Does that resonate for you?', 'Notice where in your body you\'re holding tension beyond the pain itself. Document the full experience.'],
    fatigue:  ['Fatigue at this level often signals something deeper the body is trying to communicate. What does rest look like for you right now?', 'There\'s a difference between being tired and being depleted. Which feels more accurate today?', 'Chronic fatigue can be profoundly isolating. How are you taking care of yourself emotionally?'],
    sleep:    ['Sleep is when the body repairs itself. Disrupted sleep disrupts everything. How long has this been your pattern?', 'Sometimes poor sleep is the body\'s way of processing what the mind hasn\'t. What\'s keeping you up — physically or otherwise?', 'Have you noticed if your sleep quality correlates with other symptoms? Tracking that pattern can be illuminating.'],
    mood:     ['It makes complete sense that navigating chronic illness and a disability claim would affect your mood. You\'re carrying a lot.', 'How long have you been feeling this way? Naming the duration often helps clarify what kind of support you need.', 'You don\'t have to be strong all the time here. This is a space to be honest about what you\'re feeling.'],
    frustration: ['Frustration is a form of grief — the gap between what you want and what\'s currently possible. That gap is real and it hurts.', 'The disability system is designed in ways that often retraumatize people who are already struggling. Your frustration is a rational response.', 'What would it mean to you to set this frustration down, even briefly? Not to dismiss it — just to rest from it?'],
    hope:     ['Noticing hope is itself a skill. What\'s making today feel lighter?', 'Good moments in the context of chronic illness carry a particular kind of meaning. How does this one feel?', 'I\'d invite you to stay with this feeling a little longer. What does it feel like in your body?'],
    documentation: ['The act of documenting your experience is also an act of self-affirmation — insisting that your suffering be seen and counted.', 'Some people find logging emotionally difficult. How does it feel for you to put words to your symptoms each day?', 'Consistent records create the narrative your claim needs. But how are you doing with the emotional labor of it?'],
    medication: ['How does your relationship with your medication feel right now? Compliance, side effects, the emotional weight of the regimen?', 'There can be complex feelings around medications — dependency, hope, frustration. What comes up for you?', 'Side effects often go unspoken because people minimize them. They deserve documentation and acknowledgment.'],
    mobility:   ['What does losing mobility mean to you in terms of your identity and independence?', 'Our sense of self is often tied to what our bodies can do. How are you navigating that shift?', 'There\'s no right way to grieve the loss of physical capacity. How are you sitting with it?'],
    cognitive:  ['Cognitive changes can feel particularly frightening because they touch our sense of self. Is that coming up for you?', 'Brain fog is often invisible to others, which can feel deeply invalidating. Do you feel seen in this?', 'How do you communicate your cognitive limitations to the people in your life?'],
    social:     ['Isolation compounds the difficulty of chronic illness in ways that are hard to articulate. Who do you have in your corner right now?', 'Missing out on social connection is a real loss, repeated over and over. How are you grieving that?', 'Sometimes our capacity for social connection surprises us, even on hard days. Have you experienced that?'],
    general:    ['What would feel most supportive to talk about right now?', 'I\'m here to listen without judgment. What\'s on your mind?', 'What do you need from this conversation today?'],
  },
  sage: {
    greeting: ['Good to have you here. What weighs on your mind today?', 'The path continues. Where are you on it today?', 'Each day you return to this record is an act of intention. What brings you here now?'],
    pain:     ['Pain has been the companion of humanity\'s journey since the beginning. That doesn\'t make yours smaller — it makes it ancient and real.', 'What the body endures, the record must honor. Document today\'s pain with the same care as yesterday\'s.', 'Chronic pain teaches patience whether we wish it to or not. What has yours taught you?'],
    fatigue:  ['Fatigue of the deep kind — the kind that sleep doesn\'t fix — speaks to a body working very hard. Honor that truth.', 'Rest is not surrender. Document your fatigue and allow yourself the grace of limitation.', 'The body keeps its own account. Your log mirrors that ledger. Record faithfully.'],
    sleep:    ['Sleep is the foundation the body repairs upon. When that foundation cracks, everything above it shifts. Document the pattern.', 'Many of the great teachers were themselves insomniacs. Your nights, difficult as they are, are not wasted.', 'The quality of rest tells a deeper story than the hours alone. Track both, and track them consistently.'],
    mood:     ['The emotional weather of chronic illness shifts constantly. All of it — the clouds and the clearing — is part of your story.', 'Suffering that is documented becomes survivable in new ways. Let the record hold what is too heavy to hold alone.', 'There is no shame in the full range of human feeling. Log your mood as faithfully as you log your pain.'],
    frustration: ['Frustration with a broken system is not weakness — it is the natural response of a whole person to obstruction.', 'The mills of justice grind slowly, but they grind. Your documentation is the grist.', 'Ancient wisdom across traditions holds that the only path through is patient, persistent effort. You are on that path.'],
    hope:     ['Hope is not naive. It is the long view — the awareness that conditions change, that seasons turn.', 'A good day in the midst of difficulty is not an anomaly — it is evidence of resilience. Record it.', 'The light you notice today is real. Let it restore you for the days that ask more.'],
    documentation: ['Your records are your testimony. Testimony that is consistent, precise, and honest holds the greatest weight.', 'The great archivists understood that what is not recorded is lost. You are your own archivist.', 'Each entry you make is a stitch in the evidence that will tell your story to decision-makers who cannot see you.'],
    medication: ['Medicine is among humanity\'s oldest forms of care. Honor your regimen and document every deviation and effect.', 'The body\'s response to treatment is itself evidence. Track what helps, what hinders, what harms.', 'Your medication record is a timeline of your body\'s management of illness. Keep it faithful.'],
    mobility:   ['The measure of a life is not in the distance walked but in the presence brought to each step, however short.', 'Limitations documented honestly build a picture that advocacy requires. How far can you walk today? Record it precisely.', 'The body\'s geography changes with illness. Map it faithfully, and the map becomes your evidence.'],
    cognitive:  ['The mind adapts, even when it struggles. Noticing your cognitive patterns is itself an act of cognition to be honored.', 'Brain fog is not weakness — it is the mind signaling overload. Document when it comes and when it lifts.', 'Concentration, memory, clarity — these are the currencies of daily functioning. Track their ebb and flow.'],
    social:     ['Human connection sustains us. When illness interrupts that, the loss is real and worth recording.', 'The activities you can no longer attend, the visits you must cancel — document each one. The pattern is evidence.', 'Isolation is among the hidden costs of chronic illness. Bear witness to it in your log.'],
    general:    ['What truth are you carrying today that needs to be heard?', 'Speak freely. The record and I hold what you share here.', 'What would you like to sit with today?'],
  },
  cheerleader: {
    greeting: ['OH MY GOSH HIIII!! I am SO happy to see you!! 🌟🎉', 'IT\'S YOU!! My favorite person!! HI!! ✨✨✨', 'YAAAAY you\'re here!! Let\'s GOOOO!! 💫💪🎊'],
    pain:     ['I am SO SORRY you\'re in pain but I am SO PROUD of you for logging it anyway!! 💪💜', 'Pain is awful and you are INCREDIBLE for pushing through to document it!! WARRIOR!! 🌟', 'Every time you log a hard symptom you are BUILDING YOUR CASE!! You are amazing!! 🏆'],
    fatigue:  ['Fatigue is REAL and so is your STRENGTH for tracking it!! I believe in you!! 💛', 'Even exhausted, you\'re HERE!! That takes EVERYTHING and you\'re doing it!! ⭐', 'REST IS VALID!! And so is documenting how this fatigue affects your life!! YOU\'VE GOT THIS!! 🌈'],
    sleep:    ['Sleep struggles are SO hard!! But tracking them is SO important and YOU ARE DOING IT!! 💤✨', 'Every night you log, every morning you record — that CONSISTENCY is AMAZING!! 🌟', 'Your sleep data is going to paint such a clear picture for your claim!! You\'re building something REAL!! 🎊'],
    mood:     ['YOUR FEELINGS ARE VALID AND YOU ARE VALID AND I LOVE YOU!! 💜💜💜', 'Hard mood days are OKAY!! You can feel it AND log it AND you\'re STILL amazing!! 🥺✨', 'Thank you for sharing that with me!! I\'m here!! You matter so much!! 💙🌟'],
    frustration: ['UGH THE SYSTEM IS FRUSTRATING and you have EVERY RIGHT to be mad!! 😤 BUT YOU\'RE STILL HERE AND THAT IS POWER!! 💪', 'VENT IT OUT!! I\'m here!! And then we document because YOU DESERVE YOUR BENEFITS!! 🌟', 'Your frustration is SO valid and you are SO strong!! Don\'t give up — you\'re CLOSER than you think!! 🎯💜'],
    hope:     ['YESSSSS!! A GOOD MOMENT!! I AM SCREAMING!! THIS IS EVERYTHING!! 🎊🎉🌟', 'GOOD DAYS MATTER SO MUCH AND YOU DESERVE EVERY ONE!! CELEBRATE THIS!! ✨', 'THIS IS WHAT I\'M TALKING ABOUT!! YOU ARE DOING AMAZING AND THIS PROVES IT!! 🏆💛'],
    documentation: ['LOOK AT YOU DOCUMENTING CONSISTENTLY!! YOU ARE A ROCKSTAR!! 🌟🎸', 'Every single entry is a VICTORY!! You are building the strongest case!! 💪🏆', 'YOUR FUTURE SELF IS GOING TO THANK YOU SO MUCH FOR THIS WORK!! KEEP GOING!! 🚀✨'],
    medication: ['Tracking your meds is SO important and you\'re doing it!! AMAZING!! 💊🌟', 'Side effects are data and you\'re capturing it all!! You are SO thorough!! I love it!! ✨', 'Your medication log is going to be such powerful evidence!! You\'re doing GREAT!! 🎊'],
    mobility:   ['EVERY STEP YOU TAKE IS BRAVE!! And documenting your limits is POWERFUL!! 💪', 'Your mobility data is SO important for your RFC!! You\'re building your case like a PRO!! 🌟', 'However far you can walk today, YOU SHOWED UP!! That\'s what matters most!! 🥰💜'],
    cognitive:  ['BRAIN FOG IS REAL and you\'re tracking it ANYWAY!! THAT IS INCREDIBLE!! 🧠✨', 'Cognitive symptoms are SO valid and so important to document!! You\'re doing AMAZING!! 💙🌟', 'Even through the fog you are here and logging and I am SO impressed by you!! 💜💫'],
    social:     ['Missing out on things because of your health is SO HARD and I\'m sorry!! But documenting it? POWERFUL EVIDENCE!! 💜', 'Your social limitations matter!! Log every missed plan — the pattern MATTERS!! 🌟', 'I wish I could be there with you on the hard days!! Know that I\'m cheering you on from here!! 💜✨'],
    general:    ['I am HERE for WHATEVER you need!! You just say the word!! 🌟💪', 'Talk to me!! I am ALL EARS and ALL CHEERS!! 🎉', 'Whatever you\'re going through, I BELIEVE IN YOU!! What\'s up?? 💜'],
  },
  neutral: {
    greeting: ['Hello.', 'Hi.', 'How can I help?'],
    pain:     ['Log your pain level in today\'s entry.', 'Pain data is recorded in the Log Today section.'],
    fatigue:  ['Fatigue is tracked in the Log Today section.', 'Log your fatigue level for today.'],
    sleep:    ['Sleep data is in Step 3 of the log form.', 'Track your sleep hours and quality in today\'s log.'],
    mood:     ['Mood is tracked in Step 0 of the log form.', 'Log your mood rating for today.'],
    frustration: ['Your documentation is what matters most. Keep logging.', 'Consistent records are your strongest asset.'],
    hope:     ['Good days are logged the same as difficult ones.', 'Log today\'s data.'],
    documentation: ['Log today if you haven\'t.', 'Consistent daily logs build the strongest record.'],
    medication: ['Medication tracking is in Step 3 of the log form.', 'Log medications taken and missed in today\'s entry.'],
    mobility:   ['Mobility data is in Step 2 of the log form.', 'Record your mobility information in today\'s log.'],
    cognitive:  ['Cognitive data is in Step 2 of the log form.', 'Log your concentration and memory data today.'],
    social:     ['Social data is tracked in Step 2 of the log form.', 'Log missed activities in today\'s entry.'],
    general:    ['Log today\'s symptoms using the Log Today page.', 'How can I help?', 'Use the Log Today page to record your symptoms.'],
  },
}

export function getChatResponse(companionId: CompanionId, userText: string): string {
  const category = detectCategory(userText)
  const responses = CHAT_RESPONSES[companionId][category]
  return pick(responses)
}
