import type { CollectionConfig, Where } from 'payload'

import { slugField } from '@/fields/slug'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Article', plural: 'Journal' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    description: 'News, signings and opinion pieces. Each article can have a French and Dutch version.',
    preview: (doc) => (doc?.slug ? `/en/journal/${doc.slug}` : null),
  },
  versions: {
    drafts: { autosave: { interval: 2000 } },
    maxPerDoc: 20,
  },
  access: {
    // Visitors only see published articles whose date has arrived
    read: ({ req }) =>
      req.user
        ? true
        : { and: [{ _status: { equals: 'published' } }, { publishedAt: { less_than_equal: new Date().toISOString() } }] as Where[] },
  },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
      maxLength: 280,
      admin: { description: 'Shown in lists and when the article is shared.' },
    },
    { name: 'cover', label: 'Cover image', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', localized: true },
    slugField('title'),
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'news',
      options: [
        { value: 'signing', label: 'Signing' },
        { value: 'news', label: 'News' },
        { value: 'insight', label: 'Insight' },
        { value: 'opinion', label: 'Opinion' },
        { value: 'agency', label: 'Agency' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: 'Publication date',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'A future date keeps the article off the website until then.',
      },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) => (siblingData?._status === 'published' && !value ? new Date().toISOString() : value),
        ],
      },
    },
    {
      name: 'relatedPlayers',
      label: 'Players mentioned',
      type: 'relationship',
      relationTo: 'players',
      hasMany: true,
      admin: { position: 'sidebar', description: 'The article also appears on their profile.' },
    },
  ],
}
