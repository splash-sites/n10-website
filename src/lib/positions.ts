export type PositionGroup = 'GK' | 'DEF' | 'MID' | 'FWD'

export const positions = [
  { value: 'goalkeeper', label: 'Goalkeeper', group: 'GK' },
  { value: 'right-back', label: 'Right back', group: 'DEF' },
  { value: 'centre-back', label: 'Centre back', group: 'DEF' },
  { value: 'left-back', label: 'Left back', group: 'DEF' },
  { value: 'defensive-midfielder', label: 'Defensive midfielder', group: 'MID' },
  { value: 'central-midfielder', label: 'Central midfielder', group: 'MID' },
  { value: 'attacking-midfielder', label: 'Attacking midfielder', group: 'MID' },
  { value: 'right-winger', label: 'Right winger', group: 'FWD' },
  { value: 'left-winger', label: 'Left winger', group: 'FWD' },
  { value: 'striker', label: 'Striker', group: 'FWD' },
] as const satisfies readonly { value: string; label: string; group: PositionGroup }[]

export type Position = (typeof positions)[number]['value']

export const groupOf = (position: string | null | undefined): PositionGroup =>
  positions.find((p) => p.value === position)?.group ?? 'MID'

export const ageOn = (birthDate: string | Date, today = new Date()) => {
  const d = new Date(birthDate)
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return age
}

export const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ø/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
