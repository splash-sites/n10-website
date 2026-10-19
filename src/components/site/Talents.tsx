'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { PositionGroup } from '@/lib/positions'

import { HoverPhotoArea } from './HoverPhotoArea'
import { Photo } from './Photo'

export type TalentRow = {
  id: number
  name: string
  number: number
  group: PositionGroup
  position: string
  club: string
  nat: string
  age: number
  href: string
  thumb: string | null
  card: string | null
  seed: number
}

type Labels = { all: string; list: string; photos: string; empty: string; groups: Record<PositionGroup, string> }

const GROUPS: PositionGroup[] = ['GK', 'DEF', 'MID', 'FWD']

export function Talents({ players, t }: { players: TalentRow[]; t: Labels }) {
  const [filter, setFilter] = useState<'ALL' | PositionGroup>('ALL')
  const [view, setView] = useState<'rows' | 'grid'>('rows')
  const list = players.filter((p) => filter === 'ALL' || p.group === filter)

  return (
    <>
      <div className="controls">
        <div className="chips" role="group" aria-label="Filter by position">
          {(['ALL', ...GROUPS] as const).map((g) => (
            <button key={g} type="button" aria-pressed={filter === g} onClick={() => setFilter(g)}>
              {g === 'ALL' ? t.all : t.groups[g]}
              <span>{g === 'ALL' ? players.length : players.filter((p) => p.group === g).length}</span>
            </button>
          ))}
        </div>
        <div className="views" role="group" aria-label="View">
          <button type="button" aria-pressed={view === 'rows'} onClick={() => setView('rows')}>
            {t.list}
          </button>
          <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
            {t.photos}
          </button>
        </div>
      </div>

      {list.length === 0 ? <p className="lede">{t.empty}</p> : null}

      {view === 'rows' ? (
        <HoverPhotoArea className="rows">
          {list.map((p) => (
            <Link key={p.id} href={p.href} className="rowp" data-seed={p.seed} data-photo={p.card ?? ''}>
              <span className="no">{p.number}</span>
              <span className="nm">{p.name}</span>
              <span className="c pos">{p.position}</span>
              <span className="c">{p.club}</span>
              <span className="c">{p.nat}</span>
              <span className="r">{p.age}</span>
              <Photo src={p.thumb} seed={p.seed} sizes="60px" className="thumb" />
            </Link>
          ))}
        </HoverPhotoArea>
      ) : (
        <div className="grid">
          {list.map((p) => (
            <Link key={p.id} href={p.href} className="card">
              <Photo src={p.card} seed={p.seed} sizes="(max-width: 820px) 50vw, 20vw">
                <span className="n">{p.number}</span>
              </Photo>
              <p className="nm">{p.name}</p>
              <p className="mt">
                {p.position}, {p.club}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
