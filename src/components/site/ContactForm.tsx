'use client'

import { useActionState, useEffect, useState } from 'react'

import { sendContact, type ContactState } from '@/app/(frontend)/[lang]/actions'
import type { Dictionary, Locale } from '@/i18n'

import { PRESELECT_EVENT } from './PreselectLink'

type Who = 'player' | 'family' | 'club' | 'brand' | 'partner'

export function ContactForm({ lang, t, positions }: { lang: Locale; t: Dictionary['contact']; positions: [string, string][] }) {
  const [who, setWho] = useState<Who>('player')
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, { status: 'idle' })
  const show = (...types: Who[]) => types.includes(who)

  // "?who=club" in the address, or a call-to-action click, picks the option
  useEffect(() => {
    const valid = (v: unknown): v is Who => typeof v === 'string' && v in t.types
    const fromUrl = new URLSearchParams(window.location.search).get('who')
    if (valid(fromUrl)) setWho(fromUrl)
    const onPick = (e: Event) => {
      const v = (e as CustomEvent).detail
      if (valid(v)) setWho(v)
    }
    window.addEventListener(PRESELECT_EVENT, onPick)
    return () => window.removeEventListener(PRESELECT_EVENT, onPick)
  }, [t.types])

  if (state.status === 'sent') {
    return (
      <p className="sent" role="status">
        {t.sent}
      </p>
    )
  }

  return (
    <form action={action} noValidate={false}>
      <input type="hidden" name="lang" value={lang} />
      <div className="hp" aria-hidden="true">
        <label htmlFor="company_website">Leave empty</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <fieldset>
        <legend>{t.who}</legend>
        <div className="who">
          {(Object.keys(t.types) as Who[]).map((k) => (
            <label key={k}>
              <input type="radio" name="who" id={`who-${k}`} value={k} checked={who === k} onChange={() => setWho(k)} />
              <span>{t.types[k]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="fields">
        <div className="field">
          <label htmlFor="f-name">{t.name}</label>
          <input id="f-name" name="name" required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="f-email">{t.email}</label>
          <input id="f-email" name="email" type="email" required autoComplete="email" />
        </div>
        {show('player', 'family') ? (
          <>
            <div className="field">
              <label htmlFor="f-pos">{t.position}</label>
              <select id="f-pos" name="position" defaultValue="">
                <option value="">–</option>
                {positions.map(([v, l]) => (
                  <option key={v} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-club">{t.currentClub}</label>
              <input id="f-club" name="currentClub" />
            </div>
          </>
        ) : null}
        {show('club') ? (
          <>
            <div className="field">
              <label htmlFor="f-org">{t.club}</label>
              <input id="f-org" name="organisation" autoComplete="organization" />
            </div>
            <div className="field">
              <label htmlFor="f-role">{t.role}</label>
              <input id="f-role" name="role" autoComplete="organization-title" />
            </div>
          </>
        ) : null}
        {show('brand', 'partner') ? (
          <>
            <div className="field">
              <label htmlFor="f-co">{t.company}</label>
              <input id="f-co" name="organisation" autoComplete="organization" />
            </div>
            <div className="field">
              <label htmlFor="f-web">{t.website}</label>
              <input id="f-web" name="website" type="url" autoComplete="url" />
            </div>
          </>
        ) : null}
        <div className="field full">
          <label htmlFor="f-msg">{t.message}</label>
          <textarea id="f-msg" name="message" required />
        </div>
      </div>
      {state.status === 'invalid' ? <p className="form-error" role="alert">{t.required}</p> : null}
      {state.status === 'error' ? <p className="form-error" role="alert">{t.error}</p> : null}
      <div className="form-foot">
        <small>{t.privacy}</small>
        <button className="btn dark" type="submit" disabled={pending}>
          {pending ? t.sending : t.send}
        </button>
      </div>
    </form>
  )
}
