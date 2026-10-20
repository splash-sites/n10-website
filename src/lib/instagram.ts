export type InstagramPost = { id: string; permalink: string; image: string; caption: string }

type BeholdPost = {
  id: string
  permalink: string
  mediaUrl?: string
  thumbnailUrl?: string
  prunedCaption?: string
  caption?: string
  sizes?: { medium?: { mediaUrl?: string } }
}

// Reads the Behold JSON feed (behold.so). Pinned links come first, hidden
// links are dropped. Returns an empty list when the feed is not set up.
// Fetched once a day: Behold's free plan refreshes daily and allows 1,200
// requests a month, and the server cache means visitors never hit Behold.
export async function getInstagramPosts(
  feedId: string | null | undefined,
  pinned: string[] = [],
  hidden: string[] = [],
  count = 6,
): Promise<InstagramPost[]> {
  if (!feedId) return []
  try {
    const res = await fetch(`https://feeds.behold.so/${encodeURIComponent(feedId)}`, { next: { revalidate: 86400 } })
    if (!res.ok) return []
    const json = (await res.json()) as { posts?: BeholdPost[] } | BeholdPost[]
    const raw = Array.isArray(json) ? json : json.posts ?? []
    const norm = (u: string) => u.replace(/\/$/, '').toLowerCase()
    const hiddenSet = new Set(hidden.map(norm))
    const pinnedOrder = pinned.map(norm)
    const posts = raw
      .filter((p) => !hiddenSet.has(norm(p.permalink)))
      .map((p) => ({
        id: p.id,
        permalink: p.permalink,
        image: p.sizes?.medium?.mediaUrl || p.thumbnailUrl || p.mediaUrl || '',
        caption: p.prunedCaption || p.caption || '',
      }))
      .filter((p) => p.image)
    posts.sort((a, b) => {
      const ia = pinnedOrder.indexOf(norm(a.permalink))
      const ib = pinnedOrder.indexOf(norm(b.permalink))
      return (ia === -1 ? 1e9 : ia) - (ib === -1 ? 1e9 : ib)
    })
    return posts.slice(0, count)
  } catch {
    return []
  }
}
