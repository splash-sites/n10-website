import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { s3Storage } from '@payloadcms/storage-s3'
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
import { Privacy } from './globals/Privacy'
import { Services } from './globals/Services'
import { Settings } from './globals/Settings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Postgres (Supabase) in production, a SQLite file for quick local work.
// Postgres schema changes go through migrations in src/migrations.
const databaseUrl = process.env.DATABASE_URL || ''
const db = databaseUrl.startsWith('postgres')
  ? postgresAdapter({
      pool: { connectionString: databaseUrl },
      migrationDir: path.resolve(dirname, 'migrations'),
      prodMigrations: migrations,
    })
  : sqliteAdapter({ client: { url: databaseUrl } })

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
  globals: [Home, Services, Settings, Privacy],
  editor: lexicalEditor(),
  upload: { limits: { fileSize: 15 * 1024 * 1024 } }, // 15 MB per photo
  email,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db,
  sharp,
  plugins: [
    // Uploads go to Supabase Storage (S3-compatible) when configured. Without
    // it they are written to ./media, which only works locally.
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      collections: { media: true },
      // The browser sends the photo straight to Supabase (signed URL), so the
      // Vercel 4.5 MB request limit never applies. Supabase allows CORS PUT.
      clientUploads: true,
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'eu-central-1',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
