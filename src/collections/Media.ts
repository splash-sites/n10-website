import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    description: 'Photos used on the website. JPG, PNG, WebP or AVIF, at least 1600 px on the long side, up to 15 MB.',
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
    // Photos only. SVG is excluded because it can carry scripts.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 240, height: 320, position: 'centre' },
      { name: 'card', width: 720, height: 960, position: 'centre' },
      { name: 'large', width: 1600, withoutEnlargement: true },
    ],
  },
}
