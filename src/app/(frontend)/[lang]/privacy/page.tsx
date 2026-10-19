import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getDictionary, isLocale } from '@/i18n'
import { getGlobals } from '@/lib/data'

type Params = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params
  return isLocale(lang) ? { title: getDictionary(lang).privacy.title } : {}
}

// Placeholder text. The agency must supply its final privacy policy (GDPR)
// before launch; it can then move into the CMS as its own page.
export default async function PrivacyPage({ params }: Params) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = getDictionary(lang)
  const { settings } = await getGlobals(lang)

  return (
    <section className="pad sec">
      <div className="wrap article">
        <h1>{t.privacy.title}</h1>
        <div className="prose" style={{ marginTop: 40 }}>
          <p>
            Numéro 10 uses the details you send through the contact form only to answer your message. They are stored in the
            agency&apos;s website administration and sent to the agency by email. We do not share them with third parties.
          </p>
          <p>
            Profiles of players under 18 are published only with written consent from their family. You can ask us to see, correct or
            delete your data at {settings.contactEmail}.
          </p>
        </div>
      </div>
    </section>
  )
}
