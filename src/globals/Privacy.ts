import type { GlobalConfig } from 'payload'

export const Privacy: GlobalConfig = {
  slug: 'privacy',
  label: 'Privacy policy',
  admin: {
    group: 'Pages',
    description: 'The text shown at /privacy. Paste the policy supplied by the agency’s lawyer, in each language.',
  },
  access: { read: () => true },
  fields: [
    { name: 'content', type: 'richText', localized: true },
    {
      name: 'updatedOn',
      label: 'Last updated',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
    },
  ],
}
