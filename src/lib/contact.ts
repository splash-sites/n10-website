// Contact-form rules, kept free of Next.js and Payload so they can be tested.

export const SENDER_TYPES = ['player', 'family', 'club', 'brand', 'partner'] as const
export type SenderType = (typeof SENDER_TYPES)[number]

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX = { name: 120, email: 254, message: 4000, short: 200 }

export type ContactInput = {
  senderType: SenderType
  name: string
  email: string
  message: string
  organisation?: string
  role?: string
  website?: string
  position?: string
  currentClub?: string
  locale: string
}

export type ContactCheck = { kind: 'spam' } | { kind: 'invalid' } | { kind: 'ok'; data: ContactInput }

type Source = { get(name: string): unknown }

export function validateContact(form: Source, locales: readonly string[] = ['en', 'fr', 'nl']): ContactCheck {
  const text = (k: string, max: number) => String(form.get(k) ?? '').trim().slice(0, max)

  // Hidden field people never fill in; bots usually do
  if (text('company_website', MAX.short)) return { kind: 'spam' }

  const senderType = text('who', MAX.short) as SenderType
  const name = text('name', MAX.name)
  const email = text('email', MAX.email)
  const message = text('message', MAX.message)
  if (!SENDER_TYPES.includes(senderType) || !name || !EMAIL.test(email) || !message) return { kind: 'invalid' }

  const optional = (k: string) => text(k, MAX.short) || undefined
  let website = optional('website')
  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`
  const lang = text('lang', 5)

  return {
    kind: 'ok',
    data: {
      senderType,
      name,
      email,
      message,
      organisation: optional('organisation'),
      role: optional('role'),
      website,
      position: optional('position'),
      currentClub: optional('currentClub'),
      locale: locales.includes(lang) ? lang : 'en',
    },
  }
}

// In-memory limit per key (IP address): `max` messages per `windowMs`.
// Per server instance; good enough to stop a single client flooding the form.
export function createRateLimiter(max = 5, windowMs = 10 * 60 * 1000) {
  const hits = new Map<string, number[]>()
  return (key: string, now = Date.now()) => {
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs)
    recent.push(now)
    hits.set(key, recent)
    return recent.length > max
  }
}
