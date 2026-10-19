/* eslint-disable @next/next/no-img-element */

export const Logo = () => (
  <div style={{ display: 'grid', gap: 14, justifyItems: 'start' }}>
    <img src="/n10-logo.png" alt="Numéro 10" style={{ height: 48, width: 'auto', filter: 'var(--n10-logo-filter)' }} />
    <span style={{ fontSize: 13, opacity: 0.6 }}>Studio. Sign in to edit the website.</span>
  </div>
)

export const Icon = () => (
  <img src="/n10-logo.png" alt="Numéro 10" style={{ height: 18, width: 'auto', filter: 'var(--n10-logo-filter)' }} />
)
