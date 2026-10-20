'use client'

import { useRowLabel } from '@payloadcms/ui'

export const TitleRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  return <span>{data?.title || `Item ${(rowNumber ?? 0) + 1}`}</span>
}

export const NameRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ name?: string }>()
  return <span>{data?.name || `Quote ${(rowNumber ?? 0) + 1}`}</span>
}
