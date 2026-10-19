import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { Players } from './collections/Players'
import { Posts } from './collections/Posts'
import { Team } from './collections/Team'
import { Users } from './collections/Users'
import { Home } from './globals/Home'
import { Services } from './globals/Services'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Without SMTP settings Payload prints outgoing emails to the server log,
// which is enough for local development.
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM || 'website@numero10.com',
      defaultFromName: 'Numéro 10 website',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  : undefined

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    theme: 'dark',
    meta: {
      titleSuffix: ' | Numéro 10 Studio',
      icons: [{ rel: 'icon', url: '/n10-logo.png' }],
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Graphics#Logo',
        Icon: '@/components/admin/Graphics#Icon',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  localization: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'fr', label: 'Français' },
      { code: 'nl', label: 'Nederlands' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [Players, Posts, Team, Media, Messages, Users],
  globals: [Home, Services, Settings],
  editor: lexicalEditor(),
  email,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
