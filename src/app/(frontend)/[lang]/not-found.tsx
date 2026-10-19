import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="pad sec">
      <div className="wrap">
        <h1 className="disp" style={{ fontSize: 'clamp(4rem, 12vw, 10rem)' }}>
          Offside
        </h1>
        <p className="lede" style={{ marginTop: 24 }}>
          This page does not exist or is no longer published.
        </p>
        <p style={{ marginTop: 32 }}>
          <Link className="btn" href="/">
            Back to the homepage
          </Link>
        </p>
      </div>
    </section>
  )
}
