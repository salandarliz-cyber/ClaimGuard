"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Trash2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getSettings } from "@/lib/storage"
import { getCompanion, getChatResponse, getDailyOpening } from "@/lib/companions"
import { getChatMessages, addChatMessage, clearChatMessages, createMessage } from "@/lib/chat-storage"
import { getEntries } from "@/lib/storage"
import type { ChatMessage, CompanionId } from "@/types"

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch {
    return ""
  }
}

export default function ChatPage() {
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [companionId, setCompanionId] = useState<CompanionId>("neutral")
  const [userName, setUserName] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMounted(true)
    const settings = getSettings()
    setCompanionId(settings.companionId ?? "neutral")
    setUserName(settings.userName ?? "")
    const stored = getChatMessages()
    if (stored.length === 0) {
      // Inject opening reflection as first message
      const entries = getEntries()
      const opening = getDailyOpening(settings.companionId ?? "neutral", settings.userName ?? "", entries)
      if (opening) {
        const openingMsg = createMessage("companion", opening)
        addChatMessage(openingMsg)
        setMessages([openingMsg])
      }
    } else {
      setMessages(stored)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const companion = getCompanion(companionId)

  function handleSend() {
    const text = input.trim()
    if (!text || companionId === "neutral") return

    const userMsg = createMessage("user", text)
    const updated = addChatMessage(userMsg)
    setMessages(updated)
    setInput("")
    setIsTyping(true)

    // Simulate a short typing delay
    const delay = 600 + Math.random() * 800
    setTimeout(() => {
      const responseText = getChatResponse(companionId, text)
      const companionMsg = createMessage("companion", responseText)
      const final = addChatMessage(companionMsg)
      setMessages(final)
      setIsTyping(false)
    }, delay)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleClear() {
    clearChatMessages()
    setMessages([])
    setShowClearConfirm(false)
    // Re-inject opening
    const settings = getSettings()
    const entries = getEntries()
    const opening = getDailyOpening(settings.companionId ?? "neutral", settings.userName ?? "", entries)
    if (opening) {
      const openingMsg = createMessage("companion", opening)
      addChatMessage(openingMsg)
      setMessages([openingMsg])
    }
  }

  if (!mounted) {
    return (
      <div className="flex flex-col h-screen bg-[#F1F7FA] pb-20">
        <div className="h-14 bg-[#FFFFFF] border-b border-[#C8D8E0]" />
        <div className="flex-1" />
      </div>
    )
  }

  if (companionId === "neutral") {
    return (
      <div className="flex flex-col h-screen bg-[#F1F7FA] pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#FFFFFF] border-b border-[#C8D8E0]">
          <MessageCircle className="w-5 h-5 text-[#7B95A8]" />
          <span className="font-semibold text-[#13293D]">Companion Chat</span>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-6xl">📋</p>
            <h2 className="text-lg font-semibold text-[#13293D]">No Companion Selected</h2>
            <p className="text-sm text-[#7B95A8] leading-relaxed">
              You chose "No Companion" mode, so chat is disabled. If you'd like a companion, update your settings in the History page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#F1F7FA] pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#FFFFFF] border-b border-[#C8D8E0] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xl ${companion.avatarBg}`}>
            {companion.emoji}
          </div>
          <div>
            <p className="font-semibold text-[#13293D] text-sm leading-tight">{companion.name}</p>
            <p className="text-xs text-[#9CB3C2]">{companion.tagline}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#9CB3C2] hover:text-red-600 h-8 w-8 p-0"
          onClick={() => setShowClearConfirm(true)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Clear confirm overlay */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#13293D]/50 z-50 flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#EAF2F6] border border-[#C8D8E0] rounded-2xl p-6 w-full max-w-sm space-y-4"
            >
              <h3 className="font-semibold text-[#13293D]">Clear Chat History?</h3>
              <p className="text-sm text-[#7B95A8]">This will delete all messages and start fresh with a new opening reflection. This cannot be undone.</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-[#C8D8E0] text-[#475A72]"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-500 text-white"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
            >
              {msg.role === "companion" && (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 mt-1 ${companion.avatarBg}`}
                >
                  {companion.emoji}
                </div>
              )}
              <div className={`max-w-[78%] space-y-1 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#1E7F94] text-white rounded-tr-sm"
                      : "bg-[#EAF2F6] text-[#13293D] rounded-tl-sm"
                  }`}
                  style={
                    msg.role === "companion"
                      ? { borderLeft: `3px solid ${companion.accentHex}` }
                      : undefined
                  }
                >
                  {msg.text}
                </div>
                <span className="text-xs text-[#9CB3C2] px-1">{formatTime(msg.timestamp)}</span>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-[#1E7F94]/15 flex items-center justify-center text-base flex-shrink-0 mt-1">
                  👤
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${companion.avatarBg}`}
              >
                {companion.emoji}
              </div>
              <div
                className="bg-[#EAF2F6] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1"
                style={{ borderLeft: `3px solid ${companion.accentHex}` }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#7B95A8] block"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-[#F1F7FA] border-t border-[#C8D8E0]">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${companion.name}…`}
            className="flex-1 resize-none bg-[#EAF2F6] border-[#C8D8E0] text-[#13293D] placeholder:text-[#9CB3C2] rounded-xl min-h-[44px] max-h-32 text-sm focus-visible:ring-[#1E7F94]"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            size="sm"
            className="h-11 w-11 p-0 rounded-xl"
            style={{ backgroundColor: companion.accentHex }}
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
        <p className="text-xs text-[#9CB3C2] mt-1.5 text-center">
          Responses are scripted — not real AI. Private to your device.
        </p>
      </div>
    </div>
  )
}
