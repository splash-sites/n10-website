/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ContactForm } from '@/components/site/ContactForm'
import { HoverPhotoArea } from '@/components/site/HoverPhotoArea'
import { Photo } from '@/components/site/Photo'
import { RosterWall, type WallPlayer } from '@/components/site/RosterWall'
import { Talents, type TalentRow } from '@/components/site/Talents'
import { dateLocale, getDictionary, isLocale } from '@/i18n'
import { getGlobals, getPlayers, getPosts, getTeam, media, surname } from '@/lib/data'
import { getInstagramPosts } from '@/lib/instagram'
import { ageOn, groupOf, positions } from '@/lib/positions'

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = getDictionary(lang)
  const [players, team, posts, { home, services, settings }] = await Promise.all([
    getPlayers(lang),
    getTeam(lang),
    getPosts(lang, 4),
    getGlobals(lang),
  ])
  const insta = home.instagram?.show !== false
    ? await getInstagramPosts(settings.beholdFeedId, settings.pinnedPosts ?? [], settings.hiddenPosts ?? [])
    : []

  const base = `/${lang}`
  const posLabel = (p: string) => t.positions[p] ?? p
  const fmt = (d: string) => new Date(d).toLocaleDateString(dateLocale[lang], { day: 'numeric', month: 'long', year: 'numeric' })

  const wall: WallPlayer[] = players
    .filter((p) => p.showOnWall !== false)
    .map((p) => ({
      id: p.id,
      name: p.name,
      surname: surname(p),
      number: p.shirtNumber,
      club: p.currentClub,
      href: `${base}/talents/${p.slug}`,
      photo: media(p.portrait, 'card')?.url ?? null,
      seed: p.id,
    }))
  const featured = wall.map((w, i) => ({ w, i })).filter(({ w }) => players.find((p) => p.id === w.id)?.featured)
  const initial = featured.length ? featured[new Date().getDate() % featured.length].i : 0

  const rows: TalentRow[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    number: p.shirtNumber,
    group: groupOf(p.position),
    position: posLabel(p.position),
    club: p.currentClub,
    nat: (p.nationalities ?? []).join(' / '),
    age: ageOn(p.birthDate),
    href: `${base}/talents/${p.slug}`,
    thumb: media(p.portrait, 'thumb')?.url ?? null,
    card: media(p.portrait, 'card')?.url ?? null,
    seed: p.id,
  }))

  const nationalities = new Set(players.flatMap((p) => p.nationalities ?? [])).size
  const leagues = new Set(players.map((p) => p.league).filter(Boolean)).size
  const section = (key: 'talents' | 'services' | 'team' | 'journal' | 'instagram' | 'contact') => home[key]
  const shown = (key: Parameters<typeof section>[0]) => section(key)?.show !== false

  return (
    <>
      <section className="pad">
        <div className="wrap wall">
          {wall.length ? <RosterWall players={wall} initial={initial} /> : <h1 className="names">Numéro 10</h1>}
          <div className="intro">
            <p>
              <b>{home.introBold}</b> {home.introText}
            </p>
            <div className="ctas">
              <Link className="btn" href={`${base}#talents`}>
                {home.ctaPrimary}
              </Link>
              <Link className="btn ghost" href={`${base}#contact`}>
                {home.ctaSecondary}
              </Link>
            </div>
          </div>
          {home.showFacts !== false ? (
            <dl className="facts">
              <div>
                <dt>{t.facts.players}</dt>
                <dd>{players.length}</dd>
              </div>
              <div>
                <dt>{t.facts.nationalities}</dt>
                <dd>{nationalities}</dd>
              </div>
              <div>
                <dt>{t.facts.leagues}</dt>
                <dd>{leagues}</dd>
              </div>
              {settings.fifaLicence ? (
                <div>
                  <dt>{t.facts.licence}</dt>
                  <dd>{settings.fifaLicence}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      </section>

      {shown('talents') ? (
        <section className="pad sec" id="talents">
          <div className="wrap">
            <div className="sec-top">
              <h2 className="disp">{section('talents')?.title || t.talents.title}</h2>
              <p className="lede">{section('talents')?.intro || t.talents.intro}</p>
            </div>
            <Talents players={rows} t={{ ...t.talents, groups: t.groups }} />
          </div>
        </section>
      ) : null}

      {shown('services') && services.items?.length ? (
        <section className="pad sec flush" id="services">
          <div className="wrap">
            <div className="sec-top">
              <h2 className="disp">{section('services')?.title || t.services.title}</h2>
              <p className="lede">{section('services')?.intro || t.services.intro}</p>
            </div>
            <ul className="svc">
              {services.items.map((s) => (
                <li key={s.id}>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {shown('team') && team.length ? (
        <section className="pad sec flush" id="team">
          <div className="wrap">
            <div className="sec-top">
              <h2 className="disp">{section('team')?.title || t.team.title}</h2>
              <p className="lede">{section('team')?.intro || t.team.intro}</p>
            </div>
            <div className="team">
              {team.map((m) => (
                <article className="person" key={m.id}>
                  <Photo src={media(m.photo, 'card')?.url} alt={m.name} seed={m.id + 40} sizes="(max-width: 820px) 50vw, 25vw" />
                  <h3>{m.name}</h3>
                  <p className="role">{m.role}</p>
                  {m.languages ? (
                    <p className="langs">
                      {t.team.speaks} {m.languages}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {shown('journal') && posts.length ? (
        <section className="pad sec flush" id="journal">
          <div className="wrap">
            <div className="sec-top">
              <h2 className="disp">{section('journal')?.title || t.journal.title}</h2>
              <Link className="btn ghost" href={`${base}/journal`}>
                {t.journal.all}
              </Link>
            </div>
            <HoverPhotoArea className="jrows">
              {posts.map((p) => (
                <Link key={p.id} className="jrow" href={`${base}/journal/${p.slug}`} data-seed={p.id + 60} data-photo={media(p.cover, 'card')?.url ?? ''}>
                  <span className="d">{p.publishedAt ? fmt(p.publishedAt) : ''}</span>
                  <span className="k">{t.journal.categories[p.category] ?? p.category}</span>
                  <h3>{p.title}</h3>
                </Link>
              ))}
            </HoverPhotoArea>
          </div>
        </section>
      ) : null}

      {shown('instagram') && insta.length ? (
        <section className="pad sec flush" id="instagram">
          <div className="wrap">
            <div className="sec-top">
              <div>
                <h2 className="disp">{section('instagram')?.title || t.instagram.title}</h2>
                {settings.instagramHandle ? <p className="handle">@{settings.instagramHandle}</p> : null}
              </div>
              {settings.instagramHandle ? (
                <a className="btn ghost" href={`https://www.instagram.com/${settings.instagramHandle}`} target="_blank" rel="noopener noreferrer">
                  {t.instagram.follow}
                </a>
              ) : null}
            </div>
            <div className="ig">
              {insta.map((p) => (
                <a key={p.id} href={p.permalink} target="_blank" rel="noopener noreferrer" aria-label={p.caption.slice(0, 80) || 'Instagram'}>
                  <img src={p.image} alt="" loading="lazy" />
                  {p.caption ? <span>{p.caption}</span> : null}
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {shown('contact') ? (
        <section className="pad sec contact-band" id="contact">
          <div className="wrap contact">
            <div>
              <h2 className="disp">{section('contact')?.title || t.contact.title}</h2>
              <p className="lede">{section('contact')?.intro || t.contact.intro}</p>
              <dl className="lines">
                <div>
                  <dt>{t.contact.email}</dt>
                  <dd>
                    <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
                  </dd>
                </div>
                {settings.phone ? (
                  <div>
                    <dt>{t.contact.phone}</dt>
                    <dd>{settings.phone}</dd>
                  </div>
                ) : null}
                {settings.office ? (
                  <div>
                    <dt>{t.contact.office}</dt>
                    <dd>{settings.office}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
            <ContactForm lang={lang} t={t.contact} positions={positions.map((p) => [p.value, posLabel(p.value)])} />
          </div>
        </section>
      ) : null}
    </>
  )
}
