import type { ChatMessage } from '@/types'

const CHAT_KEY = 'claimguard_chat_messages'
const MAX_MESSAGES = 200

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getChatMessages(): ChatMessage[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem(CHAT_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ChatMessage[]
  } catch {
    return []
  }
}

export function saveChatMessages(messages: ChatMessage[]): void {
  if (!isClient()) return
  // Keep only the most recent MAX_MESSAGES
  const trimmed = messages.slice(-MAX_MESSAGES)
  localStorage.setItem(CHAT_KEY, JSON.stringify(trimmed))
}

export function addChatMessage(message: ChatMessage): ChatMessage[] {
  const messages = getChatMessages()
  const updated = [...messages, message]
  saveChatMessages(updated)
  return updated
}

export function clearChatMessages(): void {
  if (!isClient()) return
  localStorage.removeItem(CHAT_KEY)
}

export function createMessage(role: 'user' | 'companion', text: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    timestamp: new Date().toISOString(),
  }
}
