import Image from 'next/image'
import type { CSSProperties, ReactNode } from 'react'

import { tone } from '@/lib/tone'

type Props = {
  src?: string | null
  alt?: string
  seed?: number
  sizes?: string
  priority?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

// A photo box: the uploaded image in black and white, or a grey tone while
// no photo has been uploaded yet.
export function Photo({ src, alt = '', seed = 0, sizes = '25vw', priority, className = '', style, children }: Props) {
  return (
    <div className={`photo ${className}`} style={{ ...tone(seed), ...style }}>
      {src ? <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="photo-img" /> : null}
      {children}
    </div>
  )
}
