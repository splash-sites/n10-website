import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Photo } from '@/components/site/Photo'
import { dateLocale, getDictionary, isLocale } from '@/i18n'
import { getPlayer, getPostsForPlayer, media } from '@/lib/data'
import { ageOn } from '@/lib/positions'

type Params = { params: Promise<{ lang: string; slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params
  if (!isLocale(lang)) return {}
  const p = await getPlayer(lang, slug)
  if (!p) return {}
  const t = getDictionary(lang)
  const img = media(p.portrait, 'card')
  return {
    title: p.name,
    description: `${t.positions[p.position] ?? p.position}, ${p.currentClub}. ${p.bio ?? ''}`.trim(),
    openGraph: { images: img ? [img.url] : undefined },
  }
}

export default async function PlayerPage({ params }: Params) {
  const { lang, slug } = await params
  if (!isLocale(lang)) notFound()
  const p = await getPlayer(lang, slug)
  if (!p) notFound()
  const t = getDictionary(lang)
  const news = await getPostsForPlayer(lang, p.id)
  const loc = dateLocale[lang]
  const date = (d: string, opts: Intl.DateTimeFormatOptions) => new Date(d).toLocaleDateString(loc, opts)
  const portrait = media(p.portrait, 'large')
  const gallery = [p.actionPhoto, ...(p.gallery ?? [])].map((m) => media(m, 'card')).filter(Boolean)

  const facts: [string, string | number | null | undefined][] = [
    [t.profile.born, date(p.birthDate, { day: 'numeric', month: 'long', year: 'numeric' })],
    [t.profile.age, ageOn(p.birthDate)],
    [t.profile.nationality, (p.nationalities ?? []).join(', ')],
    [t.profile.club, p.currentClub],
    [t.profile.league, p.league],
    [t.profile.foot, p.foot ? t.profile.feet[p.foot] : null],
    [t.profile.height, p.heightCm ? `${(p.heightCm / 100).toFixed(2).replace('.', lang === 'en' ? '.' : ',')} m` : null],
    [t.profile.until, p.contractUntil ? date(p.contractUntil, { day: 'numeric', month: 'short', year: 'numeric' }) : null],
    [t.profile.joined, p.joinedAgency ? date(p.joinedAgency, { month: 'long', year: 'numeric' }) : null],
  ]

  return (
    <div className="pad">
      <article className="wrap pf">
        <Photo src={portrait?.url} alt={p.name} seed={p.id} className="main-photo" sizes="(max-width: 820px) 100vw, 40vw" priority>
          <span className="n">{p.shirtNumber}</span>
        </Photo>
        <div className="info">
          <p className="crumb">
            <Link href={`/${lang}/talents`}>{t.profile.back}</Link>
          </p>
          <div>
            <h1>{p.name}</h1>
            <p className="pos">
              {t.positions[p.position] ?? p.position}, {p.currentClub}
            </p>
          </div>
          <dl>
            {facts
              .filter(([, v]) => v !== null && v !== undefined && v !== '')
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
          {p.bio ? <p className="bio">{p.bio}</p> : null}
          <div className="links">
            {p.transfermarktUrl ? (
              <a className="btn" href={p.transfermarktUrl} target="_blank" rel="noopener noreferrer">
                {t.profile.transfermarkt}
              </a>
            ) : null}
            {p.highlightsUrl ? (
              <a className="btn ghost" href={p.highlightsUrl} target="_blank" rel="noopener noreferrer">
                {t.profile.highlights}
              </a>
            ) : null}
            {p.instagramHandle ? (
              <a className="btn ghost" href={`https://www.instagram.com/${p.instagramHandle.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            ) : null}
            <Link className="btn ghost" href={`/${lang}?who=club#contact`}>
              {t.profile.ask}
            </Link>
          </div>
          {gallery.length ? (
            <div className="gallery">
              {gallery.map((g, i) => (
                <Photo key={i} src={g!.url} alt={g!.alt} seed={p.id + i} sizes="(max-width: 820px) 33vw, 20vw" />
              ))}
            </div>
          ) : null}
          {news.length ? (
            <div>
              <h2>{t.profile.news}</h2>
              <div className="jrows">
                {news.map((n) => (
                  <Link key={n.id} className="jrow" href={`/${lang}/journal/${n.slug}`}>
                    <span className="d">{n.publishedAt ? date(n.publishedAt, { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                    <span className="k">{t.journal.categories[n.category] ?? n.category}</span>
                    <h3>{n.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  )
}
