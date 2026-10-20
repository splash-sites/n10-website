'use client'

import { useEffect } from 'react'

// Fades in .reveal elements and counts up [data-count] numbers as they reach
// the viewport. Position is checked on scroll and on a short interval (not
// with IntersectionObserver alone), so nothing stays hidden if frames or
// observers are paused. Reduced-motion users get everything at once.
export function Motion() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const count = (el: HTMLElement) => {
      const to = Number(el.dataset.count)
      if (reduce || !Number.isFinite(to)) {
        el.textContent = String(to)
        return
      }
      const t0 = performance.now()
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / 1200)
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))))
        if (k < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      // Background tabs pause animation frames; make sure the final value lands.
      window.setTimeout(() => (el.textContent = String(to)), 1500)
    }
    const show = (el: Element) => {
      el.classList.add('in')
      el.querySelectorAll<HTMLElement>('[data-count]').forEach(count)
    }

    let pending = Array.from(document.querySelectorAll('.reveal:not(.in)'))
    if (reduce) {
      pending.forEach(show)
      return
    }
    const check = () => {
      const limit = window.innerHeight * 0.92
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top < limit) {
          show(el)
          return false
        }
        return true
      })
      if (!pending.length) stop()
    }
    const timer = window.setInterval(check, 400)
    const stop = () => {
      window.clearInterval(timer)
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
    document.documentElement.classList.add('motion')
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return stop
  }, [])
  return null
}
