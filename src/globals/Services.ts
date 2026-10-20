import type { GlobalConfig } from 'payload'

export const Services: GlobalConfig = {
  slug: 'services',
  label: 'What we do',
  admin: { group: 'Pages' },
  access: { read: () => true },
  fields: [
    {
      name: 'items',
      label: 'Services',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      admin: {
        description: 'The first service gets the large white tile on the homepage.',
        initCollapsed: true,
        components: { RowLabel: '@/components/admin/RowLabel#TitleRowLabel' },
      },
      fields: [
        { name: 'tag', label: 'Small label', type: 'text', localized: true, admin: { description: 'For example: Planning' } },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'textarea', required: true, localized: true },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Optional. Used on the first (large) tile and the last tile.' },
        },
      ],
    },
  ],
}
