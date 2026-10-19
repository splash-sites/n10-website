import type { Field } from 'payload'

import { slugify } from '@/lib/positions'

// Web address segment, filled from another field when left empty.
export const slugField = (from: string): Field => ({
  name: 'slug',
  label: 'Web address',
  type: 'text',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Filled in automatically. Change it only if you need a different link.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const source = data?.[from]
        if (typeof source === 'string') return slugify(source)
        if (source && typeof source === 'object' && 'en' in source) return slugify(String(source.en))
        return value
      },
    ],
  },
})
