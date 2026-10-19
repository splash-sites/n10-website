'use client'

import { useRef, useState, type ReactNode } from 'react'

import { tone } from '@/lib/tone'

type Shown = { x: number; y: number; src: string | null; seed: number }

const W = 220
const H = (W * 4) / 3

// Shows a photo next to the cursor while it is over an element carrying
// data-photo (image URL, may be empty) and data-seed (placeholder tone).
export function HoverPhotoArea({ children, className }: { children: ReactNode; className?: string }) {
  const [shown, setShown] = useState<Shown | null>(null)
  const last = useRef<Element | null>(null)

  return (
    <div
      className={className}
      onMouseMove={(e) => {
        const el = (e.target as HTMLElement).closest('[data-seed]')
        if (!el) {
          last.current = null
          setShown(null)
          return
        }
        last.current = el
        let x = e.clientX + 28
        if (x + W > window.innerWidth - 16) x = e.clientX - W - 28
        const y = Math.min(window.innerHeight - H - 16, Math.max(16, e.clientY - H / 2))
        setShown({ x, y, src: el.getAttribute('data-photo') || null, seed: Number(el.getAttribute('data-seed')) })
      }}
      onMouseLeave={() => setShown(null)}
    >
      {children}
      <div
        aria-hidden="true"
        className={`photo hover-photo${shown ? ' show' : ''}`}
        style={shown ? { ...tone(shown.seed), left: shown.x, top: shown.y } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {shown?.src ? <img src={shown.src} alt="" className="photo-img" /> : null}
      </div>
    </div>
  )
}
