'use client'

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { locales, type Dictionary, type Locale } from '@/i18n'

type Props = { lang: Locale; t: Dictionary['nav']; l: Dictionary['landing'] }

// Glass header that turns solid once the page scrolls.
export function Header({ lang, t, l }: Props) {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const pathname = usePathname() || `/${lang}`
  const rest = pathname.split('/').slice(2).join('/')
  const base = `/${lang}`

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const links: [string, string][] = [
    [`${base}/talents`, t.talents],
    [`${base}#services`, t.services],
    [`${base}#process`, l.howWeWork],
    [`${base}#team`, t.team],
    [`${base}/journal`, t.journal],
  ]

  const langSwitch = (
    <div className="lang" role="group" aria-label="Language">
      {locales.map((code) => (
        <Link key={code} href={`/${code}${rest ? `/${rest}` : ''}`} aria-current={code === lang ? 'true' : undefined} hrefLang={code} lang={code}>
          {code.toUpperCase()}
        </Link>
      ))}
    </div>
  )

  return (
    <>
      <header className={`head pad${solid || rest ? ' solid' : ''}`}>
        <div className="wrap row">
          <Link href={base} aria-label={`Numéro 10, ${t.home}`}>
            <img className="logo" src="/n10-logo.png" alt="Numéro 10" width={86} height={37} />
          </Link>
          <nav aria-label="Main">
            {links.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          {langSwitch}
          <Link className="btn btn-sm head-cta" href={`${base}#contact`}>
            <span className="dot" />
            {l.contactUs}
          </Link>
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
          {[...links, [`${base}#contact`, t.contact] as [string, string]].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          {langSwitch}
        </div>
      ) : null}
    </>
  )
}
