"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Plus, Calendar, FileText, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSettings } from "@/lib/storage"
import { getCompanion } from "@/lib/companions"
import { useEffect, useState } from "react"
import type { CompanionId } from "@/types"

const NAV_ITEMS = [
  { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { href: "/history",   icon: Calendar,       label: "History" },
  { href: "/log",       icon: Plus,           label: "Log Today", primary: true },
  { href: "/chat",      icon: MessageCircle,  label: "Chat" },
  { href: "/reports",   icon: FileText,       label: "Reports" },
]

export function NavBar() {
  const pathname = usePathname()
  const [companionId, setCompanionId] = useState<CompanionId>("neutral")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const settings = getSettings()
    setCompanionId(settings.companionId ?? "neutral")
  }, [])

  const companion = getCompanion(companionId)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t pb-safe"
      style={{
        backgroundColor: 'var(--so-card)',
        borderColor: 'var(--so-border)',
        boxShadow: '0 -2px 16px rgba(30,127,148,0.08)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-1 h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label, primary }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href))

          if (primary) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 flex-1"
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                    isActive ? "scale-105" : "hover:scale-105 active:scale-95"
                  )}
                  style={{
                    backgroundColor: isActive ? 'var(--so-primary-dk)' : 'var(--so-primary)',
                    boxShadow: isActive
                      ? '0 4px 16px rgba(30,127,148,0.45)'
                      : '0 2px 8px rgba(30,127,148,0.25)',
                  }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </Link>
            )
          }

          // Chat tab — show companion emoji when companion is set
          if (href === "/chat" && mounted && companionId !== "neutral") {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 flex-1 py-2"
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all", isActive ? "scale-110" : "")}>
                  <span>{companion.emoji}</span>
                </div>
                <span
                  className="text-xs transition-colors font-medium"
                  style={{ color: isActive ? 'var(--so-primary)' : 'var(--so-text-hint)' }}
                >
                  {label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 flex-1 py-2"
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className="w-6 h-6 transition-colors"
                style={{ color: isActive ? 'var(--so-primary)' : 'var(--so-text-hint)' }}
              />
              <span
                className="text-xs transition-colors"
                style={{
                  color: isActive ? 'var(--so-primary)' : 'var(--so-text-hint)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
