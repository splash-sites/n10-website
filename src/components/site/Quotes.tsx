'use client'

import { useState } from 'react'

import { Photo } from './Photo'

export type QuoteItem = { quote: string; name: string; role?: string | null; photo: string | null; seed: number }

export function Quotes({ items, eyebrow, label }: { items: QuoteItem[]; eyebrow: string; label: string }) {
  const [i, setI] = useState(0)
  const q = items[i]
  if (!q) return null
  return (
    <div className="wrap quote">
      <Photo src={q.photo} alt={q.name} seed={q.seed} sizes="(max-width: 820px) 100vw, 40vw" className="reveal" />
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <blockquote aria-live="polite">{q.quote}</blockquote>
        <p className="who">
          <b>{q.name}</b>
          {q.role ? <small>{q.role}</small> : null}
        </p>
        {items.length > 1 ? (
          <div className="dots" role="group" aria-label={eyebrow}>
            {items.map((_, k) => (
              <button key={k} type="button" aria-label={`${label} ${k + 1}`} aria-pressed={k === i} onClick={() => setI(k)} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
