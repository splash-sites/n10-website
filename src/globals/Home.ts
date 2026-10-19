import type { Field, GlobalConfig } from 'payload'

const section = (name: string, label: string): Field => ({
  name,
  label,
  type: 'group',
  admin: { description: 'Leave the title and intro empty to use the standard text.' },
  fields: [
    { name: 'show', label: 'Show this section', type: 'checkbox', defaultValue: true },
    { name: 'title', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
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
              name: 'introBold',
              label: 'Intro, bold part',
              type: 'text',
              localized: true,
              defaultValue: 'Numéro 10 represents twenty professional footballers.',
            },
            {
              name: 'introText',
              label: 'Intro, rest',
              type: 'textarea',
              localized: true,
              defaultValue: 'We negotiate their contracts, plan their careers and handle the legal, financial and commercial side.',
            },
            {
              type: 'row',
              fields: [
                { name: 'ctaPrimary', label: 'First button', type: 'text', localized: true, defaultValue: 'See every profile' },
                { name: 'ctaSecondary', label: 'Second button', type: 'text', localized: true, defaultValue: 'Contact the agency' },
              ],
            },
            {
              name: 'showFacts',
              label: 'Show the numbers under the intro',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Players, nationalities and leagues are counted from the published talents.' },
            },
          ],
        },
        {
          label: 'Sections',
          fields: [
            section('talents', 'Our talents'),
            section('services', 'What we do'),
            section('team', 'Our team'),
            section('journal', 'Journal'),
            section('instagram', 'Instagram'),
            section('contact', 'Contact'),
          ],
        },
      ],
    },
  ],
}
