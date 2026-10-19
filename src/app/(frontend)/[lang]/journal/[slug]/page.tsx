import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Photo } from '@/components/site/Photo'
import { dateLocale, getDictionary, isLocale } from '@/i18n'
import { getPost, media } from '@/lib/data'

type Params = { params: Promise<{ lang: string; slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params
  if (!isLocale(lang)) return {}
  const post = await getPost(lang, slug)
  if (!post) return {}
  const img = media(post.cover, 'large')
  return {
    title: post.title,
    description: post.summary || undefined,
    openGraph: { type: 'article', images: img ? [img.url] : undefined, publishedTime: post.publishedAt || undefined },
  }
}

export default async function ArticlePage({ params }: Params) {
  const { lang, slug } = await params
  if (!isLocale(lang)) notFound()
  const post = await getPost(lang, slug)
  if (!post) notFound()
  const t = getDictionary(lang)
  const cover = media(post.cover, 'large')
  const players = (post.relatedPlayers ?? []).filter((p) => typeof p === 'object' && p.published)

  return (
    <article className="pad sec">
      <div className="wrap">
        <div className="article">
          <p className="crumb" style={{ marginBottom: 24 }}>
            <Link href={`/${lang}/journal`}>{t.journal.back}</Link>
          </p>
          <p className="meta">
            {t.journal.categories[post.category] ?? post.category}
            {post.publishedAt
              ? `, ${new Date(post.publishedAt).toLocaleDateString(dateLocale[lang], { day: 'numeric', month: 'long', year: 'numeric' })}`
              : ''}
          </p>
          <h1>{post.title}</h1>
          {post.summary ? <p className="summary">{post.summary}</p> : null}
          {cover ? <Photo src={cover.url} alt={cover.alt} seed={post.id} className="cover" sizes="(max-width: 820px) 100vw, 760px" priority /> : null}
          {post.content ? (
            <div className="prose" style={{ marginTop: cover ? 0 : 40 }}>
              <RichText data={post.content} />
            </div>
          ) : null}
          {players.length ? (
            <div className="links" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 40 }}>
              {players.map((p) =>
                typeof p === 'object' ? (
                  <Link key={p.id} className="btn ghost" href={`/${lang}/talents/${p.slug}`}>
                    {p.name}
                  </Link>
                ) : null,
              )}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
