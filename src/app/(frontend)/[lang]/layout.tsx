/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import { Barlow, Big_Shoulders } from 'next/font/google'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { Header } from '@/components/site/Header'
import { getDictionary, isLocale, locales } from '@/i18n'
import { getGlobals, media } from '@/lib/data'

import './styles.css'

const display = Big_Shoulders({ subsets: ['latin'], weight: ['600', '800', '900'], variable: '--font-display' })
const text = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-text' })

export const dynamicParams = false
export const revalidate = 60

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const { settings } = await getGlobals(lang)
  const share = media(settings.shareImage, 'large')
  const title = settings.seoTitle || 'Numéro 10'
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    title: { default: title, template: `%s | Numéro 10` },
    description: settings.seoDescription || undefined,
    icons: { icon: '/n10-logo.png' },
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
    openGraph: { title, description: settings.seoDescription || undefined, images: share ? [share.url] : undefined, locale: lang },
  }
}

export default async function LangLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = getDictionary(lang)
  const { settings } = await getGlobals(lang)
  const base = `/${lang}`

  return (
    <html lang={lang} className={`${display.variable} ${text.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Header lang={lang} t={t.nav} l={t.landing} />
        <main id="main">{children}</main>
        <footer className="pad foot">
          <div className="wrap">
            <div className="cols">
              <div>
                <h4>{t.footer.agency}</h4>
                <Link href={`${base}/talents`}>{t.nav.talents}</Link>
                <Link href={`${base}#services`}>{t.nav.services}</Link>
                <Link href={`${base}#team`}>{t.nav.team}</Link>
                <Link href={`${base}/journal`}>{t.nav.journal}</Link>
              </div>
              <div>
                <h4>{t.footer.follow}</h4>
                {settings.instagramHandle ? (
                  <a href={`https://www.instagram.com/${settings.instagramHandle}`} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                ) : null}
                {settings.linkedinUrl ? (
                  <a href={settings.linkedinUrl.startsWith('http') ? settings.linkedinUrl : `https://${settings.linkedinUrl}`} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                ) : null}
              </div>
              <div>
                <h4>{t.nav.contact}</h4>
                <p>
                  <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
                  <span>{settings.office}</span>
                </p>
              </div>
              <div>
                <h4>{t.footer.licence}</h4>
                {settings.fifaLicence ? (
                  <p>
                    {t.footer.licenceText} {settings.fifaLicence}
                  </p>
                ) : null}
              </div>
            </div>
            <Link href={`${base}#contact`} aria-label={t.footer.talk}>
              <img className="logo-xl" src="/n10-logo.png" alt="" width={1400} height={606} />
            </Link>
            <div className="legal">
              <span>© {new Date().getFullYear()} Numéro 10</span>
              <Link href={`${base}/privacy`}>{t.footer.privacy}</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
