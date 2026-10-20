import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { ageOn, positions } from '@/lib/positions'

export const Players: CollectionConfig = {
  slug: 'players',
  labels: { singular: 'Talent', plural: 'Talents' },
  orderable: true,
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['shirtNumber', 'name', 'position', 'currentClub', 'contractUntil', 'published'],
    listSearchableFields: ['name', 'currentClub'],
    description: 'Drag rows to change the order on the website.',
    preview: (doc) => (doc?.slug ? `/en/talents/${doc.slug}` : null),
  },
  access: {
    read: ({ req }) => (req.user ? true : { published: { equals: true } }),
  },
  defaultSort: '_order',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', label: 'Full name', type: 'text', required: true, admin: { width: '60%' } },
                {
                  name: 'shirtNumber',
                  label: 'Shirt number',
                  type: 'number',
                  min: 1,
                  max: 99,
                  required: true,
                  admin: { width: '20%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'position',
                  type: 'select',
                  required: true,
                  options: positions.map(({ value, label }) => ({ value, label })),
                  admin: { width: '40%' },
                },
                {
                  name: 'foot',
                  label: 'Stronger foot',
                  type: 'select',
                  options: ['left', 'right', 'both'].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })),
                  admin: { width: '30%' },
                },
                { name: 'heightCm', label: 'Height (cm)', type: 'number', min: 140, max: 220, admin: { width: '30%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'birthDate',
                  label: 'Date of birth',
                  type: 'date',
                  required: true,
                  admin: { width: '40%', date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
                },
                {
                  name: 'nationalities',
                  type: 'text',
                  hasMany: true,
                  required: true,
                  admin: { width: '60%', description: 'Three-letter codes, e.g. BEL, MAR.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'currentClub', label: 'Current club', type: 'text', required: true, admin: { width: '40%' } },
                { name: 'league', type: 'text', admin: { width: '30%' } },
                {
                  name: 'contractUntil',
                  label: 'Contract until (internal)',
                  type: 'date',
                  // Never exposed on the website or the public API
                  access: { read: ({ req }) => Boolean(req.user) },
                  admin: {
                    width: '30%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
                    description: 'Only visible in this panel.',
                  },
                },
              ],
            },
            {
              name: 'joinedAgency',
              label: 'Joined the agency',
              type: 'date',
              admin: { date: { pickerAppearance: 'monthOnly', displayFormat: 'MMM yyyy' } },
            },
            {
              name: 'bio',
              label: 'Short biography',
              type: 'textarea',
              localized: true,
              maxLength: 600,
              admin: { description: 'Two or three sentences: playing style, previous clubs, recent form.' },
            },
          ],
        },
        {
          label: 'Photos',
          fields: [
            {
              name: 'portrait',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { description: 'Used on the homepage wall, in lists and at the top of the profile.' },
            },
            { name: 'actionPhoto', label: 'Action photo', type: 'upload', relationTo: 'media' },
            { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
          ],
        },
        {
          label: 'Links',
          fields: [
            { name: 'transfermarktUrl', label: 'Transfermarkt profile', type: 'text' },
            { name: 'instagramHandle', label: 'Instagram', type: 'text', admin: { description: 'Without the @.' } },
            { name: 'highlightsUrl', label: 'Highlights video (YouTube or Vimeo)', type: 'text' },
          ],
        },
      ],
    },
    slugField('name'),
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Visible on the website.' },
    },
    {
      name: 'showOnWall',
      label: 'Name on the homepage wall',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      label: 'Featured on the hero',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'The homepage opens on one of the featured players.' },
    },
    {
      name: 'minorConsent',
      label: 'Under 18: family consent on file',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
      validate: (value: boolean | null | undefined, { data }: { data: Record<string, unknown> }) => {
        const birth = data?.birthDate as string | undefined
        if (data?.published && birth && ageOn(birth) < 18 && !value) {
          return 'This player is under 18. Tick this box once the family has given written consent, or keep the profile unpublished.'
        }
        return true
      },
    },
  ],
}
