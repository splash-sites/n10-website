'use server'

import { headers } from 'next/headers'

import { createRateLimiter, validateContact } from '@/lib/contact'
import { payload } from '@/lib/data'

export type ContactState = { status: 'idle' | 'sent' | 'invalid' | 'error' }

const limited = createRateLimiter(5, 10 * 60 * 1000)

export async function sendContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const check = validateContact(form)
  // Bots get the same answer as people, so they learn nothing
  if (check.kind === 'spam') return { status: 'sent' }
  if (check.kind === 'invalid') return { status: 'invalid' }

  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || 'local'
  if (limited(ip)) return { status: 'error' }

  try {
    const p = await payload()
    await p.create({ collection: 'messages', overrideAccess: true, data: { ...check.data, status: 'new' } })
    return { status: 'sent' }
  } catch (err) {
    console.error('Contact form failed', err)
    return { status: 'error' }
  }
}
