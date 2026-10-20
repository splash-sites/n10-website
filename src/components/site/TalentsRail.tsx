'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { PositionGroup } from '@/lib/positions'

import { Photo } from './Photo'
import type { TalentRow } from './Talents'

type Labels = { all: string; prev: string; next: string; groups: Record<PositionGroup, string> }

const GROUPS: PositionGroup[] = ['GK', 'DEF', 'MID', 'FWD']

// Horizontal rail of large player cards: arrows, mouse drag, snap and a
// progress bar. Touch devices scroll it natively.
export function TalentsRail({ players, t }: { players: TalentRow[]; t: Labels }) {
  const [filter, setFilter] = useState<'ALL' | PositionGroup>('ALL')
  const [progress, setProgress] = useState(0.2)
  const rail = useRef<HTMLDivElement>(null)
  const drag = useRef({ down: false, x: 0, left: 0, moved: false })
  const list = players.filter((p) => filter === 'ALL' || p.group === filter)

  const update = useCallback(() => {
    const el = rail.current
    if (!el) return
    const visible = el.clientWidth / el.scrollWidth
    const max = el.scrollWidth - el.clientWidth
    setProgress(max > 0 ? visible + (1 - visible) * (el.scrollLeft / max) : 1)
  }, [])

  useEffect(() => {
    rail.current?.scrollTo({ left: 0 })
    update()
  }, [filter, update])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current
      if (!d.down || !rail.current) return
      const dx = e.clientX - d.x
      if (Math.abs(dx) > 4) d.moved = true
      rail.current.scrollLeft = d.left - dx
    }
    const up = () => {
      drag.current.down = false
      rail.current?.classList.remove('drag')
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('resize', update)
    }
  }, [update])

  const step = (dir: 1 | -1) => {
    const card = rail.current?.querySelector<HTMLElement>('.tcard')
    rail.current?.scrollBy({ left: dir * ((card?.offsetWidth ?? 300) + 14) * 2, behavior: 'smooth' })
  }

  return (
    <>
      <div className="rail-bar">
        <div className="chips pill" role="group" aria-label="Filter by position">
          {(['ALL', ...GROUPS] as const).map((g) => (
            <button key={g} type="button" aria-pressed={filter === g} onClick={() => setFilter(g)}>
              {g === 'ALL' ? `${t.all} ${players.length}` : t.groups[g]}
            </button>
          ))}
        </div>
        <div className="rail-ctrl">
          <button className="circle" type="button" onClick={() => step(-1)} aria-label={t.prev}>
            ‹
          </button>
          <button className="circle" type="button" onClick={() => step(1)} aria-label={t.next}>
            ›
          </button>
        </div>
      </div>
      <div
        ref={rail}
        className="rail"
        tabIndex={0}
        onScroll={update}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse' || !rail.current) return
          drag.current = { down: true, x: e.clientX, left: rail.current.scrollLeft, moved: false }
          rail.current.classList.add('drag')
        }}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault()
            drag.current.moved = false
          }
        }}
      >
        {list.map((p) => (
          <Link key={p.id} href={p.href} className="tcard" draggable={false}>
            <Photo src={p.card} seed={p.seed} sizes="(max-width: 820px) 70vw, 24vw">
              <span className="n">{p.number}</span>
              <span className="go" aria-hidden="true">
                ↗
              </span>
              <span className="info">
                <span className="nm">{p.name}</span>
                <span className="mt">
                  <span>
                    {p.position}, {p.club}
                  </span>
                  <span>{p.age}</span>
                </span>
              </span>
            </Photo>
          </Link>
        ))}
      </div>
      <div className="progress" aria-hidden="true">
        <i style={{ width: `${Math.min(1, progress) * 100}%` }} />
      </div>
    </>
  )
}
