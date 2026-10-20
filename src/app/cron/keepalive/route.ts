import { payload } from '@/lib/data'

export const dynamic = 'force-dynamic'

// Called once a day by Vercel Cron (see vercel.json). A real database query
// counts as activity, so the Supabase free project is never paused.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  const p = await payload()
  const { totalDocs } = await p.count({ collection: 'players' })
  return Response.json({ ok: true, players: totalDocs, at: new Date().toISOString() })
}
