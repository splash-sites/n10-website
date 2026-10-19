'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Photo } from './Photo'

export type WallPlayer = { id: number; surname: string; name: string; number: number; club: string; href: string; photo: string | null; seed: number }

// The hero: every surname in the roster. Hovering (or focusing) a name moves
// the photo next to it; clicking opens the profile.
export function RosterWall({ players, initial }: { players: WallPlayer[]; initial: number }) {
  const wallRef = useRef<HTMLDivElement>(null)
  const floatRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(initial)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)

  const place = useCallback((idx: number) => {
    const wall = wallRef.current
    const fl = floatRef.current
    const btn = wall?.querySelector<HTMLElement>(`[data-idx="${idx}"]`)
    if (!wall || !fl || !btn) return
    const wr = wall.getBoundingClientRect()
    const br = btn.getBoundingClientRect()
    const w = fl.offsetWidth
    const h = fl.offsetHeight
    let left = br.left - wr.left + br.width * 0.6
    if (left + w > wr.width) left = Math.max(0, br.left - wr.left - w * 0.6)
    setPos({ left, top: Math.max(0, br.top - wr.top - h * 0.35) })
  }, [])

  useEffect(() => {
    place(active)
    const onResize = () => place(active)
    window.addEventListener('resize', onResize)
    document.fonts?.ready.then(() => place(active))
    return () => window.removeEventListener('resize', onResize)
  }, [active, place])

  const p = players[active]

  return (
    <div className="wall-names" ref={wallRef}>
      <h1 className="names" aria-label="Numéro 10">
        {players.map((pl, i) => (
          <Link
            key={pl.id}
            href={pl.href}
            data-idx={i}
            className={i === active ? 'on' : undefined}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            aria-label={`${pl.name}, ${pl.club}`}
          >
            {pl.surname}
            <sup>{pl.number}</sup>
          </Link>
        ))}
      </h1>
      {p ? (
        <div ref={floatRef} className="float" style={pos ? { left: pos.left, top: pos.top } : { visibility: 'hidden' }}>
          <Photo src={p.photo} seed={p.seed} sizes="320px" priority>
            <span className="cap">
              {p.name}, {p.club}
            </span>
          </Photo>
        </div>
      ) : null}
    </div>
  )
}
