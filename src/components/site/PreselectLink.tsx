'use client'

import type { ReactNode } from 'react'

export const PRESELECT_EVENT = 'n10:who'

// Link to the contact form that also picks the "I am" option.
export function PreselectLink({ who, className, children }: { who: string; className?: string; children: ReactNode }) {
  return (
    <a
      href="#contact"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(PRESELECT_EVENT, { detail: who }))}
    >
      {children}
    </a>
  )
}
