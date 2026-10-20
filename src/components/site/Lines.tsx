import { Fragment } from 'react'

// Renders "a\nb" as a<br>b, so editors can break titles in the panel.
export function Lines({ text }: { text: string }) {
  const parts = text.split(/\r?\n/)
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {p}
          {i < parts.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </>
  )
}
