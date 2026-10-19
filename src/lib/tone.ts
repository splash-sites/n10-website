import type { CSSProperties } from 'react'

// Grey tone used while a photo is missing, so lists still read as a set of
// different pictures. Deterministic per seed.
export const tone = (seed: number, dark = false) => {
  const r = (k: number) => {
    const x = Math.sin((seed + 1) * 91.7 + k * 13.3) * 43758.5
    return x - Math.floor(x)
  }
  const a = dark ? 40 + Math.round(r(1) * 40) : 175 + Math.round(r(1) * 55)
  const b = dark ? 10 + Math.round(r(2) * 20) : 60 + Math.round(r(2) * 60)
  return {
    '--t1': `rgb(${a},${a},${a})`,
    '--t2': `rgb(${b},${b},${b})`,
    '--ang': `${140 + Math.round(r(3) * 60)}deg`,
  } as CSSProperties
}
