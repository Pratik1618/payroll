import { NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(req: Request, context: RouteContext) {
  try {
    const cookieHeader = req.headers.get('cookie') ?? ''
    const token = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)?.[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await context.params
    const res = await fetch(
      getBackendUrl(`/api/statutory-highlight/ecr/download/${encodeURIComponent(id)}`),
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      const data = await res.json().catch(() => ({ message: 'Failed to download highlighted ECR' }))
      return NextResponse.json(data, { status: res.status })
    }

    const blob = await res.arrayBuffer()
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': res.headers.get('content-disposition') || 'attachment; filename="highlighted-ecr.pdf"',
      },
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
