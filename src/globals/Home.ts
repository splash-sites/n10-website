import type { Field, GlobalConfig } from 'payload'

const section = (name: string, label: string, withIntro = true): Field => ({
  name,
  label,
  type: 'group',
  admin: { description: 'Leave the texts empty to use the standard wording.' },
  fields: [
    { name: 'show', label: 'Show this section', type: 'checkbox', defaultValue: true },
    { name: 'eyebrow', label: 'Small label above the title', type: 'text', localized: true },
    { name: 'title', type: 'text', localized: true, admin: { description: 'Use Enter for a line break.' } },
    ...(withIntro ? [{ name: 'intro', type: 'textarea', localized: true } as Field] : []),
  ],
})

const cta = (name: string, label: string): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    { name: 'eyebrow', label: 'Who it is for', type: 'text', localized: true },
    { name: 'title', type: 'textarea', localized: true, admin: { rows: 2 } },
    { name: 'text', type: 'textarea', localized: true, admin: { rows: 2 } },
    {
      name: 'preselect',
      label: 'Contact form opens on',
      type: 'select',
      options: [
        { value: 'player', label: 'A player' },
        { value: 'family', label: 'Family of a player' },
        { value: 'club', label: 'A club' },
        { value: 'brand', label: 'A brand' },
        { value: 'partner', label: 'Another partner' },
      ],
    },
  ],
})

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Homepage',
  admin: { group: 'Pages' },
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'headline',
              type: 'textarea',
              localized: true,
              defaultValue: 'Careers\nbuilt for\nthe long run',
              admin: { rows: 3, description: 'One line per row. Three short lines work best.' },
            },
            {
              name: 'heroImage',
              label: 'Hero photo',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Large photo on the right. Shown in black and white. Landscape, at least 2000 px wide.' },
            },
            {
              name: 'heroPlayer',
              label: 'Player in the photo',
              type: 'relationship',
              relationTo: 'players',
              admin: { description: 'Shown in the small card at the bottom right. Empty means no card.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'badgeLabel', label: 'Badge label', type: 'text', localized: true, defaultValue: 'New', admin: { width: '25%' } },
                {
                  name: 'badgeText',
                  label: 'Badge text',
                  type: 'text',
                  localized: true,
                  admin: { width: '75%', description: 'Empty means the latest journal article is shown.' },
                },
              ],
            },
            {
              name: 'introBold',
              label: 'Intro, bold part',
              type: 'text',
              localized: true,
              admin: { description: 'Optional. Shown in bold before the intro.' },
            },
            {
              name: 'introText',
              label: 'Intro',
              type: 'textarea',
              localized: true,
            },
            {
              type: 'row',
              fields: [
                { name: 'ctaPrimary', label: 'First button', type: 'text', localized: true, defaultValue: 'See our talents' },
                { name: 'ctaSecondary', label: 'Second button', type: 'text', localized: true, defaultValue: 'Talk to an agent' },
              ],
            },
          ],
        },
        {
          label: 'Numbers',
          fields: [
            { name: 'showFacts', label: 'Show the numbers', type: 'checkbox', defaultValue: true },
            {
              name: 'stats',
              label: 'Numbers',
              type: 'array',
              maxRows: 4,
              admin: { description: 'Up to four tiles. "Counted automatically" uses the published talents.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'source',
                      type: 'select',
                      required: true,
                      defaultValue: 'custom',
                      options: [
                        { value: 'players', label: 'Counted automatically: players' },
                        { value: 'nationalities', label: 'Counted automatically: nationalities' },
                        { value: 'leagues', label: 'Counted automatically: leagues' },
                        { value: 'custom', label: 'My own number' },
                      ],
                      admin: { width: '50%' },
                    },
                    {
                      name: 'value',
                      type: 'number',
                      admin: { width: '20%', condition: (_, s) => s?.source === 'custom' },
                    },
                  ],
                },
                { name: 'label', type: 'text', required: true, localized: true },
              ],
            },
          ],
        },
        {
          label: 'How we work',
          fields: [
            {
              name: 'steps',
              type: 'array',
              maxRows: 6,
              admin: { components: { RowLabel: '@/components/admin/RowLabel#TitleRowLabel' } },
              fields: [
                { name: 'title', type: 'text', required: true, localized: true },
                { name: 'text', type: 'textarea', required: true, localized: true },
              ],
            },
          ],
        },
        {
          label: 'Quotes',
          fields: [
            {
              name: 'quotes',
              type: 'array',
              maxRows: 8,
              admin: { components: { RowLabel: '@/components/admin/RowLabel#NameRowLabel' } },
              fields: [
                { name: 'quote', type: 'textarea', required: true, localized: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    { name: 'role', type: 'text', localized: true, admin: { description: 'For example: Striker, Union Saint-Gilloise' } },
                  ],
                },
                { name: 'photo', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
        {
          label: 'Calls to action',
          fields: [cta('ctaPlayers', 'Left block (players and families)'), cta('ctaClubs', 'Right block (clubs and brands)')],
        },
        {
          label: 'Sections',
          fields: [
            section('talents', 'Our talents'),
            {
              name: 'clubs',
              label: 'Clubs strip',
              type: 'group',
              admin: { description: 'The club names come from the published talents.' },
              fields: [
                { name: 'show', label: 'Show this section', type: 'checkbox', defaultValue: true },
                { name: 'title', label: 'Label', type: 'text', localized: true },
              ],
            },
            section('services', 'What we do'),
            section('process', 'How we work'),
            section('quotesSection', 'Quotes', false),
            section('team', 'Our team'),
            section('journal', 'Journal'),
            section('instagram', 'Instagram'),
            section('ctas', 'Calls to action', false),
            section('contact', 'Contact'),
          ],
        },
      ],
    },
  ],
}
