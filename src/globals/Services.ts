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
      admin: { initCollapsed: true, components: { RowLabel: '@/components/admin/RowLabel#TitleRowLabel' } },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'textarea', required: true, localized: true },
      ],
    },
  ],
}
