import type { CollectionConfig } from 'payload'

export const senderTypes = [
  { value: 'player', label: 'Player' },
  { value: 'family', label: 'Family' },
  { value: 'club', label: 'Club' },
  { value: 'brand', label: 'Brand' },
  { value: 'partner', label: 'Partner' },
] as const

// Contact form submissions. Created by the website's server action only,
// read and handled in the admin. A copy is emailed when the message arrives.
export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    group: 'Inbox',
    useAsTitle: 'name',
    defaultColumns: ['status', 'name', 'senderType', 'createdAt'],
    listSearchableFields: ['name', 'email', 'organisation'],
    description: 'Everything sent through the contact form. Each new message is also sent by email (see Settings).',
  },
  access: {
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: '-createdAt',
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return
        const settings = await req.payload.findGlobal({ slug: 'settings', req })
        if (!settings?.emailNotifications) return
        const to = (settings.notifyEmails || settings.contactEmail || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
        if (!to.length) return
        const type = senderTypes.find((t) => t.value === doc.senderType)?.label ?? doc.senderType
        const lines = [
          ['From', doc.name],
          ['Email', doc.email],
          ['Type', type],
          ['Organisation', doc.organisation],
          ['Position', doc.position],
          ['Current club', doc.currentClub],
          ['Role', doc.role],
          ['Website', doc.website],
          ['Language', doc.locale],
        ].filter(([, v]) => v)
        const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)
        try {
          await req.payload.sendEmail({
            to,
            replyTo: doc.email,
            subject: `New message (${type}): ${doc.name}`,
            text: `${lines.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${doc.message}`,
            html: `<table>${lines.map(([k, v]) => `<tr><td style="color:#777;padding-right:12px">${k}</td><td>${esc(String(v))}</td></tr>`).join('')}</table><p style="white-space:pre-line">${esc(doc.message)}</p>`,
          })
        } catch (err) {
          req.payload.logger.error({ err, msg: 'Could not send the message notification email' })
        }
      },
    ],
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { value: 'new', label: 'New' },
        { value: 'handled', label: 'Handled' },
        { value: 'archived', label: 'Archived' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'senderType', label: 'Sender', type: 'select', required: true, options: [...senderTypes], admin: { position: 'sidebar' } },
    { name: 'locale', label: 'Site language', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { readOnly: true } },
        { name: 'email', type: 'email', required: true, admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'organisation', label: 'Club or company', type: 'text', admin: { readOnly: true } },
        { name: 'role', type: 'text', admin: { readOnly: true } },
        { name: 'website', type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'position', type: 'text', admin: { readOnly: true } },
        { name: 'currentClub', label: 'Current club', type: 'text', admin: { readOnly: true } },
      ],
    },
    { name: 'message', type: 'textarea', required: true, admin: { readOnly: true } },
    { name: 'notes', label: 'Internal notes', type: 'textarea' },
  ],
}
