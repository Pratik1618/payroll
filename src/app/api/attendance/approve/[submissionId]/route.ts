import { NextResponse } from 'next/server'
import { getBackendUrl } from '@/lib/base-path'

type RouteContext = {
  params: Promise<{
    submissionId: string
  }>
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const cookieHeader = req.headers.get('cookie') ?? ''
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)
    const token = tokenMatch?.[1]

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { submissionId } = await context.params
    const body = await req.text()

    const res = await fetch(
      getBackendUrl(`/api/attendance/approve/${encodeURIComponent(submissionId)}`),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body || undefined,
        cache: 'no-store',
      }
    )

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
