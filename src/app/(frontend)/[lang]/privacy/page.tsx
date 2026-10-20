import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { dateLocale, getDictionary, isLocale } from '@/i18n'
import { getGlobals, payload } from '@/lib/data'

type Params = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params
  return isLocale(lang) ? { title: getDictionary(lang).privacy.title } : {}
}

// The policy text is edited in the panel (Pages › Privacy policy). Until it
// is filled in, a short fallback describes what the contact form does.
export default async function PrivacyPage({ params }: Params) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = getDictionary(lang)
  const [{ settings }, privacy] = await Promise.all([
    getGlobals(lang),
    (await payload()).findGlobal({ slug: 'privacy', locale: lang, depth: 0 }),
  ])
  const hasContent = Boolean(privacy.content?.root?.children?.length)

  return (
    <section className="pad sec">
      <div className="wrap article">
        <h1>{t.privacy.title}</h1>
        {privacy.updatedOn ? (
          <p className="meta" style={{ marginTop: 18 }}>
            {new Date(privacy.updatedOn).toLocaleDateString(dateLocale[lang], { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        ) : null}
        <div className="prose" style={{ marginTop: 40 }}>
          {hasContent && privacy.content ? (
            <RichText data={privacy.content} />
          ) : (
            <>
              <p>
                Numéro 10 uses the details you send through the contact form only to answer your message. They are stored in the
                agency&apos;s website administration and sent to the agency by email. We do not share them with third parties.
              </p>
              <p>
                Profiles of players under 18 are published only with written consent from their family. You can ask us to see, correct
                or delete your data at {settings.contactEmail}.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
