'use client'

import { useEffect, useState } from 'react'
import { Moon, SunMedium } from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'light' | 'dark'

function resolveInitialMode(): Mode {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem('bakaloo-ui-mode')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function HeaderThemeToggle() {
  const [mode, setMode] = useState<Mode>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const initial = resolveInitialMode()
    setMode(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
    setMounted(true)
  }, [])

  const toggle = () => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    window.localStorage.setItem('bakaloo-ui-mode', next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(17,24,39,0.08)] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(75,0,130,0.18)]"
      aria-label={mounted && mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <SunMedium
        className={cn(
          'absolute h-[18px] w-[18px] text-[#D9911D] transition-all duration-300',
          mounted && mode === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
        )}
      />
      <Moon
        className={cn(
          'absolute h-[18px] w-[18px] text-[color:var(--shop-primary)] transition-all duration-300',
          mounted && mode === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0',
        )}
      />
    </button>
  )
}
