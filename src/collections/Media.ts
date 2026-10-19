import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    description: 'Photos used on the website. JPG or PNG, at least 1600 px on the long side.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      label: 'Description (for screen readers and Google)',
      type: 'text',
      localized: true,
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 240, height: 320, position: 'centre' },
      { name: 'card', width: 720, height: 960, position: 'centre' },
      { name: 'large', width: 1600, withoutEnlargement: true },
    ],
  },
}
