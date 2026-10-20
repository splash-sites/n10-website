/**
 * Fills an empty database with the sample content from the approved design:
 * 20 players, 4 team members, journal articles, services and settings, with
 * grey placeholder photos. Run with `npm run seed` (add `-- --force` to wipe
 * the sample content and start again). It never creates or changes users.
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import { slugify } from './lib/positions'
import type { Player } from './payload-types'

type L = { en: string; fr: string; nl: string }

const players: [string, number, Player['position'], string, string, string, string[], 'left' | 'right', number, string][] = [
  ['Arno Verbeke', 1, 'goalkeeper', '2002-03-11', 'KAA Gent', 'Jupiler Pro League', ['BEL'], 'right', 193, '2028-06-30'],
  ['Moussa Ndiaye', 30, 'goalkeeper', '2005-07-02', 'RWD Molenbeek', 'Challenger Pro League', ['SEN'], 'right', 190, '2027-06-30'],
  ['Jens Van Acker', 2, 'right-back', '2003-01-24', 'Club Brugge', 'Jupiler Pro League', ['BEL'], 'right', 179, '2029-06-30'],
  ['Ibrahim Touré', 4, 'centre-back', '1999-09-30', 'Standard Liège', 'Jupiler Pro League', ['CIV'], 'right', 188, '2027-06-30'],
  ['Mathis Lefèvre', 5, 'centre-back', '2001-05-16', 'RC Lens', 'Ligue 1', ['FRA'], 'left', 186, '2028-06-30'],
  ['Noah Peeters', 3, 'left-back', '2006-02-08', 'KRC Genk', 'Jupiler Pro League', ['BEL'], 'left', 177, '2028-06-30'],
  ['Kofi Mensah', 22, 'right-back', '2004-11-19', 'FC Utrecht', 'Eredivisie', ['GHA'], 'right', 180, '2027-06-30'],
  ['Daan de Wit', 15, 'centre-back', '2000-06-03', 'Sparta Rotterdam', 'Eredivisie', ['NED'], 'left', 191, '2027-06-30'],
  ['Yassine El Amrani', 6, 'defensive-midfielder', '2002-08-27', 'Royal Antwerp FC', 'Jupiler Pro League', ['MAR', 'BEL'], 'right', 182, '2028-06-30'],
  ['Rafael Couto', 8, 'central-midfielder', '2001-04-12', 'Vitória SC', 'Liga Portugal', ['POR'], 'right', 176, '2027-06-30'],
  ['Ilyas Benali', 10, 'attacking-midfielder', '2004-05-09', 'KRC Genk', 'Jupiler Pro League', ['BEL', 'MAR'], 'left', 174, '2029-06-30'],
  ['Teo Marchetti', 14, 'central-midfielder', '2003-10-01', 'KV Mechelen', 'Jupiler Pro League', ['ITA'], 'right', 178, '2027-06-30'],
  ['Samuel Kabongo', 18, 'central-midfielder', '2009-01-14', 'RSC Anderlecht U18', 'Youth', ['COD', 'BEL'], 'right', 175, '2027-06-30'],
  ['Lars Jacobs', 23, 'defensive-midfielder', '1997-12-22', 'OH Leuven', 'Jupiler Pro League', ['BEL'], 'right', 184, '2027-06-30'],
  ['Amadou Sow', 7, 'right-winger', '2003-03-29', 'Stade de Reims', 'Ligue 2', ['SEN'], 'left', 177, '2028-06-30'],
  ['Jonas Claes', 9, 'striker', '2000-07-07', 'Union Saint-Gilloise', 'Jupiler Pro League', ['BEL'], 'right', 187, '2028-06-30'],
  ['Bilal Haddadi', 11, 'left-winger', '2005-09-18', 'Cercle Brugge', 'Jupiler Pro League', ['MAR'], 'right', 172, '2029-06-30'],
  ['Nathan Mbemba', 17, 'striker', '2002-02-25', 'SV Zulte Waregem', 'Jupiler Pro League', ['CMR'], 'right', 185, '2027-06-30'],
  ['Emil Sørensen', 19, 'striker', '2001-11-05', 'AGF Aarhus', 'Superliga', ['DEN'], 'left', 189, '2027-06-30'],
  ['Leandro Pires', 21, 'right-winger', '2006-04-30', 'KVC Westerlo', 'Jupiler Pro League', ['BRA'], 'left', 173, '2028-06-30'],
]
const featured = ['Ilyas Benali', 'Jonas Claes', 'Amadou Sow', 'Yassine El Amrani']

const team: [string, L, string][] = [
  ['Thomas Lambert', { en: 'Founder, FIFA football agent', fr: 'Fondateur, agent FIFA', nl: 'Oprichter, FIFA-voetbalagent' }, 'FR, NL, EN'],
  ['Sarah Vermeulen', { en: 'Legal and contracts', fr: 'Juridique et contrats', nl: 'Juridisch en contracten' }, 'NL, FR, EN'],
  ['Karim Bensaïd', { en: 'Scouting and player relations', fr: 'Scouting et relations joueurs', nl: 'Scouting en spelersrelaties' }, 'FR, AR, EN'],
  ['Lotte Janssens', { en: 'Communication and partnerships', fr: 'Communication et partenariats', nl: 'Communicatie en partnerships' }, 'NL, EN, DE'],
]

const services: { title: L; description: L }[] = [
  {
    title: { en: 'Sports representation', fr: 'Représentation sportive', nl: 'Sportieve vertegenwoordiging' },
    description: {
      en: "Transfers, loans and contract renewals, negotiated with clubs. We are present for every conversation about the player's future.",
      fr: "Transferts, prêts et prolongations, négociés avec les clubs. Nous sommes présents à chaque discussion sur l'avenir du joueur.",
      nl: 'Transfers, uitleningen en contractverlengingen, onderhandeld met clubs. We zitten mee aan tafel bij elk gesprek over de toekomst van de speler.',
    },
  },
  {
    title: { en: 'Career strategy', fr: 'Stratégie de carrière', nl: 'Carrièrestrategie' },
    description: {
      en: 'A plan for the next three seasons, reviewed before every window: playing time, league level, coach and style of play.',
      fr: 'Un plan pour les trois prochaines saisons, revu avant chaque mercato : temps de jeu, niveau du championnat, entraîneur et style de jeu.',
      nl: 'Een plan voor de komende drie seizoenen, herzien voor elke transferperiode: speelminuten, niveau, trainer en speelstijl.',
    },
  },
  {
    title: { en: 'Legal and financial support', fr: 'Juridique et financier', nl: 'Juridisch en financieel' },
    description: {
      en: 'Contract review, tax questions and long-term planning with lawyers and advisers we trust.',
      fr: 'Relecture des contrats, fiscalité et planification à long terme, avec des avocats et conseillers de confiance.',
      nl: 'Contractcontrole, fiscale vragen en planning op lange termijn, met advocaten en adviseurs die we vertrouwen.',
    },
  },
  {
    title: { en: 'Image and communication', fr: 'Image et communication', nl: 'Imago en communicatie' },
    description: {
      en: 'Media training, social channels and press requests, handled so the player can focus on football.',
      fr: 'Media training, réseaux sociaux et demandes de presse, pour que le joueur reste concentré sur le football.',
      nl: 'Mediatraining, sociale media en persaanvragen, zodat de speler zich op voetbal kan focussen.',
    },
  },
  {
    title: { en: 'Commercial partnerships', fr: 'Partenariats commerciaux', nl: 'Commerciële partnerships' },
    description: {
      en: 'Boot deals, brand partnerships and appearances that suit the player and the season.',
      fr: 'Équipementiers, partenariats de marque et apparitions adaptés au joueur et à la saison.',
      nl: 'Schoenendeals, merkpartnerships en optredens die passen bij de speler en het seizoen.',
    },
  },
]

const home = {
  headline: { en: 'Careers\nbuilt for\nthe long run', fr: 'Des carrières\npensées pour\ndurer', nl: 'Carrières\ngebouwd voor\nde lange termijn' },
  introText: {
    en: 'Numéro 10 is a FIFA-licensed agency in Belgium. We represent twenty footballers and look after their contracts, their next move and everything off the pitch.',
    fr: "Numéro 10 est une agence belge licenciée FIFA. Nous représentons vingt footballeurs et gérons leurs contrats, leur prochain transfert et tout ce qui se passe en dehors du terrain.",
    nl: 'Numéro 10 is een Belgisch bureau met FIFA-licentie. We vertegenwoordigen twintig voetballers en zorgen voor hun contracten, hun volgende stap en alles naast het veld.',
  },
  ctaPrimary: { en: 'See our talents', fr: 'Voir nos talents', nl: 'Bekijk onze talenten' },
  ctaSecondary: { en: 'Talk to an agent', fr: 'Parler à un agent', nl: 'Spreek een agent' },
  badgeLabel: { en: 'New', fr: 'Nouveau', nl: 'Nieuw' },
}

const stats: { source: 'players' | 'nationalities' | 'leagues' | 'custom'; value?: number; label: L }[] = [
  { source: 'players', label: { en: 'Professional players represented', fr: 'Joueurs professionnels représentés', nl: 'Vertegenwoordigde profvoetballers' } },
  { source: 'nationalities', label: { en: 'Nationalities in the roster', fr: "Nationalités dans l'effectif", nl: 'Nationaliteiten in de kern' } },
  { source: 'leagues', label: { en: 'Leagues across Europe', fr: 'Championnats en Europe', nl: 'Competities in Europa' } },
  { source: 'custom', value: 2, label: { en: 'Days to answer every message', fr: 'Jours pour répondre à chaque message', nl: 'Dagen om elk bericht te beantwoorden' } },
]

const steps: { title: L; text: L }[] = [
  {
    title: { en: 'We meet', fr: 'On se rencontre', nl: 'We ontmoeten elkaar' },
    text: {
      en: 'With the player and the family, at home or at the club. No contract on the first day.',
      fr: 'Avec le joueur et sa famille, à la maison ou au club. Pas de contrat le premier jour.',
      nl: 'Met de speler en de familie, thuis of op de club. Geen contract op de eerste dag.',
    },
  },
  {
    title: { en: 'We plan', fr: 'On planifie', nl: 'We plannen' },
    text: {
      en: 'Where the player is now, where he can be in three seasons, and what has to happen first.',
      fr: "Où en est le joueur, où il peut être dans trois saisons, et ce qu'il faut faire d'abord.",
      nl: 'Waar de speler nu staat, waar hij over drie seizoenen kan staan en wat er eerst moet gebeuren.',
    },
  },
  {
    title: { en: 'We negotiate', fr: 'On négocie', nl: 'We onderhandelen' },
    text: {
      en: 'With clubs, sponsors and lawyers. The player decides; we make sure every option is on the table.',
      fr: 'Avec les clubs, les sponsors et les avocats. Le joueur décide ; nous mettons toutes les options sur la table.',
      nl: 'Met clubs, sponsors en advocaten. De speler beslist; wij zorgen dat elke optie op tafel ligt.',
    },
  },
  {
    title: { en: 'We stay', fr: 'On reste', nl: 'We blijven' },
    text: {
      en: 'After the signature we follow every match, every injury and every window.',
      fr: 'Après la signature, nous suivons chaque match, chaque blessure et chaque mercato.',
      nl: 'Na de handtekening volgen we elke wedstrijd, elke blessure en elke transferperiode.',
    },
  },
]

const quotes: { quote: L; name: string; role: L }[] = [
  {
    quote: {
      en: 'They told me to stay one more season when everyone else said leave. It was the right call.',
      fr: "Ils m'ont conseillé de rester une saison de plus quand tout le monde disait de partir. C'était le bon choix.",
      nl: 'Ze zeiden me nog een seizoen te blijven toen iedereen zei dat ik moest vertrekken. Het was de juiste keuze.',
    },
    name: 'Jonas Claes',
    role: { en: 'Striker, Union Saint-Gilloise', fr: 'Avant-centre, Union Saint-Gilloise', nl: 'Spits, Union Saint-Gilloise' },
  },
  {
    quote: {
      en: 'My parents had every question answered before I signed anything.',
      fr: 'Mes parents avaient une réponse à chaque question avant que je signe quoi que ce soit.',
      nl: 'Mijn ouders kregen op elke vraag een antwoord voor ik iets tekende.',
    },
    name: 'Noah Peeters',
    role: { en: 'Left back, KRC Genk', fr: 'Latéral gauche, KRC Genk', nl: 'Linksachter, KRC Genk' },
  },
]

const serviceTags: L[] = [
  { en: 'Core service', fr: 'Service principal', nl: 'Kerndienst' },
  { en: 'Planning', fr: 'Planification', nl: 'Planning' },
  { en: 'Protection', fr: 'Protection', nl: 'Bescherming' },
  { en: 'Visibility', fr: 'Visibilité', nl: 'Zichtbaarheid' },
  { en: 'Partners', fr: 'Partenaires', nl: 'Partners' },
]

const para = (text: string) => ({
  type: 'paragraph',
  version: 1,
  format: '' as const,
  indent: 0,
  direction: 'ltr' as const,
  textFormat: 0,
  children: [{ type: 'text', version: 1, text, format: 0, mode: 'normal', style: '', detail: 0 }],
})
const doc = (...paras: string[]) => ({
  root: { type: 'root', version: 1, format: '' as const, indent: 0, direction: 'ltr' as const, children: paras.map(para) },
})

const posts: { title: string; summary: string; category: 'signing' | 'insight' | 'agency' | 'news'; date: string; body: string[]; players: string[]; draft?: boolean }[] = [
  {
    title: 'Ilyas Benali extends with KRC Genk until 2029',
    summary: 'The 22-year-old midfielder signed a new deal after his best season in the Pro League so far.',
    category: 'signing',
    date: '2026-10-14T10:00:00Z',
    body: ['Ilyas Benali has signed a contract extension with KRC Genk that runs until June 2029.', 'This is sample text. Write the real article in the panel under Journal.'],
    players: ['Ilyas Benali'],
  },
  {
    title: 'What clubs look at before signing a 19-year-old',
    summary: 'Playing time, data and character: what sporting directors ask us before they make an offer.',
    category: 'insight',
    date: '2026-10-02T09:00:00Z',
    body: ['Sporting directors ask the same three questions about young players: how many minutes, at what level, and how did he handle a bad run.', 'This is sample text.'],
    players: [],
  },
  {
    title: 'Why we sign fewer players than we are offered',
    summary: 'A small roster means every player has an agent who knows his situation in detail.',
    category: 'agency',
    date: '2026-09-21T09:00:00Z',
    body: ['We keep the roster at around twenty players so that each one gets real attention.', 'This is sample text.'],
    players: [],
  },
  {
    title: 'Amadou Sow completes his move to Stade de Reims',
    summary: 'The winger joins the French club on a contract until 2028.',
    category: 'signing',
    date: '2026-09-03T09:00:00Z',
    body: ['Amadou Sow has completed his transfer to Stade de Reims.', 'This is sample text.'],
    players: ['Amadou Sow'],
  },
  {
    title: 'January window: what we expect for Belgian under-21 players',
    summary: 'Clubs in the Pro League are under pressure to play young Belgians.',
    category: 'insight',
    date: '2026-10-24T09:00:00Z',
    body: ['Draft article. It is not on the website until it is published.'],
    players: ['Noah Peeters', 'Samuel Kabongo'],
    draft: true,
  },
]

// Grey studio-style placeholder, so the layout can be judged before the shoots.
async function placeholder(payload: Payload, seed: number, alt: string, w = 1200, h = 1600) {
  const r = (k: number) => {
    const x = Math.sin((seed + 1) * 91.7 + k * 13.3) * 43758.5
    return x - Math.floor(x)
  }
  const a = 175 + Math.round(r(1) * 55)
  const b = 60 + Math.round(r(2) * 60)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="${r(3).toFixed(2)}" y2="1"><stop offset="0" stop-color="rgb(${a},${a},${a})"/><stop offset="1" stop-color="rgb(${b},${b},${b})"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`
  const data = await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer()
  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/jpeg', name: `placeholder-${slugify(alt)}-${seed}.jpg`, size: data.length },
  })
}

async function seedCollections(payload: Payload) {
  const ids: Record<string, number> = {}
  for (const [i, [name, n, position, birthDate, club, league, nats, foot, h, until]] of players.entries()) {
    const portrait = await placeholder(payload, i + 3, name)
    const doc = await payload.create({
      collection: 'players',
      locale: 'en',
      data: {
        name,
        shirtNumber: n,
        position,
        birthDate,
        currentClub: club,
        league,
        nationalities: nats,
        foot,
        heightCm: h,
        contractUntil: until,
        joinedAgency: '2024-07-01',
        bio: `${name.split(' ')[0]} joined Numéro 10 in 2024. This sample biography is edited in the panel under Talents.`,
        portrait: portrait.id,
        transfermarktUrl: 'https://www.transfermarkt.com/',
        published: name !== 'Samuel Kabongo',
        showOnWall: true,
        featured: featured.includes(name),
        minorConsent: false,
      },
    })
    await payload.update({
      collection: 'players',
      id: doc.id,
      locale: 'fr',
      data: { bio: `${name.split(' ')[0]} a rejoint Numéro 10 en 2024. Biographie d'exemple, modifiable dans le panneau.` },
    })
    ids[name] = doc.id
    payload.logger.info(`Player ${i + 1}/20: ${name}`)
  }

  for (const [i, [name, role, langs]] of team.entries()) {
    const photo = await placeholder(payload, 40 + i, name, 1200, 1200)
    const doc = await payload.create({ collection: 'team', locale: 'en', data: { name, role: role.en, languages: langs, photo: photo.id, published: true } })
    for (const l of ['fr', 'nl'] as const) await payload.update({ collection: 'team', id: doc.id, locale: l, data: { role: role[l] } })
  }

  for (const [i, p] of posts.entries()) {
    const cover = await placeholder(payload, 60 + i, p.title, 1600, 1067)
    await payload.create({
      collection: 'posts',
      locale: 'en',
      draft: p.draft,
      data: {
        title: p.title,
        summary: p.summary,
        category: p.category,
        publishedAt: p.date,
        content: doc(...p.body),
        cover: cover.id,
        relatedPlayers: p.players.map((n) => ids[n]).filter(Boolean),
        _status: p.draft ? 'draft' : 'published',
      },
    })
  }
}

// Globals are always (re)written, so new homepage sections get sample text
// even on a database that already has players.
async function seedGlobals(payload: Payload) {
  const hero = await payload.find({ collection: 'players', where: { name: { equals: 'Ilyas Benali' } }, limit: 1, depth: 0 })
  const existing = await payload.findGlobal({ slug: 'home', depth: 0 })
  const heroImage = existing.heroImage ?? (await placeholder(payload, 11, 'Hero placeholder', 2400, 1600)).id
  const quotePhotos = await Promise.all(quotes.map((q, i) => placeholder(payload, 15 + i * 7, q.name, 1200, 1500)))

  const en = await payload.updateGlobal({
    slug: 'home',
    locale: 'en',
    data: {
      headline: home.headline.en,
      introBold: '',
      introText: home.introText.en,
      ctaPrimary: home.ctaPrimary.en,
      ctaSecondary: home.ctaSecondary.en,
      badgeLabel: home.badgeLabel.en,
      heroImage,
      heroPlayer: hero.docs[0]?.id,
      showFacts: true,
      stats: stats.map((s) => ({ source: s.source, value: s.value, label: s.label.en })),
      steps: steps.map((s) => ({ title: s.title.en, text: s.text.en })),
      quotes: quotes.map((q, i) => ({ quote: q.quote.en, name: q.name, role: q.role.en, photo: quotePhotos[i].id })),
    },
  })
  for (const l of ['fr', 'nl'] as const) {
    await payload.updateGlobal({
      slug: 'home',
      locale: l,
      data: {
        headline: home.headline[l],
        introBold: '',
        introText: home.introText[l],
        ctaPrimary: home.ctaPrimary[l],
        ctaSecondary: home.ctaSecondary[l],
        badgeLabel: home.badgeLabel[l],
        stats: stats.map((s, i) => ({ id: en.stats?.[i]?.id, source: s.source, value: s.value, label: s.label[l] })),
        steps: steps.map((s, i) => ({ id: en.steps?.[i]?.id, title: s.title[l], text: s.text[l] })),
        quotes: quotes.map((q, i) => ({ id: en.quotes?.[i]?.id, quote: q.quote[l], name: q.name, role: q.role[l], photo: quotePhotos[i].id })),
      },
    })
  }

  const svc = await payload.updateGlobal({
    slug: 'services',
    locale: 'en',
    data: { items: services.map((s, i) => ({ tag: serviceTags[i].en, title: s.title.en, description: s.description.en })) },
  })
  for (const l of ['fr', 'nl'] as const) {
    await payload.updateGlobal({
      slug: 'services',
      locale: l,
      data: { items: services.map((s, i) => ({ id: svc.items?.[i]?.id, tag: serviceTags[i][l], title: s.title[l], description: s.description[l] })) },
    })
  }

  await payload.updateGlobal({
    slug: 'settings',
    locale: 'en',
    data: {
      contactEmail: 'contact@numero10.com',
      phone: '+32 000 00 00 00',
      office: 'Brussels, Belgium',
      fifaLicence: '202X-0000',
      instagramHandle: 'numero10agency',
      emailNotifications: true,
    },
  })
}

async function run() {
  const payload = await getPayload({ config })
  const force = process.argv.includes('--force')
  const { totalDocs } = await payload.count({ collection: 'players' })

  if (force) {
    for (const collection of ['posts', 'players', 'team', 'media'] as const) {
      await payload.delete({ collection, where: { id: { exists: true } } })
    }
    await payload.updateGlobal({ slug: 'home', data: { heroImage: null, heroPlayer: null } })
  }
  if (!totalDocs || force) await seedCollections(payload)
  else payload.logger.info('Players already exist; only the page texts are updated. Use `npm run seed -- --force` to start over.')

  await seedGlobals(payload)
  payload.logger.info('Sample content ready. Open /admin to create the admin account if you have not yet.')
  process.exit(0)
}

await run()
