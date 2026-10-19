import { NextResponse, type NextRequest } from 'next/server'

import { defaultLocale, isLocale } from '@/i18n'

const COOKIE = 'n10-lang'

// Every public page lives under /en, /fr or /nl. A path without a language
// is sent to the visitor's saved choice, then their browser language.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const first = pathname.split('/')[1]

  if (isLocale(first)) {
    const res = NextResponse.next()
    if (req.cookies.get(COOKIE)?.value !== first) {
      res.cookies.set(COOKIE, first, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
    }
    return res
  }

  const saved = req.cookies.get(COOKIE)?.value
  const fromBrowser = (req.headers.get('accept-language') || '')
    .split(',')
    .map((part) => part.split(';')[0].trim().slice(0, 2).toLowerCase())
    .find((code) => isLocale(code))
  const locale = isLocale(saved) ? saved : fromBrowser || defaultLocale

  const url = req.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!admin|api|_next|n10-logo.png|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}
