import { describe, expect, it } from 'vitest'

import { createRateLimiter, validateContact } from '@/lib/contact'

const form = (values: Record<string, string>) => ({ get: (k: string) => values[k] ?? null })
const valid = { who: 'club', name: 'Pieter Claessens', email: 'pieter@club.be', message: 'Interested in a player', lang: 'fr' }

describe('contact form validation', () => {
  it('accepts a complete message', () => {
    const r = validateContact(form(valid))
    expect(r.kind).toBe('ok')
    if (r.kind === 'ok') expect(r.data).toMatchObject({ senderType: 'club', locale: 'fr', email: 'pieter@club.be' })
  })

  it.each([
    ['missing name', { name: '' }],
    ['blank name', { name: '   ' }],
    ['invalid email', { email: 'not-an-email' }],
    ['email with spaces', { email: 'a b@c.de' }],
    ['missing message', { message: '' }],
    ['unknown sender type', { who: 'admin' }],
  ])('rejects %s', (_, change) => {
    expect(validateContact(form({ ...valid, ...change })).kind).toBe('invalid')
  })

  it('flags the hidden spam field', () => {
    expect(validateContact(form({ ...valid, company_website: 'http://spam.example' })).kind).toBe('spam')
  })

  it('cuts overly long input', () => {
    const r = validateContact(form({ ...valid, name: 'x'.repeat(5000), message: 'y'.repeat(10000) }))
    expect(r.kind).toBe('ok')
    if (r.kind === 'ok') {
      expect(r.data.name.length).toBe(120)
      expect(r.data.message.length).toBe(4000)
    }
  })

  it('keeps HTML as plain text, never interprets it', () => {
    const r = validateContact(form({ ...valid, message: '<script>alert(1)</script>' }))
    expect(r.kind === 'ok' && r.data.message).toBe('<script>alert(1)</script>')
  })

  it('falls back to English for an unknown language', () => {
    const r = validateContact(form({ ...valid, lang: 'xx' }))
    expect(r.kind === 'ok' && r.data.locale).toBe('en')
  })

  it('adds https to a website without a scheme and leaves javascript: out', () => {
    const a = validateContact(form({ ...valid, website: 'brand.be' }))
    expect(a.kind === 'ok' && a.data.website).toBe('https://brand.be')
    const b = validateContact(form({ ...valid, website: 'javascript:alert(1)' }))
    expect(b.kind === 'ok' && b.data.website).toBe('https://javascript:alert(1)')
  })
})

describe('rate limit', () => {
  it('allows 5 messages in 10 minutes, then blocks', () => {
    const limited = createRateLimiter(5, 600_000)
    const t = 1_000_000
    const results = Array.from({ length: 6 }, (_, i) => limited('1.2.3.4', t + i))
    expect(results).toEqual([false, false, false, false, false, true])
  })

  it('counts each address separately', () => {
    const limited = createRateLimiter(1, 600_000)
    expect(limited('a', 0)).toBe(false)
    expect(limited('b', 0)).toBe(false)
    expect(limited('a', 1)).toBe(true)
  })

  it('forgets old messages after the window', () => {
    const limited = createRateLimiter(1, 1000)
    expect(limited('a', 0)).toBe(false)
    expect(limited('a', 500)).toBe(true)
    expect(limited('a', 2000)).toBe(false)
  })
})
