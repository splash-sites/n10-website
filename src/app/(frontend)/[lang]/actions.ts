'use server'

import { headers } from 'next/headers'

import { isLocale } from '@/i18n'
import { payload } from '@/lib/data'

export type ContactState = { status: 'idle' | 'sent' | 'invalid' | 'error' }

const TYPES = ['player', 'family', 'club', 'brand', 'partner'] as const
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Very small per-process rate limit: 5 messages per IP per 10 minutes.
const hits = new Map<string, number[]>()
const limited = (ip: string) => {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > 5
}

export async function sendContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const get = (k: string) => String(form.get(k) ?? '').trim().slice(0, 4000)

  // Hidden field that people never fill in; bots usually do.
  if (get('company_website')) return { status: 'sent' }

  const senderType = get('who') as (typeof TYPES)[number]
  const name = get('name')
  const email = get('email')
  const message = get('message')
  if (!TYPES.includes(senderType) || !name || !EMAIL.test(email) || !message) return { status: 'invalid' }

  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || 'local'
  if (limited(ip)) return { status: 'error' }

  const lang = get('lang')
  try {
    const p = await payload()
    await p.create({
      collection: 'messages',
      overrideAccess: true,
      data: {
        senderType,
        name,
        email,
        message,
        organisation: get('organisation') || undefined,
        role: get('role') || undefined,
        website: get('website') || undefined,
        position: get('position') || undefined,
        currentClub: get('currentClub') || undefined,
        locale: isLocale(lang) ? lang : 'en',
        status: 'new',
      },
    })
    return { status: 'sent' }
  } catch (err) {
    console.error('Contact form failed', err)
    return { status: 'error' }
  }
}
