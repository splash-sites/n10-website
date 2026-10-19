import type { CollectionConfig } from 'payload'

// The agency has a single admin account. A new user can only be created
// while the collection is empty (the "create first user" screen).
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email'],
    group: 'Agency',
  },
  auth: true,
  access: {
    create: async ({ req }) => {
      const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
      return totalDocs === 0
    },
    delete: () => false,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}
