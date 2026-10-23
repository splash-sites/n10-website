# Numéro 10

Website and content panel for Numéro 10, a FIFA-licensed football agency in Belgium. Next.js 16 and Payload 3 run in one app: the public site lives under `/en`, `/fr` and `/nl`, the panel ("Numéro 10 Studio") under `/admin`.

## Run it locally

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

Open http://localhost:3000 for the site and http://localhost:3000/admin for the panel. The first visit to `/admin` asks you to create the admin account; after that nobody else can register.

`npm run seed` fills an empty database with the sample content from the approved design (20 players, team, articles, services) and grey placeholder photos. `npm run seed -- --force` replaces the sample content.

## What the panel edits

| Panel section | Website |
| --- | --- |
| Content › Talents | Moving roster, talents rail, `/talents` list and `/talents/<name>` profiles. Drag to reorder. A player under 18 can only be published with the family-consent box ticked. |
| Content › Journal | Journal cards, `/journal` and articles. Drafts autosave; a future publication date keeps an article hidden until then. |
| Content › Team | Our team section |
| Pages › Homepage | Hero (headline, photo, featured player, badge, buttons), numbers, how we work, quotes, the two calls to action, and the title/label/intro or visibility of every section |
| Pages › What we do | The services bento. The first service gets the large white tile. |
| Pages › Privacy policy | `/privacy`, per language |
| Agency › Settings | Contact details, FIFA licence, email notifications, Instagram feed, SEO |
| Inbox › Messages | Everything sent through the contact form |

French and Dutch are edited with the language switch at the top of each document. Empty translations fall back to English.

## Contact form

Messages are saved in Inbox › Messages and emailed to the addresses in Settings › Email notifications. Without SMTP settings the email is printed in the server log.

## Instagram

The feed comes from [Behold](https://behold.so): connect the agency's Instagram account there once, create a JSON feed and paste its ID in Settings › Instagram feed. Pinned and hidden posts are set in the same tab. The section stays hidden until a feed is configured.

## Security and performance checks

`npm run test:unit` checks the contact-form rules (validation, spam trap, rate limit).

`npm run test:audit` runs 93 checks against a running production build: access rules on the API, single admin, login lockout, upload limits, security headers, cron secret, contact form, plus response times, Core Web Vitals (LCP, FCP, CLS), page weight and image optimization for the site and the panel. It registers a test admin and sends messages, so point it at a throwaway database:

```bash
cp numero10.db audit.db
DATABASE_URL=file:./audit.db CRON_SECRET=audit-cron-secret npm run build
DATABASE_URL=file:./audit.db CRON_SECRET=audit-cron-secret npx next start -p 3100
AUDIT_BASE=http://localhost:3100 CRON_SECRET=audit-cron-secret npm run test:audit
```

The first time, install the browser it uses: `npx playwright install chromium-headless-shell`.

Known and accepted: `npm audit` still lists advisories in build and migration tooling (sass, chokidar, esbuild, drizzle-kit). They have no upstream fix yet and do not handle visitor requests. No Content-Security-Policy is set, because the Payload admin needs inline scripts.

## Deploy (Vercel + Supabase)

1. **Supabase** (free plan): create a project in an EU region. Copy the *Transaction pooler* connection string. In Storage, create a public bucket called `media` and generate S3 access keys.
2. **GitHub**: push this repository.
3. **Vercel** (Hobby plan): import the repository and set the variables from `.env.example`: `DATABASE_URL` (the Postgres string), `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, the five `S3_*` values and `CRON_SECRET`. Deploy.
4. On the first start in production the database migrations in `src/migrations` run automatically.
5. **Right after the first deploy, open `/admin` and create the admin account.** Until it exists, anyone who opens `/admin` can create it.
6. Fill in the content in the panel. Do not run `npm run seed` against production.
7. Instagram: the account owner signs in at behold.so, connects the Business account, creates a JSON feed and pastes the feed ID in Settings › Instagram feed.
8. Email, when the domain is known: verify the domain in Resend (SPF/DKIM records in the DNS), then add the `SMTP_*` variables and `EMAIL_FROM` in Vercel and redeploy. Until then messages are saved in the panel only.

After changing a collection or global, create a migration with `DATABASE_URL=<postgres url> npm run payload migrate:create <name>` and commit it.

### Running costs and limits

- Vercel Hobby: free. Vercel's terms reserve Hobby for non-commercial use, so a move to Pro (US$ 20/month) may be required later.
- Supabase Free: 500 MB database, 1 GB files. A free project pauses after 7 days without activity; `/cron/keepalive` runs daily on Vercel Cron to prevent that.
- Behold Free: 1 feed, 6 posts, refreshed daily, 1,200 requests a month. The site fetches it once a day.
- Resend Free: 3,000 emails a month.

### Backups (not set up yet)

The Supabase free plan has no automatic backups. Two options when needed:

- Supabase Pro (US$ 25/month): daily backups kept 7 days, and no pausing.
- Free: a scheduled GitHub Action that runs `pg_dump` weekly and keeps the file as an artifact or in private storage.

## Still to do before announcing the site

- Paste the agency's privacy policy in Pages › Privacy policy (GDPR).
- Replace sample players, photos and figures.
- Set up email (step 8 above).

Design mockups that were approved with the client are in `design/`.
