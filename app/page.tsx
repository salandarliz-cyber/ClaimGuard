"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSettings } from '@/lib/storage'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const settings = getSettings()
    if (settings.onboardingComplete) {
      router.replace('/dashboard')
    } else {
      router.replace('/onboarding')
    }
  }, [router])

  return (
    <div className="min-h-screen so-bg flex items-center justify-center">
      <div className="text-7xl animate-pulse select-none">🛡️</div>
    </div>
  )
}
