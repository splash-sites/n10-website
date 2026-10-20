/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ContactForm } from '@/components/site/ContactForm'
import { Lines } from '@/components/site/Lines'
import { Motion } from '@/components/site/Motion'
import { Photo } from '@/components/site/Photo'
import { PreselectLink } from '@/components/site/PreselectLink'
import { Quotes, type QuoteItem } from '@/components/site/Quotes'
import { TalentsRail } from '@/components/site/TalentsRail'
import type { TalentRow } from '@/components/site/Talents'
import { dateLocale, getDictionary, isLocale } from '@/i18n'
import { getGlobals, getPlayers, getPosts, getTeam, media, surname } from '@/lib/data'
import { getInstagramPosts } from '@/lib/instagram'
import { ageOn, groupOf, positions } from '@/lib/positions'

type SectionKey = 'talents' | 'clubs' | 'services' | 'process' | 'quotesSection' | 'team' | 'journal' | 'instagram' | 'ctas' | 'contact'

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = getDictionary(lang)
  const l = t.landing
  const [players, team, posts, { home, services, settings }] = await Promise.all([
    getPlayers(lang),
    getTeam(lang),
    getPosts(lang, 3),
    getGlobals(lang),
  ])
  const sec = (k: SectionKey) => (home as unknown as Record<SectionKey, { show?: boolean | null; eyebrow?: string | null; title?: string | null; intro?: string | null } | undefined>)[k]
  const shown = (k: SectionKey) => sec(k)?.show !== false
  const insta = shown('instagram') ? await getInstagramPosts(settings.beholdFeedId, settings.pinnedPosts ?? [], settings.hiddenPosts ?? []) : []

  const base = `/${lang}`
  const posLabel = (p: string) => t.positions[p] ?? p
  const fmt = (d: string) => new Date(d).toLocaleDateString(dateLocale[lang], { day: 'numeric', month: 'short', year: 'numeric' })

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

  // Moving roster: two rows in opposite directions
  const wall = players.filter((p) => p.showOnWall !== false)
  const half = Math.ceil(wall.length / 2)
  const rosterRows = [wall.slice(0, half), wall.slice(half)].filter((r) => r.length)
  const clubs = [...new Set(players.map((p) => p.currentClub).filter(Boolean))]

  const counts = {
    players: players.length,
    nationalities: new Set(players.flatMap((p) => p.nationalities ?? [])).size,
    leagues: new Set(players.map((p) => p.league).filter(Boolean)).size,
  }
  const stats = (home.stats?.length
    ? home.stats.map((s) => ({ value: s.source === 'custom' ? (s.value ?? 0) : counts[s.source as keyof typeof counts], label: s.label }))
    : (['players', 'nationalities', 'leagues'] as const).map((k) => ({ value: counts[k], label: l.stats[k] }))
  ).slice(0, 4)

  const heroPlayer = typeof home.heroPlayer === 'object' && home.heroPlayer?.published ? home.heroPlayer : null
  const heroImg = media(home.heroImage, 'large') ?? (heroPlayer ? media(heroPlayer.portrait, 'large') : null)
  const badge = home.badgeText
    ? { text: home.badgeText, href: undefined as string | undefined }
    : posts[0]
      ? { text: posts[0].title, href: `${base}/journal/${posts[0].slug}` }
      : null

  const quotes: QuoteItem[] = (home.quotes ?? []).map((q, i) => ({
    quote: q.quote,
    name: q.name,
    role: q.role,
    photo: media(q.photo, 'card')?.url ?? null,
    seed: 15 + i * 7,
  }))

  const items = services.items ?? []
  const ctaBlocks = [
    { key: 'ctaPlayers' as const, cls: 'w', d: l.ctaPlayers },
    { key: 'ctaClubs' as const, cls: 'b', d: l.ctaClubs },
  ]

  return (
    <>
      <Motion />

      <section className="hero pad">
        <div className="hero-bg" aria-hidden="true">
          <Photo src={heroImg?.url} seed={heroPlayer?.id ?? 11} sizes="70vw" priority />
        </div>
        {heroPlayer ? (
          <span className="big-no" aria-hidden="true">
            {heroPlayer.shirtNumber}
          </span>
        ) : null}
        <div className="wrap hero-inner">
          {badge ? (
            badge.href ? (
              <Link className="badge" href={badge.href}>
                <b>{home.badgeLabel || 'New'}</b> {badge.text}
              </Link>
            ) : (
              <span className="badge">
                <b>{home.badgeLabel || 'New'}</b> {badge.text}
              </span>
            )
          ) : null}
          <h1>
            {(home.headline || 'Numéro 10').split(/\r?\n/).map((line, i) => (
              <span className="line" key={i}>
                <span style={{ animationDelay: `${i * 0.08}s` }}>{line}</span>
              </span>
            ))}
          </h1>
          <div className="sub">
            <p>
              {home.introBold ? <b>{home.introBold} </b> : null}
              {home.introText}
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
        </div>
        {heroPlayer ? (
          <Link className="now" href={`${base}/talents/${heroPlayer.slug}`}>
            <Photo src={media(heroPlayer.portrait, 'thumb')?.url} seed={heroPlayer.id} sizes="44px" />
            <span>
              <b>
                {heroPlayer.name}, No. {heroPlayer.shirtNumber}
              </b>
              <small>
                {posLabel(heroPlayer.position)}, {heroPlayer.currentClub}
              </small>
            </span>
          </Link>
        ) : null}
      </section>

      {rosterRows.length ? (
        <section className="roster-band" aria-label={t.talents.title}>
          {rosterRows.map((row, i) => (
            <div key={i} className={`marquee${i ? ' rev' : ''}`}>
              <div className="track names-row">
                {[0, 1].map((copy) =>
                  row.map((p) => (
                    <Link key={`${copy}-${p.id}`} href={`${base}/talents/${p.slug}`} tabIndex={copy ? -1 : undefined} aria-hidden={copy ? true : undefined}>
                      {surname(p)}
                      <sup>{p.shirtNumber}</sup>
                    </Link>
                  )),
                )}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {shown('clubs') && clubs.length ? (
        <section className="clubs" aria-label={home.clubs?.title || l.clubs}>
          <div className="pad">
            <p className="wrap label">{home.clubs?.title || l.clubs}</p>
          </div>
          <div className="marquee">
            <div className="track" aria-hidden="true">
              {[...clubs, ...clubs].map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
            <ul className="sr-only">
              {clubs.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {home.showFacts !== false && stats.length ? (
        <section className="pad sec">
          <dl className="wrap stats">
            {stats.map((s, i) => (
              <div className="stat reveal" key={i}>
                <dd data-count={s.value}>{s.value}</dd>
                <dt>{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {shown('talents') && rows.length ? (
        <section className="pad sec flush" id="talents">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="eyebrow">{sec('talents')?.eyebrow || l.talentsEyebrow}</p>
                <h2 className="disp reveal">
                  <Lines text={sec('talents')?.title || l.talentsTitle} />
                </h2>
              </div>
              <p className="lede">{sec('talents')?.intro || t.talents.intro}</p>
            </div>
            <TalentsRail players={rows} t={{ all: l.allPlayers, prev: l.prev, next: l.next, groups: t.groups }} />
            <div className="rail-foot">
              <Link className="btn ghost" href={`${base}/talents`}>
                {l.fullList}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {shown('services') && items.length ? (
        <section className="pad sec flush" id="services">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="eyebrow">{sec('services')?.eyebrow || t.services.title}</p>
                <h2 className="disp reveal">
                  <Lines text={sec('services')?.title || l.servicesTitle} />
                </h2>
              </div>
              <p className="lede">{sec('services')?.intro || t.services.intro}</p>
            </div>
            <div className="bento">
              {items.map((s, i) => {
                const img = media(s.image, 'card')
                const first = i === 0
                const last = i === items.length - 1 && items.length > 2
                return (
                  <article key={s.id ?? i} className={`tile reveal${first ? ' t-big' : last ? ' t-photo' : ''}`}>
                    {last && img ? <Photo src={img.url} seed={90 + i} sizes="50vw" className="tile-bg" /> : null}
                    <div>
                      {s.tag ? <p className="tag">{s.tag}</p> : null}
                      <h3>{s.title}</h3>
                    </div>
                    <p>{s.description}</p>
                    {first ? <Photo src={img?.url} seed={90} sizes="300px" className="tile-photo" /> : null}
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {shown('process') && home.steps?.length ? (
        <section className="pad sec flush" id="process">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="eyebrow">{sec('process')?.eyebrow || l.howWeWork}</p>
                <h2 className="disp reveal">
                  <Lines text={sec('process')?.title || l.processTitle} />
                </h2>
              </div>
              {sec('process')?.intro ? <p className="lede">{sec('process')?.intro}</p> : null}
            </div>
            <ol className="steps">
              {home.steps.map((s, i) => (
                <li className="step reveal" key={s.id ?? i}>
                  <span className="no">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {shown('quotesSection') && quotes.length ? (
        <section className="pad sec flush">
          <Quotes items={quotes} eyebrow={sec('quotesSection')?.eyebrow || l.quotesEyebrow} label={l.quote} />
        </section>
      ) : null}

      {shown('team') && team.length ? (
        <section className="pad sec flush" id="team">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="eyebrow">{sec('team')?.eyebrow || t.team.title}</p>
                <h2 className="disp reveal">
                  <Lines text={sec('team')?.title || t.team.title} />
                </h2>
              </div>
              <p className="lede">{sec('team')?.intro || t.team.intro}</p>
            </div>
            <div className="team">
              {team.map((m) => (
                <article className="person reveal" key={m.id}>
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
            <div className="sec-head">
              <div>
                <p className="eyebrow">{sec('journal')?.eyebrow || t.journal.title}</p>
                <h2 className="disp reveal">
                  <Lines text={sec('journal')?.title || l.journalTitle} />
                </h2>
              </div>
              <Link className="btn ghost" href={`${base}/journal`}>
                {t.journal.all}
              </Link>
            </div>
            <div className="jgrid">
              {posts.map((p) => (
                <Link key={p.id} className="post reveal" href={`${base}/journal/${p.slug}`}>
                  <Photo src={media(p.cover, 'card')?.url} seed={p.id + 60} sizes="(max-width: 820px) 100vw, 33vw" />
                  <span className="k">
                    {t.journal.categories[p.category] ?? p.category}
                    {p.publishedAt ? `, ${fmt(p.publishedAt)}` : ''}
                  </span>
                  <h3>{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {shown('instagram') && insta.length ? (
        <section className="pad sec flush" id="instagram">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <p className="eyebrow">{sec('instagram')?.eyebrow || (settings.instagramHandle ? `@${settings.instagramHandle}` : 'Instagram')}</p>
                <h2 className="disp reveal">
                  <Lines text={sec('instagram')?.title || t.instagram.title} />
                </h2>
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

      {shown('ctas') ? (
        <section className="pad sec flush">
          <div className="wrap split">
            {ctaBlocks.map(({ key, cls, d }) => {
              const c = home[key]
              const who = c?.preselect || (key === 'ctaPlayers' ? 'player' : 'club')
              return (
                <PreselectLink key={key} className={`cta ${cls} reveal`} who={who}>
                  <span className="arrow" aria-hidden="true">
                    →
                  </span>
                  <p className="cta-eyebrow">{c?.eyebrow || d.eyebrow}</p>
                  <div>
                    <h3>
                      <Lines text={c?.title || d.title} />
                    </h3>
                    <p className="cta-text">{c?.text || d.text}</p>
                  </div>
                </PreselectLink>
              )
            })}
          </div>
        </section>
      ) : null}

      {shown('contact') ? (
        <section className="pad sec contact-band" id="contact">
          <div className="wrap contact">
            <div>
              <p className="eyebrow">{sec('contact')?.eyebrow || t.contact.title}</p>
              <h2 className="disp">
                <Lines text={sec('contact')?.title || t.contact.title} />
              </h2>
              <p className="lede">{sec('contact')?.intro || t.contact.intro}</p>
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
