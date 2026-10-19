import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { HoverPhotoArea } from '@/components/site/HoverPhotoArea'
import { dateLocale, getDictionary, isLocale } from '@/i18n'
import { getPosts, media } from '@/lib/data'

type Params = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params
  return isLocale(lang) ? { title: getDictionary(lang).journal.title } : {}
}

export default async function JournalPage({ params }: Params) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = getDictionary(lang)
  const posts = await getPosts(lang, 100)

  return (
    <section className="pad sec">
      <div className="wrap">
        <div className="sec-top">
          <h1 className="disp" style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}>
            {t.journal.title}
          </h1>
        </div>
        {posts.length ? (
          <HoverPhotoArea className="jrows">
            {posts.map((p) => (
              <Link key={p.id} className="jrow" href={`/${lang}/journal/${p.slug}`} data-seed={p.id + 60} data-photo={media(p.cover, 'card')?.url ?? ''}>
                <span className="d">
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString(dateLocale[lang], { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </span>
                <span className="k">{t.journal.categories[p.category] ?? p.category}</span>
                <h3>{p.title}</h3>
              </Link>
            ))}
          </HoverPhotoArea>
        ) : (
          <p className="empty-state">{t.journal.empty}</p>
        )}
      </div>
    </section>
  )
}
