import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Settings',
  admin: { group: 'Agency' },
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Agency details',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'contactEmail', label: 'Contact email', type: 'email', required: true, defaultValue: 'contact@numero10.com' },
                { name: 'phone', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'office', type: 'text', localized: true, defaultValue: 'Brussels, Belgium' },
                { name: 'fifaLicence', label: 'FIFA licence number', type: 'text', defaultValue: '202311-5454' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'instagramHandle', label: 'Instagram', type: 'text', admin: { description: 'Without the @.' } },
                { name: 'linkedinUrl', label: 'LinkedIn', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Email notifications',
          fields: [
            {
              name: 'emailNotifications',
              label: 'Send every new message by email',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Messages always stay in the Messages list of this panel as well.' },
            },
            {
              name: 'notifyEmails',
              label: 'Send to',
              type: 'text',
              admin: { description: 'Separate several addresses with a comma. Empty means the contact email.' },
            },
          ],
        },
        {
          label: 'Instagram feed',
          fields: [
            {
              name: 'beholdFeedId',
              label: 'Behold feed ID',
              type: 'text',
              admin: {
                description:
                  'Connect the Instagram account once at behold.so, create a JSON feed and paste its ID here. The website then shows the latest posts.',
              },
            },
            {
              name: 'pinnedPosts',
              label: 'Pinned posts',
              type: 'text',
              hasMany: true,
              admin: { description: 'Post links (instagram.com/p/...) to always show first.' },
            },
            {
              name: 'hiddenPosts',
              label: 'Hidden posts',
              type: 'text',
              hasMany: true,
              admin: { description: 'Post links that should never appear on the website.' },
            },
          ],
        },
        {
          label: 'Search engines',
          fields: [
            { name: 'seoTitle', label: 'Site title', type: 'text', localized: true, defaultValue: 'Numéro 10, football agency' },
            {
              name: 'seoDescription',
              label: 'Site description',
              type: 'textarea',
              localized: true,
              defaultValue: 'FIFA-licensed football agency in Belgium. Player representation, career strategy and partnerships.',
            },
            { name: 'shareImage', label: 'Image when shared', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
