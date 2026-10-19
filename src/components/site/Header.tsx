'use client'

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { locales, type Dictionary, type Locale } from '@/i18n'

export function Header({ lang, t }: { lang: Locale; t: Dictionary['nav'] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname() || `/${lang}`
  const rest = pathname.split('/').slice(2).join('/')
  const base = `/${lang}`

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const links = [
    ['talents', t.talents],
    ['services', t.services],
    ['team', t.team],
    ['journal', t.journal],
    ['contact', t.contact],
  ] as const

  const langSwitch = (
    <div className="lang" role="group" aria-label="Language">
      {locales.map((l) => (
        <Link key={l} href={`/${l}${rest ? `/${rest}` : ''}`} aria-current={l === lang ? 'true' : undefined} hrefLang={l} lang={l}>
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  )

  return (
    <>
      <header className="head pad">
        <div className="wrap row">
          <Link href={base} aria-label={`Numéro 10, ${t.home}`}>
            <img className="logo" src="/n10-logo.png" alt="Numéro 10" width={86} height={37} />
          </Link>
          <nav aria-label="Main">
            {links.map(([id, label]) => (
              <Link key={id} href={id === 'journal' ? `${base}/journal` : `${base}#${id}`}>
                {label}
              </Link>
            ))}
          </nav>
          {langSwitch}
          <button className="menu-btn" type="button" onClick={() => setOpen(true)} aria-expanded={open}>
            {t.menu}
          </button>
        </div>
      </header>
      {open ? (
        <div className="mnav" role="dialog" aria-modal="true" aria-label={t.menu}>
          <button className="close" type="button" onClick={() => setOpen(false)}>
            {t.close}
          </button>
          {links.map(([id, label]) => (
            <Link key={id} href={id === 'journal' ? `${base}/journal` : `${base}#${id}`} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          {langSwitch}
        </div>
      ) : null}
    </>
  )
}
