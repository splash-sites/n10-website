import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n'
import type { Media, Player, Post } from '@/payload-types'

export const payload = cache(async () => getPayload({ config }))

export const getPlayers = cache(async (locale: Locale) => {
  const p = await payload()
  const res = await p.find({
    collection: 'players',
    locale,
    where: { published: { equals: true } },
    sort: '_order',
    limit: 200,
    depth: 1,
    overrideAccess: false,
  })
  return res.docs
})

export const getPlayer = cache(async (locale: Locale, slug: string) => {
  const p = await payload()
  const res = await p.find({
    collection: 'players',
    locale,
    where: { and: [{ slug: { equals: slug } }, { published: { equals: true } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return res.docs[0] ?? null
})

const livePosts = (): { and: Where[] } => ({
  and: [{ _status: { equals: 'published' } }, { publishedAt: { less_than_equal: new Date().toISOString() } }],
})

export const getPosts = cache(async (locale: Locale, limit = 50) => {
  const p = await payload()
  const res = await p.find({ collection: 'posts', locale, where: livePosts(), sort: '-publishedAt', limit, depth: 1, overrideAccess: false })
  return res.docs
})

export const getPost = cache(async (locale: Locale, slug: string) => {
  const p = await payload()
  const res = await p.find({
    collection: 'posts',
    locale,
    where: { and: [{ slug: { equals: slug } }, ...livePosts().and] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return res.docs[0] ?? null
})

export const getPostsForPlayer = cache(async (locale: Locale, playerId: number) => {
  const p = await payload()
  const res = await p.find({
    collection: 'posts',
    locale,
    where: { and: [{ relatedPlayers: { contains: playerId } }, ...livePosts().and] },
    sort: '-publishedAt',
    limit: 6,
    depth: 0,
    overrideAccess: false,
  })
  return res.docs
})

export const getTeam = cache(async (locale: Locale) => {
  const p = await payload()
  const res = await p.find({ collection: 'team', locale, where: { published: { equals: true } }, sort: '_order', limit: 50, depth: 1, overrideAccess: false })
  return res.docs
})

export const getGlobals = cache(async (locale: Locale) => {
  const p = await payload()
  const [home, services, settings] = await Promise.all([
    p.findGlobal({ slug: 'home', locale, depth: 1 }),
    p.findGlobal({ slug: 'services', locale, depth: 1 }),
    p.findGlobal({ slug: 'settings', locale, depth: 1 }),
  ])
  return { home, services, settings }
})

export const media = (m: number | Media | null | undefined, size?: 'thumb' | 'card' | 'large') => {
  if (!m || typeof m === 'number') return null
  const sized = size ? m.sizes?.[size]?.url : null
  // Payload prefixes the site address when serverURL is set; Next.js image
  // optimization only accepts same-site files as relative paths.
  const url = (sized || m.url || '').replace(/^https?:\/\/[^/]+(?=\/api\/media\/)/, '')
  return { url, alt: m.alt || '', width: m.width ?? undefined, height: m.height ?? undefined }
}

export const surname = (p: Pick<Player, 'name'>) => p.name.trim().split(/\s+/).slice(-1)[0]

export type { Player, Post }
