import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Talents, type TalentRow } from '@/components/site/Talents'
import { getDictionary, isLocale } from '@/i18n'
import { getPlayers, media } from '@/lib/data'
import { ageOn, groupOf } from '@/lib/positions'

type Params = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params
  return isLocale(lang) ? { title: getDictionary(lang).talents.title } : {}
}

export default async function TalentsPage({ params }: Params) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = getDictionary(lang)
  const players = await getPlayers(lang)

  const rows: TalentRow[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    number: p.shirtNumber,
    group: groupOf(p.position),
    position: t.positions[p.position] ?? p.position,
    club: p.currentClub,
    nat: (p.nationalities ?? []).join(' / '),
    age: ageOn(p.birthDate),
    href: `/${lang}/talents/${p.slug}`,
    thumb: media(p.portrait, 'thumb')?.url ?? null,
    card: media(p.portrait, 'card')?.url ?? null,
    seed: p.id,
  }))

  return (
    <section className="pad sec">
      <div className="wrap">
        <div className="sec-head">
          <h1 className="disp" style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}>
            {t.landing.talentsPage}
          </h1>
          <p className="lede">{t.talents.intro}</p>
        </div>
        <Talents players={rows} t={{ ...t.talents, groups: t.groups }} />
      </div>
    </section>
  )
}
