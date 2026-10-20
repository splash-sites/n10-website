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
| Agency › Settings | Contact details, FIFA licence, email notifications, Instagram feed, SEO |
| Inbox › Messages | Everything sent through the contact form |

French and Dutch are edited with the language switch at the top of each document. Empty translations fall back to English.

## Contact form

Messages are saved in Inbox › Messages and emailed to the addresses in Settings › Email notifications. Without SMTP settings the email is printed in the server log.

## Instagram

The feed comes from [Behold](https://behold.so): connect the agency's Instagram account there once, create a JSON feed and paste its ID in Settings › Instagram feed. Pinned and hidden posts are set in the same tab. The section stays hidden until a feed is configured.

## Before launch

- Switch the database to Postgres (`@payloadcms/db-postgres`) and media storage to S3 or R2 (`@payloadcms/storage-s3`).
- Fill in the SMTP variables.
- Replace the placeholder privacy policy in `src/app/(frontend)/[lang]/privacy/page.tsx` with the agency's own text.
- Replace sample players, photos and figures.

Design mockups that were approved with the client are in `design/`.
