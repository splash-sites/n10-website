import type { CollectionConfig } from 'payload'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team member', plural: 'Team' },
  orderable: true,
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'published'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { published: { equals: true } }),
  },
  defaultSort: '_order',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true, localized: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'languages', label: 'Languages spoken', type: 'text', admin: { description: 'For example: FR, NL, EN' } },
    { name: 'linkedinUrl', label: 'LinkedIn', type: 'text' },
    { name: 'published', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
