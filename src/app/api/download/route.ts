import { NextRequest } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'
const ORIGIN = API_BASE.replace(/\/api\/?$/, '')

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url') || ''
  const name = req.nextUrl.searchParams.get('name') || 'download'

  if (!url.startsWith(ORIGIN)) {
    return new Response('Invalid download url.', { status: 400 })
  }

  try {
    const upstream = await fetch(url, { cache: 'no-store' })
    if (!upstream.ok) {
      return new Response('Failed to fetch file.', { status: upstream.status })
    }
    const safeName = name.replace(/[^\w.\- ]/g, '_').replace(/\s+/g, '_')
    const headers = new Headers()
    headers.set('Content-Type', upstream.headers.get('Content-Type') || 'application/octet-stream')
    headers.set('Content-Disposition', `attachment; filename="${safeName}"`)
    if (upstream.headers.get('Content-Length')) headers.set('Content-Length', upstream.headers.get('Content-Length')!)
    return new Response(upstream.body, { headers })
  } catch (e) {
    return new Response('Failed to fetch file.', { status: 502 })
  }
}
