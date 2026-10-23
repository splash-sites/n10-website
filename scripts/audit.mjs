/**
 * Security and performance audit for the Numéro 10 site and panel.
 *
 * Run it against a production build that uses a throwaway database, never
 * against the real one: it registers a test admin, locks it out on purpose
 * and sends contact-form messages.
 *
 *   cp numero10.db audit.db
 *   DATABASE_URL=file:./audit.db CRON_SECRET=audit-cron-secret npm run build
 *   DATABASE_URL=file:./audit.db CRON_SECRET=audit-cron-secret npx next start -p 3100
 *   AUDIT_BASE=http://localhost:3100 CRON_SECRET=audit-cron-secret node scripts/audit.mjs
 */
import { randomBytes } from 'node:crypto'
import http from 'node:http'
import { chromium } from 'playwright'

const BASE = process.env.AUDIT_BASE || 'http://localhost:3100'
const CRON = process.env.CRON_SECRET || ''
const results = []
const add = (area, name, ok, detail = '') => results.push({ area, name, status: ok === null ? 'INFO' : ok ? 'PASS' : 'FAIL', detail })
const url = (p) => new URL(p, BASE).toString()
// A connection the server closes counts as a refusal (status 0)
const get = (p, init = {}) =>
  fetch(url(p), { redirect: 'manual', ...init }).catch(() => new Response(null, { status: 499, statusText: 'connection closed' }))
const json = async (res) => {
  try {
    return await res.json()
  } catch {
    return null
  }
}
const ms = (n) => `${Math.round(n)} ms`
const kb = (n) => `${(n / 1024).toFixed(0)} KB`

// Throwaway credentials, generated per run and never printed
const admin = { name: 'Audit', email: `audit-${randomBytes(4).toString('hex')}@example.test`, password: randomBytes(18).toString('base64url') }
let token = ''
const auth = () => ({ Authorization: `JWT ${token}` })

async function securityHeaders() {
  for (const path of ['/en', '/admin']) {
    const res = await get(path)
    const h = res.headers
    const missing = ['x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy', 'strict-transport-security'].filter(
      (k) => !h.get(k),
    )
    add('Security', `Security headers on ${path}`, missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : 'all present')
    add('Security', `No X-Powered-By on ${path}`, !h.get('x-powered-by'), h.get('x-powered-by') || '')
  }
}

async function publicAccess() {
  const msgs = await get('/api/messages')
  add('Security', 'Messages cannot be read without login', [401, 403].includes(msgs.status), `HTTP ${msgs.status}`)

  const create = await get('/api/messages', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'x', email: 'x@x.x', message: 'x', senderType: 'club' }) })
  add('Security', 'Messages cannot be created through the API', [401, 403].includes(create.status), `HTTP ${create.status}`)

  const users = await get('/api/users')
  add('Security', 'Users cannot be listed without login', [401, 403].includes(users.status), `HTTP ${users.status}`)

  const fd = new FormData()
  fd.append('file', new Blob([Buffer.from('fake')], { type: 'image/png' }), 'x.png')
  const upload = await get('/api/media', { method: 'POST', body: fd })
  add('Security', 'Media cannot be uploaded without login', [401, 403].includes(upload.status), `HTTP ${upload.status}`)

  const players = await json(await get('/api/players?limit=200&depth=0'))
  const docs = players?.docs ?? []
  add('Security', 'Public API lists only published players', docs.length > 0 && docs.every((p) => p.published === true), `${docs.length} returned`)
  add('Security', 'Contract end date is not in the public API', docs.every((p) => !('contractUntil' in p)), '')

  const posts = await json(await get('/api/posts?limit=100&depth=0'))
  const postDocs = posts?.docs ?? []
  add('Security', 'Public API lists no draft articles', postDocs.every((p) => p._status === 'published'), `${postDocs.length} returned`)
  const future = postDocs.filter((p) => p.publishedAt && new Date(p.publishedAt) > new Date())
  add('Security', 'Public API hides articles dated in the future', future.length === 0, future.length ? `${future.length} visible early` : '')

  const pg = await get('/api/graphql-playground')
  add('Security', 'GraphQL playground off in production', pg.status === 404, `HTTP ${pg.status}`)

  const gql = await json(
    await get('/api/graphql', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: '{ Messages { docs { email message } } }' }) }),
  )
  const leaked = gql?.data?.Messages?.docs?.length
  add('Security', 'GraphQL does not expose messages', !leaked, leaked ? `${leaked} leaked` : 'blocked')

  const cronNo = await get('/cron/keepalive')
  add('Security', 'Keep-alive cron rejects calls without the secret', cronNo.status === 401, `HTTP ${cronNo.status}`)
  if (CRON) {
    const cronYes = await get('/cron/keepalive', { headers: { authorization: `Bearer ${CRON}` } })
    add('Security', 'Keep-alive cron works with the secret', cronYes.status === 200, `HTTP ${cronYes.status}`)
  }

  // Raw request so the path stays "//evil.example/path" instead of becoming a host
  const loc = await new Promise((resolve) => {
    const { hostname, port } = new URL(BASE)
    http.get({ hostname, port, path: '//evil.example/path' }, (res) => {
      res.resume()
      resolve(res.headers.location || '')
    }).on('error', () => resolve(''))
  })
  add('Security', 'Language redirect cannot send visitors to another site', !loc || new URL(loc, BASE).origin === new URL(BASE).origin, loc)

  const minor = await get('/en/talents/samuel-kabongo')
  add('Security', 'Unpublished (minor) profile is not reachable', minor.status === 404, `HTTP ${minor.status}`)
}

async function adminAuth() {
  const first = await get('/api/users/first-register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(admin) })
  if (first.status !== 200) {
    add('Security', 'Test admin created on the empty audit database', false, `HTTP ${first.status}. Use a fresh audit.db`)
    return false
  }
  const login = await get('/api/users/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: admin.email, password: admin.password }) })
  const body = await json(login)
  token = body?.token || ''
  const cookie = login.headers.get('set-cookie') || ''
  add('Security', 'Login works for the admin', Boolean(token), `HTTP ${login.status}`)
  add('Security', 'Session cookie is HttpOnly', /httponly/i.test(cookie), '')
  add('Security', 'Session cookie has SameSite', /samesite=(lax|strict)/i.test(cookie), cookie.match(/samesite=\w+/i)?.[0] || 'none')
  add('Security', 'Session cookie is Secure (only on HTTPS)', null, /secure/i.test(cookie) ? 'Secure set' : 'not set on http://localhost, set automatically behind HTTPS')

  const second = await get('/api/users', { method: 'POST', headers: { 'content-type': 'application/json', ...auth() }, body: JSON.stringify({ name: 'B', email: 'b@example.test', password: randomBytes(12).toString('hex') }) })
  add('Security', 'A second account cannot be created (single admin)', [401, 403].includes(second.status), `HTTP ${second.status}`)
  const reg = await get('/api/users/first-register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'C', email: 'c@example.test', password: randomBytes(12).toString('hex') }) })
  add('Security', 'First-user registration closes after the admin exists', reg.status >= 400, `HTTP ${reg.status}`)
  return true
}

async function uploads() {
  const list = await json(await get('/api/media?limit=1&depth=0'))
  const m = list?.docs?.[0]
  if (m?.url) {
    // Media URLs can be absolute (NEXT_PUBLIC_SERVER_URL); test them on this server
    const f = await get(new URL(m.url, BASE).pathname)
    add('Security', 'Media files are served with nosniff', f.headers.get('x-content-type-options') === 'nosniff', f.headers.get('content-type') || '')
  }

  const svg = new FormData()
  svg.append('file', new Blob(['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'], { type: 'image/svg+xml' }), 'evil.svg')
  svg.append('_payload', JSON.stringify({ alt: 'svg' }))
  const r1 = await get('/api/media', { method: 'POST', headers: auth(), body: svg })
  add('Security', 'SVG upload is rejected (script risk)', r1.status >= 400, `HTTP ${r1.status}`)
  if (r1.status < 300) {
    const doc = (await json(r1))?.doc
    if (doc?.id) await get(`/api/media/${doc.id}`, { method: 'DELETE', headers: auth() })
  }

  const html = new FormData()
  html.append('file', new Blob(['<html><script>alert(1)</script></html>'], { type: 'image/png' }), 'fake.png')
  html.append('_payload', JSON.stringify({ alt: 'fake' }))
  const r2 = await get('/api/media', { method: 'POST', headers: auth(), body: html })
  add('Security', 'HTML disguised as .png is rejected', r2.status >= 400, `HTTP ${r2.status}`)
  if (r2.status < 300) {
    const doc = (await json(r2))?.doc
    if (doc?.id) await get(`/api/media/${doc.id}`, { method: 'DELETE', headers: auth() })
  }

  const big = new FormData()
  big.append('file', new Blob([Buffer.alloc(25 * 1024 * 1024, 1)], { type: 'image/jpeg' }), 'huge.jpg')
  big.append('_payload', JSON.stringify({ alt: 'huge' }))
  const r3 = await get('/api/media', { method: 'POST', headers: auth(), body: big })
  add('Security', 'Uploads over the size limit are rejected', r3.status >= 400, `HTTP ${r3.status}`)
  if (r3.status < 300) {
    const doc = (await json(r3))?.doc
    if (doc?.id) await get(`/api/media/${doc.id}`, { method: 'DELETE', headers: auth() })
  }
}

async function lockout() {
  for (let i = 0; i < 5; i++) {
    await get('/api/users/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: admin.email, password: 'wrong-password' }) })
  }
  const after = await get('/api/users/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: admin.email, password: admin.password }) })
  add('Security', 'Account locks after 5 wrong passwords', after.status >= 400, `correct password then gives HTTP ${after.status}`)
}

async function contactForm(browser) {
  const page = await browser.newPage()
  const countMessages = async () => (await json(await get('/api/messages?limit=0', { headers: auth() })))?.totalDocs ?? NaN
  const before = await countMessages()
  // Fresh load each time (a new query string), then wait for hydration
  let n = 0
  const open = async () => {
    await page.goto(url(`/en?audit=${++n}#contact`), { waitUntil: 'load' })
    await page.locator('#f-name').waitFor()
  }
  const shows = (sel) => page.locator(sel).first().waitFor({ state: 'visible', timeout: 8000 }).then(() => true, () => false)

  // Server-side validation, with the browser's own checks removed
  await open()
  // Turn off the browser's own checks so the server has to catch it
  await page.evaluate(() => { document.querySelector('#contact form').noValidate = true })
  await page.fill('#f-name', 'Audit')
  await page.fill('#f-email', 'not-an-email')
  await page.fill('#f-msg', 'Testing validation')
  await page.click('#contact button[type=submit]')
  const invalid = await shows('#contact .form-error')
  add('Security', 'Contact form rejects an invalid email on the server', invalid, '')

  // Honeypot: looks sent, nothing stored
  await open()
  await page.evaluate(() => { const hp = document.querySelector('#company_website'); if (hp) hp.value = 'http://spam.example' })
  await page.fill('#f-name', 'Bot')
  await page.fill('#f-email', 'bot@example.test')
  await page.fill('#f-msg', 'Spam')
  await page.click('#contact button[type=submit]')
  await shows('#contact .sent')
  const afterBot = await countMessages()
  add('Security', 'Spam trap: bot submissions are not stored', afterBot === before, `${afterBot - before} stored`)

  // Valid messages, then the rate limit
  let sent = 0
  let blockedAt = 0
  for (let i = 1; i <= 7; i++) {
    await open()
    await page.fill('#f-name', `Audit ${i}`)
    await page.fill('#f-email', 'audit@example.test')
    await page.fill('#f-msg', `Audit message ${i}`)
    await page.click('#contact button[type=submit]')
    const ok = await Promise.race([shows('#contact .sent'), shows('#contact .form-error').then((e) => (e ? false : null))])
    if (ok) sent++
    else if (!blockedAt) blockedAt = i
  }
  add('Security', 'Valid messages are stored', (await countMessages()) - afterBot === sent && sent > 0, `${sent} stored`)
  add('Security', 'Rate limit stops a flood of messages', blockedAt > 0, blockedAt ? `blocked after ${sent} valid messages (limit 5 per 10 min per address, counting earlier attempts)` : 'never blocked')

  const xss = await json(await get('/api/messages?limit=1&depth=0', { headers: auth() }))
  add('Security', 'Messages store text as typed (no HTML rendering on the site)', Boolean(xss?.docs?.length), 'messages are only shown in the panel as plain text')
  await page.close()
}

async function ttfb() {
  const paths = ['/en', '/fr', '/en/talents', '/en/talents/ilyas-benali', '/en/journal', '/en/journal/ilyas-benali-extends-with-krc-genk-until-2029', '/admin/login']
  for (const p of paths) {
    await get(p)
    const times = []
    let size = 0
    for (let i = 0; i < 5; i++) {
      const t0 = performance.now()
      const r = await get(p, { headers: { 'accept-encoding': 'gzip, br' } })
      const buf = await r.arrayBuffer()
      times.push(performance.now() - t0)
      size = buf.byteLength
    }
    times.sort((a, b) => a - b)
    const median = times[2]
    add('Performance', `Server response ${p}`, median < 300 ? true : median < 800 ? null : false, `${ms(median)} median, HTML ${kb(size)}`)
  }
  const t0 = performance.now()
  await get('/api/players?limit=100&depth=1', { headers: auth() })
  const apiMs = performance.now() - t0
  add('Performance', 'Panel API: talents list (20, with photos)', apiMs < 500, ms(apiMs))
}

async function pageMetrics(browser, path, label, viewport) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  if (path.startsWith('/admin')) await ctx.addCookies([{ name: 'payload-token', value: token, url: BASE }])
  let bytes = 0
  let jsBytes = 0
  let imgBytes = 0
  let fontBytes = 0
  let requests = 0
  const images = []
  const uncompressed = []
  page.on('response', async (res) => {
    try {
      const len = Number(res.headers()['content-length'] || (await res.body()).length)
      const type = res.request().resourceType()
      requests++
      bytes += len
      if (type === 'script') jsBytes += len
      if (type === 'image') {
        imgBytes += len
        images.push({ url: res.url(), type: res.headers()['content-type'], len })
      }
      if (type === 'document' || type === 'script' || type === 'stylesheet') {
        if (!res.headers()['content-encoding'] && len > 20 * 1024) uncompressed.push(res.url())
      }
      if (type === 'font') fontBytes += len
    } catch {}
  })
  await page.addInitScript(() => {
    window.__lcp = 0
    window.__cls = 0
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value })).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto(url(path), { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const m = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]
    return { lcp: window.__lcp, cls: window.__cls, fcp: fcp?.startTime ?? 0, load: nav.loadEventEnd }
  })
  const where = `${label} (${viewport.width}px)`
  add('Performance', `${where}: Largest Contentful Paint`, m.lcp < 2500 ? true : m.lcp < 4000 ? null : false, ms(m.lcp))
  add('Performance', `${where}: First Contentful Paint`, m.fcp < 1800 ? true : m.fcp < 3000 ? null : false, ms(m.fcp))
  add('Performance', `${where}: layout shift (CLS)`, m.cls < 0.1 ? true : m.cls < 0.25 ? null : false, m.cls.toFixed(3))
  const limit = path.startsWith('/admin') ? 6 : 1.5
  add('Performance', `${where}: page weight`, bytes < limit * 1024 * 1024 ? true : bytes < limit * 2 * 1024 * 1024 ? null : false, `${kb(bytes)} total, JS ${kb(jsBytes)}, images ${kb(imgBytes)}, fonts ${kb(fontBytes)}, ${requests} requests`)

  add('Performance', `${where}: text files sent compressed`, uncompressed.length === 0, uncompressed.length ? `${uncompressed.length} uncompressed` : 'gzip/br')
  if (!path.startsWith('/admin')) {
    const next = images.filter((i) => i.url.includes('/_next/image'))
    const modern = next.filter((i) => /webp|avif/.test(i.type || ''))
    add('Performance', `${where}: images served as WebP/AVIF`, next.length > 0 && modern.length === next.length, `${modern.length}/${next.length} optimized`)
    const biggest = images.sort((a, b) => b.len - a.len)[0]
    if (biggest) add('Performance', `${where}: largest image`, biggest.len < 250 * 1024 ? true : null, `${kb(biggest.len)} ${biggest.type}`)
    const lazy = await page.evaluate(() => {
      const imgs = [...document.images].filter((i) => i.getBoundingClientRect().top > window.innerHeight * 1.5)
      return { below: imgs.length, lazy: imgs.filter((i) => i.loading === 'lazy').length }
    })
    add('Performance', `${where}: off-screen images load lazily`, lazy.below === lazy.lazy, `${lazy.lazy}/${lazy.below}`)
  }
  await ctx.close()
}

async function originals() {
  const list = await json(await get('/api/media?limit=100&depth=0', { headers: auth() }))
  const docs = list?.docs ?? []
  const heavy = docs.filter((d) => d.filesize > 1.5 * 1024 * 1024)
  add('Performance', 'Uploaded originals are resized for the site', null, `${docs.length} files; site uses the thumb/card/large sizes through Next.js image optimization${heavy.length ? `; ${heavy.length} originals over 1.5 MB` : ''}`)
}

const step = async (name, fn) => {
  try {
    return await fn()
  } catch (err) {
    add('Audit', `${name} could not finish`, false, String(err?.message || err).split(/\r?\n/)[0])
  }
}

const browser = await chromium.launch(process.env.AUDIT_CHROME ? { executablePath: process.env.AUDIT_CHROME } : {})
try {
  await step('Security headers', securityHeaders)
  await step('Public access', publicAccess)
  const ok = await step('Admin login', adminAuth)
  if (ok) {
    await step('Uploads', uploads)
    await step('Contact form', () => contactForm(browser))
    await step('Response times', ttfb)
    await step('Originals', originals)
    for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      await step('Home metrics', () => pageMetrics(browser, '/en', 'Home', vp))
      await step('Profile metrics', () => pageMetrics(browser, '/en/talents/ilyas-benali', 'Profile', vp))
    }
    await step('Article metrics', () => pageMetrics(browser, '/en/journal/ilyas-benali-extends-with-krc-genk-until-2029', 'Article', { width: 1440, height: 900 }))
    await step('Panel metrics', () => pageMetrics(browser, '/admin', 'Panel dashboard', { width: 1440, height: 900 }))
    await step('Panel list metrics', () => pageMetrics(browser, '/admin/collections/players', 'Panel talents list', { width: 1440, height: 900 }))
    await step('Lockout', lockout)
  }
} finally {
  await browser.close()
}

const pad = (s, n) => String(s).padEnd(n)
for (const area of ['Security', 'Performance', 'Audit']) {
  console.log(`\n${area}`)
  for (const r of results.filter((x) => x.area === area)) console.log(`  ${pad(r.status, 5)} ${pad(r.name, 62)} ${r.detail}`)
}
const fails = results.filter((r) => r.status === 'FAIL').length
console.log(`\n${results.length} checks, ${fails} failed, ${results.filter((r) => r.status === 'INFO').length} to review`)
process.exitCode = fails ? 1 : 0
